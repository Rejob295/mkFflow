'use server';
/**
 * @fileOverview A Genkit flow for generating hashtags optimized for SEO, GEO, and AEO.
 *
 * - generateHashtags - A function that generates hashtags based on a topic, keywords, and location.
 * - GenerateHashtagsInput - The input type for the generateHashtags function.
 * - GenerateHashtagsOutput - The return type for the generateHashtags function.
 */

// import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const GenerateHashtagsInputSchema = z.object({
  topic: z.string().describe('The main topic for the content.'),
  keywords: z.string().optional().describe('Comma-separated keywords related to the topic.'),
  location: z.string().optional().describe('An optional location to generate geo-targeted hashtags.'),
});
export type GenerateHashtagsInput = z.infer<typeof GenerateHashtagsInputSchema>;

export const GenerateHashtagsOutputSchema = z.object({
  general: z.array(z.string()).describe('Broad hashtags for general SEO and reach.'),
  niche: z.array(z.string()).describe('Specific, long-tail hashtags for Answer Engine Optimization (AEO) and targeting a niche audience.'),
  local: z.array(z.string()).optional().describe('Geo-targeted hashtags if a location was provided.'),
});
export type GenerateHashtagsOutput = z.infer<typeof GenerateHashtagsOutputSchema>;

export async function generateHashtags(input: GenerateHashtagsInput): Promise<GenerateHashtagsOutput> {
  // Mock implementation
  const topicWords = input.topic.toLowerCase().split(' ');
  const keywordWords = input.keywords ? input.keywords.toLowerCase().split(',').map(k => k.trim()) : [];
  
  const general = [
    `#${topicWords.join('')}`,
    `#${topicWords[0]}`,
    '#marketing',
    '#contenido',
    '#digital'
  ];
  
  const niche = [
    `#${topicWords.join('')}Tips`,
    `#Como${topicWords[0]}`,
    ...keywordWords.map(k => `#${k.replace(/\s+/g, '')}`),
    `#${topicWords[0]}Estrategia`,
    `#${topicWords[0]}Experto`
  ];
  
  const local = input.location ? [
    `#${input.location.replace(/\s+/g, '')}`,
    `#${topicWords[0]}${input.location.replace(/\s+/g, '')}`,
    `#${input.location.split(' ')[0]}`
  ] : undefined;
  
  return { general, niche, local };
}

// Comentamos las funciones de Genkit temporalmente
