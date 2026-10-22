import type { CartItem, Order, ShippingAddress } from '@velora/shared';
import { api } from './api';

export interface CreateOrderPayload {
  items: CartItem[];
  subtotal: number;
  discount?: number;
  discountCode?: string;
  shippingMethod: 'standard' | 'express';
  shippingCost: number;
  tax?: number;
  estimatedTax?: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
  customerEmail?: string;
  customerName?: string;
}

const ORDERS_STORAGE_KEY = 'velora_orders';
const GUEST_ORDER_TOKENS_KEY = 'velora_guest_order_tokens';

function readGuestOrderTokens(): Record<string, string> {
  try {
    const value = localStorage.getItem(GUEST_ORDER_TOKENS_KEY);
    const parsed: unknown = value ? JSON.parse(value) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, string>
      : {};
  } catch {
    return {};
  }
}

function saveGuestOrderToken(order: Order, token: string): void {
  try {
    const tokens = readGuestOrderTokens();
    if (order.id) tokens[order.id] = token;
    if (order.orderNumber) tokens[order.orderNumber] = token;
    localStorage.setItem(GUEST_ORDER_TOKENS_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.error('Failed to save guest order access token:', error);
  }
}

const getInitialOrders = (): Order[] => {
  return [
    {
      id: 'VEL-89421-NYC',
      orderNumber: 'VEL-89421',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      customerName: 'Client Member',
      customerEmail: 'client@velora-studio.com',
      items: [
        {
          id: 'structured-double-breasted-wool-blazer-Sand-S',
          productId: 'structured-double-breasted-wool-blazer',
          name: 'Structured Double-Breasted Wool Blazer',
          category: 'Blazers',
          price: 340,
          image:
            'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=800&q=80',
          color: 'Sandstone Taupe',
          size: 'S',
          quantity: 1,
        },
        {
          id: 'soft-draped-midi-dress-Sand-S',
          productId: 'soft-draped-midi-dress',
          name: 'Soft Draped Midi Dress',
          category: 'Dresses',
          price: 165,
          image:
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
          color: 'Sand',
          size: 'S',
          quantity: 1,
        },
      ],
      subtotal: 505.0,
      discount: 0,
      shippingMethod: 'standard',
      shippingCost: 0,
      tax: 40.4,
      estimatedTax: 40.4,
      total: 545.4,
      paymentMethod: 'Credit Card',
      shippingAddress: {
        firstName: 'Client',
        lastName: 'Member',
        email: 'client@velora-studio.com',
        phone: '+1 (555) 234-5678',
        address: '742 Evergreen Terrace',
        streetAddress: '742 Evergreen Terrace',
        apartment: 'Suite 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
      },
      status: 'Confirmed',
      estimatedDelivery: '3–5 business days',
    },
  ];
};

export const orderService = {
  /**
   * Synchronously get all stored orders from cache/localStorage
   */
  getAllOrders(): Order[] {
    try {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    const initial = getInitialOrders();
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(initial));
    } catch {}
    return initial;
  },

  /**
   * Find order by ID from local cache synchronously
   */
  getOrderById(id: string): Order | null {
    const all = this.getAllOrders();
    return all.find((o) => o.id === id || o.orderNumber === id) || null;
  },

  /**
   * Fetch order from backend API with fallback to local cache
   */
  async fetchOrderById(id: string): Promise<Order | null> {
    try {
      const accessToken = readGuestOrderTokens()[id];
      const response = await api.get<Order>(`/orders/${encodeURIComponent(id)}`, {
        headers: accessToken ? { 'X-Order-Access-Token': accessToken } : undefined,
      });
      if (response.data) {
        const order = response.data;
        // Merge into local cache
        const all = this.getAllOrders();
        const filtered = all.filter((o) => o.id !== order.id && o.orderNumber !== order.orderNumber);
        try {
          localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([order, ...filtered]));
        } catch {}
        return order;
      }
    } catch (error) {
      console.warn(`Could not fetch order ${id} from API, using cached data:`, error);
    }
    return this.getOrderById(id);
  },

  /**
  * Create a new order via the Express backend
   */
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    try {
      const response = await api.post<{
        message?: string;
        order: Order;
        guestAccessToken?: string;
      }>('/orders', payload);
      const createdOrder = response.data.order;
      if (!createdOrder) {
        throw new Error('Order API returned no order.');
      }

      if (response.data.guestAccessToken) {
        saveGuestOrderToken(createdOrder, response.data.guestAccessToken);
      }
      try {
        const existing = this.getAllOrders();
        const filtered = existing.filter((o) => o.id !== createdOrder.id);
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([createdOrder, ...filtered]));
      } catch (error) {
        console.error('Failed to update local order cache:', error);
      }
      return createdOrder;
    } catch (error) {
      console.error('Backend order creation failed:', error instanceof Error ? error.name : 'Unknown error');
      throw new Error('Order could not be saved. Please try again when the service is available.');
    }
  },

  /**
   * Async get orders from backend with fallback to cached orders
   */
  async getOrders(): Promise<Order[]> {
    try {
      const response = await api.get<Order[]>('/orders');
      if (Array.isArray(response.data)) {
        try {
          localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(response.data));
        } catch {}
        return response.data;
      }
    } catch (error) {
      console.warn('Could not fetch orders from API, returning local cache:', error);
    }
    return this.getAllOrders();
  },
};

export default orderService;
