import { renderHook } from '@testing-library/react';
import { useBriefGeneration } from '../hooks/useBriefGeneration';

const mockTranscript = 'This is a marketing meeting transcript about a new product launch.';
const mockBrief = {
  title: 'Product Launch Campaign',
  summary: 'A comprehensive campaign to launch the new product...',
  objectives: ['Increase awareness', 'Drive sales'],
  problemStatement: 'Consumers are unaware of the new product',
  targetAudience: ['Millennials', 'Gen Z'],
  successMetrics: ['Reach 1M impressions', '10K conversions'],
  requirements: {
    functional: ['Requirement 1'],
    nonFunctional: ['Requirement 2'],
    technical: ['Requirement 3'],
    security: ['Requirement 4'],
  },
  keyMessages: ['Try our new product!'],
  timeline: 'Q3 2024',
  channelsAndTactics: {
    overview: 'Multi-channel approach',
    components: ['Social Media', 'Email'],
    technologies: ['Meta Ads'],
    integrations: ['CRM'],
  },
  riskAnalysis: {
    risks: ['Low engagement'],
    mitigations: ['Increase ad spend'],
  },
  dependencies: ['Partner agency'],
  assumptions: ['Budget approved'],
  outOfScope: ['International markets'],
  campaignPhases: [
    { phase: 'Awareness', deliverables: ['Video Ad'], duration: '2 weeks' },
  ],
};

global.fetch = jest.fn();

// Utilidad simple para esperar un cambio de estado en el hook
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

describe('useBriefGeneration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'test-key';
  });

  it('no hace nada si transcript es null', () => {
    const { result } = renderHook(() => useBriefGeneration(null));
    expect(result.current.brief).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('genera brief correctamente cuando la API responde bien', async () => {
    (fetch as any).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choices: [
            { message: { content: JSON.stringify(mockBrief) } },
          ],
        }),
      })
    );
    const { result } = renderHook(() => useBriefGeneration(mockTranscript));
    expect(result.current.loading).toBe(true);
    await waitForCondition(() => !!result.current.brief);
    expect(result.current.brief).toEqual(mockBrief);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('maneja error de red', async () => {
    (fetch as any).mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );
    const { result } = renderHook(() => useBriefGeneration(mockTranscript));
    expect(result.current.loading).toBe(true);
    await waitForCondition(() => typeof result.current.error === 'string' && /Network error/.test(result.current.error));
    expect(result.current.brief).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('maneja error de API key faltante', () => {
    process.env.EXPO_PUBLIC_OPENAI_API_KEY = '';
    const { result } = renderHook(() => useBriefGeneration(mockTranscript));
    expect(result.current.loading).toBe(false);
    expect(result.current.brief).toBeNull();
    expect(result.current.error).toBe('No se encontró la API key de OpenAI');
  });

  it('maneja respuesta no JSON de OpenAI', async () => {
    (fetch as any).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choices: [
            { message: { content: 'not a json' } },
          ],
        }),
      })
    );
    const { result } = renderHook(() => useBriefGeneration(mockTranscript));
    expect(result.current.loading).toBe(true);
    await waitForCondition(() => typeof result.current.error === 'string' && /no es un JSON válido/i.test(result.current.error));
    expect(result.current.brief).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});