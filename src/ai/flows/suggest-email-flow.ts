'use server';
/**
 * @fileOverview An email validation AI flow.
 *
 * - suggestEmailCorrection - A function that suggests a correction for a given email address.
 * - EmailInput - The input type for the suggestEmailCorrection function.
 * - EmailSuggestionOutput - The return type for the suggestEmailCorrection function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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

export async function suggestEmailCorrection(
  input: EmailInput
): Promise<EmailSuggestionOutput> {
  return suggestEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestEmailPrompt',
  input: { schema: EmailInputSchema },
  output: { schema: EmailSuggestionOutputSchema },
  prompt: `You are an email validation expert. Your task is to identify common typos in the domain part of an email address and suggest a correction.

Analyze the following email address: {{{email}}}

- If you detect a common typo (e.g., "gmial.com", "yaho.com", "outlok.com"), provide the corrected version.
- Only correct common, obvious typos in the domain name (the part after the '@'). Do not change the username part.
- If the email address appears to be valid or the typo is not obvious, return null for the suggestion.

Examples:
- Input: "test@gmial.com" -> Output: "test@gmail.com"
- Input: "user@yaho.com" -> Output: "user@yahoo.com"
- Input: "contact@outlok.com" -> Output: "contact@outlook.com"
- Input: "valid.email@example.com" -> Output: null
- Input: "user@randomdomain123.xyz" -> Output: null`,
});

const suggestEmailFlow = ai.defineFlow(
  {
    name: 'suggestEmailFlow',
    inputSchema: EmailInputSchema,
    outputSchema: EmailSuggestionOutputSchema,
  },
  async (input) => {
    // Basic regex check to avoid running AI on clearly invalid formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      return { suggestion: null };
    }

    const { output } = await prompt(input);
    return output!;
  }
);
