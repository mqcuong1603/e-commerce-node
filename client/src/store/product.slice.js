// src/store/product.slice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ProductService from "../services/product.service";

export const fetchCategories = createAsyncThunk(
  "product/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ProductService.getCategories();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

export const fetchBrands = createAsyncThunk(
  "product/fetchBrands",
  async (_, { rejectWithValue }) => {
    try {
      // This would be a separate API endpoint in a real app
      // We're simulating it for now by fetching all products
      const response = await ProductService.getAllProducts({ limit: 100 });
      // Extract unique brands
      const brands = [
        ...new Set(response.data.products.map((product) => product.brand)),
      ];
      return brands;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch brands"
      );
    }
  }
);

export const fetchLandingPageProducts = createAsyncThunk(
  "product/fetchLandingPageProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ProductService.getLandingPageProducts();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch landing page products"
      );
    }
  }
);

export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async (params, { rejectWithValue }) => {
    try {
      if (params.category) {
        const response = await ProductService.getProductsByCategory(
          params.category,
          params
        );
        return response.data;
      } else {
        const response = await ProductService.getAllProducts(params);
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  "product/fetchProductBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await ProductService.getProductBySlug(slug);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product"
      );
    }
  }
);

const initialState = {
  categories: [],
  brands: [],
  newProducts: [],
  bestSellers: [],
  categoryProducts: {},
  products: [],
  currentProduct: null,
  pagination: null,
  isLoading: false,
  error: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch categories
    builder.addCase(fetchCategories.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.isLoading = false;
      state.categories = action.payload;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Fetch brands
    builder.addCase(fetchBrands.fulfilled, (state, action) => {
      state.brands = action.payload;
    });
    builder.addCase(fetchBrands.rejected, (state, action) => {
      state.error = action.payload;
    });

    // Fetch landing page products
    builder.addCase(fetchLandingPageProducts.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchLandingPageProducts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.newProducts = action.payload.newProducts || [];
      state.bestSellers = action.payload.bestSellers || [];
      state.categoryProducts = action.payload.categoryProducts || {};
    });
    builder.addCase(fetchLandingPageProducts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Fetch products
    builder.addCase(fetchProducts.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.products = action.payload.products || [];
      state.pagination = action.payload.pagination || null;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Fetch product by slug
    builder.addCase(fetchProductBySlug.pending, (state) => {
      state.isLoading = true;
      state.currentProduct = null;
    });
    builder.addCase(fetchProductBySlug.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentProduct = action.payload;
    });
    builder.addCase(fetchProductBySlug.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  },
});

export const { clearProductError } = productSlice.actions;
export default productSlice.reducer;
