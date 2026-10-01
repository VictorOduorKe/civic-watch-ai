import { z } from 'zod';

/**
 * Validator for admin dashboard query parameters.
 */
export const adminDashboardSummarySchema = z.object({
  query: z.object({
    range: z.preprocess(
      (val) => (val ? String(val).trim().toLowerCase() : '30d'),
      z.enum(['7d', '30d', '90d', 'year', 'all']).default('30d')
    )
  })
});
