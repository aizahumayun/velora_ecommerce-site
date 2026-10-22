import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ProductModel } from '../models/Product.js';

export const productRouter = Router();

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * GET /api/products
 * Retrieves products from MongoDB with optional query filtering and sorting.
 */
productRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        error: 'Database unavailable',
        message: 'MongoDB connection is currently unavailable. Please try again shortly.',
      });
      return;
    }

    const {
      category,
      search,
      q,
      color,
      colors,
      size,
      sizes,
      minPrice,
      maxPrice,
      inStockOnly,
      includeLowStock,
      styleOccasion,
      sortBy,
    } = req.query;

    const filter: Record<string, any> = {};

    // 1. Category filtering
    const categoryQuery = (category as string)?.trim();
    if (categoryQuery && categoryQuery.toLowerCase() !== 'all') {
      const catLower = categoryQuery.toLowerCase().replace(/-/g, ' ');
      if (catLower === 'new arrivals' || catLower === 'new') {
        filter.newArrival = true;
      } else if (catLower === 'bottoms' || catLower === 'trousers') {
        filter.category = { $in: [/^bottoms$/i, /^trousers$/i] };
      } else {
        filter.category = new RegExp(`^${escapeRegex(catLower)}$`, 'i');
      }
    }

    // 2. Search query filtering (by name, category, description, collection)
    const searchTerm = (search || q) as string | undefined;
    if (searchTerm && searchTerm.trim()) {
      const escaped = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [
        { name: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
        { collection: searchRegex },
      ];
    }

    // 3. Color filtering
    let parsedColors: string[] = [];
    if (Array.isArray(colors)) {
      parsedColors = colors.map((c) => String(c).trim().toLowerCase());
    } else if (typeof colors === 'string') {
      parsedColors = colors.split(',').map((c) => c.trim().toLowerCase()).filter(Boolean);
    } else if (typeof color === 'string') {
      parsedColors = color.split(',').map((c) => c.trim().toLowerCase()).filter(Boolean);
    }

    if (parsedColors.length > 0) {
      const colorRegexes = parsedColors.map((c) => new RegExp(escapeRegex(c), 'i'));
      filter['colors.name'] = { $in: colorRegexes };
    }

    // 4. Size filtering
    let parsedSizes: string[] = [];
    if (Array.isArray(sizes)) {
      parsedSizes = sizes.map((s) => String(s).trim().toUpperCase());
    } else if (typeof sizes === 'string') {
      parsedSizes = sizes.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
    } else if (typeof size === 'string') {
      parsedSizes = size.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
    }

    if (parsedSizes.length > 0) {
      filter.sizes = { $in: parsedSizes };
    }

    // 5. Price range filtering
    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      filter.price = { ...filter.price, $gte: Number(minPrice) };
    }
    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      filter.price = { ...filter.price, $lte: Number(maxPrice) };
    }

    // 6. Stock filtering
    if (inStockOnly === 'true' || inStockOnly === '1') {
      filter.stock = { $gt: 0 };
    }
    if (includeLowStock === 'false' || includeLowStock === '0') {
      filter.lowStock = { $ne: true };
    }

    // 7. Style Occasion
    if (styleOccasion && typeof styleOccasion === 'string' && styleOccasion.trim()) {
      filter.styleOccasion = new RegExp(`^${escapeRegex(styleOccasion.trim())}$`, 'i');
    }

    // 8. Sorting
    let sortOptions: Record<string, 1 | -1> = { featured: -1, _id: 1 };
    if (sortBy === 'price-asc') {
      sortOptions = { price: 1 };
    } else if (sortBy === 'price-desc') {
      sortOptions = { price: -1 };
    } else if (sortBy === 'newest') {
      sortOptions = { newArrival: -1, createdAt: -1 };
    } else if (sortBy === 'name') {
      sortOptions = { name: 1 };
    } else if (sortBy === 'featured') {
      sortOptions = { featured: -1, _id: 1 };
    }

    const products = await ProductModel.find(filter).sort(sortOptions);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error instanceof Error ? error.name : 'Unknown error');
    res.status(500).json({
      error: 'Failed to retrieve products',
      message: 'Internal server error',
    });
  }
});

/**
 * GET /api/products/:id
 * Retrieves a single product by either its custom slug id (e.g. 'soft-draped-midi-dress')
 * or MongoDB ObjectId.
 */
productRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        error: 'Database unavailable',
        message: 'MongoDB connection is currently unavailable.',
      });
      return;
    }

    const { id } = req.params;
    if (!id || !id.trim()) {
      res.status(400).json({
        error: 'Invalid parameter',
        message: 'A product ID or slug parameter is required.',
      });
      return;
    }

    const trimmedId = id.trim();

    // Support lookup by custom slug ID or MongoDB ObjectId
    let product = await ProductModel.findOne({ id: trimmedId });

    if (!product && mongoose.Types.ObjectId.isValid(trimmedId)) {
      product = await ProductModel.findById(trimmedId);
    }

    if (!product) {
      res.status(404).json({
        error: 'Not found',
        message: `Product with identifier "${trimmedId}" was not found in catalog.`,
      });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error('Error retrieving product:', error instanceof Error ? error.name : 'Unknown error');
    res.status(500).json({
      error: 'Failed to retrieve product',
      message: 'Internal server error',
    });
  }
});

export default productRouter;
