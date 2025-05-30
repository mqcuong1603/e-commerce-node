// src/js/api-client.js
// This enhanced version will establish a consistent API interface for all frontend components

/**
 * Core API client for making requests to the backend
 */
class ApiClient {
    constructor() {
      this.baseUrl = 'http://localhost:3000/api';
      this.token = localStorage.getItem('token');
    }
  
    /**
     * Set authentication token for subsequent requests
     * @param {string} token - JWT token
     */
    setToken(token) {
      this.token = token;
      localStorage.setItem('token', token);
    }
  
    /**
     * Clear authentication token
     */
    clearToken() {
      this.token = null;
      localStorage.removeItem('token');
    }
  
    /**
     * Create headers for API requests
     * @returns {Object} Headers object
     */
    getHeaders() {
      const headers = {
        'Content-Type': 'application/json',
      };
  
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }
  
      return headers;
    }
  
    /**
     * Make API request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise} Promise resolving to response data
     */
    async request(endpoint, options = {}) {
      const url = `${this.baseUrl}${endpoint}`;
      
      const config = {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...(options.headers || {})
        }
      };
  
      try {
        const response = await fetch(url, config);
        const data = await response.json();
  
        if (!response.ok) {
          throw {
            status: response.status,
            statusText: response.statusText,
            data
          };
        }
  
        return data;
      } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
      }
    }
  
    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Additional options
     * @returns {Promise} Promise resolving to response data
     */
    get(endpoint, options = {}) {
      return this.request(endpoint, { method: 'GET', ...options });
    }
  
    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body data
     * @param {Object} options - Additional options
     * @returns {Promise} Promise resolving to response data
     */
    post(endpoint, data, options = {}) {
      return this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        ...options
      });
    }
  
    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body data
     * @param {Object} options - Additional options
     * @returns {Promise} Promise resolving to response data
     */
    put(endpoint, data, options = {}) {
      return this.request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
        ...options
      });
    }
  
    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Additional options
     * @returns {Promise} Promise resolving to response data
     */
    delete(endpoint, options = {}) {
      return this.request(endpoint, { method: 'DELETE', ...options });
    }
  }
  
  // Create instance
  const apiClient = new ApiClient();
  export default apiClient;