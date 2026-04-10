import { Schema } from "mongoose";

import { TProduct, TVariant } from "./product.interface";

export const variantSchema = new Schema<TVariant>({
  color: {
    type: String,
  },
  stock: [
    {
      size: { type: Number, required: true, min: 0 },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
});

export const productSchema = new Schema<TProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },

    price: { type: Number, required: true },
    discountPrice: { type: Number, required: true },
    categoryID: { type: Schema.Types.ObjectId, ref: "Category" },

    variant: [variantSchema],

    images: [{ type: String, required: true }],

    sku: { type: String, unique: true },
  },
  {
    timestamps: true,
  },
);
