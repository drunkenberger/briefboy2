import { act, renderHook } from '@testing-library/react';
import { useChatWithAI } from '../hooks/useChatWithAI';

const mockBrief = {
  title: 'Campaña de Prueba',
  summary: 'Resumen inicial',
  brandPositioning: 'Posicionamiento inicial',
  objectives: ['Objetivo 1'],
  problemStatement: 'Problema inicial',
  targetAudience: ['Audiencia 1'],
  successMetrics: ['Métrica 1'],
  requirements: {
    functional: ['Funcionalidad 1'],
    nonFunctional: ['No funcional 1'],
    technical: ['Técnico 1'],
    security: ['Seguridad 1']
  },
  keyMessages: ['Mensaje 1'],
  timeline: 'Cronograma',
  channelsAndTactics: {
    overview: 'Overview',
    components: ['Componente 1'],
    technologies: ['Tech 1'],
    integrations: ['Integración 1']
  },
  riskAnalysis: {
    risks: ['Riesgo 1'],
    mitigations: ['Mitigación 1']
  },
  dependencies: ['Dependencia 1'],
  assumptions: ['Supuesto 1'],
  outOfScope: ['Fuera de alcance 1'],
  campaignPhases: [
    { phase: 'Fase 1', deliverables: ['Entregable 1'], duration: '1 semana' }
  ]
};

global.fetch = jest.fn();

async function waitForCondition(condition: () => boolean, timeout = 2000, interval = 20) {
  const start = Date.now();
  return new Promise<void>((resolve, reject) => {
    function check() {
      if (condition()) return resolve();
      if (Date.now() - start > timeout) return reject(new Error('Timeout waiting for condition'));
      setTimeout(check, interval);
    }
    check();
  });
}

describe('useChatWithAI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';
  });

  it('inicializa el chat con mensaje de bienvenida', () => {
    const { result } = renderHook(() => useChatWithAI(mockBrief));
    expect(result.current.messages[0].role).toBe('assistant');
    expect(result.current.messages[0].content).toMatch(/analizado tu brief/i);
    expect(result.current.improvedBrief).toBeNull();
    expect(result.current.iaSuggestions).toBeNull();
  });

  it('flujo exitoso: mejora el brief y lo marca como completo', async () => {
    // Mock análisis y mejora válidos
    (fetch as any)
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve({
          choices: [{ message: { content: JSON.stringify({
            completenessScore: 100,
            missingElements: [],
            improvementSuggestions: [],
            criticalGaps: [],
            recommendedNextSteps: []
          }) } }]
        })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve({
          choices: [{ message: { content: JSON.stringify({ ...mockBrief, title: 'Título Mejorado' }) } }]
        })
      }));
    const { result } = renderHook(() => useChatWithAI(mockBrief));
    await act(async () => {
      result.current.setUserInput('Respondo a la IA');
      await result.current.sendMessage();
    });
    expect(result.current.improvedBrief.title).toBe('Título Mejorado');
    expect(result.current.messages[result.current.messages.length - 1].content).toMatch(/listo/i);
  });

  it('repregunta si hay campos pobres o vacíos', async () => {
    // Mock análisis y mejora con campo pobre
    (fetch as any)
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve({
          choices: [{ message: { content: JSON.stringify({
            completenessScore: 60,
            missingElements: ['requirements'],
            improvementSuggestions: ['Agregar requerimientos'],
            criticalGaps: ['Faltan requerimientos'],
            recommendedNextSteps: ['Completar requerimientos']
          }) } }]
        })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve({
          choices: [{ message: { content: JSON.stringify({ ...mockBrief, requirements: { functional: [], nonFunctional: [], technical: [], security: [] } }) } }]
        })
      }));
    const { result } = renderHook(() => useChatWithAI(mockBrief));
    await act(async () => {
      result.current.setUserInput('Faltan requerimientos');
      await result.current.sendMessage();
    });
    expect(result.current.improvedBrief).toBeNull();
    expect(result.current.messages[result.current.messages.length - 1].content).toMatch(/campos siguen vacíos/i);
    expect(result.current.iaSuggestions).toBeNull();
  });

  it('maneja error de red o API', async () => {
    (fetch as any).mockImplementationOnce(() => Promise.reject(new Error('Network error')));
    const { result } = renderHook(() => useChatWithAI(mockBrief));
    await act(async () => {
      result.current.setUserInput('Prueba error');
      await result.current.sendMessage();
    });
    expect(result.current.messages[result.current.messages.length - 1].content).toMatch(/error/i);
  });

  it('muestra sugerencias adicionales si la IA responde fuera de JSON', async () => {
    (fetch as any)
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve({
          choices: [{ message: { content: JSON.stringify({
            completenessScore: 100,
            missingElements: [],
            improvementSuggestions: [],
            criticalGaps: [],
            recommendedNextSteps: []
          }) } }]
        })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve({
          choices: [{ message: { content: 'SUGERENCIA: Agrega más detalles a los objetivos.' } }]
        })
      }));
    const { result } = renderHook(() => useChatWithAI(mockBrief));
    await act(async () => {
      result.current.setUserInput('Dame sugerencias');
      await result.current.sendMessage();
    });
    expect(result.current.improvedBrief).toBeNull();
    expect(result.current.iaSuggestions).toMatch(/sugerencia/i);
  });
});