import z from "zod";

export const registerSchema = z.object({
  username: z.string().min(5).max(20),
  email: z.email(),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  username: z.string().min(5).max(20),
  password: z.string().min(6).max(100),
});