import z from "zod";

export const registerSchema = z.object({
  username: z.string().min(5).max(20, "Username must be between 5 and 20 characters"),
  email: z.email().max(255, "Email must be between 5 and 255 characters"),
  password: z.string().min(6).max(100, "Password must be between 6 and 100 characters"),
});

export const loginSchema = z.object({
  username: z.string().min(5).max(20, "Username must be between 5 and 20 characters"),
  password: z.string().min(6).max(100, "Password must be between 6 and 100 characters"),
});