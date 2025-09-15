// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Generates marketing copy suggestions based on a content title or brief description.
 *
 * - generateMarketingCopy - A function that generates marketing copy suggestions.
 * - GenerateMarketingCopyInput - The input type for the generateMarketingCopy function.
 * - GenerateMarketingCopyOutput - The return type for the generateMarketingCopy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMarketingCopyInputSchema = z.object({
  contentTitle: z.string().describe('The title of the content.'),
  briefDescription: z.string().describe('A brief description of the content.'),
});
export type GenerateMarketingCopyInput = z.infer<
  typeof GenerateMarketingCopyInputSchema
>;

const GenerateMarketingCopyOutputSchema = z.object({
  marketingCopySuggestions: z
    .array(z.string())
    .describe('An array of marketing copy suggestions.'),
});
export type GenerateMarketingCopyOutput = z.infer<
  typeof GenerateMarketingCopyOutputSchema
>;

export async function generateMarketingCopy(
  input: GenerateMarketingCopyInput
): Promise<GenerateMarketingCopyOutput> {
  return generateMarketingCopyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMarketingCopyPrompt',
  input: {schema: GenerateMarketingCopyInputSchema},
  output: {schema: GenerateMarketingCopyOutputSchema},
  prompt: `You are a marketing expert. Generate multiple engaging marketing copy suggestions based on the following content title and brief description.

Content Title: {{{contentTitle}}}
Brief Description: {{{briefDescription}}}

Marketing Copy Suggestions:`,
});

const generateMarketingCopyFlow = ai.defineFlow(
  {
    name: 'generateMarketingCopyFlow',
    inputSchema: GenerateMarketingCopyInputSchema,
    outputSchema: GenerateMarketingCopyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
