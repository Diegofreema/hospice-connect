import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Email is required').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email('Email is required').min(1, 'Email is required'),
});

export const resetPasswordSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  password: z.string().min(1, 'Password is required'),
});

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
