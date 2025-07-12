// Quick Resources Interface and Data
// This file contains all quick resource definitions for the Learn section

export interface QuickResource {
  title: string;
  description: string;
  type: string;
  time: string;
}

export const quickResources: QuickResource[] = [
  {
    title: 'BRIEF AUDIT CHECKLIST',
    description: 'Lista de verificación de 47 puntos para detectar briefs tóxicos',
    type: 'CHECKLIST',
    time: '10 MIN'
  },
  {
    title: 'INSIGHT EXTRACTION FRAMEWORK',
    description: 'Metodología para extraer insights desde data social hasta neurociencia',
    type: 'FRAMEWORK',
    time: '20 MIN'
  },
  {
    title: 'CREATIVE BRIEF TEMPLATES',
    description: 'Templates probados por agencias top que no quieren que uses',
    type: 'TEMPLATES',
    time: '5 MIN'
  },
  {
    title: 'CAMPAIGN AUTOPSY GUIDE',
    description: 'Cómo hacer la autopsia de campañas fallidas para aprender',
    type: 'GUIDE',
    time: '15 MIN'
  }
];