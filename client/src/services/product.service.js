// src/services/product.service.js
import api from './api';

const ProductService = {
  getAllProducts: async (params) => {
    return api.get('/products', { params });
  },

  getLandingPageProducts: async () => {
    return api.get('/products/landing');
  },

  getProductBySlug: async (slug) => {
    return api.get(`/products/${slug}`);
  },

  getProductsByCategory: async (slug, params) => {
    return api.get(`/products/category/${slug}`, { params });
  },

  getCategories: async () => {
    return api.get('/categories');
  },

  getCategoryTree: async () => {
    return api.get('/categories/tree');
  },

  getMenuCategories: async () => {
    return api.get('/categories/menu');
  },

  getCategoryBySlug: async (slug) => {
    return api.get(`/categories/${slug}`);
  },

  getProductReviews: async (productId, params) => {
    return api.get(`/reviews/product/${productId}`, { params });
  },

  addProductReview: async (productId, reviewData) => {
    return api.post(`/reviews/product/${productId}`, reviewData);
  }
};

export default ProductService;