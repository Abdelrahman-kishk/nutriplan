/**
 * app.js
 * Wires up events, fetches data via Api, and asks UI to render.
 */
(() => {
  const { $, $$ } = UI;

  function debounce(fn, delay = 400) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  // ------------------------------------------------------------------
  // Bootstrapping
  // ------------------------------------------------------------------
  async function init() {
    wireSidebarAndNav();
    wireRecipeControls();
    wireScanner();

    try {
      const { user } = await Api.getProfile();
      State.setUser(user);
      UI.renderProfile(user);
      UI.hideLoader();
      UI.showApp();
      await loadCategories();
      await loadRecipes();
    } catch (err) {
      UI.hideLoader();
      UI.showApp();
      UI.toast('error', err.message || 'Could not reach the NutriPlan server');
    }
  }

  // ------------------------------------------------------------------
  // Sidebar / navigation / profile dropdown
  // ------------------------------------------------------------------
  function wireSidebarAndNav() {
    const sidebar = $('#sidebar');
    const backdrop = $('#sidebar-backdrop');

    const openSidebar = () => {
      sidebar.classList.remove('-translate-x-full');
      backdrop.classList.remove('hidden');
    };
    const closeSidebar = () => {
      sidebar.classList.add('-translate-x-full');
      backdrop.classList.add('hidden');
    };

    $('#sidebar-open').addEventListener('click', openSidebar);
    $('#sidebar-close').addEventListener('click', closeSidebar);
    backdrop.addEventListener('click', closeSidebar);

    $$('.nav-item').forEach((btn) =>
      btn.addEventListener('click', async () => {
        const view = btn.dataset.view;
        State.data.currentView = view;
        UI.switchView(view);
        closeSidebar();
        if (view === 'foodlog') await loadFoodLog();
      })
    );

    $('#profile-pill').addEventListener('click', () => {
      $('#profile-dropdown').classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
      if (!$('#profile-pill').contains(e.target) && !$('#profile-dropdown').contains(e.target)) {
        $('#profile-dropdown').classList.add('hidden');
      }
    });

    $('#edit-targets-btn').addEventListener('click', async () => {
      const targets = State.data.user.dailyTargets;
      const { value } = await Swal.fire({
        title: 'Edit Daily Targets',
        customClass: { popup: 'np-popup' },
        html: `
          <div class="text-left space-y-3 mt-2">
            <div><label class="text-xs font-semibold text-gray-600">Calories</label>
              <input id="t-cal" type="number" value="${targets.calories}" class="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label class="text-xs font-semibold text-gray-600">Protein (g)</label>
              <input id="t-pro" type="number" value="${targets.protein}" class="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label class="text-xs font-semibold text-gray-600">Carbs (g)</label>
              <input id="t-carb" type="number" value="${targets.carbs}" class="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label class="text-xs font-semibold text-gray-600">Fats (g)</label>
              <input id="t-fat" type="number" value="${targets.fats}" class="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
          </div>`,
        showCancelButton: true,
        confirmButtonText: 'Save',
        confirmButtonColor: '#10b981',
        preConfirm: () => ({
          calories: +document.getElementById('t-cal').value,
          protein: +document.getElementById('t-pro').value,
          carbs: +document.getElementById('t-carb').value,
          fats: +document.getElementById('t-fat').value,
        }),
      });
      if (value) {
        try {
          const { user } = await Api.updateProfile({ dailyTargets: value });
          State.setUser(user);
          UI.renderProfile(user);
          UI.toast('success', 'Targets updated');
          if (State.data.currentView === 'foodlog') await loadFoodLog();
        } catch (err) {
          UI.toast('error', err.message);
        }
      }
      $('#profile-dropdown').classList.add('hidden');
    });

    $('#header-refresh').addEventListener('click', async () => {
      if (State.data.currentView === 'recipes') await loadRecipes();
      if (State.data.currentView === 'foodlog') await loadFoodLog();
    });
  }

  // ------------------------------------------------------------------
  // Recipes view controls
  // ------------------------------------------------------------------
  function wireRecipeControls() {
    const debouncedSearch = debounce(async (val) => {
      State.data.filters.search = val;
      State.data.filters.page = 1;
      await loadRecipes();
    }, 400);

    $('#search-input').addEventListener('input', (e) => debouncedSearch(e.target.value));

    $('#sort-select').addEventListener('change', async (e) => {
      State.data.filters.sort = e.target.value;
      await loadRecipes();
    });

    $('#view-grid-btn').addEventListener('click', () => setLayout('grid'));
    $('#view-list-btn').addEventListener('click', () => setLayout('list'));

    // Event delegation for dynamically rendered pills/cards
    $('#diet-pills').addEventListener('click', async (e) => {
      const btn = e.target.closest('.diet-pill');
      if (!btn) return;
      State.data.filters.diet = btn.dataset.diet;
      State.data.filters.page = 1;
      UI.renderDietPills(State.data.filters.diet);
      await loadRecipes();
    });

    $('#category-grid').addEventListener('click', async (e) => {
      const btn = e.target.closest('.category-card');
      if (!btn) return;
      State.data.filters.category = btn.dataset.category;
      State.data.filters.page = 1;
      UI.renderCategories(State.data.categories, State.data.filters.category);
      await loadRecipes();
    });

    $('#recipe-grid').addEventListener('click', async (e) => {
      const bookmarkBtn = e.target.closest('.bookmark-btn');
      if (bookmarkBtn) {
        State.toggleBookmark(bookmarkBtn.dataset.id);
        renderCachedRecipes();
        return;
      }
      const detailsBtn = e.target.closest('.view-details-btn');
      if (detailsBtn) {
        await openRecipeDetails(detailsBtn.dataset.id);
      }
    });
  }

  function setLayout(layout) {
    State.data.layoutView = layout;
    $('#view-grid-btn').classList.toggle('active', layout === 'grid');
    $('#view-list-btn').classList.toggle('active', layout === 'list');
    renderCachedRecipes();
  }

  function renderCachedRecipes() {
    UI.renderRecipes(State.data.recipesCache.data, State.data.layoutView, State.data.bookmarks);
  }

  // ------------------------------------------------------------------
  // Data loading
  // ------------------------------------------------------------------
  async function loadCategories() {
    UI.renderCategorySkeleton();
    UI.renderDietPills(State.data.filters.diet);
    try {
      const { data } = await Api.getCategories();
      State.data.categories = data;
      UI.renderCategories(data, State.data.filters.category);
    } catch (err) {
      UI.toast('error', 'Could not load categories');
    }
  }

  async function loadRecipes() {
    UI.renderRecipeSkeleton(State.data.layoutView);
    const { search, category, diet, sort, page, limit } = State.data.filters;
    try {
      const res = await Api.getRecipes({ search, category, diet, sort, page, limit });
      State.data.recipesCache = res;
      UI.renderRecipes(res.data, State.data.layoutView, State.data.bookmarks);
      UI.renderResultsCount(res.total, res.page, res.pages);
      UI.renderPagination(res.page, res.pages, async (p) => {
        State.data.filters.page = p;
        await loadRecipes();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    } catch (err) {
      UI.toast('error', err.message || 'Could not load recipes');
    }
  }

  async function openRecipeDetails(id) {
    try {
      const { data: recipe } = await Api.getRecipe(id);
      UI.openRecipeModal(recipe, {
        onLog: (r) => {
          Swal.close();
          UI.openLogModal(r, async ({ mealSlot, portionSize }) => {
            await submitLogEntry({ recipeId: r._id, mealSlot, portionSize });
          });
        },
      });
    } catch (err) {
      UI.toast('error', err.message || 'Could not load recipe details');
    }
  }

  async function submitLogEntry(payload) {
    try {
      await Api.addLogEntry(payload);
      UI.toast('success', 'Added to your food log');
      if (State.data.currentView === 'foodlog') await loadFoodLog();
    } catch (err) {
      UI.toast('error', err.message || 'Could not log entry');
    }
  }

  // ------------------------------------------------------------------
  // Food log view
  // ------------------------------------------------------------------
  async function loadFoodLog() {
    try {
      const payload = await Api.getTodayLog();
      State.data.todayLog = payload;
      UI.renderFoodLog(payload, async (logId) => {
        try {
          await Api.deleteLogEntry(logId);
          UI.toast('success', 'Entry removed');
          await loadFoodLog();
        } catch (err) {
          UI.toast('error', err.message);
        }
      });
    } catch (err) {
      UI.toast('error', err.message || 'Could not load food log');
    }
  }

  // ------------------------------------------------------------------
  // Product scanner (lightweight local lookup demo backed by manual macro entry)
  // ------------------------------------------------------------------
  function wireScanner() {
    $('#scanner-search-btn').addEventListener('click', () => {
      const query = $('#scanner-input').value.trim();
      if (!query) return;
      // Lightweight deterministic mock estimate so the flow is demonstrable end-to-end.
      const hash = [...query].reduce((s, c) => s + c.charCodeAt(0), 0);
      const macros = {
        calories: 80 + (hash % 350),
        protein: 2 + (hash % 20),
        carbs: 5 + (hash % 40),
        fats: 1 + (hash % 15),
      };
      const resultEl = $('#scanner-result');
      resultEl.classList.remove('hidden');
      resultEl.innerHTML = `
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="font-bold text-sm">${query}</p>
            <p class="text-xs text-gray-400">Estimated nutrition per serving</p>
          </div>
          <span class="text-lg font-extrabold text-emerald-600">${macros.calories} kcal</span>
        </div>
        <div class="flex gap-2 mb-4">${UI.$('#recipe-grid') ? '' : ''}
          <span class="macro-badge bg-rose-50 text-rose-600">P ${macros.protein}g</span>
          <span class="macro-badge bg-amber-50 text-amber-600">C ${macros.carbs}g</span>
          <span class="macro-badge bg-sky-50 text-sky-600">F ${macros.fats}g</span>
        </div>
        <div class="flex gap-2">
          <select id="scanner-mealslot" class="flex-1 border border-gray-200 rounded-lg px-2.5 py-2 text-xs">
            <option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snacks</option>
          </select>
          <button id="scanner-log-btn" class="px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold">
            Log It
          </button>
        </div>`;

      document.getElementById('scanner-log-btn').addEventListener('click', async () => {
        await submitLogEntry({
          customFoodName: query,
          mealSlot: document.getElementById('scanner-mealslot').value,
          portionSize: 1,
          macros,
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
