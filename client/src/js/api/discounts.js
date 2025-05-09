// src/js/api/discounts.js
// Discount API (Admin operations)
import apiClient from "../api-client.js";

export const discountAPI = {
  /**
   * Get all discount codes
   * @returns {Promise} - List of discount codes
   */
  getAllDiscountCodes() {
    return apiClient.get("/discounts");
  },

  /**
   * Create a new discount code
   * @param {Object} discountData - Discount code data
   * @returns {Promise} - Created discount code
   */
  createDiscountCode(discountData) {
    return apiClient.post("/discounts", discountData);
  },

  /**
   * Get details of a specific discount code
   * @param {string} code - Discount code
   * @returns {Promise} - Discount code details
   */
  getDiscountCodeDetails(code) {
    return apiClient.get(`/discounts/${code}`);
  },

  /**
   * Delete a discount code
   * @param {string} code - Discount code
   * @returns {Promise} - Response
   */
  deleteDiscountCode(code) {
    return apiClient.delete(`/discounts/${code}`);
  },

  /**
   * Toggle discount code active status
   * @param {string} code - Discount code
   * @returns {Promise} - Updated discount code
   */
  toggleDiscountCodeStatus(code) {
    return apiClient.patch(`/discounts/${code}/toggle`);
  },
};
