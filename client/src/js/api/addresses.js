// src/js/api/addresses.js
// User addresses API
import apiClient from '../api-client.js';

export const addressAPI = {
  /**
   * Get user addresses
   * @returns {Promise} - User addresses
   */
  getUserAddresses() {
    return apiClient.get('/users/addresses');
  },

  /**
   * Add new address
   * @param {Object} addressData - Address data
   * @returns {Promise} - Created address
   */
  addAddress(addressData) {
    return apiClient.post('/users/addresses', addressData);
  },

  /**
   * Update address
   * @param {string} addressId - Address ID
   * @param {Object} addressData - Updated address data
   * @returns {Promise} - Updated address
   */
  updateAddress(addressId, addressData) {
    return apiClient.put(`/users/addresses/${addressId}`, addressData);
  },

  /**
   * Delete address
   * @param {string} addressId - Address ID
   * @returns {Promise} - Response
   */
  deleteAddress(addressId) {
    return apiClient.delete(`/users/addresses/${addressId}`);
  },

  /**
   * Set address as default
   * @param {string} addressId - Address ID
   * @returns {Promise} - Updated address
   */
  setDefaultAddress(addressId) {
    return apiClient.put(`/users/addresses/${addressId}/default`);
  }
};