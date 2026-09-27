/**
 * ui.js
 * Pure(ish) rendering helpers. Reads from State, writes to the DOM.
 * No fetch calls live here — app.js orchestrates data + UI.
 */
const UI = (() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const DIET_TAGS = [
    'All Recipes',
    'High Protein',
    'Low Carb',
    'Vegan',
    'Gluten-Free',
    'Quick Meals',
    'Keto',
  ];

  const DIET_COLORS = {
    'High Protein': 'bg-rose-50 text-rose-600',
    'Low Carb': 'bg-amber-50 text-amber-600',
    Vegan: 'bg-emerald-50 text-emerald-600',
    'Gluten-Free': 'bg-sky-50 text-sky-600',
    'Quick Meals': 'bg-violet-50 text-violet-600',
    Keto: 'bg-orange-50 text-orange-600',
  };

  // ------------------------------------------------------------------
  // Loader / auth / shell toggles
  // ------------------------------------------------------------------
  function hideLoader() {
    const el = $('#app-loader');
    if (el) el.remove();
  }

  function showApp() {
    $('#app-shell').classList.remove('hidden');
  }

  function renderProfile(user) {
    if (!user) return;
    $('#profile-avatar').src = user.avatarUrl;
    $('#profile-name').textContent = user.fullName;
    $('#profile-plan').textContent = `${user.subscription} Plan`;
    $('#calories-target').textContent = user.dailyTargets?.calories ?? 0;
  }

  // ------------------------------------------------------------------
  // Diet filter pills
  // ------------------------------------------------------------------
  function renderDietPills(activeDiet) {
    const container = $('#diet-pills');
    container.innerHTML = DIET_TAGS.map(
      (tag) =>
        `<button class="diet-pill ${tag === activeDiet ? 'active' : ''}" data-diet="${tag}">${tag}</button>`
    ).join('');
  }

  // ------------------------------------------------------------------
  // Category cards (with skeleton state)
  // ------------------------------------------------------------------
  function renderCategorySkeleton() {
    const container = $('#category-grid');
    container.innerHTML = Array.from({ length: 5 })
      .map(
        () => `
      <div class="skeleton rounded-xl h-24"></div>`
      )
      .join('');
  }

  function renderCategories(categories, activeCategory) {
    const container = $('#category-grid');
    const allCard = `
      <button data-category="All Recipes" class="category-card ${
        activeCategory === 'All Recipes' ? 'ring-2 ring-emerald-500' : ''
      } bg-white border border-gray-100 rounded-xl p-4 text-left hover:shadow-md transition flex flex-col gap-2">
        <i class="fa-solid fa-layer-group text-emerald-500"></i>
        <p class="text-sm font-semibold">All Recipes</p>
        <p class="text-xs text-gray-400">${categories.reduce((s, c) => s + c.count, 0)} recipes</p>
      </button>`;

    const cards = categories
      .map(
        (c) => `
      <button data-category="${c.name}" class="category-card ${
          activeCategory === c.name ? 'ring-2 ring-emerald-500' : ''
        } bg-white border border-gray-100 rounded-xl p-4 text-left hover:shadow-md transition flex flex-col gap-2">
        <i class="fa-solid ${c.icon} text-emerald-500"></i>
        <p class="text-sm font-semibold">${c.name}</p>
        <p class="text-xs text-gray-400">${c.count} recipes</p>
      </button>`
      )
      .join('');

    container.innerHTML = allCard + cards;
  }

  // ------------------------------------------------------------------
  // Recipe grid / list (with skeleton state)
  // ------------------------------------------------------------------
  function renderRecipeSkeleton(layout = 'grid') {
    const container = $('#recipe-grid');
    $('#recipe-empty').classList.add('hidden');
    container.className =
      layout === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'
        : 'flex flex-col gap-4';

    container.innerHTML = Array.from({ length: 8 })
      .map(() =>
        layout === 'grid'
          ? `<div class="rounded-2xl overflow-hidden border border-gray-100">
               <div class="skeleton h-40 w-full"></div>
               <div class="p-4 space-y-2">
                 <div class="skeleton h-4 w-3/4 rounded"></div>
                 <div class="skeleton h-3 w-1/2 rounded"></div>
               </div>
             </div>`
          : `<div class="flex gap-4 p-3 rounded-2xl border border-gray-100">
               <div class="skeleton w-28 h-24 rounded-xl shrink-0"></div>
               <div class="flex-1 space-y-2 py-1">
                 <div class="skeleton h-4 w-1/2 rounded"></div>
                 <div class="skeleton h-3 w-3/4 rounded"></div>
               </div>
             </div>`
      )
      .join('');
  }

  function macroBadges(macros) {
    return `
      <span class="macro-badge bg-rose-50 text-rose-600">P ${macros.protein}g</span>
      <span class="macro-badge bg-amber-50 text-amber-600">C ${macros.carbs}g</span>
      <span class="macro-badge bg-sky-50 text-sky-600">F ${macros.fats}g</span>`;
  }

  function recipeCardHTML(recipe, isBookmarked) {
    return `
    <div class="recipe-card flex flex-col" data-id="${recipe._id}">
      <div class="relative h-40 overflow-hidden">
        <img src="${recipe.imageUrl}" alt="${recipe.title}" class="w-full h-full object-cover" loading="lazy" />
        <span class="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-[10px] font-bold text-gray-700">
          <i class="fa-regular fa-clock mr-1"></i>${recipe.prepTime + recipe.cookTime} min
        </span>
        <button class="bookmark-btn ${isBookmarked ? 'active' : ''} absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center" data-id="${recipe._id}">
          <i class="fa-${isBookmarked ? 'solid' : 'regular'} fa-heart text-gray-500 text-sm"></i>
        </button>
      </div>
      <div class="p-4 flex flex-col gap-2 flex-1">
        <h4 class="font-bold text-sm leading-snug line-clamp-1">${recipe.title}</h4>
        <p class="text-xs text-gray-400 line-clamp-2 flex-1">${recipe.description}</p>
        <div class="flex items-center justify-between mt-1">
          <span class="text-xs font-bold text-emerald-600">${recipe.macros.calories} kcal</span>
          <div class="flex gap-1">${macroBadges(recipe.macros)}</div>
        </div>
        <button class="view-details-btn mt-2 w-full py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition" data-id="${recipe._id}">
          View Details
        </button>
      </div>
    </div>`;
  }

  function recipeRowHTML(recipe, isBookmarked) {
    return `
    <div class="recipe-row flex gap-4 p-3" data-id="${recipe._id}">
      <div class="relative w-28 h-24 rounded-xl overflow-hidden shrink-0">
        <img src="${recipe.imageUrl}" alt="${recipe.title}" class="w-full h-full object-cover" loading="lazy" />
      </div>
      <div class="flex-1 min-w-0 flex flex-col">
        <div class="flex items-start justify-between gap-2">
          <h4 class="font-bold text-sm leading-snug">${recipe.title}</h4>
          <button class="bookmark-btn ${isBookmarked ? 'active' : ''} w-7 h-7 shrink-0 rounded-full hover:bg-gray-100 flex items-center justify-center" data-id="${recipe._id}">
            <i class="fa-${isBookmarked ? 'solid' : 'regular'} fa-heart text-gray-500 text-sm"></i>
          </button>
        </div>
        <p class="text-xs text-gray-400 line-clamp-1 mt-0.5">${recipe.description}</p>
        <div class="flex items-center gap-2 mt-auto pt-2">
          <span class="text-xs font-bold text-emerald-600">${recipe.macros.calories} kcal</span>
          <div class="flex gap-1">${macroBadges(recipe.macros)}</div>
          <button class="view-details-btn ml-auto px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold" data-id="${recipe._id}">
            Details
          </button>
        </div>
      </div>
    </div>`;
  }

  function renderRecipes(recipes, layout, bookmarks) {
    const container = $('#recipe-grid');
    const empty = $('#recipe-empty');

    if (!recipes.length) {
      container.innerHTML = '';
      empty.classList.remove('hidden');
      empty.classList.add('flex');
      return;
    }
    empty.classList.add('hidden');
    empty.classList.remove('flex');

    container.className =
      layout === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'
        : 'flex flex-col gap-4';

    container.innerHTML = recipes
      .map((r) =>
        layout === 'grid'
          ? recipeCardHTML(r, bookmarks.has(r._id))
          : recipeRowHTML(r, bookmarks.has(r._id))
      )
      .join('');
  }

  function renderResultsCount(total, page, pages) {
    $('#results-count').textContent = `${total} recipe${total === 1 ? '' : 's'} found · page ${page} of ${pages}`;
  }

  function renderPagination(page, pages, onPageClick) {
    const container = $('#pagination');
    if (pages <= 1) {
      container.innerHTML = '';
      return;
    }
    const buttons = [];
    for (let i = 1; i <= pages; i++) {
      buttons.push(
        `<button data-page="${i}" class="page-btn w-8 h-8 rounded-lg text-xs font-semibold ${
          i === page ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-400'
        }">${i}</button>`
      );
    }
    container.innerHTML = buttons.join('');
    $$('.page-btn').forEach((btn) =>
      btn.addEventListener('click', () => onPageClick(parseInt(btn.dataset.page, 10)))
    );
  }

  // ------------------------------------------------------------------
  // View switching (sidebar nav)
  // ------------------------------------------------------------------
  const VIEW_META = {
    recipes: { title: 'Meals & Recipes', subtitle: 'Discover recipes tailored to your goals' },
    scanner: { title: 'Product Scanner', subtitle: 'Look up packaged foods and log them instantly' },
    foodlog: { title: 'Food Log', subtitle: "Track today's meals against your daily targets" },
  };

  function switchView(view) {
    ['recipes', 'scanner', 'foodlog'].forEach((v) => {
      $(`#view-${v}`).classList.toggle('hidden', v !== view);
    });
    $$('.nav-item').forEach((btn) => btn.classList.toggle('active', btn.dataset.view === view));
    $('#page-title').textContent = VIEW_META[view].title;
    $('#page-subtitle').textContent = VIEW_META[view].subtitle;
  }

  // ------------------------------------------------------------------
  // Recipe details modal (SweetAlert2) + macro donut chart
  // ------------------------------------------------------------------
  let donutChart = null;

  function openRecipeModal(recipe, { onLog }) {
    const ingredientsHTML = recipe.ingredients
      .map((i) => `<li class="flex justify-between py-1.5 border-b border-gray-100 text-sm"><span>${i.name}</span><span class="text-gray-400">${i.quantity}</span></li>`)
      .join('');

    const stepsHTML = recipe.instructions
      .map(
        (s, idx) =>
          `<li class="flex gap-3 text-sm mb-3"><span class="w-6 h-6 shrink-0 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">${idx + 1}</span><span class="pt-0.5">${s}</span></li>`
      )
      .join('');

    const dietHTML = recipe.dietTags
      .map((t) => `<span class="macro-badge ${DIET_COLORS[t] || 'bg-gray-100 text-gray-600'}">${t}</span>`)
      .join(' ');

    Swal.fire({
      width: 720,
      padding: '0',
      showCloseButton: true,
      showConfirmButton: false,
      customClass: { popup: 'np-popup text-left' },
      html: `
        <div class="text-left">
          <img src="${recipe.imageUrl}" class="w-full h-52 object-cover rounded-t-2xl" />
          <div class="p-6">
            <div class="flex flex-wrap gap-1 mb-2">${dietHTML}</div>
            <h2 class="text-xl font-extrabold mb-1">${recipe.title}</h2>
            <p class="text-sm text-gray-500 mb-4">${recipe.description}</p>

            <div class="grid grid-cols-3 gap-3 text-center mb-5">
              <div class="bg-gray-50 rounded-xl py-2"><p class="text-xs text-gray-400">Prep</p><p class="font-bold text-sm">${recipe.prepTime}m</p></div>
              <div class="bg-gray-50 rounded-xl py-2"><p class="text-xs text-gray-400">Cook</p><p class="font-bold text-sm">${recipe.cookTime}m</p></div>
              <div class="bg-gray-50 rounded-xl py-2"><p class="text-xs text-gray-400">Servings</p><p class="font-bold text-sm">${recipe.servings}</p></div>
            </div>

            <div class="flex flex-col sm:flex-row gap-6 mb-5">
              <div class="flex-1 flex flex-col items-center">
                <canvas id="macro-donut" width="160" height="160"></canvas>
                <p class="text-xs text-gray-400 mt-2">${recipe.macros.calories} kcal total</p>
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-sm mb-2">Ingredients</h3>
                <ul class="max-h-40 overflow-y-auto pr-1">${ingredientsHTML}</ul>
              </div>
            </div>

            <h3 class="font-bold text-sm mb-2">Instructions</h3>
            <ol class="mb-6">${stepsHTML}</ol>

            <button id="modal-log-btn" class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:opacity-90 transition">
              <i class="fa-solid fa-plus mr-1.5"></i> Log this to today's plan
            </button>
          </div>
        </div>`,
      didOpen: () => {
        const ctx = document.getElementById('macro-donut').getContext('2d');
        if (donutChart) donutChart.destroy();
        donutChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Protein', 'Carbs', 'Fat'],
            datasets: [
              {
                data: [recipe.macros.protein, recipe.macros.carbs, recipe.macros.fats],
                backgroundColor: ['#f43f5e', '#f59e0b', '#0ea5e9'],
                borderWidth: 0,
              },
            ],
          },
          options: {
            cutout: '70%',
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } },
          },
        });

        document.getElementById('modal-log-btn').addEventListener('click', () => onLog(recipe));
      },
      willClose: () => {
        if (donutChart) {
          donutChart.destroy();
          donutChart = null;
        }
      },
    });
  }

  // ------------------------------------------------------------------
  // Quick-add / log-to-plan modal
  // ------------------------------------------------------------------
  async function openLogModal(recipe, onSubmit) {
    const { value: formValues } = await Swal.fire({
      title: `Log "${recipe.title}"`,
      customClass: { popup: 'np-popup' },
      html: `
        <div class="text-left space-y-3 mt-2">
          <div>
            <label class="text-xs font-semibold text-gray-600">Meal Slot</label>
            <select id="swal-mealslot" class="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snacks</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600">Portion (servings)</label>
            <input id="swal-portion" type="number" min="0.25" step="0.25" value="1" class="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>`,
      showCancelButton: true,
      confirmButtonText: 'Add to Log',
      confirmButtonColor: '#10b981',
      preConfirm: () => ({
        mealSlot: document.getElementById('swal-mealslot').value,
        portionSize: parseFloat(document.getElementById('swal-portion').value) || 1,
      }),
    });

    if (formValues) onSubmit(formValues);
  }

  function toast(icon, title) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title,
      showConfirmButton: false,
      timer: 2200,
      timerProgressBar: true,
    });
  }

  // ------------------------------------------------------------------
  // Food log view render
  // ------------------------------------------------------------------
  let totalsChartInstance = null;

  function renderFoodLog(payload, onDelete) {
    const slots = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
    const slotIcons = {
      Breakfast: 'fa-mug-hot',
      Lunch: 'fa-bowl-food',
      Dinner: 'fa-utensils',
      Snacks: 'fa-apple-whole',
    };

    const container = $('#foodlog-slots');
    container.innerHTML = slots
      .map((slot) => {
        const items = payload.grouped[slot] || [];
        const itemsHTML = items.length
          ? items
              .map(
                (e) => `
            <div class="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div class="flex items-center gap-3 min-w-0">
                ${
                  e.recipe?.imageUrl
                    ? `<img src="${e.recipe.imageUrl}" class="w-10 h-10 rounded-lg object-cover shrink-0" />`
                    : `<div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><i class="fa-solid fa-bowl-rice text-gray-400 text-xs"></i></div>`
                }
                <div class="min-w-0">
                  <p class="text-sm font-medium truncate">${e.customFoodName}</p>
                  <p class="text-xs text-gray-400">${e.macros.calories} kcal · ${e.portionSize}x</p>
                </div>
              </div>
              <button data-log-id="${e._id}" class="delete-log-btn text-gray-300 hover:text-red-500 px-2">
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>`
              )
              .join('')
          : `<p class="text-xs text-gray-300 py-3">No items logged yet</p>`;

        const slotTotal = items.reduce((s, e) => s + e.macros.calories, 0);

        return `
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-bold text-sm flex items-center gap-2"><i class="fa-solid ${slotIcons[slot]} text-emerald-500"></i>${slot}</h4>
            <span class="text-xs text-gray-400">${slotTotal} kcal</span>
          </div>
          ${itemsHTML}
        </div>`;
      })
      .join('');

    $$('.delete-log-btn').forEach((btn) =>
      btn.addEventListener('click', () => onDelete(btn.dataset.logId))
    );

    // Totals
    const { calories, protein, carbs, fats } = payload.totals;
    const target = payload.targets.calories || 1;
    $('#calories-consumed').textContent = calories;
    $('#calories-target').textContent = target;
    $('#calories-bar').style.width = `${Math.min(100, Math.round((calories / target) * 100))}%`;

    $('#totals-legend').innerHTML = `
      <div class="flex items-center justify-between"><span class="flex items-center gap-2"><i class="fa-solid fa-circle text-rose-400 text-[8px]"></i>Protein</span><span class="font-semibold">${protein}g</span></div>
      <div class="flex items-center justify-between"><span class="flex items-center gap-2"><i class="fa-solid fa-circle text-amber-400 text-[8px]"></i>Carbs</span><span class="font-semibold">${carbs}g</span></div>
      <div class="flex items-center justify-between"><span class="flex items-center gap-2"><i class="fa-solid fa-circle text-sky-400 text-[8px]"></i>Fat</span><span class="font-semibold">${fats}g</span></div>`;

    const ctx = document.getElementById('totals-chart').getContext('2d');
    if (totalsChartInstance) totalsChartInstance.destroy();
    const hasData = protein + carbs + fats > 0;
    totalsChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Protein', 'Carbs', 'Fat'],
        datasets: [
          {
            data: hasData ? [protein, carbs, fats] : [1, 1, 1],
            backgroundColor: hasData ? ['#f43f5e', '#f59e0b', '#0ea5e9'] : ['#f1f5f9', '#f1f5f9', '#f1f5f9'],
            borderWidth: 0,
          },
        ],
      },
      options: { cutout: '72%', plugins: { legend: { display: false } } },
    });
  }

  return {
    $, $$,
    hideLoader, showApp, renderProfile,
    renderDietPills, renderCategorySkeleton, renderCategories,
    renderRecipeSkeleton, renderRecipes, renderResultsCount, renderPagination,
    switchView, openRecipeModal, openLogModal, toast, renderFoodLog,
  };
})();
