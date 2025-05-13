// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth.slice';
import cartReducer from './cart.slice';
import productReducer from './product.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    product: productReducer,
  },
});