// src/services/user.service.js
import api from './api';

const UserService = {
  getUserProfile: async () => {
    return api.get('/users/profile');
  },

  updateUserProfile: async (profileData) => {
    return api.put('/users/profile', profileData);
  },

  getUserAddresses: async () => {
    return api.get('/users/addresses');
  },

  addAddress: async (addressData) => {
    return api.post('/users/addresses', addressData);
  },

  updateAddress: async (addressId, addressData) => {
    return api.put(`/users/addresses/${addressId}`, addressData);
  },

  deleteAddress: async (addressId) => {
    return api.delete(`/users/addresses/${addressId}`);
  },

  setDefaultAddress: async (addressId) => {
    return api.put(`/users/addresses/${addressId}/default`);
  },

  getLoyaltyPoints: async () => {
    return api.get('/users/loyalty-points');
  }
};

export default UserService;