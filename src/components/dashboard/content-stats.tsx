"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DonutChart } from "./donut-chart"
import type { ContentItem, ContentCategory, ContentStatus } from "@/lib/types"
import { contentCategories, contentStatuses, statusColors, categoryColors } from "@/lib/types"
import { PieChartIcon, BarChart3 } from "lucide-react"

interface ContentStatsProps {
  content: ContentItem[];
}

export function ContentStats({ content }: ContentStatsProps) {
  const categoryCounts = React.useMemo(() => {
    const counts = content.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<ContentCategory, number>);

    contentCategories.forEach(cat => {
      if (!counts[cat]) {
        counts[cat] = 0;
      }
    });
    
    return counts;
  }, [content]);

  const statusCounts = React.useMemo(() => {
    return content.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
    }, {} as Record<ContentStatus, number>);
  }, [content]);

  const totalContent = content.length;

  const categoryChartData = React.useMemo(() => {
    return contentCategories
      .map(category => ({
        category,
        value: categoryCounts[category] || 0,
        fill: categoryColors[category],
      }))
      .filter(item => item.value > 0);
  }, [categoryCounts]);

  const categoryPercentageData = React.useMemo(() => {
    return contentCategories
      .map(category => {
        const count = categoryCounts[category] || 0;
        const percentage = totalContent > 0 ? (count / totalContent) * 100 : 0;
        return {
          category,
          count,
          percentage,
          color: categoryColors[category],
        };
      })
      .filter(item => item.count > 0);
  }, [categoryCounts, totalContent]);

  const statusPercentageData = React.useMemo(() => {
    return contentStatuses.map(status => {
        const count = statusCounts[status] || 0;
        const percentage = totalContent > 0 ? (count / totalContent) * 100 : 0;
        return {
            status,
            count,
            percentage,
            color: statusColors[status],
        };
    });
  }, [statusCounts, totalContent]);


  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Distribución por Categoría</CardTitle>
          <CardDescription>Desglose visual de tus tipos de contenido.</CardDescription>
        </CardHeader>
        <CardContent>
          {totalContent > 0 && categoryChartData.length > 0 ? (
            <DonutChart data={categoryChartData} />
          ) : (
            <div className="flex flex-col items-center justify-center h-[244px] text-center text-muted-foreground bg-accent/30 rounded-lg">
              <PieChartIcon className="w-12 h-12 mb-4 text-muted-foreground/50" />
              <p className="font-semibold">No hay contenido</p>
              <p className="text-sm">Programa contenido para ver stats.</p>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Porcentajes de Categoría</CardTitle>
          <CardDescription>Visualización apilada de cada categoría.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-center min-h-[292px]">
            {totalContent > 0 && categoryPercentageData.length > 0 ? (
                <div>
                    <div className="flex w-full h-3 rounded-full overflow-hidden mb-4">
                        {categoryPercentageData.map(({ category, percentage, color }) => (
                            <div
                            key={category}
                            className="h-full"
                            style={{ width: `${percentage}%`, backgroundColor: color }}
                            title={`${category}: ${percentage.toFixed(0)}%`}
                            />
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        {categoryPercentageData.map(({ category, count, percentage, color }) => (
                            <div key={category} className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                                <div className="flex justify-between w-full">
                                  <span className="font-medium truncate">{category.split(' ')[1]}</span>
                                  <span className="text-muted-foreground">{percentage.toFixed(0)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center text-sm text-muted-foreground">
                    No hay datos para mostrar.
                </div>
            )}
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle className="font-headline">Progreso del Contenido</CardTitle>
          <CardDescription>Resumen del estado de tus contenidos.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-center min-h-[292px]">
            {totalContent > 0 ? (
                <div className="space-y-4">
                    {statusPercentageData.map(({ status, count, percentage, color }) => (
                        <div key={status}>
                            <div className="flex justify-between mb-1 text-sm font-medium">
                                <span>{status}</span>
                                <span>{count} / {totalContent}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                                <div 
                                    className="h-2.5 rounded-full" 
                                    style={{ width: `${percentage}%`, backgroundColor: color }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mb-4 text-muted-foreground/50" />
                    <p className="font-semibold">No hay datos</p>
                    <p className="text-sm">El progreso aparecerá aquí.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

    