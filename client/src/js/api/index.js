// src/js/api/index.js
// Export all API modules

import { authAPI } from "./auth.js";
import { productAPI } from "./products.js";
import { categoryAPI } from "./categories.js";
import { cartAPI } from "./cart.js";
import { orderAPI } from "./orders.js";
import { addressAPI } from "./addresses.js";
import { reviewAPI } from "./reviews.js";
import { userAPI } from "./users.js";
import { discountAPI } from "./discounts.js";

// Named exports for individual APIs
export {
  authAPI,
  productAPI,
  categoryAPI,
  cartAPI,
  orderAPI,
  addressAPI,
  reviewAPI,
  userAPI,
  discountAPI,
};

// Default export with all APIs grouped
export default {
  auth: authAPI,
  product: productAPI,
  category: categoryAPI,
  cart: cartAPI,
  order: orderAPI,
  address: addressAPI,
  review: reviewAPI,
  user: userAPI,
  discount: discountAPI,
};
