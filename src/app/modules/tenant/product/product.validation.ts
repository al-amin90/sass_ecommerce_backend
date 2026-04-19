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
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.string().min(0).optional(),
    discountPrice: z.string().min(0).optional(),
    categoryID: z.string().optional(),
    images: z.array(z.any()).optional(),
    existingImages: z.array(z.string()).optional(),
    sku: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

const updateVariantSchema = z.object({
  body: z.object({
    color: z.string().min(1).optional(),
    stock: z
      .array(stockSchema)
      .min(1)
      .refine(
        (stocks) => {
          const sizes = stocks.map((s) => s.size);
          return sizes.length === new Set(sizes).size;
        },
        { message: "Duplicate sizes are not allowed" },
      )
      .optional(),
  }),
});

export const productValidations = {
  createProductSchema,
  updateProductSchema,
  updateVariantSchema,
};
