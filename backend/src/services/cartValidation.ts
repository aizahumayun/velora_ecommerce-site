import type { CartItem } from '@velora/shared';
import { ProductModel } from '../models/Product.js';

export class CartValidationError extends Error {}

export interface NormalizedCart {
  items: CartItem[];
  subtotal: number;
}

export async function normalizeCartItems(input: unknown): Promise<NormalizedCart> {
  if (!Array.isArray(input) || input.length === 0 || input.length > 50) {
    throw new CartValidationError('Cart must contain between 1 and 50 items.');
  }

  const requestedItems = input.map((value) => {
    if (!value || typeof value !== 'object') {
      throw new CartValidationError('Cart item is invalid.');
    }

    const item = value as Record<string, unknown>;
    if (
      typeof item.productId !== 'string' || !item.productId.trim() || item.productId.length > 120 ||
      typeof item.color !== 'string' || !item.color.trim() || item.color.length > 80 ||
      typeof item.size !== 'string' || !item.size.trim() || item.size.length > 20 ||
      typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) ||
      item.quantity < 1 || item.quantity > 50
    ) {
      throw new CartValidationError('Cart item details are invalid.');
    }

    return {
      productId: item.productId.trim(),
      color: item.color.trim(),
      size: item.size.trim().toUpperCase(),
      quantity: item.quantity,
    };
  });

  const productIds = [...new Set(requestedItems.map((item) => item.productId))];
  const products = await ProductModel.find({ id: { $in: productIds } });
  const productsById = new Map(products.map((product) => [product.id, product]));
  const quantityByProduct = new Map<string, number>();

  const items = requestedItems.map((requested): CartItem => {
    const product = productsById.get(requested.productId);
    if (!product) {
      throw new CartValidationError('A requested product is no longer available.');
    }

    const color = product.colors.find(
      (candidate) => candidate.name.toLowerCase() === requested.color.toLowerCase()
    );
    if (!color || !product.sizes.includes(requested.size)) {
      throw new CartValidationError('A requested product option is unavailable.');
    }

    const requestedQuantity = (quantityByProduct.get(product.id) || 0) + requested.quantity;
    if (requestedQuantity > product.stock) {
      throw new CartValidationError('Requested quantity exceeds available stock.');
    }
    quantityByProduct.set(product.id, requestedQuantity);

    return {
      id: `${product.id}-${color.name}-${requested.size}`,
      productId: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.images[0] || '',
      color: color.name,
      size: requested.size,
      quantity: requested.quantity,
    };
  });

  const subtotal = Math.round(
    items.reduce((total, item) => total + item.price * item.quantity, 0) * 100
  ) / 100;

  return { items, subtotal };
}