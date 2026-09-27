/**
 * state.js
 * Centralized, mutable app state + a tiny pub/sub so UI modules can react to changes.
 */
const State = (() => {
  const listeners = {};

  const data = {
    user: null,
    currentView: 'recipes',
    layoutView: 'grid', // 'grid' | 'list'
    filters: {
      search: '',
      category: 'All Recipes',
      diet: 'All Recipes',
      sort: 'newest',
      page: 1,
      limit: 8,
    },
    categories: [],
    recipesCache: { data: [], total: 0, pages: 1 },
    bookmarks: new Set(JSON.parse(localStorage.getItem('np_bookmarks') || '[]')),
    todayLog: null,
  };

  function on(event, cb) {
    (listeners[event] = listeners[event] || []).push(cb);
  }

  function emit(event, payload) {
    (listeners[event] || []).forEach((cb) => cb(payload));
  }

  function setUser(user) {
    data.user = user;
    emit('user:changed', user);
  }

  function toggleBookmark(id) {
    if (data.bookmarks.has(id)) data.bookmarks.delete(id);
    else data.bookmarks.add(id);
    localStorage.setItem('np_bookmarks', JSON.stringify([...data.bookmarks]));
    emit('bookmarks:changed', data.bookmarks);
  }

  return { data, on, emit, setUser, toggleBookmark };
})();
