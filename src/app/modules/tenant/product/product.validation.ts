import { z } from "zod";

const stockSchema = z.object({
  size: z.number({ message: "Size is required" }).min(0).max(50),
  quantity: z.number({ message: "Quantity is required" }).min(0),
});

const variantSchema = z.object({
  color: z.string({ message: "Color is required" }).min(1),
  stock: z
    .array(stockSchema)
    .min(1, { message: "At least one stock entry is required" })
    .refine(
      (stocks) => {
        const sizes = stocks.map((s) => s.size);
        return sizes.length === new Set(sizes).size;
      },
      { message: "Duplicate sizes are not allowed in a variant" },
    ),
});

const createProductSchema = z.object({
  body: z.object({
    name: z.string({ message: "Name is required" }).min(1),
    description: z.string().optional(),
    price: z
      .string({ message: "Price is required" })
      .min(1)
      .transform((v) => parseFloat(v)),
    discountPrice: z
      .string()
      .optional()
      .transform((v) => (v ? parseFloat(v) : undefined)),
    categoryID: z.string({ message: "Category ID is required" }).min(1),
    variant: z
      .string()
      .transform((val) => {
        try {
          return JSON.parse(val);
        } catch {
          return [];
        }
      })
      .pipe(z.array(variantSchema)),
    images: z.array(z.any()).default([]),
    sku: z.string({ message: "SKU is required" }).min(1),
    isActive: z.boolean().default(true),
  }),
});

const updateProductSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),

    price: z.string().transform(Number).optional(),
    discountPrice: z.string().transform(Number).optional(),

    categoryID: z.string().optional(),
    images: z.array(z.any()).default([]).optional(),
    existingImages: z
      .string()
      .optional()
      .transform((val) => (val ? JSON.parse(val) : [])),

    sku: z.string().optional(),
    isActive: z.boolean().optional(),

    variant: z
      .string()
      .transform((val) => {
        try {
          return JSON.parse(val);
        } catch {
          return [];
        }
      })
      .pipe(z.array(variantSchema))
      .optional(),
  }),
});

export const productValidations = {
  createProductSchema,
  updateProductSchema,
};
