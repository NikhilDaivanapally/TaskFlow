import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(3, "name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
  file: z
    .object({
      fieldname: z.string(),
      originalname: z.string(),
      mimetype: z.string().startsWith("image/"),
      size: z.number().max(5 * 1024 * 1024, "File too large (max 5MB)"),
      path: z.string().optional(),
    })
    .optional(),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password is required"),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
