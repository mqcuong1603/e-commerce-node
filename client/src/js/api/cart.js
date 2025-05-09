// src/js/api/cart.js
// Cart API
import apiClient from "../api-client.js";

export const cartAPI = {
  /**
   * Get current cart
   * @returns {Promise} - Cart data
   */
  getCart() {
    return apiClient.get("/cart");
  },

  /**
   * Add item to cart
   * @param {string} productVariantId - Product variant ID
   * @param {number} quantity - Quantity to add
   * @returns {Promise} - Updated cart
   */
  addItemToCart(productVariantId, quantity = 1) {
    return apiClient.post("/cart/items", { productVariantId, quantity });
  },

  /**
   * Update cart item quantity
   * @param {string} productVariantId - Product variant ID
   * @param {number} quantity - New quantity
   * @returns {Promise} - Updated cart
   */
  updateCartItem(productVariantId, quantity) {
    return apiClient.put(`/cart/items/${productVariantId}`, { quantity });
  },

  /**
   * Remove item from cart
   * @param {string} productVariantId - Product variant ID
   * @returns {Promise} - Updated cart
   */
  removeCartItem(productVariantId) {
    return apiClient.delete(`/cart/items/${productVariantId}`);
  },

  /**
   * Clear cart
   * @returns {Promise} - Empty cart
   */
  clearCart() {
    return apiClient.delete("/cart");
  },

  /**
   * Apply discount code to cart
   * @param {string} code - Discount code
   * @returns {Promise} - Updated cart with discount
   */
  applyDiscount(code) {
    return apiClient.post("/orders/verify-discount", { code });
  },
};
