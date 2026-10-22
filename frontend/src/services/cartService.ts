import { api } from './api';
import type { CartItem } from '@velora/shared';

export const cartService = {
  /**
   * Fetch authenticated user's cart from MongoDB
   */
  async fetchRemoteCart(): Promise<CartItem[] | null> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('velora_token') : null;
      if (!token) return null;

      const response = await api.get<{ items: CartItem[] }>('/cart');
      return response.data?.items || [];
    } catch {
      return null;
    }
  },

  /**
   * Save cart to backend MongoDB if user is authenticated
   */
  async syncRemoteCart(items: CartItem[]): Promise<void> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('velora_token') : null;
      if (!token) return;

      await api.put('/cart', { items });
    } catch {
      // Non-blocking sync error
    }
  },

  /**
   * Clear remote cart upon checkout completion
   */
  async clearRemoteCart(): Promise<void> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('velora_token') : null;
      if (!token) return;

      await api.delete('/cart');
    } catch {
      // Non-blocking
    }
  },
};

export default cartService;
