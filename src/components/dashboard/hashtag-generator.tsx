"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Hash, Wand2, Copy } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { generateHashtags, GenerateHashtagsOutput } from '@/ai/flows/generate-hashtags';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  topic: z.string().min(1, "El tema es requerido."),
  keywords: z.string().optional(),
  location: z.string().optional(),
});

export function HashtagGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [hashtags, setHashtags] = useState<GenerateHashtagsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      keywords: "",
      location: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setHashtags(null);
    try {
      const result = await generateHashtags(values);
      setHashtags(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error al generar hashtags",
        description: "Algo salió mal. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = (text: string, category: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "¡Copiado!",
      description: `Hashtags de ${category} copiados al portapapeles.`,
    });
  };

  const renderHashtagBlock = (title: string, list: string[] | undefined) => {
    if (!list || list.length === 0) return null;
    const hashtagString = list.join(' ');
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm">{title}</h4>
            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(hashtagString, title)}>
                <Copy className="mr-2 h-3 w-3" />
                Copiar
            </Button>
        </div>
        <div className="p-3 bg-background rounded-md shadow-sm text-sm text-muted-foreground">
          {hashtagString}
        </div>
      </div>
    );
  };

  return (
    <div>
      <DialogHeader>
        <DialogTitle className="font-headline flex items-center gap-2">
          <Hash className="w-6 h-6" />
          Generador de Hashtags
        </DialogTitle>
        <DialogDescription>
          Crea hashtags optimizados para SEO, GEO y AEO para maximizar tu alcance.
        </DialogDescription>
      </DialogHeader>
      <div className="py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tema Principal</FormLabel>
                    <FormControl>
                      <Input placeholder="p.ej., Marketing de Contenidos" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Palabras Clave (separadas por coma)</FormLabel>
                    <FormControl>
                      <Input placeholder="p.ej., redes sociales, seo, marca" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="p.ej., Madrid, España" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Generando...' : <><Wand2 className="mr-2 h-4 w-4" /> Generar Hashtags</>}
            </Button>
          </form>
        </Form>

        {(isLoading || hashtags) && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Hashtags Sugeridos</h3>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                   <div key={i} className="space-y-2">
                     <div className="h-5 w-24 bg-accent/30 rounded animate-pulse" />
                     <div className="p-4 bg-accent/30 rounded-lg animate-pulse h-12" />
                   </div>
                ))}
              </div>
            ) : (
                hashtags && (
                <ScrollArea className="h-72 rounded-lg border p-4">
                    <div className="space-y-4">
                        {renderHashtagBlock('Generales (SEO)', hashtags.general)}
                        {renderHashtagBlock('De Nicho (AEO)', hashtags.niche)}
                        {renderHashtagBlock('Locales (GEO)', hashtags.local)}
                    </div>
              </ScrollArea>
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
