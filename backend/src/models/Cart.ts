import mongoose, { Schema, Document, Model } from 'mongoose';
import type { CartItem } from '@velora/shared';

export interface ICartDocument extends Document {
  userId: mongoose.Types.ObjectId;
  items: CartItem[];
  updatedAt: Date;
}

const CartItemSubSchema = new Schema<CartItem>(
  {
    id: { type: String, required: true },
    productId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const CartSchema = new Schema<ICartDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [CartItemSubSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const CartModel: Model<ICartDocument> =
  mongoose.models.Cart || mongoose.model<ICartDocument>('Cart', CartSchema);

export default CartModel;
