import type { ContentItem } from './types';

export const getInitialContent = (): ContentItem[] => {
  return [
    {
      id: '1',
      title: 'Lanzamiento Nueva Colección Otoño',
      date: new Date(new Date().getFullYear(), 8, 15),
      category: '📢 Promocional',
      description: '¡Prepárate! La nueva colección de otoño llega con estilos increíbles y colores de temporada.',
      status: 'Por Hacer',
    },
    {
      id: '2',
      title: '5 Tips para Mejorar tu SEO',
      date: new Date(new Date().getFullYear(), 8, 20),
      category: '📚 Educativo',
      description: 'Descubre 5 estrategias sencillas para optimizar tu sitio web y atraer más tráfico orgánico.',
      status: 'En Proceso',
    },
    {
      id: '3',
      title: 'Frase Inspiradora de la Semana',
      date: new Date(new Date().getFullYear(), 8, 23),
      category: '💫 Inspiracional',
      description: '"El único modo de hacer un gran trabajo es amar lo que haces." - Steve Jobs',
      status: 'Finalizado',
    },
    {
      id: '4',
      title: 'Live Q&A con nuestro CEO',
      date: new Date(new Date().getFullYear(), 9, 2),
      category: '🤝 Comunidad',
      description: 'Únete a nuestra sesión en vivo y pregunta todo lo que quieras saber sobre el futuro de la marca.',
      status: 'Por Hacer',
    },
     {
      id: '5',
      title: 'Detrás de Cámaras: Sesión de Fotos',
      date: new Date(new Date().getFullYear(), 9, 10),
      category: '🎬 Entretenimiento',
      description: 'Un vistazo exclusivo a cómo creamos la magia para nuestra próxima campaña publicitaria.',
      status: 'Por Hacer',
    },
    {
      id: '6',
      title: 'Testimonio de Cliente: Ana G.',
      date: new Date(new Date().getFullYear(), 9, 18),
      category: '👥 UGC / Testimonios',
      description: '"¡Estoy enamorada de mi nuevo producto! La calidad superó mis expectativas." - Ana G. comparte su experiencia.',
      status: 'Finalizado',
    },
  ];
};
