"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { ContentItem } from "@/lib/types"
import { contentCategories } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { MarketingCopyGenerator } from "./marketing-copy-generator"

const formSchema = z.object({
  title: z.string().min(2, { message: "El título debe tener al menos 2 caracteres." }),
  date: z.date({ required_error: "Se requiere una fecha." }),
  category: z.enum(contentCategories, { required_error: "Por favor, selecciona una categoría." }),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>;

interface AddContentDialogProps {
  onAddContent: (content: ContentItem) => void;
  onEditContent: (content: ContentItem) => void;
  initialData?: ContentItem | null;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  children?: React.ReactNode;
}

export function AddContentDialog({
  onAddContent,
  onEditContent,
  initialData,
  isOpen: controlledIsOpen,
  onOpenChange: setControlledIsOpen,
  children,
}: AddContentDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const { toast } = useToast();
  
  const isEditing = !!initialData;
  const isOpen = controlledIsOpen ?? internalIsOpen;
  const setIsOpen = setControlledIsOpen ?? setInternalIsOpen;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditing ? initialData : {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(isEditing ? initialData : {
        title: "",
        description: "",
        date: undefined,
        category: undefined,
      });
    }
  }, [isOpen, isEditing, initialData, form]);

  const descriptionValue = form.watch("description");
  const titleValue = form.watch("title");

  function onSubmit(values: FormValues) {
    if (isEditing && initialData) {
      const updatedContent = {
        ...initialData,
        ...values,
        description: values.description || "",
      };
      onEditContent(updatedContent);
      toast({
        title: "¡Contenido Actualizado!",
        description: `"${values.title}" ha sido actualizado.`,
      });
    } else {
      const newContent = {
        ...values,
        description: values.description || "",
        status: 'Por Hacer' as const,
        id: crypto.randomUUID(),
      };
      onAddContent(newContent);
      toast({
        title: "¡Contenido Programado!",
        description: `"${values.title}" ha sido agregado al calendario.`,
      });
    }
    setIsOpen(false);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{isEditing ? "Editar Contenido" : "Programar Nuevo Contenido"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Modifica los detalles de tu contenido a continuación."
              : "Completa los detalles para agregar nuevo contenido a tu calendario."
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="p.ej., Anuncio de Venta de Verano" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Elige una fecha</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contentCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Descripción / Copy</FormLabel>
                    <MarketingCopyGenerator 
                      contentTitle={titleValue}
                      briefDescription={descriptionValue || ""}
                      onSelectCopy={(copy) => form.setValue('description', copy)}
                    />
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe una breve descripción o el copy final de marketing..."
                      className="resize-none h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{isEditing ? "Guardar Cambios" : "Guardar Contenido"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
