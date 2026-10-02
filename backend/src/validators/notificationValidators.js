import { z } from 'zod';

/**
 * Controlled vocabulary for notification types.
 * Active in M8: REPORT_RECEIVED, REPORT_STATUS_CHANGED, REPORT_ASSIGNED, REPORT_UPDATED, SYSTEM_NOTIFICATION
 * Future-ready types: ALERT_PUBLISHED, CONSULTATION_OPENED, SURVEY_CLOSING
 */
export const NOTIFICATION_TYPES = [
  'REPORT_RECEIVED',
  'REPORT_STATUS_CHANGED',
  'REPORT_ASSIGNED',
  'REPORT_UPDATED',
  'SYSTEM_NOTIFICATION',
  'ALERT_PUBLISHED',
  'CONSULTATION_OPENED',
  'SURVEY_CLOSING'
];

/**
 * Notification List Query Validator
 * Validates pagination parameters and unread filter.
 * Defaults: page=1, limit=20. Max limit=50.
 */
export const listNotificationsQuerySchema = z.object({
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
    unread: z.preprocess(
      (val) => {
        if (val === 'true' || val === '1' || val === true) return true;
        if (val === 'false' || val === '0' || val === false) return false;
        return undefined;
      },
      z.boolean().optional()
    )
  })
});

/**
 * Notification ID Param Validator
 */
export const notificationIdParamSchema = z.object({
  params: z.object({
    id: z.preprocess(
      (val) => Number(val),
      z.number({ required_error: 'Notification ID is required' })
        .int('Notification ID must be an integer')
        .positive('Notification ID must be a positive integer')
    )
  })
});

/**
 * Internal Notification Creation Schema
 */
export const createNotificationSchema = z.object({
  recipientUserId: z.number().int().positive('Valid recipient user ID is required'),
  type: z.enum(NOTIFICATION_TYPES, {
    errorMap: () => ({ message: 'Invalid notification type' })
  }),
  title: z.string().trim().min(1, 'Title is required').max(255, 'Title must not exceed 255 characters'),
  message: z.string().trim().min(1, 'Message is required').max(2000, 'Message must not exceed 2000 characters'),
  entityType: z.string().trim().max(50).optional().nullable(),
  entityId: z.number().int().positive().optional().nullable(),
  entityReference: z.string().trim().max(100).optional().nullable(),
  dedupeKey: z.string().trim().max(191).optional().nullable()
});
