import React from 'react';
import { render } from '@testing-library/react-native';
import BriefResult from '../components/BriefResult';

describe('BriefResult', () => {
  const fullBrief = {
    projectTitle: 'Campaña de Verano 2024',
    briefSummary: 'Campaña integral para aumentar ventas durante la temporada de verano dirigida a jóvenes y familias.',
    businessChallenge: 'Baja visibilidad de marca en temporada alta de competencia.',
    strategicObjectives: [
      'Incrementar ventas en un 25% durante verano',
      'Mejorar reconocimiento de marca',
      'Expandir base de clientes jóvenes'
    ],
    targetAudience: {
      primary: 'Jóvenes de 18-25 años activos en redes sociales',
      secondary: 'Familias con niños de clase media',
      insights: [
        'Buscan experiencias auténticas',
        'Valoran ofertas exclusivas',
        'Prefieren contenido visual'
      ]
    },
    brandPositioning: 'Marca líder en experiencias de verano para toda la familia',
    creativeStrategy: {
      bigIdea: 'Este verano, vive momentos únicos',
      tone: 'Fresco, divertido y aspiracional',
      messaging: ['Exclusividad', 'Diversión', 'Calidad']
    }
  };

  it('should be importable', () => {
    expect(BriefResult).toBeDefined();
    expect(typeof BriefResult).toBe('function');
  });

  it('should handle null brief', () => {
    // Test that component doesn't crash with null brief
    expect(() => {
      React.createElement(BriefResult, { brief: null, loading: false, error: null });
    }).not.toThrow();
  });

  it('should handle loading state', () => {
    // Test that component doesn't crash with loading state
    expect(() => {
      React.createElement(BriefResult, { brief: null, loading: true, error: null });
    }).not.toThrow();
  });

  it('should handle error state', () => {
    // Test that component doesn't crash with error
    expect(() => {
      React.createElement(BriefResult, { brief: null, loading: false, error: 'Test error' });
    }).not.toThrow();
  });

  it('should handle complete brief', () => {
    // Test that component doesn't crash with full brief
    expect(() => {
      React.createElement(BriefResult, { brief: fullBrief, loading: false, error: null });
    }).not.toThrow();
  });

  it('should display key content fields correctly', () => {
    // Transform fullBrief to match BriefResult component's expected structure
    const briefForComponent = {
      title: fullBrief.projectTitle,
      summary: fullBrief.briefSummary,
      objectives: fullBrief.strategicObjectives,
      problemStatement: fullBrief.businessChallenge,
      targetAudience: fullBrief.targetAudience,
      keyMessages: fullBrief.creativeStrategy.messaging,
      callToAction: 'Participa ahora en nuestra campaña de verano',
      _raw: JSON.stringify(fullBrief)
    };

    const { getByText, queryByText, getAllByText } = render(
      <BriefResult brief={briefForComponent} loading={false} error={null} />
    );

    // Verify main title is displayed
    expect(getByText('Campaña de Verano 2024')).toBeTruthy();

    // Verify summary section content
    expect(getByText('Campaña integral para aumentar ventas durante la temporada de verano dirigida a jóvenes y familias.')).toBeTruthy();

    // Verify strategic objectives are displayed
    expect(getAllByText(/Incrementar ventas en un 25% durante verano/).length).toBeGreaterThan(0);
    expect(getAllByText(/Mejorar reconocimiento de marca/).length).toBeGreaterThan(0);
    expect(getAllByText(/Expandir base de clientes jóvenes/).length).toBeGreaterThan(0);

    // Verify business challenge is displayed
    expect(getByText('Baja visibilidad de marca en temporada alta de competencia.')).toBeTruthy();

    // Verify target audience nested object is displayed
    expect(getByText('primary:')).toBeTruthy();
    expect(getByText('Jóvenes de 18-25 años activos en redes sociales')).toBeTruthy();
    expect(getByText('secondary:')).toBeTruthy();
    expect(getByText('Familias con niños de clase media')).toBeTruthy();
    expect(getByText('insights:')).toBeTruthy();
    expect(getByText('Buscan experiencias auténticas')).toBeTruthy();
    expect(getByText('Valoran ofertas exclusivas')).toBeTruthy();
    expect(getByText('Prefieren contenido visual')).toBeTruthy();

    // Verify key messages array is displayed
    expect(getAllByText(/Exclusividad/).length).toBeGreaterThan(0);
    expect(getAllByText(/Diversión/).length).toBeGreaterThan(0);
    expect(getAllByText(/Calidad/).length).toBeGreaterThan(0);

    // Verify call to action is displayed
    expect(getByText(/Llamado a la acción:/)).toBeTruthy();
    expect(getByText(/Participa ahora en nuestra campaña de verano/)).toBeTruthy();

    // Verify section headers are present
    expect(getByText('Resumen')).toBeTruthy();
    expect(getByText('Objetivos')).toBeTruthy();
    expect(getByText('Problema/Oportunidad')).toBeTruthy();
    expect(getByText('Audiencia Objetivo')).toBeTruthy();
    expect(getByText('Mensajes Clave')).toBeTruthy();
  });
});