import { z } from 'zod';

/**
 * Registration validation schema.
 * Enforces email normalization, password confirmation, minimum length, and terms acceptance.
 */
export const registerSchema = z.object({
  body: z
    .object({
      fullName: z
        .string({ required_error: 'Full name is required' })
        .trim()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name must not exceed 100 characters'),
      email: z
        .string({ required_error: 'Email address is required' })
        .trim()
        .toLowerCase()
        .email('Please provide a valid email address')
        .max(255, 'Email must not exceed 255 characters'),
      phone: z
        .string({ required_error: 'Phone number is required' })
        .trim()
        .min(9, 'Phone number must be at least 9 digits')
        .max(20, 'Phone number must not exceed 20 characters')
        .regex(/^[+0-9\s\-()]+$/, 'Please provide a valid phone number format'),
      password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'Password must be at least 8 characters long')
        .max(128, 'Password must not exceed 128 characters'),
      confirmPassword: z
        .string({ required_error: 'Please confirm your password' }),
      county: z
        .string({ required_error: 'County is required' })
        .trim()
        .min(2, 'County is required')
        .max(100, 'County must not exceed 100 characters'),
      ward: z
        .string()
        .trim()
        .max(100, 'Ward must not exceed 100 characters')
        .optional()
        .or(z.literal('')),
      termsAccepted: z
        .boolean({ required_error: 'You must acknowledge the terms and privacy notice' })
        .refine((val) => val === true, {
          message: 'You must acknowledge the terms and privacy notice'
        })
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword']
    })
});

/**
 * Login validation schema.
 */
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email address is required' })
      .trim()
      .toLowerCase()
      .email('Please provide a valid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password is required')
  })
});
