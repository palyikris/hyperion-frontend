import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = loginSchema
  .extend({
    full_name: z.string().min(1, "Full name is required"),
  })
