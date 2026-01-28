import { ActionPriority } from '@/core/domain/shared/enums';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

/**
 * Zod schema for action suggestion structured output
 */
const ActionSuggestionSchema = z.object({
  rootCause: z
    .string()
    .min(10, 'Root cause must be at least 10 characters')
    .max(500, 'Root cause must be at most 500 characters')
    .describe('The root cause or underlying reason that justifies this action'),
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be at most 100 characters')
    .describe('A clear, concise title for the action'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be at most 1000 characters')
    .describe('A detailed description of what needs to be done'),
  priority: z
    .enum([
      ActionPriority.LOW,
      ActionPriority.MEDIUM,
      ActionPriority.HIGH,
      ActionPriority.URGENT,
    ])
    .describe('The priority level of this action'),
  estimatedStartDays: z
    .number()
    .int()
    .min(0, 'Start days must be 0 or more')
    .max(365, 'Start days must be at most 365')
    .describe('Number of days from today when this action should start'),
  estimatedDurationDays: z
    .number()
    .int()
    .min(1, 'Duration must be at least 1 day')
    .max(365, 'Duration must be at most 365 days')
    .describe('Estimated duration of the action in days'),
  checklistItems: z
    .array(
      z
        .string()
        .min(3, 'Checklist item must be at least 3 characters')
        .max(200, 'Checklist item must be at most 200 characters'),
    )
    .min(3, 'Must have at least 3 checklist items')
    .max(8, 'Must have at most 8 checklist items')
    .describe('List of specific tasks or steps to complete this action'),
});

/**
 * Zod schema for the complete action plan response
 */
const ActionPlanResponseSchema = z.object({
  suggestions: z
    .array(ActionSuggestionSchema)
    .length(3, 'Must generate exactly 3 action suggestions')
    .describe('Array of 3 action suggestions'),
});

/**
 * Export the response format for OpenAI Structured Outputs
 */
export const actionPlanResponseFormat = zodResponseFormat(
  ActionPlanResponseSchema,
  'action_plan',
);

/**
 * TypeScript type inferred from the schema
 */
export type ActionPlanResponse = z.infer<typeof ActionPlanResponseSchema>;
