'use server';
/**
 * @fileOverview A Genkit flow for generating hashtags optimized for SEO, GEO, and AEO.
 *
 * - generateHashtags - A function that generates hashtags based on a topic, keywords, and location.
 * - GenerateHashtagsInput - The input type for the generateHashtags function.
 * - GenerateHashtagsOutput - The return type for the generateHashtags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHashtagsInputSchema = z.object({
  topic: z.string().describe('The main topic for the content.'),
  keywords: z.string().optional().describe('Comma-separated keywords related to the topic.'),
  location: z.string().optional().describe('An optional location to generate geo-targeted hashtags.'),
});
export type GenerateHashtagsInput = z.infer<typeof GenerateHashtagsInputSchema>;

const GenerateHashtagsOutputSchema = z.object({
  general: z.array(z.string()).describe('Broad hashtags for general SEO and reach.'),
  niche: z.array(z.string()).describe('Specific, long-tail hashtags for Answer Engine Optimization (AEO) and targeting a niche audience.'),
  local: z.array(z.string()).optional().describe('Geo-targeted hashtags if a location was provided.'),
});
export type GenerateHashtagsOutput = z.infer<typeof GenerateHashtagsOutputSchema>;

export async function generateHashtags(input: GenerateHashtagsInput): Promise<GenerateHashtagsOutput> {
  return generateHashtagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHashtagsPrompt',
  input: {schema: GenerateHashtagsInputSchema},
  output: {schema: GenerateHashtagsOutputSchema},
  prompt: `You are a social media expert specializing in advanced hashtag strategy. Your task is to generate three categories of hashtags based on the user's input, optimized for different marketing objectives: SEO, AEO, and GEO (geo-targeting).

The user has provided:
- Topic: {{{topic}}}
{{#if keywords}}- Keywords: {{{keywords}}}{{/if}}
{{#if location}}- Location: {{{location}}}{{/if}}

Generate hashtags for the following categories, ensuring they are contextually deep and semantically relevant so they could be understood and potentially cited by AI (Generative Engine Optimization).

1.  **General (SEO - Search Engine Optimization)**: Create 5-7 popular and relevant hashtags to maximize general reach and drive traffic. These should be broad but directly related to the main topic and keywords. The goal is to appear in traditional search results.

2.  **Niche (AEO - Answer Engine Optimization)**: Create 5-7 specific, "long-tail" hashtags. These should be designed to answer a user's specific intent, question, or problem. Think about what a user might type into a voice search or a Q&A box. These hashtags should help the content appear in direct answers or featured snippets.

3.  **Local (GEO-targeting)**: {{#if location}}Create 3-5 hashtags that are targeted to the specified location: {{{location}}}. Include the city, region, and related local terms to capture a local audience.{{else}}No location was provided, so you must leave the 'local' field empty in the output.{{/if}}

Rules:
- All hashtags must start with '#'.
- Do not include spaces in hashtags.
- Return the hashtags in the specified JSON format.
`,
});

const generateHashtagsFlow = ai.defineFlow(
  {
    name: 'generateHashtagsFlow',
    inputSchema: GenerateHashtagsInputSchema,
    outputSchema: GenerateHashtagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
