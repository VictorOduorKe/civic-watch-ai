import { z } from 'zod';

export const ALERT_TYPES = [
  'OFFICIAL_COUNTY_ALERT',
  'GOVERNMENT_ADVISORY',
  'UTILITY_DOWNTIME',
  'PUBLIC_SAFETY',
  'WEATHER_ENVIRONMENTAL',
  'COMMUNITY_ADVISORY'
];

export const ALERT_SEVERITIES = ['INFO', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'];

export const ALERT_STATUSES = [
  'DRAFT',
  'PENDING_REVIEW',
  'ACTIVE',
  'SCHEDULED',
  'EXPIRED',
  'CANCELLED',
  'ARCHIVED'
];

export const VERIFICATION_STATUSES = ['PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED'];

export const SOURCE_TYPES = [
  'COUNTY_GOVERNMENT',
  'NATIONAL_AGENCY',
  'UTILITY_PROVIDER',
  'EMERGENCY_SERVICES',
  'CIVIC_ORGANIZATION',
  'COMMUNITY'
];

export const UTILITY_SERVICES = [
  'ELECTRICITY',
  'WATER',
  'ROAD_INFRASTRUCTURE',
  'WASTE_SANITATION',
  'INTERNET_TELECOM',
  'OTHER'
];

export const DOWNTIME_STATUSES = ['PLANNED', 'ONGOING', 'RESTORED', 'CANCELLED'];

/**
 * Public List Alerts Query Validator
 */
export const listPublicAlertsQuerySchema = z.object({
  query: z.object({
    page: z.preprocess(
      (val) => (val !== undefined && val !== null && val !== '' ? Number(val) : 1),
      z.number().int().min(1).default(1)
    ),
    limit: z.preprocess(
      (val) => (val !== undefined && val !== null && val !== '' ? Number(val) : 20),
      z.number().int().min(1).max(50).default(20)
    ),
    category: z.string().trim().optional(),
    alert_type: z.enum(ALERT_TYPES).optional(),
    severity: z.enum(ALERT_SEVERITIES).optional(),
    county: z.string().trim().optional(),
    sub_county: z.string().trim().optional(),
    utility_service: z.enum(UTILITY_SERVICES).optional(),
    search: z.string().trim().max(100).optional(),
    status: z.enum(['ACTIVE', 'EXPIRED', 'ALL']).default('ACTIVE').optional()
  })
});

/**
 * Alert ID Param Validator
 */
export const alertIdParamSchema = z.object({
  params: z.object({
    id: z.preprocess(
      (val) => Number(val),
      z.number({ required_error: 'Alert ID is required' })
        .int('Alert ID must be an integer')
        .positive('Alert ID must be positive')
    )
  })
});

/**
 * Citizen Community Advisory Submission Schema
 * Enforces security rules:
 * - Cannot declare itself official
 * - Cannot declare severity HIGH or CRITICAL (capped at MODERATE)
 * - Must pass server-side moderation
 */
export const createCommunityAdvisorySchema = z.object({
  body: z.object({
    title: z.string().trim().min(5, 'Title must be at least 5 characters').max(255, 'Title cannot exceed 255 characters'),
    summary: z.string().trim().min(10, 'Summary must be at least 10 characters').max(500, 'Summary cannot exceed 500 characters'),
    description: z.string().trim().min(10, 'Description must be at least 10 characters').max(5000, 'Description cannot exceed 5000 characters'),
    alert_type: z.enum(['COMMUNITY_ADVISORY', 'PUBLIC_SAFETY', 'WEATHER_ENVIRONMENTAL']).default('COMMUNITY_ADVISORY'),
    severity: z.enum(['INFO', 'LOW', 'MODERATE']).default('LOW'),
    county: z.string().trim().max(100).optional().nullable(),
    sub_county: z.string().trim().max(100).optional().nullable(),
    ward: z.string().trim().max(100).optional().nullable(),
    location_text: z.string().trim().max(255).optional().nullable(),
    recommended_action: z.string().trim().max(1000).optional().nullable()
  })
});

/**
 * Admin Alert Creation Schema
 */
export const createAdminAlertSchema = z.object({
  body: z.object({
    title: z.string().trim().min(5, 'Title must be at least 5 characters').max(255),
    summary: z.string().trim().min(10, 'Summary must be at least 10 characters').max(500),
    description: z.string().trim().min(10, 'Description must be at least 10 characters').max(10000),
    alert_type: z.enum(ALERT_TYPES),
    severity: z.enum(ALERT_SEVERITIES).default('INFO'),
    status: z.enum(['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'SCHEDULED']).default('DRAFT'),
    source_type: z.enum(SOURCE_TYPES),
    source_name: z.string().trim().min(2, 'Source name is required').max(255),
    source_reference: z.string().trim().max(500).optional().nullable(),
    county: z.string().trim().max(100).optional().nullable(),
    sub_county: z.string().trim().max(100).optional().nullable(),
    ward: z.string().trim().max(100).optional().nullable(),
    location_text: z.string().trim().max(255).optional().nullable(),
    utility_service: z.enum(UTILITY_SERVICES).optional().nullable(),
    downtime_status: z.enum(DOWNTIME_STATUSES).optional().nullable(),
    expected_restoration: z.string().optional().nullable(),
    actual_restoration: z.string().optional().nullable(),
    recommended_action: z.string().trim().max(2000).optional().nullable(),
    start_time: z.string().optional().nullable(),
    end_time: z.string().optional().nullable(),
    is_official: z.boolean().default(true),
    is_demo: z.boolean().default(true) // Rule 35: Defaults to true for safety
  }).refine((data) => {
    if (data.start_time && data.end_time) {
      return new Date(data.end_time) >= new Date(data.start_time);
    }
    return true;
  }, {
    message: 'End time must be after or equal to start time',
    path: ['end_time']
  })
});

/**
 * Admin Alert Update Schema
 */
export const updateAdminAlertSchema = z.object({
  params: z.object({
    id: z.preprocess((val) => Number(val), z.number().int().positive())
  }),
  body: z.object({
    title: z.string().trim().min(5).max(255).optional(),
    summary: z.string().trim().min(10).max(500).optional(),
    description: z.string().trim().min(10).max(10000).optional(),
    alert_type: z.enum(ALERT_TYPES).optional(),
    severity: z.enum(ALERT_SEVERITIES).optional(),
    status: z.enum(ALERT_STATUSES).optional(),
    source_type: z.enum(SOURCE_TYPES).optional(),
    source_name: z.string().trim().min(2).max(255).optional(),
    source_reference: z.string().trim().max(500).optional().nullable(),
    county: z.string().trim().max(100).optional().nullable(),
    sub_county: z.string().trim().max(100).optional().nullable(),
    ward: z.string().trim().max(100).optional().nullable(),
    location_text: z.string().trim().max(255).optional().nullable(),
    utility_service: z.enum(UTILITY_SERVICES).optional().nullable(),
    downtime_status: z.enum(DOWNTIME_STATUSES).optional().nullable(),
    expected_restoration: z.string().optional().nullable(),
    actual_restoration: z.string().optional().nullable(),
    recommended_action: z.string().trim().max(2000).optional().nullable(),
    start_time: z.string().optional().nullable(),
    end_time: z.string().optional().nullable(),
    is_official: z.boolean().optional(),
    is_demo: z.boolean().optional(),
    change_summary: z.string().trim().max(500).optional()
  }).refine((data) => {
    if (data.start_time && data.end_time) {
      return new Date(data.end_time) >= new Date(data.start_time);
    }
    return true;
  }, {
    message: 'End time must be after or equal to start time',
    path: ['end_time']
  })
});

/**
 * Admin Verify Alert Schema
 */
export const verifyAlertSchema = z.object({
  params: z.object({
    id: z.preprocess((val) => Number(val), z.number().int().positive())
  }),
  body: z.object({
    verification_status: z.enum(['VERIFIED', 'REJECTED']),
    is_official: z.boolean().optional(),
    notes: z.string().trim().max(500).optional()
  })
});

/**
 * Admin Publish Alert Schema
 */
export const publishAlertSchema = z.object({
  params: z.object({
    id: z.preprocess((val) => Number(val), z.number().int().positive())
  }),
  body: z.object({
    schedule_time: z.string().optional().nullable(),
    notes: z.string().trim().max(500).optional()
  }).optional().default({})
});

/**
 * Admin List Alerts Query Schema
 */
export const listAdminAlertsQuerySchema = z.object({
  query: z.object({
    page: z.preprocess(
      (val) => (val !== undefined && val !== null && val !== '' ? Number(val) : 1),
      z.number().int().min(1).default(1)
    ),
    limit: z.preprocess(
      (val) => (val !== undefined && val !== null && val !== '' ? Number(val) : 20),
      z.number().int().min(1).max(50).default(20)
    ),
    status: z.string().trim().optional(),
    alert_type: z.enum(ALERT_TYPES).optional(),
    severity: z.enum(ALERT_SEVERITIES).optional(),
    verification_status: z.enum(VERIFICATION_STATUSES).optional(),
    county: z.string().trim().optional(),
    source_type: z.enum(SOURCE_TYPES).optional(),
    search: z.string().trim().max(100).optional()
  })
});
