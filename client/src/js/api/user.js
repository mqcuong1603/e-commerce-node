// src/js/api/users.js
// User API
import apiClient from "../api-client.js";

export const userAPI = {
  /**
   * Get user profile
   * @returns {Promise} - User profile data
   */
  getProfile() {
    return apiClient.get("/users/profile");
  },

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise} - Updated user profile
   */
  updateProfile(profileData) {
    return apiClient.put("/users/profile", profileData);
  },

  /**
   * Get user order history
   * @returns {Promise} - Order history
   */
  getOrderHistory() {
    return apiClient.get("/users/orders");
  },

  /**
   * Get specific order details
   * @param {string} orderId - Order ID
   * @returns {Promise} - Order details
   */
  getOrderDetails(orderId) {
    return apiClient.get(`/users/orders/${orderId}`);
  },

  /**
   * Get loyalty points
   * @returns {Promise} - Loyalty points information
   */
  getLoyaltyPoints() {
    return apiClient.get("/users/loyalty-points");
  },

  /**
   * Deactivate user account
   * @returns {Promise} - Response
   */
  deactivateAccount() {
    return apiClient.put("/users/deactivate");
  },
};
