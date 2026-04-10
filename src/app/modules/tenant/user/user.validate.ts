import z from "zod";

export const userZodSchema = z.object({
  password: z
    .string()
    .max(20, { message: "Password cant not be more than 20" }),
});
