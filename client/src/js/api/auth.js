// src/js/api/auth.js
// Authentication API
import apiClient from "../api-client.js";

export const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - Registration response
   */
  register(userData) {
    return apiClient.post("/auth/register", userData);
  },

  /**
   * Login user
   * @param {Object} credentials - Login credentials (email, password)
   * @returns {Promise} - Login response with token
   */
  login(credentials) {
    return apiClient.post("/auth/login", credentials);
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} - Response
   */
  forgotPassword(email) {
    return apiClient.post("/auth/forgot-password", { email });
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise} - Response
   */
  resetPassword(token, newPassword) {
    return apiClient.post(`/auth/reset-password/${token}`, { newPassword });
  },

  /**
   * Update password when logged in
   * @param {Object} passwordData - Password update data (currentPassword, newPassword)
   * @returns {Promise} - Response
   */
  updatePassword(passwordData) {
    return apiClient.post("/auth/update-password", passwordData);
  },

  /**
   * Get user profile
   * @returns {Promise} - User data
   */
  getProfile() {
    return apiClient.get("/users/profile");
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} - Updated user data
   */
  updateProfile(profileData) {
    return apiClient.put("/users/profile", profileData);
  },

  /**
   * Get Google OAuth URL
   * @returns {string} - Google OAuth URL
   */
  getGoogleAuthUrl() {
    return `${apiClient.baseUrl}/auth/google`;
  },

  /**
   * Get Facebook OAuth URL
   * @returns {string} - Facebook OAuth URL
   */
  getFacebookAuthUrl() {
    return `${apiClient.baseUrl}/auth/facebook`;
  },

  /**
   * Deactivate user account
   * @returns {Promise} - Response
   */
  deactivateAccount() {
    return apiClient.put("/users/deactivate");
  },
};
