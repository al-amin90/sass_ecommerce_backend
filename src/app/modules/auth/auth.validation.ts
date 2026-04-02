import z, { email } from "zod";

const registerTenantValidationSchema = z.object({
  body: z.object({
    businessName: z.string().min(1, "businessName is required"),
    subdomain: z.string().min(1, "subdomain is required"),
    adminEmail: z.string().email("Invalid email"),
    adminPassword: z.string().min(6, "Password must be at least 6 chars"),
    contactPhone: z.string(),
  }),
});

const LoginBodyValidationSchema = z.object({
  body: z.object({
    email: z.string(),
    password: z.string(),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string(),
    newPassword: z.string(),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string(),
  }),
});

export const authValidation = {
  registerTenantValidationSchema,
  LoginBodyValidationSchema,
  changePasswordValidationSchema,
  refreshTokenValidationSchema,
};
