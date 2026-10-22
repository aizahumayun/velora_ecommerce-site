import mongoose, { Schema, Document, Model } from 'mongoose';
import type { CartItem, Order, ShippingAddress } from '@velora/shared';

export interface IOrderItem extends Document, Omit<Order, 'id'> {
  id: string;
  userId?: string | mongoose.Types.ObjectId;
  guestAccessTokenHash?: string;
  createdAt: string;
  updatedAt: string;
}

const OrderItemSchema = new Schema<CartItem>(
  {
    id: { type: String, required: true },
    productId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<ShippingAddress>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    streetAddress: { type: String, trim: true },
    apartment: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true, default: '' },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'United States' },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderItem>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    guestAccessTokenHash: {
      type: String,
      select: false,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: CartItem[]) => Array.isArray(items) && items.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountCode: {
      type: String,
      trim: true,
    },
    shippingMethod: {
      type: String,
      enum: ['standard', 'express'],
      default: 'standard',
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    estimatedTax: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      default: 'Credit / Debit Card',
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Processing', 'Shipped', 'Delivered'],
      default: 'Confirmed',
      index: true,
    },
    estimatedDelivery: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        if (!ret.id && ret._id) {
          ret.id = ret._id.toString();
        }
        delete ret._id;
        delete ret.__v;
        delete ret.guestAccessTokenHash;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        if (!ret.id && ret._id) {
          ret.id = ret._id.toString();
        }
        delete ret._id;
        delete ret.__v;
        delete ret.guestAccessTokenHash;
        return ret;
      },
    },
  }
);

// Pre-save hook: Ensure date matches createdAt string
OrderSchema.pre<IOrderItem>('save', function () {
  if (!this.date) {
    this.date = new Date().toISOString();
  }
});

export const OrderModel: Model<IOrderItem> =
  mongoose.models.Order || mongoose.model<IOrderItem>('Order', OrderSchema);

export default OrderModel;
