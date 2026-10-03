import { z } from 'zod';

/**
 * M13 — Citizen Notifications & Subscriptions: Validators
 */

const ALERT_TYPES = [
  'OFFICIAL_COUNTY_ALERT',
  'GOVERNMENT_ADVISORY',
  'UTILITY_DOWNTIME',
  'PUBLIC_SAFETY',
  'WEATHER_ENVIRONMENTAL',
  'COMMUNITY_ADVISORY'
];

const UTILITY_SERVICES = [
  'ELECTRICITY',
  'WATER',
  'ROAD_INFRASTRUCTURE',
  'WASTE_SANITATION',
  'INTERNET_TELECOM',
  'OTHER'
];

const SEVERITY_LEVELS = ['INFO', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
const CHANNELS = ['IN_APP', 'EMAIL', 'BOTH'];

// Schema for updating user notification preferences
export const updatePreferencesSchema = z.object({
  body: z.object({
    in_app_enabled: z.boolean().optional(),
    email_enabled: z.boolean().optional(),
    min_severity: z.enum(SEVERITY_LEVELS).optional()
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one preference field must be provided' }
  )
});

// Schema for creating an alert subscription
export const createSubscriptionSchema = z.object({
  body: z.object({
    alert_type: z.enum(ALERT_TYPES).nullable().optional(),
    utility_service: z.enum(UTILITY_SERVICES).nullable().optional(),
    county: z
      .preprocess((val) => (val ? String(val).trim().substring(0, 100) : null), z.string().nullable().optional()),
    sub_county: z
      .preprocess((val) => (val ? String(val).trim().substring(0, 100) : null), z.string().nullable().optional()),
    ward: z
      .preprocess((val) => (val ? String(val).trim().substring(0, 100) : null), z.string().nullable().optional()),
    min_severity: z.enum(SEVERITY_LEVELS).nullable().optional(),
    channel: z.enum(CHANNELS).default('IN_APP').optional(),
    is_active: z.boolean().default(true).optional()
  }).refine(
    (data) => data.alert_type || data.county || data.utility_service,
    { message: 'A subscription must specify at least an alert category, utility service, or geographic county.' }
  )
});

// Schema for updating an alert subscription
export const updateSubscriptionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Subscription ID must be a positive integer')
  }),
  body: z.object({
    alert_type: z.enum(ALERT_TYPES).nullable().optional(),
    utility_service: z.enum(UTILITY_SERVICES).nullable().optional(),
    county: z
      .preprocess((val) => (val ? String(val).trim().substring(0, 100) : null), z.string().nullable().optional()),
    sub_county: z
      .preprocess((val) => (val ? String(val).trim().substring(0, 100) : null), z.string().nullable().optional()),
    ward: z
      .preprocess((val) => (val ? String(val).trim().substring(0, 100) : null), z.string().nullable().optional()),
    min_severity: z.enum(SEVERITY_LEVELS).nullable().optional(),
    channel: z.enum(CHANNELS).optional(),
    is_active: z.boolean().optional()
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field to update must be provided' }
  )
});

// Subscription ID parameter schema
export const subscriptionIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Subscription ID must be a positive integer')
  })
});

// Unsubscribe helper schema
export const unsubscribeSchema = z.object({
  body: z.object({
    alert_type: z.enum(ALERT_TYPES).optional(),
    county: z.string().max(100).optional(),
    subscription_id: z.number().int().positive().optional()
  }).refine(
    (data) => data.alert_type || data.county || data.subscription_id,
    { message: 'Must provide subscription_id, alert_type, or county to unsubscribe.' }
  )
});
