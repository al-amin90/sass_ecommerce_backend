import { z } from "zod";

const variantSchema = z.object({
  size: z.number({ message: "Size is required" }),
  color: z.string().optional(),
  stock: z.number({ message: "Stock is required" }).min(0, {
    message: "Stock cannot be negative",
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string({ message: "Name is required" }),

    slug: z.string({ message: "Slug is required" }),

    description: z.string().optional(),

    price: z.number({ message: "Price is required" }).min(0),

    discountPrice: z.number().min(0).optional(),

    variants: z
      .array(variantSchema, {
        message: "Sizes are required",
      })
      .min(1, { message: "At least one Sizes is required" }),

    images: z
      .array(z.string({ message: "Image URL must be string" }))
      .min(1, { message: "At least one image is required" }),

    sku: z.string({ message: "SKU is required" }),

    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    price: z.number().min(0).optional(),
    discountPrice: z.number().min(0).optional(),
    variants: z.array(variantSchema).optional(),

    images: z.array(z.string()).optional(),
    sku: z.string().optional(),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
  }),
});

export const productValidations = {
  createProductSchema,
  updateProductSchema,
};
