// src/js/api/orders.js
// Orders API
import apiClient from '../api-client.js';

export const orderAPI = {
  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise} - Created order
   */
  createOrder(orderData) {
    return apiClient.post('/orders', orderData);
  },

  /**
   * Get all user orders
   * @returns {Promise} - User orders
   */
  getOrders() {
    return apiClient.get('/orders');
  },

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise} - Order details
   */
  getOrderById(orderId) {
    return apiClient.get(`/orders/${orderId}`);
  },

  /**
   * Get order history
   * @returns {Promise} - Order history
   */
  getOrderHistory() {
    return apiClient.get('/orders/history');
  }
};