"use client"

import * as React from "react"
import { Pie, PieChart, Cell } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface DonutChartProps {
  data: {
    category: string;
    value: number;
    fill: string;
  }[];
}

const chartConfig = {
  value: {
    label: "Contenido",
  },
  "📚 Educativo": {
    label: "Educativo",
    color: "hsl(var(--chart-1))",
  },
  "💫 Inspiracional": {
    label: "Inspiracional",
    color: "hsl(var(--chart-2))",
  },
  "📢 Promocional": {
    label: "Promocional",
    color: "hsl(var(--chart-3))",
  },
  "👥 UGC / Testimonios": {
    label: "UGC / Testimonios",
    color: "hsl(var(--chart-4))",
  },
  "🎬 Entretenimiento": {
    label: "Entretenimiento",
    color: "hsl(var(--chart-5))",
  },
  "🤝 Comunidad": {
    label: "Comunidad",
    color: "hsl(var(--primary))",
  },
} satisfies React.ComponentProps<typeof ChartContainer>["config"];

export function DonutChart({ data }: DonutChartProps) {
  const totalValue = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0)
  }, [data])

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[300px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="category"
          innerRadius="60%"
          strokeWidth={5}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
