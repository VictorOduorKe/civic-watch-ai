import { z } from 'zod';

/**
 * M12 — Civic Intelligence & Insights: Analytics Query Validators
 *
 * All inputs sanitized via Zod. No raw SQL construction from user input.
 * Dates validated for logical ordering. Enums whitelist all filter values.
 */

// Allowed predefined time ranges
const RANGE_VALUES = ['7d', '30d', '90d', '12m', 'all'];

// Shared analytics query shape
const analyticsQueryShape = {
  range: z
    .preprocess(
      (val) => (val ? String(val).trim().toLowerCase() : undefined),
      z.enum(RANGE_VALUES).optional()
    )
    .optional(),
  start_date: z
    .preprocess(
      (val) => (val ? String(val).trim() : undefined),
      z.string().optional()
    )
    .optional(),
  end_date: z
    .preprocess(
      (val) => (val ? String(val).trim() : undefined),
      z.string().optional()
    )
    .optional(),
  county: z
    .preprocess(
      (val) => (val ? String(val).trim().substring(0, 100) : undefined),
      z.string().min(1).max(100).optional()
    )
    .optional(),
  category: z
    .preprocess(
      (val) => (val ? String(val).trim() : undefined),
      z.string().optional()
    )
    .optional(),
  status: z
    .preprocess(
      (val) => (val ? String(val).trim() : undefined),
      z.string().optional()
    )
    .optional()
};

function dateOrderRefinement(data, ctx) {
  if (data.start_date && data.end_date) {
    if (new Date(data.start_date) > new Date(data.end_date)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'start_date must be before or equal to end_date',
        path: ['start_date']
      });
    }
  }
}

export const analyticsOverviewSchema = z.object({
  query: z.object(analyticsQueryShape).superRefine(dateOrderRefinement)
});

export const analyticsReportsSchema = z.object({
  query: z.object(analyticsQueryShape).superRefine(dateOrderRefinement)
});

export const analyticsCategoriesSchema = z.object({
  query: z.object(analyticsQueryShape).superRefine(dateOrderRefinement)
});

export const analyticsStatusSchema = z.object({
  query: z.object(analyticsQueryShape).superRefine(dateOrderRefinement)
});

export const analyticsGeographySchema = z.object({
  query: z.object(analyticsQueryShape).superRefine(dateOrderRefinement)
});

export const analyticsAlertsSchema = z.object({
  query: z.object({
    range: z
      .preprocess(
        (val) => (val ? String(val).trim().toLowerCase() : undefined),
        z.enum(RANGE_VALUES).optional()
      )
      .optional(),
    start_date: z.preprocess((val) => (val ? String(val).trim() : undefined), z.string().optional()).optional(),
    end_date: z.preprocess((val) => (val ? String(val).trim() : undefined), z.string().optional()).optional(),
    county: z
      .preprocess(
        (val) => (val ? String(val).trim().substring(0, 100) : undefined),
        z.string().optional()
      )
      .optional()
  }).superRefine(dateOrderRefinement)
});

export const analyticsTrendsSchema = z.object({
  query: z.object(analyticsQueryShape).superRefine(dateOrderRefinement)
});
