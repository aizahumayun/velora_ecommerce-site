import { Router, Response } from 'express';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import mongoose from 'mongoose';
import { OrderModel } from '../models/Order.js';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { emailService } from '../services/emailService.js';
import { CartValidationError, normalizeCartItems } from '../services/cartValidation.js';

export const orderRouter = Router();

/**
 * Generate a unique VELORA order number (e.g. VEL-84920)
 */
async function generateUniqueOrderNumber(): Promise<string> {
  let unique = false;
  let orderNumber = '';
  let attempts = 0;

  while (!unique && attempts < 10) {
    attempts++;
    orderNumber = `VEL-${randomBytes(6).toString('hex').toUpperCase()}`;
    const existing = await OrderModel.findOne({ orderNumber });
    if (!existing) {
      unique = true;
    }
  }

  return orderNumber || `VEL-${randomBytes(8).toString('hex').toUpperCase()}`;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hashGuestAccessToken = (token: string) => createHash('sha256').update(token).digest('hex');

/**
 * POST /api/orders
 * Creates a new order in MongoDB.
 * If user is authenticated via Bearer token, attaches userId.
 * Triggers order confirmation email (or logs unconfigured notice).
 */
orderRouter.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        error: 'Database unavailable',
        message: 'MongoDB connection is currently unavailable. Please try again shortly.',
      });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const shippingMethod = body.shippingMethod ?? 'standard';
    if (shippingMethod !== 'standard' && shippingMethod !== 'express') {
      res.status(400).json({
        error: 'Validation error',
        message: 'A valid shipping method is required.',
      });
      return;
    }

    const addressValue = body.shippingAddress;
    if (!addressValue || typeof addressValue !== 'object') {
      res.status(400).json({
        error: 'Validation error',
        message: 'A complete shipping address is required to place an order.',
      });
      return;
    }

    const addressInput = addressValue as Record<string, unknown>;
    const readAddressField = (key: string): string =>
      typeof addressInput[key] === 'string' ? (addressInput[key] as string).trim() : '';
    const firstName = readAddressField('firstName');
    const lastName = readAddressField('lastName');
    const city = readAddressField('city');
    const postalCode = readAddressField('postalCode');
    const phone = readAddressField('phone');
    if (!firstName || !lastName || !city || !postalCode || !phone) {
      res.status(400).json({
        error: 'Validation error',
        message: 'A complete shipping address is required to place an order.',
      });
      return;
    }

    const emailInput = req.user?.email ||
      (typeof body.customerEmail === 'string' ? body.customerEmail : readAddressField('email'));
    const finalEmail = emailInput.trim().toLowerCase();
    if (!EMAIL_REGEX.test(finalEmail)) {
      res.status(400).json({ error: 'Validation error', message: 'A valid customer email is required.' });
      return;
    }

    const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
    const finalName = customerName || `${firstName} ${lastName}`;
    const normalizedCart = await normalizeCartItems(body.items);
    const { items, subtotal } = normalizedCart;
    const normalizedShippingMethod = shippingMethod as 'standard' | 'express';
    const shippingCost = normalizedShippingMethod === 'express' ? 25 : subtotal >= 250 ? 0 : 15;
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + shippingCost + tax;
    const shippingAddress = {
      firstName,
      lastName,
      email: finalEmail,
      phone,
      address: readAddressField('address'),
      streetAddress: readAddressField('streetAddress'),
      apartment: readAddressField('apartment'),
      city,
      state: readAddressField('state'),
      postalCode,
      country: readAddressField('country') || 'United States',
    };

    // Determine estimated delivery date string
    const now = new Date();
    const deliveryDays = shippingMethod === 'express' ? 2 : 4;
    const estDeliveryDate = new Date(now.getTime() + deliveryDays * 24 * 60 * 60 * 1000);
    const estDeliveryStr = estDeliveryDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const orderNumber = await generateUniqueOrderNumber();
    const guestAccessToken = req.user ? undefined : randomBytes(32).toString('base64url');

    const orderDoc = new OrderModel({
      orderNumber,
      userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : null,
      customerName: finalName,
      customerEmail: finalEmail,
      items,
      shippingAddress: {
        ...shippingAddress,
      },
      subtotal,
      discount: 0,
      discountCode: '',
      shippingMethod: normalizedShippingMethod,
      shippingCost,
      tax,
      estimatedTax: tax,
      total,
      paymentMethod: 'Credit / Debit Card',
      guestAccessTokenHash: guestAccessToken ? hashGuestAccessToken(guestAccessToken) : undefined,
      status: 'Confirmed',
      estimatedDelivery: estDeliveryStr,
      date: now.toISOString(),
    });

    await orderDoc.save();

    // Trigger order confirmation email in the background (gracefully logs if unconfigured)
    emailService
      .sendOrderConfirmationEmail(orderDoc.toJSON())
      .catch((err) => console.error('Error during email dispatch background task:', err));

    res.status(201).json({
      message: 'Order created successfully',
      order: orderDoc.toJSON(),
      ...(guestAccessToken ? { guestAccessToken } : {}),
    });
  } catch (error) {
    if (error instanceof CartValidationError) {
      res.status(400).json({ error: 'Validation error', message: error.message });
      return;
    }
    console.error('Error creating order:', error instanceof Error ? error.name : 'Unknown error');
    res.status(500).json({
      error: 'Order creation failed',
      message: 'Internal server error while placing order.',
    });
  }
});

/**
 * GET /api/orders
 * Retrieves all orders belonging to the authenticated user.
 * Users must only access their own orders.
 */
orderRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid user session.' });
      return;
    }

    const orders = await OrderModel.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error instanceof Error ? error.name : 'Unknown error');
    res.status(500).json({
      error: 'Failed to retrieve orders',
      message: 'Internal server error.',
    });
  }
});

/**
 * GET /api/orders/:id
 * Retrieves a single order by orderNumber or MongoDB ObjectId.
 * Enforces ownership: users can only access their own orders.
 */
orderRouter.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
        message: 'An order ID or order number is required.',
      });
      return;
    }

    const trimmedId = id.trim();

    // Lookup order by orderNumber or ObjectId
    let order = await OrderModel.findOne({ orderNumber: trimmedId }).select('+guestAccessTokenHash');
    if (!order && mongoose.Types.ObjectId.isValid(trimmedId)) {
      order = await OrderModel.findById(trimmedId).select('+guestAccessTokenHash');
    }

    if (!order) {
      res.status(404).json({
        error: 'Order not found',
        message: `Order with identifier "${trimmedId}" was not found.`,
      });
      return;
    }

    // Ownership check: Users must only access their own orders
    if (order.userId) {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required to view this order.',
        });
        return;
      }

      if (order.userId.toString() !== req.user.id) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to access this order.',
        });
        return;
      }
    } else {
      const suppliedToken = req.get('X-Order-Access-Token');
      if (!suppliedToken || !order.guestAccessTokenHash) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'A guest order access token is required.',
        });
        return;
      }

      const suppliedHash = Buffer.from(hashGuestAccessToken(suppliedToken), 'hex');
      const storedHash = Buffer.from(order.guestAccessTokenHash, 'hex');
      if (suppliedHash.length !== storedHash.length || !timingSafeEqual(suppliedHash, storedHash)) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to access this order.',
        });
        return;
      }
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error retrieving order:', error instanceof Error ? error.name : 'Unknown error');
    res.status(500).json({
      error: 'Failed to retrieve order',
      message: 'Internal server error.',
    });
  }
});

export default orderRouter;
