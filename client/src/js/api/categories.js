// src/js/api/categories.js
// Categories API
import apiClient from '../api-client.js';

export const categoryAPI = {
  /**
   * Get all categories
   * @returns {Promise} - All categories
   */
  getAllCategories() {
    return apiClient.get('/categories');
  },

  /**
   * Get category tree (hierarchical)
   * @returns {Promise} - Category tree
   */
  getCategoryTree() {
    return apiClient.get('/categories/tree');
  },

  /**
   * Get categories for menu navigation
   * @returns {Promise} - Menu categories
   */
  getMenuCategories() {
    return apiClient.get('/categories/menu');
  },

  /**
   * Get category by slug
   * @param {string} slug - Category slug
   * @returns {Promise} - Category details
   */
  getCategoryBySlug(slug) {
    return apiClient.get(`/categories/${slug}`);
  }
};