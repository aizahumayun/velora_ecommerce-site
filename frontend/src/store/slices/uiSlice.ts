import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@velora/shared';

interface ToastState {
  isOpen: boolean;
  message: string;
  submessage?: string;
}

interface QuickAddState {
  isOpen: boolean;
  product: Product | null;
  initialColor?: string;
  initialSize?: string;
}

interface UiState {
  isSearchOpen: boolean;
  searchQuery: string;
  sizeGuideModalOpen: boolean;
  quickAddModal: QuickAddState;
  toast: ToastState;
}

const initialState: UiState = {
  isSearchOpen: false,
  searchQuery: '',
  sizeGuideModalOpen: false,
  quickAddModal: {
    isOpen: false,
    product: null,
  },
  toast: {
    isOpen: false,
    message: '',
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSearch: (state) => {
      state.isSearchOpen = !state.isSearchOpen;
    },
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.isSearchOpen = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    openSizeGuide: (state) => {
      state.sizeGuideModalOpen = true;
    },
    closeSizeGuide: (state) => {
      state.sizeGuideModalOpen = false;
    },
    openQuickAdd: (
      state,
      action: PayloadAction<{
        product: Product;
        initialColor?: string;
        initialSize?: string;
      }>
    ) => {
      state.quickAddModal = {
        isOpen: true,
        product: action.payload.product,
        initialColor: action.payload.initialColor,
        initialSize: action.payload.initialSize,
      };
    },
    closeQuickAdd: (state) => {
      state.quickAddModal.isOpen = false;
      state.quickAddModal.product = null;
    },
    showToast: (
      state,
      action: PayloadAction<{ message: string; submessage?: string }>
    ) => {
      state.toast = {
        isOpen: true,
        message: action.payload.message,
        submessage: action.payload.submessage,
      };
    },
    hideToast: (state) => {
      state.toast.isOpen = false;
    },
  },
});

export const {
  toggleSearch,
  setSearchOpen,
  setSearchQuery,
  openSizeGuide,
  closeSizeGuide,
  openQuickAdd,
  closeQuickAdd,
  showToast,
  hideToast,
} = uiSlice.actions;

export default uiSlice.reducer;
