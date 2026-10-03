import { z } from 'zod';

export const auditQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    severity: z.enum(['INFO', 'NOTICE', 'WARNING', 'SECURITY', 'CRITICAL']).optional(),
    outcome: z.enum(['SUCCESS', 'FAILURE', 'DENIED', 'BLOCKED']).optional(),
    action: z.string().optional(),
    resourceType: z.string().optional(),
    resourceId: z.string().optional(),
    actorId: z.coerce.number().int().optional(),
    startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
    endDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
    search: z.string().max(100).optional()
  }).optional()
});

export const auditExportSchema = z.object({
  body: z.object({
    format: z.enum(['CSV', 'JSON']).default('CSV'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    severity: z.enum(['INFO', 'NOTICE', 'WARNING', 'SECURITY', 'CRITICAL']).optional(),
    action: z.string().optional(),
    resourceType: z.string().optional()
  }).optional()
});

export const securityEventQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(['DETECTED', 'REVIEWING', 'CONFIRMED', 'DISMISSED', 'RESOLVED']).optional(),
    severity: z.enum(['WARNING', 'SECURITY', 'CRITICAL']).optional(),
    eventCode: z.string().optional()
  }).optional()
});

export const securityEventStatusSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive()
  }),
  body: z.object({
    status: z.enum(['DETECTED', 'REVIEWING', 'CONFIRMED', 'DISMISSED', 'RESOLVED']),
    resolutionNote: z.string().max(1000).optional()
  })
});

export const categoryCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    module: z.string().max(50).default('REPORT'),
    displayOrder: z.coerce.number().int().default(0),
    parentId: z.coerce.number().int().nullable().optional(),
    metadata: z.record(z.any()).nullable().optional()
  })
});

export const categoryUpdateSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive()
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().min(5).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
    module: z.string().max(50).optional(),
    displayOrder: z.coerce.number().int().optional(),
    parentId: z.coerce.number().int().nullable().optional(),
    metadata: z.record(z.any()).nullable().optional()
  })
});

export const apiKeyCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Key name must be at least 2 characters').max(100),
    scopes: z.array(z.string()).min(1, 'At least one scope is required').default(['reports:read', 'alerts:read']),
    expiresInDays: z.coerce.number().int().min(1).max(365).default(90)
  })
});

export const webhookCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Webhook name must be at least 2 characters').max(100),
    endpointUrl: z.string().url('A valid URL is required').max(500),
    eventSubscriptions: z.array(z.string()).min(1, 'At least one event subscription is required')
  })
});

export const webhookUpdateSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive()
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    endpointUrl: z.string().url().max(500).optional(),
    eventSubscriptions: z.array(z.string()).optional(),
    status: z.enum(['ACTIVE', 'DISABLED', 'FAILED']).optional()
  })
});

export const securityPolicyUpdateSchema = z.object({
  params: z.object({
    key: z.string().min(2).max(100)
  }),
  body: z.object({
    value: z.any(),
    reason: z.string().min(3, 'A reason of at least 3 characters is required').max(500)
  })
});
