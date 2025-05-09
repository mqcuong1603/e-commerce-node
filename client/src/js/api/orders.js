// src/js/api/orders.js
// Orders API
import apiClient from "../api-client.js";

export const orderAPI = {
  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise} - Created order
   */
  createOrder(orderData) {
    return apiClient.post("/orders", orderData);
  },

  /**
   * Get all user orders
   * @returns {Promise} - User orders
   */
  getUserOrders() {
    return apiClient.get("/orders/user");
  },

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise} - Order details
   */
  getOrderById(orderId) {
    return apiClient.get(`/orders/user/${orderId}`);
  },

  /**
   * Get order tracking information
   * @param {string} orderId - Order ID
   * @returns {Promise} - Order tracking details
   */
  getOrderTracking(orderId) {
    return apiClient.get(`/orders/user/${orderId}/tracking`);
  },

  /**
   * Cancel an order
   * @param {string} orderId - Order ID
   * @returns {Promise} - Cancelled order
   */
  cancelOrder(orderId) {
    return apiClient.post(`/orders/user/${orderId}/cancel`);
  },

  /**
   * Verify discount code
   * @param {string} code - Discount code
   * @returns {Promise} - Discount validation result
   */
  verifyDiscount(code) {
    return apiClient.post("/orders/verify-discount", { code });
  },

  /**
   * Apply loyalty points to an order
   * @param {number} points - Number of points to apply
   * @returns {Promise} - Updated order
   */
  applyLoyaltyPoints(points) {
    return apiClient.post("/orders/user/apply-loyalty-points", { points });
  },
};
