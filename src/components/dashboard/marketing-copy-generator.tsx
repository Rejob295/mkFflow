"use client";

import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { generateMarketingCopy } from '@/ai/flows/generate-marketing-copy';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

interface MarketingCopyGeneratorProps {
  contentTitle: string;
  briefDescription: string;
  onSelectCopy: (copy: string) => void;
}

export function MarketingCopyGenerator({ contentTitle, briefDescription, onSelectCopy }: MarketingCopyGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!contentTitle) {
      toast({
        title: "Falta el título",
        description: "Por favor, proporciona un título para generar el copy de marketing.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSuggestions([]);
    try {
      const result = await generateMarketingCopy({
        contentTitle,
        briefDescription,
      });
      setSuggestions(result.marketingCopySuggestions);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error al generar el copy",
        description: "Algo salió mal. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (copy: string) => {
    onSelectCopy(copy);
    setIsOpen(false);
  };

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
        <Wand2 className="mr-2 h-4 w-4" />
        Generar con IA
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Generar Copy de Marketing</DialogTitle>
            <DialogDescription>
              Genera un copy de marketing atractivo para tu contenido basado en su título y descripción.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="p-4 bg-accent/30 rounded-lg border border-dashed">
              <h3 className="text-sm font-semibold">Vista Previa del Contenido</h3>
              <p className="text-sm font-bold mt-1">{contentTitle || "No se proporcionó título"}</p>
              <p className="text-sm text-muted-foreground mt-1">{briefDescription || "No se proporcionó descripción"}</p>
            </div>
            
            <Button onClick={handleGenerate} disabled={isLoading || !contentTitle}>
              {isLoading ? 'Generando...' : <><Wand2 className="mr-2 h-4 w-4" /> Generar sugerencias</>}
            </Button>

            {suggestions.length > 0 && (
              <ScrollArea className="h-64 border rounded-lg p-2">
                <div className="space-y-4 p-2">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 bg-background rounded-md shadow-sm">
                      <p className="text-sm">{suggestion}</p>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto mt-2"
                        onClick={() => handleSelect(suggestion)}
                      >
                        Usar esta sugerencia
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            {isLoading && (
              <div className="flex items-center justify-center h-64 border rounded-lg">
                <p className="text-muted-foreground">Generando ideas...</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
