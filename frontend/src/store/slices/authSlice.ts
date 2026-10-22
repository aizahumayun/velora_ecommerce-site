import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User, ShippingAddress } from '@velora/shared';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const AUTH_STORAGE_KEY = 'velora_user';

const loadUserFromStorage = (): User | null => {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Failed to load user from storage', e);
    return null;
  }
};

const initialUser = loadUserFromStorage();

const initialState: AuthState = {
  user: initialUser,
  isAuthenticated: !!initialUser,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<User | { email: string; name?: string; phone?: string }>
    ) => {
      let loggedUser: User;
      if ('id' in action.payload) {
        loggedUser = action.payload;
      } else {
        loggedUser = {
          id: `usr_${Date.now()}`,
          name: action.payload.name || action.payload.email.split('@')[0],
          email: action.payload.email,
          phone: action.payload.phone || '+1 (555) 234-5678',
        };
      }
      state.user = loggedUser;
      state.isAuthenticated = true;
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
      } catch (e) {
        console.error('Failed to save user to storage', e);
      }
    },
    register: (
      state,
      action: PayloadAction<{ name: string; email: string; phone?: string }>
    ) => {
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: action.payload.name,
        email: action.payload.email,
        phone: action.payload.phone || '',
      };
      state.user = newUser;
      state.isAuthenticated = true;
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      } catch (e) {
        console.error('Failed to save user to storage', e);
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem('velora_token');
        localStorage.removeItem('velora_guest_order_tokens');
        localStorage.removeItem('velora_orders');
      } catch (e) {
        console.error('Failed to remove user from storage', e);
      }
    },
    updateProfile: (
      state,
      action: PayloadAction<{ name?: string; phone?: string; avatar?: string }>
    ) => {
      if (state.user) {
        if (action.payload.name) state.user.name = action.payload.name;
        if (action.payload.phone !== undefined) state.user.phone = action.payload.phone;
        if (action.payload.avatar !== undefined) state.user.avatar = action.payload.avatar;
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state.user));
        } catch (e) {
          console.error(e);
        }
      }
    },
    updateShippingAddress: (state, action: PayloadAction<ShippingAddress>) => {
      if (state.user) {
        state.user.address = action.payload;
        state.user.shippingAddress = action.payload;
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state.user));
        } catch (e) {
          console.error(e);
        }
      }
    },
  },
});

export const { login, register, logout, updateProfile, updateShippingAddress } = authSlice.actions;
export default authSlice.reducer;
