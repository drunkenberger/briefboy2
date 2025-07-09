import { render, screen } from '@testing-library/react-native';
import React from 'react';
import BriefResult from '../components/BriefResult';

describe('BriefResult', () => {
  const fullBrief = {
    title: 'Campaña de Verano',
    summary: 'Campaña para aumentar ventas en verano.',
    objectives: ['Incrementar ventas', 'Mejorar awareness'],
    problemStatement: 'Baja visibilidad en temporada alta.',
    targetAudience: ['Jóvenes 18-25', 'Familias'],
    successMetrics: ['+20% ventas', '+30% visitas web'],
    requirements: {
      functional: ['Landing page', 'Formulario de registro'],
      nonFunctional: ['Carga rápida', 'Accesibilidad'],
      technical: ['Integración con CRM'],
      security: ['Protección de datos']
    },
    keyMessages: ['¡No te lo pierdas!', 'Oferta limitada'],
    timeline: 'Junio - Agosto',
    channelsAndTactics: {
      overview: 'Multicanal digital',
      components: ['Redes sociales', 'Email marketing'],
      technologies: ['React', 'Node.js'],
      integrations: ['Google Analytics']
    },
    riskAnalysis: {
      risks: ['Bajo engagement', 'Problemas técnicos'],
      mitigations: ['A/B testing', 'Soporte técnico']
    },
    dependencies: ['Equipo de diseño', 'Proveedor de hosting'],
    assumptions: ['Presupuesto aprobado'],
    outOfScope: ['Publicidad impresa'],
    campaignPhases: [
      { phase: 'Lanzamiento', duration: '2 semanas', deliverables: ['Landing', 'Anuncios'] },
      { phase: 'Optimización', duration: '1 mes', deliverables: ['Ajustes creativos'] }
    ]
  };

  it('muestra el indicador de carga', () => {
    render(<BriefResult brief={null} loading={true} error={null} />);
    expect(screen.getByText(/generando brief/i)).toBeTruthy();
  });

  it('muestra el mensaje de error', () => {
    render(<BriefResult brief={null} loading={false} error="Error de red" />);
    expect(screen.getByText(/error de red/i)).toBeTruthy();
  });

  it('muestra el mensaje de no hay brief', () => {
    render(<BriefResult brief={null} loading={false} error={null} />);
    expect(screen.getByText(/no hay brief generado/i)).toBeTruthy();
  });

  it('muestra todas las secciones del brief completo', () => {
    render(<BriefResult brief={fullBrief} loading={false} error={null} />);
    expect(screen.getByText(fullBrief.title)).toBeTruthy();
    expect(screen.getByText(/resumen/i)).toBeTruthy();
    expect(screen.getByText(fullBrief.summary)).toBeTruthy();
    expect(screen.getByText(/objetivos/i)).toBeTruthy();
    expect(screen.getByText('• Incrementar ventas')).toBeTruthy();
    expect(screen.getByText('• Mejorar awareness')).toBeTruthy();
    expect(screen.getByText(/problema/i)).toBeTruthy();
    expect(screen.getByText(fullBrief.problemStatement)).toBeTruthy();
    expect(screen.getByText(/audiencia objetivo/i)).toBeTruthy();
    expect(screen.getByText('• Jóvenes 18-25')).toBeTruthy();
    expect(screen.getByText('• Familias')).toBeTruthy();
    expect(screen.getByText(/métricas de éxito/i)).toBeTruthy();
    expect(screen.getByText('• +20% ventas')).toBeTruthy();
    expect(screen.getByText('• +30% visitas web')).toBeTruthy();
    expect(screen.getByText(/requerimientos/i)).toBeTruthy();
    expect(screen.getByText(/funcionales/i)).toBeTruthy();
    expect(screen.getByText('- Landing page')).toBeTruthy();
    expect(screen.getByText('- Formulario de registro')).toBeTruthy();
    expect(screen.getByText(/no funcionales/i)).toBeTruthy();
    expect(screen.getByText('- Carga rápida')).toBeTruthy();
    expect(screen.getByText('- Accesibilidad')).toBeTruthy();
    expect(screen.getByText(/técnicos/i)).toBeTruthy();
    expect(screen.getByText('- Integración con CRM')).toBeTruthy();
    expect(screen.getByText(/seguridad/i)).toBeTruthy();
    expect(screen.getByText('- Protección de datos')).toBeTruthy();
    expect(screen.getByText(/mensajes clave/i)).toBeTruthy();
    expect(screen.getByText('• ¡No te lo pierdas!')).toBeTruthy();
    expect(screen.getByText('• Oferta limitada')).toBeTruthy();
    expect(screen.getByText(/cronograma/i)).toBeTruthy();
    expect(screen.getByText(fullBrief.timeline)).toBeTruthy();
    expect(screen.getByText(/canales y tácticas/i)).toBeTruthy();
    expect(screen.getByText(fullBrief.channelsAndTactics.overview)).toBeTruthy();
    expect(screen.getByText('• Redes sociales')).toBeTruthy();
    expect(screen.getByText('• Email marketing')).toBeTruthy();
    expect(screen.getByText(/tecnologías/i)).toBeTruthy();
    expect(screen.getByText('• React')).toBeTruthy();
    expect(screen.getByText('• Node.js')).toBeTruthy();
    expect(screen.getByText(/integraciones/i)).toBeTruthy();
    expect(screen.getByText('• Google Analytics')).toBeTruthy();
    expect(screen.getByText(/análisis de riesgos/i)).toBeTruthy();
    expect(screen.getByText('• Bajo engagement')).toBeTruthy();
    expect(screen.getByText('• Problemas técnicos')).toBeTruthy();
    expect(screen.getByText(/mitigaciones/i)).toBeTruthy();
    expect(screen.getByText('• A/B testing')).toBeTruthy();
    expect(screen.getByText('• Soporte técnico')).toBeTruthy();
    expect(screen.getByText(/dependencias/i)).toBeTruthy();
    expect(screen.getByText('• Equipo de diseño')).toBeTruthy();
    expect(screen.getByText('• Proveedor de hosting')).toBeTruthy();
    expect(screen.getByText(/supuestos/i)).toBeTruthy();
    expect(screen.getByText('• Presupuesto aprobado')).toBeTruthy();
    expect(screen.getByText(/fuera de alcance/i)).toBeTruthy();
    expect(screen.getByText('• Publicidad impresa')).toBeTruthy();
    expect(screen.getByText(/fases de la campaña/i)).toBeTruthy();
    expect(screen.getByText('Lanzamiento')).toBeTruthy();
    expect(screen.getByText('Duración: 2 semanas')).toBeTruthy();
    expect(screen.getByText('- Landing')).toBeTruthy();
    expect(screen.getByText('- Anuncios')).toBeTruthy();
    expect(screen.getByText('Optimización')).toBeTruthy();
    expect(screen.getByText('Duración: 1 mes')).toBeTruthy();
    expect(screen.getByText('- Ajustes creativos')).toBeTruthy();
  });

  it('tolera brief incompleto (edge case)', () => {
    const partialBrief = { title: 'Solo título' };
    render(<BriefResult brief={partialBrief} loading={false} error={null} />);
    expect(screen.getByText('Solo título')).toBeTruthy();
    expect(screen.getByText(/resumen/i)).toBeTruthy();
  });
});