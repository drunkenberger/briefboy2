// Master Classes Interface and Data
// This file contains all master class definitions for the Learn section

export interface MasterClass {
  title: string;
  speaker: string;
  description: string;
  duration: string;
  level: string;
}

export const masterClasses: MasterClass[] = [
  {
    title: 'THE BRIEF WHISPERER',
    speaker: 'DAVID DROGA MINDSET',
    description: 'Cómo leer entre líneas de un brief y encontrar la campaña oculta',
    duration: '45 MIN',
    level: 'MASTERCLASS'
  },
  {
    title: 'BEHAVIORAL TRIGGERS',
    speaker: 'NEUROMARKETING LAB',
    description: 'Los 12 triggers psicológicos que hackean decisiones de compra',
    duration: '60 MIN',
    level: 'MASTERCLASS'
  },
  {
    title: 'ANTI-ADVERTISING',
    speaker: 'DISRUPTION ACADEMY',
    description: 'Cómo crear campañas que la gente quiere ver (no evitar)',
    duration: '50 MIN',
    level: 'MASTERCLASS'
  }
];