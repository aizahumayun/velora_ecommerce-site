export interface ProductColor {
  name: string;
  hex: string;
  tone?: string;
}

export interface ProductSpecifications {
  fit: string[];
  materials: string;
  care: string;
  shipping: string;
  returns: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  collection?: string;
  price: number;
  originalPrice?: number;
  description: string;
  editorialDescription?: string;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  stock: number;
  lowStock?: boolean;
  featured: boolean;
  newArrival: boolean;
  itemCode?: string;
  rating?: number;
  reviewCount?: number;
  fabricRatio?: string;
  craftsmanshipNote?: string;
  specifications?: ProductSpecifications;
  styleOccasion?: 'Everyday' | 'Tailoring' | 'Occasion' | 'Casual';
}

export interface CartItem {
  id: string; // Unique cart item ID (e.g., `${productId}-${color}-${size}`)
  productId: string;
  name: string;
  category: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: string;
  streetAddress?: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  createdAt: string;
  date?: string;
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
  status: 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered';
  estimatedDelivery?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  address?: ShippingAddress;
  shippingAddress?: ShippingAddress;
}

export interface ProductFilterParams {
  category?: string;
  color?: string;
  colors?: string[];
  size?: string;
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  includeLowStock?: boolean;
  styleOccasion?: string;
  search?: string;
  sortBy?: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'name';
}
