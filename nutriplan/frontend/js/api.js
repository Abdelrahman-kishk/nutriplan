/**
 * api.js
 * Thin fetch wrapper around the NutriPlan REST API.
 * No login/JWT: every request is attributed server-side to a single
 * auto-created "Guest" account, so there is nothing to authenticate here.
 * Change API_BASE_URL to point at your deployed backend.
 */
const API_BASE_URL = window.NUTRIPLAN_API_BASE || 'http://localhost:5000/api';

const Api = (() => {
  async function request(path, { method = 'GET', body } = {}) {
    let res;
    try {
      res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (networkErr) {
      throw new Error(
        'Unable to reach the NutriPlan server. Please check your connection or that the API is running.'
      );
    }

    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      const err = new Error(data.message || `Request failed (${res.status})`);
      err.status = res.status;
      err.errors = data.errors;
      throw err;
    }

    return data;
  }

  return {
    // ---- Profile (no login required) ----
    getProfile: () => request('/profile'),
    updateProfile: (payload) => request('/profile', { method: 'PATCH', body: payload }),

    // ---- Recipes ----
    getRecipes: (query = {}) => {
      const params = new URLSearchParams(
        Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '')
      ).toString();
      return request(`/recipes${params ? `?${params}` : ''}`);
    },
    getRecipe: (id) => request(`/recipes/${id}`),
    getCategories: () => request('/categories'),

    // ---- Food Log ----
    getTodayLog: (date) => request(`/food-log/today${date ? `?date=${date}` : ''}`),
    addLogEntry: (payload) => request('/food-log', { method: 'POST', body: payload }),
    deleteLogEntry: (id) => request(`/food-log/${id}`, { method: 'DELETE' }),
  };
})();
