"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lightbulb, Wand2 } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { suggestContentIdeas } from '@/ai/flows/suggest-content-ideas';
import { ScrollArea } from '../ui/scroll-area';

const formSchema = z.object({
  topic: z.string().optional(),
  keyword: z.string().optional(),
});

export function IdeaGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      keyword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.topic && !values.keyword) {
      toast({
        title: "Entrada requerida",
        description: "Por favor, proporciona un tema o palabra clave.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setIdeas([]);
    try {
      const result = await suggestContentIdeas(values);
      if (result.ideas && result.ideas.length > 0) {
        setIdeas(result.ideas);
      } else {
        toast({ title: "No se encontraron ideas", description: "Prueba con un tema o palabra clave diferente." });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error al generar ideas",
        description: "Algo salió mal. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <DialogHeader>
        <DialogTitle className="font-headline flex items-center gap-2">
          <Lightbulb className="w-6 h-6" />
          Generador de Ideas de Contenido
        </DialogTitle>
        <DialogDescription>
          Obtén ideas de contenido con IA basadas en un tema o palabra clave.
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
                    <FormLabel>Tema</FormLabel>
                    <FormControl>
                      <Input placeholder="p.ej., Tendencias de marketing digital" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="keyword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Palabra Clave</FormLabel>
                    <FormControl>
                      <Input placeholder="p.ej., SEO" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Generando...' : <><Wand2 className="mr-2 h-4 w-4" /> Generar Ideas</>}
            </Button>
          </form>
        </Form>

        {(isLoading || ideas.length > 0) && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Sugerencias</h3>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 bg-accent/30 rounded-lg animate-pulse h-12" />
                ))}
              </div>
            ) : (
              <ScrollArea className="h-60 rounded-lg border">
                <div className="p-4 space-y-3">
                  {ideas.map((idea, index) => (
                    <div key={index} className="p-3 bg-background rounded-md shadow-sm">
                      <p className="font-medium text-sm">{idea}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
