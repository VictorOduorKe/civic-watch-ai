import { z } from 'zod';

/**
 * Report submission validator.
 * Robustly parses both JSON and multipart/form-data string encodings.
 */
export const createReportSchema = z.object({
  body: z.object({
    category_id: z.preprocess(
      (val) => (val !== undefined && val !== null && val !== '' ? Number(val) : NaN),
      z.number({ required_error: 'Incident category is required' })
        .int('Category ID must be an integer')
        .positive('Please select a valid incident category')
    ),
    title: z
      .string({ required_error: 'Incident title is required' })
      .trim()
      .min(3, 'Title must be at least 3 characters long')
      .max(255, 'Title must not exceed 255 characters'),
    description: z
      .string({ required_error: 'Incident description is required' })
      .trim()
      .min(10, 'Description must be at least 10 characters long')
      .max(5000, 'Description must not exceed 5000 characters'),
    county: z
      .string({ required_error: 'County is required' })
      .trim()
      .min(2, 'County is required')
      .max(100, 'County must not exceed 100 characters'),
    sub_county: z
      .string()
      .trim()
      .max(100, 'Sub-county must not exceed 100 characters')
      .optional()
      .or(z.literal(''))
      .nullable(),
    ward: z
      .string()
      .trim()
      .max(100, 'Ward must not exceed 100 characters')
      .optional()
      .or(z.literal(''))
      .nullable(),
    location_text: z
      .string()
      .trim()
      .max(255, 'Location description must not exceed 255 characters')
      .optional()
      .or(z.literal(''))
      .nullable(),
    latitude: z.preprocess(
      (val) => {
        if (val === undefined || val === null || val === '') return null;
        const num = Number(val);
        return isNaN(num) ? val : num;
      },
      z.number()
        .min(-90, 'Latitude must be between -90 and 90')
        .max(90, 'Latitude must be between -90 and 90')
        .optional()
        .nullable()
    ),
    longitude: z.preprocess(
      (val) => {
        if (val === undefined || val === null || val === '') return null;
        const num = Number(val);
        return isNaN(num) ? val : num;
      },
      z.number()
        .min(-180, 'Longitude must be between -180 and 180')
        .max(180, 'Longitude must be between -180 and 180')
        .optional()
        .nullable()
    ),
    incident_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Incident date must follow YYYY-MM-DD format')
      .optional()
      .or(z.literal(''))
      .nullable(),
    incident_time: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'Incident time must follow HH:MM format')
      .optional()
      .or(z.literal(''))
      .nullable(),
    is_anonymous: z.preprocess(
      (val) => {
        if (typeof val === 'boolean') return val;
        if (typeof val === 'string') {
          return val.toLowerCase() === 'true' || val === '1';
        }
        return false;
      },
      z.boolean().default(false)
    ),
    preferred_contact: z.preprocess(
      (val) => (val ? String(val).toLowerCase().trim() : 'none'),
      z.enum(['none', 'email', 'phone'], {
        errorMap: () => ({ message: 'Preferred contact must be "none", "email", or "phone"' })
      }).default('none')
    )
  })
});
