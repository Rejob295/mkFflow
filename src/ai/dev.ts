import { config } from 'dotenv';
config();

import '@/ai/flows/generate-marketing-copy.ts';
import '@/ai/flows/classify-content-and-match-constraints.ts';
import '@/ai/flows/suggest-content-ideas.ts';
import '@/ai/flows/process-content-with-ai.ts';
import '@/ai/flows/generate-hashtags.ts';
