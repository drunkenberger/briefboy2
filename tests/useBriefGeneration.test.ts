import { renderHook, waitFor } from '@testing-library/react';
import { useBriefGeneration } from '../hooks/useBriefGeneration';

const mockTranscript = 'Esta es una transcripción de reunión de marketing sobre un nuevo lanzamiento de producto. Queremos dirigirnos a millennials y Gen Z con una campaña integral que incluya redes sociales y email marketing.';

const mockBrief = {
  projectTitle: 'Campaña de Lanzamiento de Producto',
  briefSummary: 'Una campaña integral para lanzar el nuevo producto dirigida a millennials y Gen Z.',
  businessChallenge: 'Los consumidores no conocen nuestro nuevo producto',
  strategicObjectives: [
    'Incrementar awareness en un 50%',
    'Generar 10K conversiones',
    'Posicionar la marca en mercado millennial'
  ],
  targetAudience: {
    primary: 'Millennials de 25-35 años con interés en tecnología',
    secondary: 'Gen Z de 18-24 años activos en redes sociales',
    insights: [
      'Valoran la autenticidad de la marca',
      'Prefieren contenido visual e interactivo',
      'Buscan productos que reflejen sus valores'
    ]
  },
  brandPositioning: 'Marca innovadora que conecta con las nuevas generaciones',
  creativeStrategy: {
    bigIdea: 'Tu estilo, tu tecnología, tu momento',
    tone: 'Auténtico, dinámico y aspiracional',
    messaging: ['Innovación', 'Autenticidad', 'Conexión']
  }
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
    // Restore API keys for each test
    process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'test-key';
    process.env.EXPO_PUBLIC_CLAUDE_API_KEY = 'test-claude-key';
    process.env.EXPO_PUBLIC_GEMINI_API_KEY = 'test-gemini-key';
  });

  it('no hace nada si transcript es null o enabled es false', () => {
    const { result } = renderHook(() => useBriefGeneration(null, false));
    expect(result.current.brief).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('no inicia si enabled es false', () => {
    const { result } = renderHook(() => useBriefGeneration(mockTranscript, false));
    expect(result.current.brief).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('genera brief correctamente cuando la API responde bien', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choices: [
            { message: { content: JSON.stringify(mockBrief) } },
          ],
        }),
      })
    );

    const { result } = renderHook(() => useBriefGeneration(mockTranscript, true));
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.brief).toEqual(mockBrief);
    expect(result.current.error).toBeNull();
  });

  it('maneja error de red mostrando error', async () => {
    // Mock fetch para que todas las llamadas fallen
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.reject(new Error('Network error'))
    );

    const { result } = renderHook(() => useBriefGeneration(mockTranscript, true));
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // When all providers fail, should have an error
    expect(result.current.error).toContain('modelos de IA fallaron');
  });

  it('maneja error de API key faltante', async () => {
    // Limpiar todas las API keys
    process.env.EXPO_PUBLIC_OPENAI_API_KEY = '';
    process.env.EXPO_PUBLIC_CLAUDE_API_KEY = '';
    process.env.EXPO_PUBLIC_GEMINI_API_KEY = '';
    
    const { result } = renderHook(() => useBriefGeneration(mockTranscript, true));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.brief).toBeNull();
    expect(result.current.error).toContain('No se encontró ninguna API key configurada');
  });

  it('maneja respuesta no JSON de OpenAI creando brief de fallback', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choices: [
            { message: { content: 'not a json' } },
          ],
        }),
      })
    );

    const { result } = renderHook(() => useBriefGeneration(mockTranscript, true));
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // El hook actual crea un brief de fallback con información de error, no retorna null
    expect(result.current.brief).not.toBeNull();
    expect(result.current.brief.title || result.current.brief.projectTitle).toContain('Error');
  });
});