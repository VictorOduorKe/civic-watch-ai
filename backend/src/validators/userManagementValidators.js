import { z } from 'zod';

export const USER_ROLES = ['Citizen', 'Moderator', 'Analyst', 'Admin'];
export const USER_STATUSES = ['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'];
export const IDENTITY_STATUSES = ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'];

export const listUsersQuerySchema = z.object({
  query: z.object({
    page: z.preprocess((v) => (v ? Number(v) : 1), z.number().int().min(1).default(1)),
    limit: z.preprocess((v) => (v ? Number(v) : 20), z.number().int().min(1).max(100).default(20)),
    search: z.string().trim().max(100).optional(),
    role: z.enum(USER_ROLES).optional(),
    status: z.enum(USER_STATUSES).optional(),
    identity_status: z.enum(IDENTITY_STATUSES).optional(),
    county: z.string().trim().max(100).optional(),
    is_county_liaison: z.preprocess((v) => (v === 'true' || v === true ? true : v === 'false' || v === false ? false : undefined), z.boolean().optional())
  })
});

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.preprocess((v) => Number(v), z.number().int().positive('Valid user ID required'))
  })
});

export const updateRoleSchema = z.object({
  body: z.object({
    role: z.enum(USER_ROLES, {
      errorMap: () => ({ message: 'Invalid role. Must be Citizen, Moderator, Analyst, or Admin.' })
    }),
    reason: z.string().trim().min(3, 'A reason for changing the role is required (min 3 characters)').max(500)
  })
});

export const suspendUserSchema = z.object({
  body: z.object({
    reason: z.string().trim().min(5, 'Mandatory justification reason is required for suspension (min 5 characters)').max(1000)
  })
});

export const reactivateUserSchema = z.object({
  body: z.object({
    reason: z.string().trim().max(1000).optional()
  })
});

export const provisionCountyLiaisonSchema = z.object({
  body: z.object({
    is_county_liaison: z.boolean().default(true),
    liaison_county: z.string().trim().min(2, 'Valid county name is required').max(100),
    liaison_sub_county: z.string().trim().max(100).optional().nullable(),
    reason: z.string().trim().max(500).optional()
  })
});

export const updateIdentitySchema = z.object({
  body: z.object({
    status: z.enum(IDENTITY_STATUSES, {
      errorMap: () => ({ message: 'Status must be UNVERIFIED, PENDING, VERIFIED, or REJECTED' })
    }),
    reason: z.string().trim().max(500).optional(),
    id_document_type: z.string().trim().max(100).optional(),
    id_document_ref: z.string().trim().max(100).optional()
  })
});

export const inviteStaffSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Valid email address is required').max(255),
    full_name: z.string().trim().min(2, 'Full name is required').max(255),
    role: z.enum(['Admin', 'Moderator', 'Analyst'], {
      errorMap: () => ({ message: 'Staff role must be Admin, Moderator, or Analyst' })
    }),
    is_county_liaison: z.boolean().default(false),
    liaison_county: z.string().trim().max(100).optional().nullable()
  })
});
