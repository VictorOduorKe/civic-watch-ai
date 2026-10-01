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

const ALLOWED_STATUSES = [
  'Submitted',
  'Under Review',
  'Verified',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
  'Rejected',
  'Dismissed'
];

/**
 * Validator for citizen report listing with pagination, search, and filters.
 */
export const listMyReportsSchema = z.object({
  query: z.object({
    page: z.preprocess(
      (val) => (val !== undefined && val !== null && val !== '' ? parseInt(String(val), 10) : 1),
      z.number().int().min(1, 'Page must be at least 1').default(1)
    ),
    limit: z.preprocess(
      (val) => (val !== undefined && val !== null && val !== '' ? parseInt(String(val), 10) : 10),
      z.number().int().min(1, 'Limit must be at least 1').max(50, 'Limit must not exceed 50').default(10)
    ),
    status: z.preprocess(
      (val) => (val ? String(val).trim() : undefined),
      z.enum(ALLOWED_STATUSES).optional()
    ).optional(),
    category_id: z.preprocess(
      (val) => (val !== undefined && val !== null && val !== '' ? parseInt(String(val), 10) : undefined),
      z.number().int().positive().optional()
    ),
    search: z.preprocess(
      (val) => (val ? String(val).trim() : undefined),
      z.string().max(100, 'Search query must not exceed 100 characters').optional()
    ),
    sort: z.preprocess(
      (val) => (val ? String(val).trim().toLowerCase() : 'updated_at'),
      z.enum(['created_at', 'updated_at', 'incident_date']).default('updated_at')
    ),
    order: z.preprocess(
      (val) => (val ? String(val).trim().toUpperCase() : 'DESC'),
      z.enum(['ASC', 'DESC']).default('DESC')
    )
  })
});

/**
 * Validator for report reference param.
 */
export const reportReferenceSchema = z.object({
  params: z.object({
    reference: z
      .string({ required_error: 'Report reference is required' })
      .trim()
      .regex(/^CWK-\d{4}-\d{6}$/, 'Invalid report reference format (expected CWK-YYYY-XXXXXX)')
  })
});

/**
 * Validator for attachment download param.
 */
export const reportAttachmentParamSchema = z.object({
  params: z.object({
    reference: z
      .string({ required_error: 'Report reference is required' })
      .trim()
      .regex(/^CWK-\d{4}-\d{6}$/, 'Invalid report reference format'),
    attachmentId: z.preprocess(
      (val) => (val !== undefined && val !== null && val !== '' ? parseInt(String(val), 10) : NaN),
      z.number({ required_error: 'Attachment ID is required' }).int().positive('Invalid attachment ID')
    )
  })
});
