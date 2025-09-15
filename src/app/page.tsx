"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileDown, FileUp, Trash, HelpCircle, Lightbulb, Plus, Star, X, Hash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AddContentDialog } from "@/components/dashboard/add-content-dialog";
import { ContentStats } from "@/components/dashboard/content-stats";
import { IdeaGenerator } from "@/components/dashboard/idea-generator";
import { useContent } from "@/hooks/use-content";
import { Logo } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import type { ContentItem, ContentCategory, ContentStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { AllContentTable } from "@/components/dashboard/all-content-table";
import { contentCategories, contentStatuses } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getInitialContent } from "@/lib/initial-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { HashtagGenerator } from "@/components/dashboard/hashtag-generator";

export default function Home() {
  const { 
    content, 
    addContent, 
    deleteContent, 
    setContent, 
    updateContentStatus,
    updateContent,
    isLoaded,
    campaigns,
    addCampaign,
    deleteCampaign,
    activeView,
    setActiveView,
    undo,
  } = useContent(getInitialContent);
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isIdeaGeneratorOpen, setIsIdeaGeneratorOpen] = useState(false);
  const [isHashtagGeneratorOpen, setIsHashtagGeneratorOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const [isDeleteGeneralContentOpen, setIsDeleteGeneralContentOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);


  const handleExport = () => {
    if (content.length === 0) {
      toast({
        title: "No hay contenido para exportar",
        description: "Agrega contenido a tu calendario antes de exportar.",
        variant: "destructive",
      });
      return;
    }
  
    // Main content sheet
    const contentWorksheet = XLSX.utils.json_to_sheet(content.map(item => ({
      'Título': item.title,
      'Fecha': item.date,
      'Categoría': item.category,
      'Descripción': item.description || "",
      'Estado': item.status,
    })));
  
    const totalContent = content.length;
  
    // Category distribution sheet
    const categoryCounts = content.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<ContentCategory, number>);
  
    const distributionData = contentCategories.map(category => ({
      'Categoría': category,
      'Cantidad': categoryCounts[category] || 0,
      'Porcentaje': totalContent > 0 ? `${((categoryCounts[category] || 0) / totalContent * 100).toFixed(2)}%` : '0.00%',
    }));
    const distributionWorksheet = XLSX.utils.json_to_sheet(distributionData);

     // Status progress sheet
    const statusCounts = content.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
    }, {} as Record<ContentStatus, number>);

    const progressData = contentStatuses.map(status => ({
        'Estado': status,
        'Cantidad': statusCounts[status] || 0,
        'Porcentaje': totalContent > 0 ? `${((statusCounts[status] || 0) / totalContent * 100).toFixed(2)}%` : '0.00%',
    }));
    const progressWorksheet = XLSX.utils.json_to_sheet(progressData);
  
    // Create workbook and append sheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, contentWorksheet, "Contenido");
    XLSX.utils.book_append_sheet(workbook, distributionWorksheet, "Distribución por Categoría");
    XLSX.utils.book_append_sheet(workbook, progressWorksheet, "Progreso por Estado");
  
    XLSX.writeFile(workbook, "calendario_de_contenido_con_stats.xlsx");
    toast({ title: "¡Exportación Exitosa!", description: "Tu calendario y estadísticas han sido exportados." });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bstr = event.target?.result;
        if (!bstr) {
          throw new Error("No se pudo leer el archivo.");
        }
        const workbook = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        
        if (!jsonData || jsonData.length < 1) { 
          throw new Error("El archivo de Excel parece estar vacío o no contiene encabezados.");
        }

        const headers: any[] = jsonData[0] || [];
        const normalizedHeaders = headers.map(h => (typeof h === 'string' ? h.toLowerCase().trim().replace(/í/g, 'i') : ''));

        const findIndex = (keys: string[]) => {
          for (const key of keys) {
            const index = normalizedHeaders.indexOf(key);
            if (index !== -1) return index;
          }
          return -1;
        };
        
        const titleIndex = findIndex(['título', 'titulo', 'title']);
        const dateIndex = findIndex(['fecha', 'date']);
        const categoryIndex = findIndex(['categoría', 'categoria', 'category']);
        const descriptionIndex = findIndex(['descripción', 'descripcion', 'description', 'copy']);

        if (titleIndex === -1 || dateIndex === -1 || categoryIndex === -1) {
            throw new Error("El archivo debe contener las columnas 'Título', 'Fecha' y 'Categoría'. Los encabezados pueden estar en español o inglés.");
        }

        const importedContent: ContentItem[] = [];
        const rows = jsonData.length > 1 ? jsonData.slice(1) : [];

        for (const row of rows) {
          if (!row || row.length === 0 || !row[titleIndex] || !row[dateIndex] || !row[categoryIndex]) {
            continue; 
          }
            
            const rawCategory = String(row[categoryIndex]).trim().toLowerCase();
            const foundCategory = contentCategories.find(c => 
              c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(rawCategory)
            );

            if (!foundCategory) {
              console.warn(`Categoría no válida omitida: ${row[categoryIndex]}`);
              continue;
            }

            let date = row[dateIndex];
            let parsedDate;

            if (date instanceof Date && !isNaN(date.getTime())) {
              parsedDate = date;
            } else if (typeof date === 'string') {
              const parts = date.split(/[\/\-]/);
              if (parts.length === 3) {
                  let day, month, year;
                  
                  if (parts[2].length === 4) { // DD/MM/YYYY or MM/DD/YYYY
                    day = parseInt(parts[0], 10);
                    month = parseInt(parts[1], 10);
                    year = parseInt(parts[2], 10);
                  } else if (parts[0].length === 4) { // YYYY/MM/DD
                    year = parseInt(parts[0], 10);
                    month = parseInt(parts[1], 10);
                    day = parseInt(parts[2], 10);
                  } else { // DD/MM/YY
                    day = parseInt(parts[0], 10);
                    month = parseInt(parts[1], 10);
                    year = parseInt(parts[2], 10);
                    if (year < 100) {
                      year += 2000;
                    }
                  }

                  // Check for DD/MM/YYYY by validating the date
                  if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                      const attempt1 = new Date(year, month - 1, day);
                      if (attempt1.getFullYear() === year && attempt1.getMonth() === month - 1 && attempt1.getDate() === day) {
                         parsedDate = attempt1;
                      }
                  }
                  
                  if (!parsedDate && parts[0].length !== 4) {
                      day = parseInt(parts[1], 10);
                      month = parseInt(parts[0], 10);
                      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                          const attempt2 = new Date(year, month - 1, day);
                           if (attempt2.getFullYear() === year && attempt2.getMonth() === month - 1 && attempt2.getDate() === day) {
                              parsedDate = attempt2;
                           }
                      }
                  }
              }
               if (!parsedDate) {
                  const fallbackDate = new Date(date);
                  if (!isNaN(fallbackDate.getTime())) {
                    parsedDate = fallbackDate;
                  }
               }
            } else if (typeof date === 'number') {
              parsedDate = new Date(Date.UTC(0, 0, date - 1));
            }

            if (!parsedDate || isNaN(parsedDate.getTime())) {
              console.warn(`Fecha no válida omitida: ${row[dateIndex]}`);
              continue;
            }

            importedContent.push({
                id: crypto.randomUUID(),
                title: String(row[titleIndex]),
                date: parsedDate,
                category: foundCategory,
                description: descriptionIndex !== -1 ? String(row[descriptionIndex] || "") : "",
                status: 'Por Hacer'
            });
        }
        
        if (rows.length > 0 && importedContent.length === 0) {
           throw new Error("No se pudo leer ningún dato válido del archivo. Revisa el formato y que las filas tengan datos completos.");
        }
  
        setContent(importedContent);
        toast({ 
          title: "¡Importación Exitosa!", 
          description: `${importedContent.length} elementos importados.`
        });
  
      } catch (error: any) {
        console.error("Error al importar el archivo:", error);
        toast({
          title: "Error de Importación",
          description: error.message || "Hubo un problema al leer el archivo. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };
  
  const handleUndo = () => {
    undo();
    toast({
      title: "Acción deshecha",
      description: "El último cambio ha sido revertido.",
    });
  };

  const handleResetContent = () => {
    setContent([]);
    toast({
      title: "Contenido Eliminado",
      description: "Todo el contenido del calendario ha sido eliminado.",
    });
  };

  const handleDeleteItem = (id: string, title: string) => {
    deleteContent(id);
    toast({
      duration: 5000,
      title: "Contenido Eliminado",
      description: `"${title}" ha sido eliminado.`,
      variant: "destructive",
      action: <Button variant="secondary" size="sm" onClick={handleUndo}>Deshacer</Button>
    });
  }

  const handleStatusChange = (id: string, status: ContentStatus) => {
    updateContentStatus(id, status);
     toast({
      title: "Estado Actualizado",
      description: `El estado del contenido ha sido actualizado a "${status}".`
    });
  }
  
  const handleCreateCampaign = () => {
    if (newCampaignName.trim()) {
      addCampaign(newCampaignName.trim());
      setNewCampaignName("");
      toast({
        title: "Campaña Creada",
        description: `La campaña "${newCampaignName.trim()}" ha sido creada.`,
      });
    }
  };
  
  const confirmDeleteCampaign = (campaignName: string) => {
    setCampaignToDelete(campaignName);
  };

  const executeDeleteCampaign = () => {
    if (campaignToDelete) {
      deleteCampaign(campaignToDelete);
      toast({
        duration: 5000,
        title: "Campaña Eliminada",
        description: `La campaña "${campaignToDelete}" ha sido eliminada.`,
        variant: "destructive",
        action: <Button variant="secondary" size="sm" onClick={handleUndo}>Deshacer</Button>
      });
      setCampaignToDelete(null);
    }
  };
  
  const handleDeleteGeneralContent = () => {
    setContent([]);
    toast({
        title: "Contenido General Eliminado",
        description: "Todo el contenido de la vista general ha sido eliminado.",
        variant: "destructive",
        action: <Button variant="secondary" size="sm" onClick={handleUndo}>Deshacer</Button>
    });
    setIsDeleteGeneralContentOpen(false);
  };
  
  const handleEditItem = (item: ContentItem) => {
    setEditingContent(item);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold">Cargando MKTFLOW...</p>
          <p className="text-muted-foreground">Por favor, espera un momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".xlsx, .xls, .csv"
      />
      <AddContentDialog
        isOpen={!!editingContent}
        onOpenChange={(isOpen) => !isOpen && setEditingContent(null)}
        onAddContent={addContent}
        onEditContent={updateContent}
        initialData={editingContent}
      />
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Logo className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold font-headline text-foreground">
              MKTFLOW
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={handleImportClick}>
              <FileUp className="mr-2 h-4 w-4" />
              Importar
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Resetear</span>
                  </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente todo el contenido de tu calendario.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetContent}>Continuar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Separator orientation="vertical" className="h-8 mx-2" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>
                  <Star className="mr-2 h-4 w-4" />
                  Crear Campaña
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Crear Nueva Campaña</AlertDialogTitle>
                  <AlertDialogDescription>
                    Dale un nombre a tu nueva campaña para empezar a organizar contenido específico.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Input 
                    placeholder="p.ej., Lanzamiento Verano 2024"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCreateCampaign}>Crear</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex-grow"></div>
            
            <AddContentDialog onAddContent={addContent} onEditContent={updateContent}>
               <Button variant="default" size="icon" className="h-10 w-10">
                  <Plus className="h-6 w-6" strokeWidth={2.5} />
                  <span className="sr-only">Programar Contenido</span>
                </Button>
            </AddContentDialog>
            
            <Separator orientation="vertical" className="h-8 mx-2" />

            <Dialog>
              <DialogTrigger asChild>
                 <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <HelpCircle className="h-5 w-5" />
                  <span className="sr-only">Ayuda de importación</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Ayuda para Importar</DialogTitle>
                  <DialogDescription>
                    Asegúrate de que tu archivo Excel (.xlsx) se parezca a este ejemplo.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="mt-4 text-sm border rounded-lg p-4 bg-accent/20">
                  <div className="grid grid-cols-3 gap-4 font-semibold border-b pb-2 mb-2">
                    <div>Título</div>
                    <div>Fecha</div>
                    <div>Categoría</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-muted-foreground">
                    <div className="truncate pr-1">Inspiración Machu Picchu</div>
                    <div>01/09/2024</div>
                    <div>Inspiracional</div>
                  </div>
                   <div className="grid grid-cols-3 gap-4 text-muted-foreground mt-2">
                    <div className="truncate pr-1">5 Tips para Cusco</div>
                    <div>02/09/2024</div>
                    <div>Promocional</div>
                  </div>
                   <div className="grid grid-cols-3 gap-4 text-muted-foreground mt-2">
                    <div className="truncate pr-1">Amanecer en Machu Picchu</div>
                    <div>03/09/2024</div>
                    <div>Entretenimiento</div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  <span className="font-bold">Nota:</span> Las columnas 'Título', 'Fecha' y 'Categoría' son obligatorias. La columna 'Descripción' es opcional. El orden y el uso de mayúsculas/minúsculas en los encabezados no importan.
                </p>
              </DialogContent>
            </Dialog>

            <Dialog open={isHashtagGeneratorOpen} onOpenChange={setIsHashtagGeneratorOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <Hash className="h-5 w-5" />
                   <span className="sr-only">Generador de Hashtags</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                 <HashtagGenerator />
              </DialogContent>
            </Dialog>
            
            <Dialog open={isIdeaGeneratorOpen} onOpenChange={setIsIdeaGeneratorOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <Lightbulb className="h-5 w-5" />
                   <span className="sr-only">Generar Ideas</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                 <IdeaGenerator />
              </DialogContent>
            </Dialog>

          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px.6 lg:px-8 py-6 space-y-8">
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList>
            <div className="relative group">
              <TabsTrigger value="general" className={activeView === 'general' && content.length > 0 ? "pr-8" : ""}>Contenido General</TabsTrigger>
              {activeView === 'general' && content.length > 0 && (
                <AlertDialog open={isDeleteGeneralContentOpen} onOpenChange={setIsDeleteGeneralContentOpen}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-1/2 right-1 -translate-y-1/2 h-5 w-5 opacity-50 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDeleteGeneralContentOpen(true);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                   <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar Contenido General?</AlertDialogTitle>
                    <AlertDialogDescription>
                        ¿Estás seguro de que quieres eliminar todo el contenido de la vista general? Esta acción es permanente.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteGeneralContent}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            {campaigns.map(campaign => (
               <div key={campaign} className="relative group">
                <TabsTrigger value={campaign} className="pr-8">{campaign}</TabsTrigger>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-1/2 right-1 -translate-y-1/2 h-5 w-5 opacity-50 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDeleteCampaign(campaign);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                </AlertDialog>
              </div>
            ))}
          </TabsList>
          
           <AlertDialog open={!!campaignToDelete} onOpenChange={() => setCampaignToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar Campaña?</AlertDialogTitle>
                <AlertDialogDescription>
                    ¿Estás seguro de que quieres eliminar la campaña "{campaignToDelete}"? Esta acción es permanente y eliminará todo el contenido asociado.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={executeDeleteCampaign}>Eliminar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
            </AlertDialog>

          <TabsContent value={activeView} className="mt-6">
            <AllContentTable 
              content={content} 
              onDeleteItem={handleDeleteItem}
              onEditItem={handleEditItem}
              onStatusChange={handleStatusChange}
            />
            
            <Separator className="my-8"/>
            
            <ContentStats content={content} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="container mx-auto px-4 sm:px.6 lg:px-8 py-6 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} MKTFLOW. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
