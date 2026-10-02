import { z } from 'zod';

export const VERIFICATION_STATUSES = [
  'REQUIRES_VERIFICATION',
  'EVIDENCE_SUPPORTS_CLAIM',
  'EVIDENCE_CONFLICTS_WITH_CLAIM',
  'INSUFFICIENT_EVIDENCE',
  'MISSING_CONTEXT'
];

export const INPUT_TYPES = [
  'TEXT',
  'URL',
  'IMAGE',
  'TEXT_AND_URL',
  'TEXT_AND_IMAGE'
];

export const CONFIDENCE_LEVELS = ['LOW', 'MEDIUM', 'HIGH'];

/**
 * URL validation regex enforcing http and https only
 */
const SAFE_URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

/**
 * Validator for creating a new verification request
 */
export const createVerificationSchema = z.object({
  body: z.object({
    input_type: z.enum(INPUT_TYPES, {
      errorMap: () => ({ message: 'Invalid input type. Allowed: TEXT, URL, IMAGE, TEXT_AND_URL, TEXT_AND_IMAGE' })
    }),
    claim_text: z.string().trim().max(10000, 'Claim text cannot exceed 10,000 characters').optional().nullable(),
    source_url: z.string().trim().max(1000, 'Source URL cannot exceed 1,000 characters').optional().nullable().refine(
      (val) => {
        if (!val) return true;
        return SAFE_URL_REGEX.test(val);
      },
      { message: 'Source URL must be a valid web address starting with http:// or https://' }
    ),
    source_title: z.string().trim().max(255, 'Source title cannot exceed 255 characters').optional().nullable()
  }).refine((data) => {
    // Check basic non-emptiness based on input_type
    const hasClaim = Boolean(data.claim_text && data.claim_text.length >= 3);
    const hasUrl = Boolean(data.source_url && data.source_url.length > 0);

    if (data.input_type === 'TEXT') {
      return hasClaim;
    }
    if (data.input_type === 'URL') {
      return hasUrl;
    }
    if (data.input_type === 'TEXT_AND_URL') {
      return hasClaim && hasUrl;
    }
    // For IMAGE and TEXT_AND_IMAGE, file presence will be validated in controller/middleware
    return true;
  }, {
    message: 'Please provide the required claim text or source URL for the selected input type.',
    path: ['claim_text']
  })
});

/**
 * Query schema for listing user's verification history
 */
export const listVerificationsQuerySchema = z.object({
  query: z.object({
    page: z.preprocess(
      (val) => (val !== undefined && val !== null && val !== '' ? Number(val) : 1),
      z.number({ invalid_type_error: 'Page must be a valid number' })
        .int('Page must be an integer')
        .min(1, 'Page must be at least 1')
    ).default(1),
    limit: z.preprocess(
      (val) => (val !== undefined && val !== null && val !== '' ? Number(val) : 20),
      z.number({ invalid_type_error: 'Limit must be a valid number' })
        .int('Limit must be an integer')
        .min(1, 'Limit must be at least 1')
        .max(50, 'Limit cannot exceed 50')
    ).default(20),
    status: z.enum(VERIFICATION_STATUSES).optional()
  })
});

/**
 * Verification ID param schema
 */
export const verificationIdParamSchema = z.object({
  params: z.object({
    id: z.preprocess(
      (val) => Number(val),
      z.number({ required_error: 'Verification ID is required' })
        .int('Verification ID must be an integer')
        .positive('Verification ID must be a positive integer')
    )
  })
});

/**
 * Schema to strictly validate raw output returned by AI provider
 */
export const aiVerificationResponseSchema = z.object({
  status: z.enum(VERIFICATION_STATUSES, {
    errorMap: () => ({ message: 'AI returned an unrecognized verification status' })
  }),
  mainClaim: z.string().trim().min(1, 'Main claim summary is required'),
  summary: z.string().trim().min(1, 'AI analysis summary is required'),
  supportingInformation: z.array(z.string().trim()).default([]),
  contradictoryInformation: z.array(z.string().trim()).default([]),
  missingContext: z.array(z.string().trim()).default([]),
  recommendedVerification: z.array(z.string().trim()).default([]),
  confidence: z.enum(CONFIDENCE_LEVELS).default('LOW')
});
