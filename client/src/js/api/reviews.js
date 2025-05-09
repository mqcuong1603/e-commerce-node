// src/js/api/reviews.js
// Reviews API
import apiClient from "../api-client.js";

export const reviewAPI = {
  /**
   * Get reviews for a product
   * @param {string} productId - Product ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} - Reviews with pagination
   */
  getProductReviews(productId, page = 1, limit = 10) {
    return apiClient.get(
      `/reviews/product/${productId}?page=${page}&limit=${limit}`
    );
  },

  /**
   * Add review for a product
   * @param {string} productId - Product ID
   * @param {Object} reviewData - Review data (rating, comment, userName)
   * @returns {Promise} - Created review
   */
  addReview(productId, reviewData) {
    return apiClient.post(`/reviews/product/${productId}`, reviewData);
  },

  /**
   * Update review
   * @param {string} reviewId - Review ID
   * @param {Object} reviewData - Updated review data
   * @returns {Promise} - Updated review
   */
  updateReview(reviewId, reviewData) {
    return apiClient.put(`/reviews/${reviewId}`, reviewData);
  },

  /**
   * Delete review
   * @param {string} reviewId - Review ID
   * @returns {Promise} - Response
   */
  deleteReview(reviewId) {
    return apiClient.delete(`/reviews/${reviewId}`);
  },

  /**
   * Get user's reviews
   * @returns {Promise} - User reviews
   */
  getUserReviews() {
    return apiClient.get("/reviews/user");
  },
};
