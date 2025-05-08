// src/js/api/products.js
// Products API
import apiClient from '../api-client.js';

export const productAPI = {
  /**
   * Get products for landing page (new, bestsellers, by category)
   * @returns {Promise} - Landing page products
   */
  getLandingPageProducts() {
    return apiClient.get('/products/landing');
  },

  /**
   * Get all products with pagination and filtering
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {Object} filters - Filter options
   * @returns {Promise} - Products list with pagination
   */
  getAllProducts(page = 1, limit = 12, filters = {}) {
    const queryParams = new URLSearchParams({ page, limit, ...filters });
    return apiClient.get(`/products?${queryParams.toString()}`);
  },

  /**
   * Get product by slug
   * @param {string} slug - Product slug
   * @returns {Promise} - Product details
   */
  getProductBySlug(slug) {
    return apiClient.get(`/products/${slug}`);
  },

  /**
   * Get products by category
   * @param {string} categorySlug - Category slug
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} - Products in category with pagination
   */
  getProductsByCategory(categorySlug, page = 1, limit = 12) {
    return apiClient.get(`/products/category/${categorySlug}?page=${page}&limit=${limit}`);
  }
};