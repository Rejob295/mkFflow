'use server';

/**
 * @fileOverview Content idea generation flow.
 *
 * - suggestContentIdeas - A function that suggests content ideas based on various inputs.
 * - SuggestContentIdeasInput - The input type for the suggestContentIdeas function.
 * - SuggestContentIdeasOutput - The return type for the suggestContentIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestContentIdeasInputSchema = z.object({
  topic: z
    .string()
    .optional()
    .describe('Optional: The specific topic to generate content ideas for.'),
  trendingTopics: z
    .string()
    .optional()
    .describe('Optional: Current trending topics to base content on.'),
  seasonalEvents: z
    .string()
    .optional()
    .describe('Optional: Upcoming seasonal events to consider.'),
  keyword: z
      .string()
      .optional()
      .describe('Optional: A keyword to focus content ideas around.')
});

export type SuggestContentIdeasInput = z.infer<typeof SuggestContentIdeasInputSchema>;

const SuggestContentIdeasOutputSchema = z.object({
  ideas: z.array(
    z.string().describe('A content idea based on the provided inputs.')
  ).describe('Array of content ideas'),
});

export type SuggestContentIdeasOutput = z.infer<typeof SuggestContentIdeasOutputSchema>;

export async function suggestContentIdeas(input: SuggestContentIdeasInput): Promise<SuggestContentIdeasOutput> {
  return suggestContentIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestContentIdeasPrompt',
  input: {schema: SuggestContentIdeasInputSchema},
  output: {schema: SuggestContentIdeasOutputSchema},
  prompt: `You are a marketing content creation expert. Your task is to generate content ideas based on the provided information.

  Here are some trending topics: {{{trendingTopics}}}
  Here are some seasonal events to consider: {{{seasonalEvents}}}
  Here is a specific topic: {{{topic}}}
  Here is a keyword to focus on: {{{keyword}}}

  Please provide 5 distinct content ideas that are engaging and relevant to the target audience.
  Ideas:`, 
});

const suggestContentIdeasFlow = ai.defineFlow(
  {
    name: 'suggestContentIdeasFlow',
    inputSchema: SuggestContentIdeasInputSchema,
    outputSchema: SuggestContentIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
