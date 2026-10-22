import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { CartModel } from '../models/Cart.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { CartValidationError, normalizeCartItems } from '../services/cartValidation.js';

export const cartRouter = Router();

/**
 * GET /api/cart
 * Retrieves the authenticated user's cart from MongoDB
 */
cartRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        error: 'Database unavailable',
        message: 'MongoDB connection is currently unavailable.',
      });
      return;
    }

    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid user session' });
      return;
    }

    const cart = await CartModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    res.status(200).json({ items: cart?.items || [] });
  } catch (error) {
    console.error('Error fetching cart:', error instanceof Error ? error.name : 'Unknown error');
    res.status(500).json({
      error: 'Failed to retrieve cart',
      message: 'Internal server error.',
    });
  }
});

/**
 * PUT /api/cart
 * Persists the authenticated user's cart items in MongoDB
 */
cartRouter.put('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        error: 'Database unavailable',
        message: 'MongoDB connection is currently unavailable.',
      });
      return;
    }

    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid user session' });
      return;
    }

    const { items } = await normalizeCartItems(req.body?.items);

    const updatedCart = await CartModel.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      { items, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ items: updatedCart.items });
  } catch (error) {
    if (error instanceof CartValidationError) {
      res.status(400).json({ error: 'Validation error', message: error.message });
      return;
    }
    console.error('Error saving cart:', error);
    res.status(500).json({
      error: 'Failed to save cart',
      message: 'Internal server error.',
    });
  }
});

/**
 * DELETE /api/cart
 * Clears the authenticated user's cart in MongoDB
 */
cartRouter.delete('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        error: 'Database unavailable',
        message: 'MongoDB connection is currently unavailable.',
      });
      return;
    }

    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid user session' });
      return;
    }

    await CartModel.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      { items: [] }
    );

    res.status(200).json({ message: 'Cart cleared', items: [] });
  } catch (error) {
    console.error('Error clearing cart:', error instanceof Error ? error.name : 'Unknown error');
    res.status(500).json({
      error: 'Failed to clear cart',
      message: 'Internal server error.',
    });
  }
});

export default cartRouter;
