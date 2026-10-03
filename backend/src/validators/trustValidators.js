import { z } from 'zod';

export const SOURCE_TYPES = [
  'GOVERNMENT',
  'COUNTY',
  'PUBLIC_UTILITY',
  'CIVIL_SOCIETY',
  'COMMUNITY',
  'OFFICIAL_ORGANIZATION',
  'MEDIA',
  'OTHER'
];

export const TRUST_STATUSES = [
  'UNVERIFIED',
  'UNDER_REVIEW',
  'VERIFIED',
  'DISPUTED',
  'CORRECTED',
  'WITHDRAWN'
];

export const ENTITY_TYPES = ['SOURCE', 'ALERT', 'REPORT'];

export const VERIFY_ACTIONS = [
  'VERIFIED',
  'DISPUTED',
  'CORRECTED',
  'WITHDRAWN',
  'UNDER_REVIEW'
];

/**
 * Strict Safe URL validator
 * Only allows http: and https: protocols.
 * Explicitly rejects javascript:, data:, vbscript:, file:, etc.
 */
export const safeUrlSchema = z.string()
  .trim()
  .url({ message: 'Must be a valid URL' })
  .refine((url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, { message: 'URL must use HTTP or HTTPS protocol' });

export const referenceItemSchema = z.object({
  title: z.string().trim().min(3, 'Reference title must be at least 3 characters').max(255),
  reference_url: safeUrlSchema,
  description: z.string().trim().max(1000).optional().nullable(),
  source_type: z.string().trim().max(100).optional().nullable()
});

/**
 * Source Creation Validator
 */
export const createSourceSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Source name must be at least 2 characters').max(255),
    organization: z.string().trim().max(255).optional().nullable(),
    source_type: z.enum(SOURCE_TYPES).default('COMMUNITY'),
    website: safeUrlSchema.optional().nullable().or(z.literal('')),
    description: z.string().trim().max(2000).optional().nullable(),
    contact_email: z.string().trim().email('Invalid contact email').max(255).optional().nullable().or(z.literal('')),
    contact_phone: z.string().trim().max(50).optional().nullable().or(z.literal('')),
    is_official: z.boolean().default(false)
  })
});

/**
 * Source Update Validator
 */
export const updateSourceSchema = z.object({
  params: z.object({
    id: z.preprocess((v) => Number(v), z.number().int().positive('Invalid source ID'))
  }),
  body: z.object({
    name: z.string().trim().min(2).max(255).optional(),
    organization: z.string().trim().max(255).optional().nullable(),
    source_type: z.enum(SOURCE_TYPES).optional(),
    website: safeUrlSchema.optional().nullable().or(z.literal('')),
    description: z.string().trim().max(2000).optional().nullable(),
    contact_email: z.string().trim().email().max(255).optional().nullable().or(z.literal('')),
    contact_phone: z.string().trim().max(50).optional().nullable().or(z.literal('')),
    is_official: z.boolean().optional(),
    is_active: z.boolean().optional()
  })
});

/**
 * Verification Action Validator
 * Workflow action for SOURCE, ALERT, or REPORT
 */
export const verifyActionSchema = z.object({
  params: z.object({
    entityType: z.preprocess((v) => String(v).toUpperCase(), z.enum(ENTITY_TYPES)),
    entityId: z.preprocess((v) => Number(v), z.number().int().positive('Invalid entity ID'))
  }),
  body: z.object({
    action: z.enum(VERIFY_ACTIONS),
    reason: z.string().trim().max(2000).optional().nullable(),
    evidence_summary: z.string().trim().max(2000).optional().nullable(),
    references: z.array(referenceItemSchema).optional()
  }).refine((data) => {
    // Reason is mandatory when disputing, correcting, or withdrawing
    if (['DISPUTED', 'CORRECTED', 'WITHDRAWN'].includes(data.action)) {
      return Boolean(data.reason && data.reason.trim().length >= 5);
    }
    return true;
  }, {
    message: 'A detailed reason (at least 5 characters) is required when disputing, correcting, or withdrawing verification status.',
    path: ['reason']
  })
});

/**
 * Add Reference Validator
 */
export const addReferenceSchema = z.object({
  params: z.object({
    entityType: z.preprocess((v) => String(v).toUpperCase(), z.enum(ENTITY_TYPES)),
    entityId: z.preprocess((v) => Number(v), z.number().int().positive('Invalid entity ID'))
  }),
  body: referenceItemSchema
});

/**
 * List Sources Query Validator
 */
export const listSourcesQuerySchema = z.object({
  query: z.object({
    page: z.preprocess((v) => (v ? Number(v) : 1), z.number().int().min(1).default(1)),
    limit: z.preprocess((v) => (v ? Number(v) : 20), z.number().int().min(1).max(100).default(20)),
    source_type: z.enum(SOURCE_TYPES).optional(),
    status: z.enum(TRUST_STATUSES).optional(),
    is_official: z.preprocess((v) => (v === 'true' || v === true ? true : v === 'false' || v === false ? false : undefined), z.boolean().optional()),
    search: z.string().trim().optional()
  })
});

/**
 * Verification Queue Query Validator
 */
export const queryVerificationQueueSchema = z.object({
  query: z.object({
    page: z.preprocess((v) => (v ? Number(v) : 1), z.number().int().min(1).default(1)),
    limit: z.preprocess((v) => (v ? Number(v) : 20), z.number().int().min(1).max(50).default(20)),
    entity_type: z.preprocess((v) => (v ? String(v).toUpperCase() : undefined), z.enum(ENTITY_TYPES).optional()),
    status: z.enum(TRUST_STATUSES).optional(),
    search: z.string().trim().optional()
  })
});
