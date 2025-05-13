// src/services/cart.service.js
import api from './api';

const CartService = {
  getCart: async () => {
    return api.get('/cart');
  },

  addItemToCart: async (productVariantId, quantity) => {
    return api.post('/cart/items', { productVariantId, quantity });
  },

  updateCartItem: async (productVariantId, quantity) => {
    return api.put(`/cart/items/${productVariantId}`, { quantity });
  },

  removeCartItem: async (productVariantId) => {
    return api.delete(`/cart/items/${productVariantId}`);
  },

  clearCart: async () => {
    return api.delete('/cart');
  },

  verifyDiscount: async (code) => {
    return api.post('/orders/verify-discount', { code });
  },

  applyLoyaltyPoints: async (points) => {
    return api.post('/orders/user/apply-loyalty-points', { points });
  }
};

export default CartService;