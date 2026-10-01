import { z } from 'zod';

export const INCIDENT_STATUSES = [
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

export const REFERRAL_STATUSES = [
  'Pending',
  'Sent',
  'Accepted',
  'Declined',
  'Completed',
  'Cancelled'
];

export const REFERRAL_TYPES = [
  'OCL Review',
  'Civil Society Organization',
  'Authorized Advocate',
  'Public Service Authority',
  'Police Administration',
  'Emergency Organization',
  'Human Rights Organization',
  'Other Approved Referral'
];

/**
 * Validator for admin incident list query parameters.
 */
export const adminIncidentListSchema = z.object({
  query: z.object({
    page: z.preprocess(
      (val) => (val !== undefined && val !== null && val !== '' ? parseInt(String(val), 10) : 1),
      z.number().int().min(1, 'Page must be at least 1').default(1)
    ),
    limit: z.preprocess(
      (val) => (val !== undefined && val !== null && val !== '' ? parseInt(String(val), 10) : 20),
      z.number().int().min(1, 'Limit must be at least 1').max(50, 'Limit must not exceed 50').default(20)
    ),
    status: z.preprocess(
      (val) => (val ? String(val).trim() : undefined),
      z.enum(INCIDENT_STATUSES).optional()
    ).optional(),
    category_id: z.preprocess(
      (val) => (val !== undefined && val !== null && val !== '' ? parseInt(String(val), 10) : undefined),
      z.number().int().positive().optional()
    ),
    county: z.preprocess(
      (val) => (val ? String(val).trim() : undefined),
      z.string().max(100).optional()
    ),
    search: z.preprocess(
      (val) => (val ? String(val).trim() : undefined),
      z.string().max(100, 'Search query must not exceed 100 characters').optional()
    ),
    assigned: z.preprocess(
      (val) => (val ? String(val).trim().toLowerCase() : 'all'),
      z.enum(['all', 'assigned', 'unassigned']).default('all')
    ),
    date_from: z.preprocess(
      (val) => (val ? String(val).trim() : undefined),
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date_from must be in YYYY-MM-DD format').optional()
    ),
    date_to: z.preprocess(
      (val) => (val ? String(val).trim() : undefined),
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date_to must be in YYYY-MM-DD format').optional()
    ),
    sort: z.preprocess(
      (val) => (val ? String(val).trim().toLowerCase() : 'updated_at'),
      z.enum(['created_at', 'updated_at', 'incident_date', 'status', 'title']).default('updated_at')
    ),
    order: z.preprocess(
      (val) => (val ? String(val).trim().toUpperCase() : 'DESC'),
      z.enum(['ASC', 'DESC']).default('DESC')
    )
  })
});

/**
 * Validator for reference path parameter.
 */
export const incidentReferenceParamSchema = z.object({
  params: z.object({
    reference: z
      .string({ required_error: 'Incident reference is required' })
      .trim()
      .regex(/^CWK-\d{4}-[A-Z0-9]{4,10}$/i, 'Invalid incident reference format')
  })
});

/**
 * Validator for changing incident status.
 */
export const changeIncidentStatusSchema = z.object({
  params: z.object({
    reference: z
      .string({ required_error: 'Incident reference is required' })
      .trim()
      .regex(/^CWK-\d{4}-[A-Z0-9]{4,10}$/i, 'Invalid incident reference format')
  }),
  body: z.object({
    status: z.enum(INCIDENT_STATUSES, {
      required_error: 'Status is required',
      invalid_type_error: 'Invalid incident status'
    }),
    note: z
      .string()
      .trim()
      .max(2000, 'Status note must not exceed 2000 characters')
      .optional()
      .or(z.literal('')),
    reopen: z.boolean().optional().default(false),
    publish_citizen_update: z.boolean().optional().default(false),
    citizen_message: z
      .string()
      .trim()
      .max(2000, 'Citizen update message must not exceed 2000 characters')
      .optional()
      .or(z.literal(''))
  }).superRefine((data, ctx) => {
    if (data.status === 'Rejected' && (!data.note || data.note.trim().length < 5)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['note'],
        message: 'A rejection requires an explanatory note of at least 5 characters.'
      });
    }
    if (data.status === 'Resolved' && (!data.note || data.note.trim().length < 5)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['note'],
        message: 'A resolution requires an explanatory note of at least 5 characters.'
      });
    }
    if (data.publish_citizen_update && (!data.citizen_message || data.citizen_message.trim().length < 3)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['citizen_message'],
        message: 'Citizen message must be at least 3 characters when publishing an update.'
      });
    }
  })
});

/**
 * Validator for assigning an incident to authorized staff.
 */
