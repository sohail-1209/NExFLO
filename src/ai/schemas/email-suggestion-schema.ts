
import { z } from 'zod';

/**
 * @fileOverview Zod schemas and TypeScript types for the email suggestion AI flow.
 */

export const EmailInputSchema = z.object({
  email: z.string().describe('The email address to validate.'),
});
export type EmailInput = z.infer<typeof EmailInputSchema>;

export const EmailSuggestionOutputSchema = z.object({
  suggestion: z
    .string()
    .nullable()
    .describe(
      'The suggested email correction, or null if no correction is needed.'
    ),
});
export type EmailSuggestionOutput = z.infer<
  typeof EmailSuggestionOutputSchema
>;
