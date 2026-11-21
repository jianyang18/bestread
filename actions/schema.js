import { z } from "zod";

export const otpSignInSchema = z.object({
  email: z.string().email(),
});

export const verifyOtpSchema = z.object({
  // Length is set by Supabase (Auth > Email OTP length), so only require digits here.
  token: z.string().trim().regex(/^\d+$/, "Code must be digits only"),
  email: z.string(),
});

export const onboardingSchema = z.object({
  username: z.string().min(2).max(30).regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),
});

export const addBookSchema = z.object({
  title: z.string(),
  isReading: z.boolean().optional(),
  pageCount: z.number().optional(),
  authors: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
});

export const editBookSchema = z.object({
  bookId: z.string(),
  isReading: z.boolean().optional(),
  isFinished: z.boolean().optional(),
  progress: z.number().optional(),
  progressType: z.enum(["page", "percentage"]).optional(),
  rating: z.number().min(1).max(5).optional(),
  imageUrl: z.string().url().nullable().optional(),
});

export const deleteBookSchema = z.object({
  bookId: z.string(),
});
