// src/js/api/index.js
// Export all API modules
import { authAPI } from './auth.js';
import { productAPI } from './products.js';
import { categoryAPI } from './categories.js';
import { cartAPI } from './cart.js';
import { orderAPI } from './orders.js';
import { addressAPI } from './addresses.js';
import { reviewAPI } from './reviews.js';

export {
  authAPI,
  productAPI,
  categoryAPI,
  cartAPI,
  orderAPI,
  addressAPI,
  reviewAPI
};

// Default export with all APIs
export default {
  auth: authAPI,
  product: productAPI,
  category: categoryAPI,
  cart: cartAPI,
  order: orderAPI,
  address: addressAPI,
  review: reviewAPI
};