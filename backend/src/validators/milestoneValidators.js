import { z } from 'zod';

export const approveMilestoneSchema = z.object({
  params: z.object({
    id: z.string().trim().toUpperCase().max(10)
  }),
  body: z.object({
    comment: z.string().trim().max(1000).optional().default('Approved after human review and verification sign-off.')
  }).optional().default({})
});

export const rejectMilestoneSchema = z.object({
  params: z.object({
    id: z.string().trim().toUpperCase().max(10)
  }),
  body: z.object({
    reason: z.string().trim().min(3, 'Rejection reason must be at least 3 characters.').max(1000)
  })
});

export const reportRegressionSchema = z.object({
  params: z.object({
    id: z.string().trim().toUpperCase().max(10)
  }),
  body: z.object({
    reason: z.string().trim().min(3, 'Regression description must be at least 3 characters.').max(1000)
  })
});

export const updateMilestoneDefinitionSchema = z.object({
  params: z.object({
    id: z.string().trim().toUpperCase().max(10)
  }),
  body: z.object({
    title: z.string().trim().max(255).optional(),
    objective: z.string().trim().optional(),
    tasks: z.array(z.string().trim()).min(1).optional(),
    acceptance_criteria: z.array(z.string().trim()).min(1).optional(),
    verification_requirements: z.array(z.string().trim()).min(1).optional(),
    change_reason: z.string().trim().min(3, 'Change reason must be at least 3 characters.').max(1000)
  })
});
