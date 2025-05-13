// src/store/cart.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import CartService from '../services/cart.service';

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CartService.getCart();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productVariantId, quantity }, { rejectWithValue }) => {
    try {
      const response = await CartService.addItemToCart(productVariantId, quantity);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productVariantId, quantity }, { rejectWithValue }) => {
    try {
      const response = await CartService.updateCartItem(productVariantId, quantity);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart item');
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (productVariantId, { rejectWithValue }) => {
    try {
      const response = await CartService.removeCartItem(productVariantId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove cart item');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CartService.clearCart();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

export const applyDiscount = createAsyncThunk(
  'cart/applyDiscount',
  async (code, { rejectWithValue }) => {
    try {
      const response = await CartService.verifyDiscount(code);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid discount code');
    }
  }
);

const initialState = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  shipping: 0,
  tax: 0,
  discount: {
    code: null,
    amount: 0,
  },
  total: 0,
  loyaltyPoints: 0,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder.addCase(fetchCart.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload.items || [];
      state.itemCount = action.payload.itemCount || 0;
      state.subtotal = action.payload.subtotal || 0;
      state.shipping = action.payload.shipping || 0;
      state.tax = action.payload.tax || 0;
      state.total = action.payload.total || 0;

      if (action.payload.discount) {
        state.discount = {
          code: action.payload.discount.code || null,
          amount: action.payload.discount.amount || 0,
        };
      }
    });
    builder.addCase(fetchCart.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Handle other actions (add, update, remove, clear)
    const pendingActions = [
      addToCart.pending,
      updateCartItem.pending,
      removeCartItem.pending,
      clearCart.pending,
      applyDiscount.pending,
    ];

    const fulfilledActions = [
      addToCart.fulfilled,
      updateCartItem.fulfilled,
      removeCartItem.fulfilled,
      clearCart.fulfilled,
    ];

    const rejectedActions = [
      addToCart.rejected,
      updateCartItem.rejected,
      removeCartItem.rejected,
      clearCart.rejected,
      applyDiscount.rejected,
    ];

    pendingActions.forEach((action) => {
      builder.addCase(action, (state) => {
        state.isLoading = true;
        state.error = null;
      });
    });

    fulfilledActions.forEach((action) => {
      builder.addCase(action, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.itemCount = action.payload.itemCount || 0;
        state.subtotal = action.payload.subtotal || 0;
        state.shipping = action.payload.shipping || 0;
        state.tax = action.payload.tax || 0;
        state.total = action.payload.total || 0;
      });
    });

    rejectedActions.forEach((action) => {
      builder.addCase(action, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    });

    // Special case for discount
    builder.addCase(applyDiscount.fulfilled, (state, action) => {
      state.isLoading = false;
      state.discount = {
        code: action.payload.code,
        amount: action.payload.discountAmount,
      };
      state.total = state.subtotal + state.shipping + state.tax - action.payload.discountAmount;
    });
  },
});

export const { clearCartError } = cartSlice.actions;
export default cartSlice.reducer;