import { z } from 'zod';

export const PETITION_STATUSES = [
  'DRAFT',
  'PENDING_REVIEW',
  'PUBLISHED',
  'CLOSED',
  'QUORUM_REACHED',
  'REJECTED',
  'ARCHIVED'
];

export const HEARING_STATUSES = [
  'DRAFT',
  'PUBLISHED',
  'ONGOING',
  'COMPLETED',
  'CANCELLED',
  'ARCHIVED'
];

export const FEEDBACK_STANCES = ['SUPPORT', 'OPPOSE', 'NEUTRAL', 'PROPOSAL'];

export const FEEDBACK_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'PUBLISHED',
  'REJECTED',
  'WITHDRAWN',
  'ARCHIVED'
];

// --- Petition Validation Schemas ---

export const listPetitionsQuerySchema = z.object({
  query: z.object({
    page: z.preprocess((v) => (v ? Number(v) : 1), z.number().int().min(1).default(1)),
    limit: z.preprocess((v) => (v ? Number(v) : 20), z.number().int().min(1).max(100).default(20)),
    search: z.string().trim().max(100).optional(),
    status: z.enum(PETITION_STATUSES).optional(),
    category: z.string().trim().max(100).optional(),
    county: z.string().trim().max(100).optional()
  })
});

export const petitionIdParamSchema = z.object({
  params: z.object({
    id: z.preprocess((v) => Number(v), z.number().int().positive('Valid petition ID required'))
  })
});

export const createPetitionSchema = z.object({
  body: z.object({
    title: z.string().trim().min(5, 'Title must be at least 5 characters').max(255),
    summary: z.string().trim().min(10, 'Summary must be at least 10 characters').max(500),
    description: z.string().trim().min(20, 'Description must be at least 20 characters'),
    purpose: z.string().trim().min(10, 'Purpose statement must be at least 10 characters'),
    category: z.string().trim().min(2, 'Category is required').max(100),
    county: z.string().trim().max(100).nullable().optional(),
    sub_county: z.string().trim().max(100).nullable().optional(),
    target_authority: z.string().trim().min(3, 'Target public authority is required').max(255),
    requested_action: z.string().trim().min(10, 'Requested action must be at least 10 characters'),
    supporting_information: z.string().trim().max(5000).nullable().optional(),
    closing_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid closing date (YYYY-MM-DD) required'),
    quorum_requirement: z.preprocess(
      (v) => (v ? Number(v) : 50),
      z.number().int().min(5, 'Quorum requirement must be at least 5 verified signatures').max(100000).default(50)
    )
  })
});

export const updatePetitionSchema = z.object({
  body: z.object({
    title: z.string().trim().min(5).max(255).optional(),
    summary: z.string().trim().min(10).max(500).optional(),
    description: z.string().trim().min(20).optional(),
    purpose: z.string().trim().min(10).optional(),
    category: z.string().trim().min(2).max(100).optional(),
    county: z.string().trim().max(100).nullable().optional(),
    sub_county: z.string().trim().max(100).nullable().optional(),
    target_authority: z.string().trim().min(3).max(255).optional(),
    requested_action: z.string().trim().min(10).optional(),
    supporting_information: z.string().trim().max(5000).nullable().optional(),
    closing_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    quorum_requirement: z.number().int().min(5).max(100000).optional()
  })
});

export const moderatePetitionSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING_REVIEW', 'PUBLISHED', 'CLOSED', 'REJECTED', 'ARCHIVED']),
    reason: z.string().trim().max(1000).optional()
  })
});

export const signPetitionSchema = z.object({
  body: z.object({
    comment: z.string().trim().max(500).optional()
  })
});

// --- Budget Hearing Validation Schemas ---

export const listHearingsQuerySchema = z.object({
  query: z.object({
    page: z.preprocess((v) => (v ? Number(v) : 1), z.number().int().min(1).default(1)),
    limit: z.preprocess((v) => (v ? Number(v) : 20), z.number().int().min(1).max(100).default(20)),
    search: z.string().trim().max(100).optional(),
    county: z.string().trim().max(100).optional(),
    status: z.enum(HEARING_STATUSES).optional(),
    from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
  })
});

export const hearingIdParamSchema = z.object({
  params: z.object({
    id: z.preprocess((v) => Number(v), z.number().int().positive('Valid hearing ID required'))
  })
});

