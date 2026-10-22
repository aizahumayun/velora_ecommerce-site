import { INITIAL_PRODUCTS } from '@velora/shared';
import type { Product, ProductFilterParams } from '@velora/shared';
import { api } from './api';

// In-memory cache starting with initial mock data, updated whenever API returns data
let cachedProducts: Product[] = [...INITIAL_PRODUCTS];

export const productService = {
  /**
   * Update internal products cache
   */
  updateCache(newProducts: Product[]) {
    if (!Array.isArray(newProducts) || newProducts.length === 0) return;
    const map = new Map<string, Product>();
    // Seed with existing cache
    cachedProducts.forEach((p) => map.set(p.id, p));
    // Overlay newly fetched products
    newProducts.forEach((p) => {
      if (p && p.id) {
        map.set(p.id, p);
      }
    });
    cachedProducts = Array.from(map.values());
  },

  /**
   * Synchronously filter products from cache/mock data
   */
  getProductsSync(params?: ProductFilterParams): Product[] {
    let products = [...cachedProducts];

    if (!params) return products;

    // Filter by category
    if (params.category && params.category.toLowerCase() !== 'all') {
      const catLower = params.category.toLowerCase().replace(/-/g, ' ');
      if (catLower === 'new arrivals' || catLower === 'new') {
        products = products.filter((p) => p.newArrival);
      } else if (catLower === 'bottoms' || catLower === 'trousers') {
        products = products.filter(
          (p) => p.category.toLowerCase() === 'bottoms' || p.category.toLowerCase() === 'trousers'
        );
      } else {
        products = products.filter((p) => p.category.toLowerCase() === catLower);
      }
    }

    // Filter by search query
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.collection?.toLowerCase().includes(q)
      );
    }

    // Filter by multiple colors or single color
    if (params.colors && params.colors.length > 0) {
      const selected = params.colors.map((c) => c.toLowerCase());
      products = products.filter((p) =>
        p.colors.some((c) => selected.some((s) => c.name.toLowerCase().includes(s)))
      );
    } else if (params.color) {
      const selectedColors = params.color.split(',').map((c) => c.trim().toLowerCase());
      products = products.filter((p) =>
        p.colors.some((c) => selectedColors.some((sc) => c.name.toLowerCase().includes(sc)))
      );
    }

    // Filter by sizes
    if (params.sizes && params.sizes.length > 0) {
      const selected = params.sizes.map((s) => s.toUpperCase());
      products = products.filter((p) =>
        p.sizes.some((s) => selected.includes(s.toUpperCase()))
      );
    } else if (params.size) {
      const selectedSizes = params.size.split(',').map((s) => s.trim().toUpperCase());
      products = products.filter((p) =>
        p.sizes.some((s) => selectedSizes.includes(s.toUpperCase()))
      );
    }

    // Filter by price range
    if (typeof params.minPrice === 'number') {
      products = products.filter((p) => p.price >= params.minPrice!);
    }
    if (typeof params.maxPrice === 'number') {
      products = products.filter((p) => p.price <= params.maxPrice!);
    }

    // Filter by stock
    if (params.inStockOnly) {
      products = products.filter((p) => p.stock > 0);
    }
    if (params.includeLowStock === false) {
      products = products.filter((p) => !p.lowStock);
    }

    // Filter by style occasion
    if (params.styleOccasion) {
      products = products.filter(
        (p) => p.styleOccasion?.toLowerCase() === params.styleOccasion?.toLowerCase()
      );
    }

    // Sorting
    if (params.sortBy) {
      switch (params.sortBy) {
        case 'price-asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          products.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
          break;
        case 'name':
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'featured':
        default:
          products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
          break;
      }
    }

    return products;
  },

  /**
   * Synchronously get product by ID from cache/mock data
   */
  getProductByIdSync(id: string): Product | null {
    return cachedProducts.find((p) => p.id === id) || INITIAL_PRODUCTS.find((p) => p.id === id) || null;
  },

  /**
   * Synchronously get related products
   */
  getRelatedProductsSync(productId: string, limit = 4): Product[] {
    const current = this.getProductByIdSync(productId);
    if (!current) return cachedProducts.slice(0, limit);

    return cachedProducts
      .filter((p) => p.id !== productId && (p.category === current.category || p.featured))
      .slice(0, limit);
  },

  /**
   * Async getProducts: Fetches from backend /api/products first.
   * On failure or offline, transparently falls back to local mock data.
   */
  async getProducts(params?: ProductFilterParams): Promise<Product[]> {
    try {
      const response = await api.get<Product[]>('/products', { params });
      if (response && response.data && Array.isArray(response.data)) {
        this.updateCache(response.data);
        return response.data;
      }
    } catch (error) {
      console.warn('Backend /api/products unavailable or error encountered; using mock fallback.', error);
    }
    return this.getProductsSync(params);
  },

  /**
   * Async getProductById: Fetches from backend /api/products/:id first.
   * On failure or 404/500, falls back to local mock data.
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await api.get<Product>(`/products/${encodeURIComponent(id)}`);
      if (response && response.data && response.data.id) {
        this.updateCache([response.data]);
        return response.data;
      }
    } catch (error) {
      console.warn(`Backend /api/products/${id} unavailable; using mock fallback.`, error);
    }
    return this.getProductByIdSync(id);
  },

  /**
   * Async getRelatedProducts
   */
  async getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
    const current = await this.getProductById(productId);
    if (!current) return this.getRelatedProductsSync(productId, limit);

    return cachedProducts
      .filter((p) => p.id !== productId && (p.category === current.category || p.featured))
      .slice(0, limit);
  },

  /**
   * Fetch featured products
   */
  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const products = await this.getProducts({ sortBy: 'featured' });
      return products.filter((p) => p.featured).slice(0, 4);
    } catch {
      return this.getProductsSync({ sortBy: 'featured' }).filter((p) => p.featured).slice(0, 4);
    }
  },

  /**
   * Fetch new arrivals
   */
  async getNewArrivals(): Promise<Product[]> {
    try {
      const products = await this.getProducts({ sortBy: 'newest' });
      return products.filter((p) => p.newArrival).slice(0, 4);
    } catch {
      return this.getProductsSync({ sortBy: 'newest' }).filter((p) => p.newArrival).slice(0, 4);
    }
  },
};