export const assignIncidentSchema = z.object({
  params: z.object({
    reference: z
      .string({ required_error: 'Incident reference is required' })
      .trim()
      .regex(/^CWK-\d{4}-[A-Z0-9]{4,10}$/i, 'Invalid incident reference format')
  }),
  body: z.object({
    assigned_to_user_id: z.preprocess(
      (val) => (val !== undefined && val !== null && val !== '' ? parseInt(String(val), 10) : NaN),
      z.number({ required_error: 'Target user ID is required' })
        .int('User ID must be an integer')
        .positive('Invalid target user ID')
    ),
    assignment_note: z
      .string()
      .trim()
      .max(1000, 'Assignment note must not exceed 1000 characters')
      .optional()
      .or(z.literal('')),
    update_status_to_assigned: z.boolean().optional().default(true)
  })
});

/**
 * Validator for unassigning an incident.
 */
export const unassignIncidentSchema = z.object({
  params: z.object({
    reference: z
      .string({ required_error: 'Incident reference is required' })
      .trim()
      .regex(/^CWK-\d{4}-[A-Z0-9]{4,10}$/i, 'Invalid incident reference format')
  }),
  body: z.object({
    reason: z
      .string()
      .trim()
      .max(500, 'Unassignment reason must not exceed 500 characters')
      .optional()
      .or(z.literal(''))
  }).optional().default({})
});

/**
 * Validator for creating an internal note (admin-only).
 */
export const createInternalNoteSchema = z.object({
  params: z.object({
    reference: z
      .string({ required_error: 'Incident reference is required' })
      .trim()
      .regex(/^CWK-\d{4}-[A-Z0-9]{4,10}$/i, 'Invalid incident reference format')
  }),
  body: z.object({
    note: z
      .string({ required_error: 'Note content is required' })
      .trim()
      .min(2, 'Note must be at least 2 characters long')
      .max(5000, 'Note must not exceed 5000 characters')
  })
});

/**
 * Validator for creating a citizen-visible update.
 */
export const createCitizenUpdateSchema = z.object({
  params: z.object({
    reference: z
      .string({ required_error: 'Incident reference is required' })
      .trim()
      .regex(/^CWK-\d{4}-[A-Z0-9]{4,10}$/i, 'Invalid incident reference format')
  }),
  body: z.object({
    message: z
      .string({ required_error: 'Update message is required' })
      .trim()
      .min(3, 'Update message must be at least 3 characters long')
      .max(5000, 'Update message must not exceed 5000 characters')
  })
});

/**
 * Validator for creating a referral.
 */
export const createReferralSchema = z.object({
  params: z.object({
    reference: z
      .string({ required_error: 'Incident reference is required' })
      .trim()
      .regex(/^CWK-\d{4}-[A-Z0-9]{4,10}$/i, 'Invalid incident reference format')
  }),
  body: z.object({
    referral_type: z
      .string({ required_error: 'Referral type is required' })
      .trim()
      .min(2, 'Referral type must be at least 2 characters')
      .max(100, 'Referral type must not exceed 100 characters'),
    organization_name: z
      .string({ required_error: 'Organization name is required' })
      .trim()
      .min(2, 'Organization name must be at least 2 characters')
      .max(255, 'Organization name must not exceed 255 characters'),
    reason: z
      .string({ required_error: 'Referral reason is required' })
      .trim()
      .min(5, 'Referral reason must be at least 5 characters')
      .max(5000, 'Referral reason must not exceed 5000 characters')
  })
});

/**
 * Validator for updating a referral status.
 */
export const updateReferralStatusSchema = z.object({
  params: z.object({
    reference: z
      .string({ required_error: 'Incident reference is required' })
      .trim()
      .regex(/^CWK-\d{4}-[A-Z0-9]{4,10}$/i, 'Invalid incident reference format'),
    referralId: z.preprocess(
      (val) => (val !== undefined && val !== null && val !== '' ? parseInt(String(val), 10) : NaN),
      z.number({ required_error: 'Referral ID is required' })
        .int('Referral ID must be an integer')
        .positive('Invalid referral ID')
    )
  }),
  body: z.object({
    status: z.enum(REFERRAL_STATUSES, {
      required_error: 'Referral status is required',
      invalid_type_error: 'Invalid referral status'
    })
  })
});

/**
 * Validator for attachment download param.
 */
export const incidentAttachmentParamSchema = z.object({
  params: z.object({
    reference: z
      .string({ required_error: 'Incident reference is required' })
      .trim()
      .regex(/^CWK-\d{4}-[A-Z0-9]{4,10}$/i, 'Invalid incident reference format'),
    attachmentId: z.preprocess(
      (val) => (val !== undefined && val !== null && val !== '' ? parseInt(String(val), 10) : NaN),
      z.number({ required_error: 'Attachment ID is required' })
        .int('Attachment ID must be an integer')
        .positive('Invalid attachment ID')
    )
  })
});