export const createHearingSchema = z.object({
  body: z.object({
    title: z.string().trim().min(5, 'Hearing title must be at least 5 characters').max(255),
    county: z.string().trim().min(2, 'County is required').max(100),
    sub_county: z.string().trim().max(100).nullable().optional(),
    ward: z.string().trim().max(100).nullable().optional(),
    description: z.string().trim().min(10, 'Description is required'),
    fiscal_year: z.string().trim().max(20).default('FY 2026/2027'),
    hearing_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid hearing date (YYYY-MM-DD) required'),
    start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Valid start time (HH:MM) required'),
    end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Valid end time (HH:MM) required'),
    venue: z.string().trim().min(3, 'Venue is required').max(255),
    participation_instructions: z.string().trim().max(2000).nullable().optional(),
    contact_information: z.string().trim().max(255).nullable().optional()
  })
});

export const updateHearingSchema = z.object({
  body: z.object({
    title: z.string().trim().min(5).max(255).optional(),
    county: z.string().trim().min(2).max(100).optional(),
    sub_county: z.string().trim().max(100).nullable().optional(),
    ward: z.string().trim().max(100).nullable().optional(),
    description: z.string().trim().min(10).optional(),
    fiscal_year: z.string().trim().max(20).optional(),
    hearing_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
    end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
    venue: z.string().trim().min(3).max(255).optional(),
    participation_instructions: z.string().trim().max(2000).nullable().optional(),
    contact_information: z.string().trim().max(255).nullable().optional(),
    status: z.enum(HEARING_STATUSES).optional()
  })
});

export const cancelHearingSchema = z.object({
  body: z.object({
    reason: z.string().trim().min(5, 'Cancellation reason required (min 5 characters)').max(500)
  })
});

// --- Legislative Items & Feedback Validation Schemas ---

export const listLegislativeItemsQuerySchema = z.object({
  query: z.object({
    page: z.preprocess((v) => (v ? Number(v) : 1), z.number().int().min(1).default(1)),
    limit: z.preprocess((v) => (v ? Number(v) : 20), z.number().int().min(1).max(100).default(20)),
    search: z.string().trim().max(100).optional(),
    level: z.enum(['NATIONAL', 'COUNTY']).optional(),
    county: z.string().trim().max(100).optional(),
    category: z.string().trim().max(100).optional(),
    status: z.enum(['ACTIVE', 'CLOSED', 'ARCHIVED']).optional()
  })
});

export const legislativeItemIdParamSchema = z.object({
  params: z.object({
    id: z.preprocess((v) => Number(v), z.number().int().positive('Valid legislative item ID required'))
  })
});

export const createLegislativeItemSchema = z.object({
  body: z.object({
    reference_code: z.string().trim().min(3, 'Reference code required').max(50),
    title: z.string().trim().min(5, 'Title must be at least 5 characters').max(255),
    summary: z.string().trim().min(10, 'Summary is required'),
    body_text: z.string().trim().nullable().optional(),
    category: z.string().trim().min(2, 'Category is required').max(100),
    level: z.enum(['NATIONAL', 'COUNTY']).default('NATIONAL'),
    county: z.string().trim().max(100).nullable().optional(),
    sponsoring_body: z.string().trim().min(3, 'Sponsoring body is required').max(255),
    feedback_deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid feedback deadline (YYYY-MM-DD) required')
  })
});

export const submitFeedbackSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3, 'Feedback title must be at least 3 characters').max(255),
    feedback_text: z.string().trim().min(10, 'Feedback statement must be at least 10 characters'),
    stance: z.enum(FEEDBACK_STANCES, {
      errorMap: () => ({ message: 'Stance must be SUPPORT, OPPOSE, NEUTRAL, or PROPOSAL' })
    }).default('NEUTRAL'),
    category: z.string().trim().max(100).nullable().optional(),
    county: z.string().trim().max(100).nullable().optional()
  })
});

export const feedbackIdParamSchema = z.object({
  params: z.object({
    id: z.preprocess((v) => Number(v), z.number().int().positive('Valid feedback ID required'))
  })
});

export const moderateFeedbackSchema = z.object({
  body: z.object({
    status: z.enum(['PUBLISHED', 'REJECTED', 'UNDER_REVIEW', 'ARCHIVED']),
    notes: z.string().trim().max(1000).optional()
  })
});
