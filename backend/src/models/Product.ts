import mongoose, { Schema, Document, Model } from 'mongoose';
import type { ProductColor, ProductSpecifications, Product } from '@velora/shared';

export interface IProductItem extends Product {
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductColorSchema = new Schema<ProductColor>(
  {
    name: { type: String, required: true, trim: true },
    hex: { type: String, required: true, trim: true },
    tone: { type: String, trim: true },
  },
  { _id: false }
);

const ProductSpecificationsSchema = new Schema<ProductSpecifications>(
  {
    fit: [{ type: String, trim: true }],
    materials: { type: String, trim: true },
    care: { type: String, trim: true },
    shipping: { type: String, trim: true },
    returns: { type: String, trim: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProductItem>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    collection: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    editorialDescription: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    colors: {
      type: [ProductColorSchema],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lowStock: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    newArrival: {
      type: Boolean,
      default: false,
      index: true,
    },
    itemCode: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 5.0,
    },
    reviewCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    fabricRatio: {
      type: String,
    },
    craftsmanshipNote: {
      type: String,
    },
    specifications: {
      type: ProductSpecificationsSchema,
    },
    styleOccasion: {
      type: String,
      enum: ['Everyday', 'Tailoring', 'Occasion', 'Casual'],
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
        return ret;
      },
    },
  }
);

// Prevent re-compilation in development reload environments
export const ProductModel: Model<IProductItem> =
  mongoose.models.Product || mongoose.model<IProductItem>('Product', ProductSchema);

export default ProductModel;
