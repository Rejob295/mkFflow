'use server';
/**
 * @fileOverview A Genkit flow for classifying content and matching it against user-specified constraints.
 *
 * - classifyContentAndMatchConstraints - A function that classifies content and checks if it matches user constraints.
 * - ClassifyContentAndMatchConstraintsInput - The input type for the classifyContentAndMatchConstraints function.
 * - ClassifyContentAndMatchConstraintsOutput - The return type for the classifyContentAndMatchConstraints function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyContentAndMatchConstraintsInputSchema = z.object({
  content: z.string().describe('The content to be classified.'),
  constraints: z.string().describe('The user-specified constraints for the content.'),
});
export type ClassifyContentAndMatchConstraintsInput = z.infer<typeof ClassifyContentAndMatchConstraintsInputSchema>;

const ClassifyContentAndMatchConstraintsOutputSchema = z.object({
  classification: z.string().describe('The classification of the content.'),
  matchesConstraints: z.boolean().describe('Whether the content classification matches the user-specified constraints.'),
});
export type ClassifyContentAndMatchConstraintsOutput = z.infer<typeof ClassifyContentAndMatchConstraintsOutputSchema>;

export async function classifyContentAndMatchConstraints(input: ClassifyContentAndMatchConstraintsInput): Promise<ClassifyContentAndMatchConstraintsOutput> {
  return classifyContentAndMatchConstraintsFlow(input);
}

const classifyContentAndMatchConstraintsPrompt = ai.definePrompt({
  name: 'classifyContentAndMatchConstraintsPrompt',
  input: {schema: ClassifyContentAndMatchConstraintsInputSchema},
  output: {schema: ClassifyContentAndMatchConstraintsOutputSchema},
  prompt: `You are an AI assistant that classifies content and determines if it matches user-specified constraints.\n\nContent: {{{content}}}\nConstraints: {{{constraints}}}\n\nClassification: \nMatches Constraints: `,
});

const classifyContentAndMatchConstraintsFlow = ai.defineFlow(
  {
    name: 'classifyContentAndMatchConstraintsFlow',
    inputSchema: ClassifyContentAndMatchConstraintsInputSchema,
    outputSchema: ClassifyContentAndMatchConstraintsOutputSchema,
  },
  async input => {
    const {output} = await classifyContentAndMatchConstraintsPrompt(input);
    return output!;
  }
);
