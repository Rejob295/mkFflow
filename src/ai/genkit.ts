// Comentamos temporalmente las importaciones de Genkit para evitar errores
// import {genkit} from 'genkit';
// import {googleAI} from '@genkit-ai/googleai';

// Exportamos un objeto mock para evitar errores de compilación
export const ai = {
  definePrompt: () => () => ({ output: null }),
  defineFlow: () => () => ({ output: null })
};
