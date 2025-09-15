'use server';
/**
 * @fileOverview A Genkit flow for processing raw spreadsheet data into structured content items using AI.
 *
 * - processContentWithAI - A function that takes raw JSON data from a spreadsheet and maps it to structured ContentItem objects.
 * - ProcessContentWithAIInput - The input type for the processContentWithAI function.
 * - ProcessContentWithAIOutput - The return type for the processContentWithAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { contentCategories } from '@/lib/types';

const ProcessContentWithAIInputSchema = z.object({
  rawData: z.string().describe('A JSON string representing an array of objects, where each object is a row from a spreadsheet.'),
});
export type ProcessContentWithAIInput = z.infer<typeof ProcessContentWithAIInputSchema>;

const ProcessedContentItemSchema = z.object({
    title: z.string().describe('The title of the content item.'),
    date: z.string().describe('The publication date in ISO 8601 format (YYYY-MM-DD).'),
    category: z.enum(contentCategories).describe('The category of the content item.'),
    description: z.string().optional().describe('A brief description of the content.'),
});

const ProcessContentWithAIOutputSchema = z.object({
  processedContent: z.array(ProcessedContentItemSchema).describe('An array of structured content items.'),
});
export type ProcessContentWithAIOutput = z.infer<typeof ProcessContentWithAIOutputSchema>;

export async function processContentWithAI(input: ProcessContentWithAIInput): Promise<ProcessContentWithAIOutput> {
  return processContentWithAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processContentWithAIPrompt',
  input: {schema: ProcessContentWithAIInputSchema},
  output: {schema: ProcessContentWithAIOutputSchema},
  prompt: `You are an intelligent data processing assistant. Your task is to analyze the provided raw JSON data, which comes from a spreadsheet, and transform it into a structured format of content items.

The user wants to map their spreadsheet columns to the following fields: 'title', 'date', 'category', and 'description'.

Your instructions are:
1.  **Analyze the Input**: The input JSON is an array of objects. Each object represents a row. The keys are column letters (A, B, C, etc.) or header names.
2.  **Identify Columns**: Intelligently determine which column corresponds to 'title', 'date', 'category', and 'description'. The column names might not be exact matches (e.g., 'Título del Post' should map to 'title', 'Fecha de Publicación' to 'date').
3.  **Handle Dates**: Convert any recognized date format into a strict 'YYYY-MM-DD' ISO 8601 format. The current year is ${new Date().getFullYear()}. If a date is ambiguous or invalid, make a reasonable guess or omit the item if it's impossible to parse.
4.  **Map Categories**: The 'category' field must be one of the following exact values: ${contentCategories.join(', ')}. If you find a category like 'educacional' or 'inspirational', map it to the correct value (e.g., '📚 Educativo', '💫 Inspiracional'). If a category is unrecognizable, you can default to '📚 Educativo'.
5.  **Structure Output**: Return an array of objects, where each object strictly follows the defined output schema. Omit any rows that are clearly headers or do not contain valid data.

Here is the raw data from the user's spreadsheet:
{{{rawData}}}
`,
});

const processContentWithAIFlow = ai.defineFlow(
  {
    name: 'processContentWithAIFlow',
    inputSchema: ProcessContentWithAIInputSchema,
    outputSchema: ProcessContentWithAIOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
