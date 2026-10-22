import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, Product } from '@velora/shared';

export interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  discountCode: string | null;
  discountRate: number; // e.g. 0.1 for 10%
  shippingMethod: 'standard' | 'express';
}

const CART_STORAGE_KEY = 'velora_cart';

const getInitialItems = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading cart from storage', e);
  }

  return [];
};

const saveCart = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error(e);
  }
};

const initialState: CartState = {
  items: getInitialItems(),
  isDrawerOpen: false,
  discountCode: 'WELCOME10',
  discountRate: 0.1, // 10% Member Introduction Discount as shown in screen
  shippingMethod: 'standard',
};

export type AddToCartPayload =
  | {
      product: Product;
      size: string;
      color: string;
      quantity?: number;
    }
  | {
      id?: string;
      productId: string;
      name: string;
      category: string;
      price: number;
      image: string;
      color: string;
      size: string;
      quantity?: number;
    };

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<AddToCartPayload>) => {
      let productId: string;
      let name: string;
      let category: string;
      let price: number;
      let image: string;
      let color: string;
      let size: string;
      let quantity = 1;

      if ('product' in action.payload) {
        const p = action.payload.product;
        productId = p.id;
        name = p.name;
        category = p.category;
        price = p.price;
        image = p.images[0] || '';
        color = action.payload.color;
        size = action.payload.size;
        quantity = action.payload.quantity ?? 1;
      } else {
        productId = action.payload.productId;
        name = action.payload.name;
        category = action.payload.category;
        price = action.payload.price;
        image = action.payload.image;
        color = action.payload.color;
        size = action.payload.size;
        quantity = action.payload.quantity ?? 1;
      }

      const itemId = `${productId}-${color}-${size}`;
      const existing = state.items.find((item) => item.id === itemId);

      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({
          id: itemId,
          productId,
          name,
          category,
          price,
          image,
          color,
          size,
          quantity,
        });
      }
      saveCart(state.items);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      saveCart(state.items);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity?: number; delta?: number }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        if (action.payload.quantity !== undefined) {
          item.quantity = action.payload.quantity;
        } else if (action.payload.delta !== undefined) {
          item.quantity += action.payload.delta;
        }
        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== action.payload.id);
        }
      }
      saveCart(state.items);
    },

    setQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== action.payload.id);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
      saveCart(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      saveCart(state.items);
    },

    openCartDrawer: (state) => {
      state.isDrawerOpen = true;
    },

    closeCartDrawer: (state) => {
      state.isDrawerOpen = false;
    },

    toggleCartDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },

    applyDiscountCode: (
      state,
      action: PayloadAction<{ code: string; rate?: number } | string>
    ) => {
      if (typeof action.payload === 'string') {
        const code = action.payload.trim().toUpperCase();
        state.discountCode = code;
        state.discountRate = code === 'VELORA15' || code === 'VIP15' ? 0.15 : 0.1;
      } else {
        state.discountCode = action.payload.code.trim().toUpperCase();
        state.discountRate = action.payload.rate ?? 0.1;
      }
    },

    removeDiscountCode: (state) => {
      state.discountCode = null;
      state.discountRate = 0;
    },

    setShippingMethod: (
      state,
      action: PayloadAction<'standard' | 'express'>
    ) => {
      state.shippingMethod = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  setQuantity,
  clearCart,
  openCartDrawer,
  closeCartDrawer,
  toggleCartDrawer,
  applyDiscountCode,
  removeDiscountCode,
  setShippingMethod,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartDrawerOpen = (state: { cart: CartState }) => state.cart.isDrawerOpen;
export const selectCartTotalCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartSubtotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

export const selectCartDiscountAmount = (state: { cart: CartState }) => {
  const subtotal = selectCartSubtotal(state);
  return Math.round(subtotal * state.cart.discountRate);
};

export const selectCartFinalTotal = (state: { cart: CartState }) => {
  const subtotal = selectCartSubtotal(state);
  const discount = selectCartDiscountAmount(state);
  return Math.max(0, subtotal - discount);
};

export default cartSlice.reducer;
