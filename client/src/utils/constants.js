// src/utils/constants.js

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    UPDATE_PASSWORD: '/auth/update-password',
  },
  PRODUCTS: {
    BASE: '/products',
    LANDING: '/products/landing',
    CATEGORY: '/products/category',
  },
  CATEGORIES: {
    BASE: '/categories',
    TREE: '/categories/tree',
    MENU: '/categories/menu',
  },
  CART: {
    BASE: '/cart',
    ITEMS: '/cart/items',
  },
  ORDERS: {
    BASE: '/orders',
    USER: '/orders/user',
    VERIFY_DISCOUNT: '/orders/verify-discount',
    APPLY_LOYALTY: '/orders/user/apply-loyalty-points',
  },
  USERS: {
    PROFILE: '/users/profile',
    ADDRESSES: '/users/addresses',
    LOYALTY_POINTS: '/users/loyalty-points',
  },
  REVIEWS: {
    PRODUCT: '/reviews/product',
  },
};

// Order status constants
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Payment methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
};

// Sort options for products
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
  { value: 'bestselling', label: 'Best Selling' },
  { value: 'rating', label: 'Top Rated' },
];

// Countries for address forms
export const COUNTRIES = [
  { code: 'VN', name: 'Vietnam' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'JP', name: 'Japan' },
];

// Default pagination limits
export const PAGINATION = {
  PRODUCTS_PER_PAGE: 12,
  ORDERS_PER_PAGE: 10,
  REVIEWS_PER_PAGE: 5,
};

// Loyalty points conversion rate (1 point = 1,000 VND)
export const LOYALTY_POINT_VALUE = 1000;