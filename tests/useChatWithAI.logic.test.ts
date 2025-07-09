import { useChatWithAI } from '../hooks/useChatWithAI';

global.fetch = jest.fn();

describe('useChatWithAI (lógica pura)', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';
  });

  it('flujo exitoso: mejora el brief y lo marca como completo', async () => {
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
    // Instancia el hook manualmente
    const hook = useChatWithAI(mockBrief);
    hook.setUserInput('Respondo a la IA');
    await hook.sendMessage();
    expect(hook.improvedBrief.title).toBe('Título Mejorado');
    expect(hook.messages[hook.messages.length - 1].content).toMatch(/listo/i);
  });

  it('repregunta si hay campos pobres o vacíos', async () => {
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
    const hook = useChatWithAI(mockBrief);
    hook.setUserInput('Faltan requerimientos');
    await hook.sendMessage();
    expect(hook.improvedBrief).toBeNull();
    expect(hook.messages[hook.messages.length - 1].content).toMatch(/campos siguen vacíos/i);
  });

  it('maneja error de red o API', async () => {
    (fetch as any).mockImplementationOnce(() => Promise.reject(new Error('Network error')));
    const hook = useChatWithAI(mockBrief);
    hook.setUserInput('Prueba error');
    await hook.sendMessage();
    expect(hook.messages[hook.messages.length - 1].content).toMatch(/error/i);
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
    const hook = useChatWithAI(mockBrief);
    hook.setUserInput('Dame sugerencias');
    await hook.sendMessage();
    expect(hook.improvedBrief).toBeNull();
    expect(hook.iaSuggestions).toMatch(/sugerencia/i);
  });
});