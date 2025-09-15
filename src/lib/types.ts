export type ContentCategory = '📚 Educativo' | '💫 Inspiracional' | '📢 Promocional' | '👥 UGC / Testimonios' | '🎬 Entretenimiento' | '🤝 Comunidad';

export const contentCategories: readonly ContentCategory[] = ['📚 Educativo', '💫 Inspiracional', '📢 Promocional', '👥 UGC / Testimonios', '🎬 Entretenimiento', '🤝 Comunidad'];

export const categoryColors: Record<ContentCategory, string> = {
  "📚 Educativo": "hsl(var(--chart-1))",
  "💫 Inspiracional": "hsl(var(--chart-2))",
  "📢 Promocional": "hsl(var(--chart-3))",
  "👥 UGC / Testimonios": "hsl(var(--chart-4))",
  "🎬 Entretenimiento": "hsl(var(--chart-5))",
  "🤝 Comunidad": "hsl(var(--primary))",
};

export type ContentStatus = 'Por Hacer' | 'En Proceso' | 'Finalizado';
export const contentStatuses: readonly ContentStatus[] = ['Por Hacer', 'En Proceso', 'Finalizado'];

export const statusColors: Record<ContentStatus, string> = {
  "Por Hacer": "hsl(48, 96%, 58%)", // Yellow
  "En Proceso": "hsl(217, 91%, 60%)", // Blue
  "Finalizado": "hsl(142, 71%, 45%)", // Green
}

export interface ContentItem {
  id: string;
  title: string;
  date: Date;
  category: ContentCategory;
  description: string;
  status: ContentStatus;
}

    