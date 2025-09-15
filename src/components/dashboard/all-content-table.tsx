"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, ListChecks, MoreHorizontal, Pencil } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { ContentItem, ContentStatus } from "@/lib/types"
import { contentStatuses } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AllContentTableProps {
  content: ContentItem[];
  onDeleteItem: (id: string, title: string) => void;
  onEditItem: (item: ContentItem) => void;
  onStatusChange: (id: string, status: ContentStatus) => void;
}

const statusColors: Record<ContentStatus, string> = {
  "Por Hacer": "bg-yellow-500",
  "En Proceso": "bg-blue-500",
  "Finalizado": "bg-green-500",
}

export function AllContentTable({ content, onDeleteItem, onEditItem, onStatusChange }: AllContentTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <ListChecks className="w-6 h-6" />
            Vista General de Contenido
        </CardTitle>
        <CardDescription>
          Aquí puedes ver todo tu contenido programado y gestionar su estado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content.length > 0 ? (
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead className="w-[150px]">Fecha</TableHead>
                        <TableHead className="w-[200px]">Categoría</TableHead>
                        <TableHead className="w-[150px]">Estado</TableHead>
                        <TableHead className="text-right w-[120px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {content.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.title}</TableCell>
                            <TableCell>{format(item.date, "d MMM yyyy", { locale: es })}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Badge variant="outline" className="cursor-pointer">
                                            <span className={cn("h-2 w-2 rounded-full mr-2", statusColors[item.status])}></span>
                                            {item.status}
                                        </Badge>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {contentStatuses.map(status => (
                                            <DropdownMenuItem key={status} onSelect={() => onStatusChange(item.id, status)}>
                                                {status}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={() => onEditItem(item)}
                                >
                                    <Pencil className="h-4 w-4"/>
                                    <span className="sr-only">Editar</span>
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={() => onDeleteItem(item.id, item.title)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                    <span className="sr-only">Eliminar</span>
                                </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        ) : (
            <div className="flex items-center justify-center h-40 text-center text-sm text-muted-foreground bg-accent/30 rounded-lg">
                <p>No hay contenido para mostrar. ¡Empieza a programar o importa un archivo!</p>
            </div>
        )}
      </CardContent>
    </Card>
  )
}
