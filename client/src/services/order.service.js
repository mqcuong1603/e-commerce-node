// src/services/order.service.js
import api from './api';

const OrderService = {
  createOrder: async (orderData) => {
    return api.post('/orders', orderData);
  },

  getUserOrders: async () => {
    return api.get('/orders/user');
  },

  getOrderDetails: async (orderId) => {
    return api.get(`/orders/user/${orderId}`);
  },

  getOrderTracking: async (orderId) => {
    return api.get(`/orders/user/${orderId}/tracking`);
  },

  cancelOrder: async (orderId, reason) => {
    return api.post(`/orders/user/${orderId}/cancel`, { reason });
  }
};

export default OrderService;