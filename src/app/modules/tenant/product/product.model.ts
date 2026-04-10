import { Schema } from "mongoose";

import { TProduct, TVariant } from "./product.interface";

const variantSchema = new Schema<TVariant>(
  {
    size: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
    },
    stock: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const productSchema = new Schema<TProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },

    price: { type: Number, required: true },
    discountPrice: { type: Number, required: true },

    variants: {
      type: [variantSchema],
    },

    images: [{ type: String, required: true }],

    sku: { type: String, unique: true },
  },
  {
    timestamps: true,
  },
);

export default productSchema;
