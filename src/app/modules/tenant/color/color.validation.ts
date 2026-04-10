import { z } from "zod";

export const createColorSchema = z.object({
  body: z.object({
    name: z
      .string({ message: "Color name is required" })
      .min(1, { message: "Color code cannot be empty" }),

    color: z.string().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),

    color: z.string().optional(),
  }),
});
export const colorValidations = {
  createColorSchema,
  updateCategorySchema,
};
