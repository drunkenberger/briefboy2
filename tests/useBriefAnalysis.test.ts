import { renderHook, act } from '@testing-library/react-hooks';
import { useBriefAnalysis } from '../hooks/useBriefAnalysis';

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('useBriefAnalysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with null analysis', () => {
    const { result } = renderHook(() => useBriefAnalysis(null));

    expect(result.current.analysis).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should start loading when brief is provided', async () => {
    const mockBrief = {
      projectTitle: 'Test Project',
      briefSummary: 'Test summary',
      strategicObjectives: ['Increase sales'],
    };

    const mockAnalysis = {
      overallScore: 85,
      completenessScore: 90,
      qualityScore: 80,
      professionalismScore: 85,
      readinessScore: 75,
      strengths: ['Clear objectives'],
      weaknesses: ['Generic messaging'],
      criticalIssues: ['Timeline too vague'],
      recommendations: ['Define specific metrics'],
      sectionAnalysis: {
        projectTitle: {
          score: 85,
          status: 'good',
          issues: [],
          suggestions: ['Make more specific'],
        },
      },
      isReadyForProduction: true,
      estimatedImprovementTime: '15-20 minutos',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify(mockAnalysis),
          },
        }],
      }),
    } as Response);

    const { result, waitForNextUpdate } = renderHook(() => useBriefAnalysis(mockBrief));

    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.analysis).toEqual(mockAnalysis);
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors', async () => {
    const mockBrief = {
      projectTitle: 'Test Project',
      briefSummary: 'Test summary',
    };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const { result, waitForNextUpdate } = renderHook(() => useBriefAnalysis(mockBrief));

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.analysis).toBeNull();
    expect(result.current.error).toContain('Error HTTP 500');
  });

  it('should handle JSON parsing errors', async () => {
    const mockBrief = {
      projectTitle: 'Test Project',
      briefSummary: 'Test summary',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: 'Invalid JSON response',
          },
        }],
      }),
    } as Response);

    const { result, waitForNextUpdate } = renderHook(() => useBriefAnalysis(mockBrief));

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.analysis).toBeNull();
    expect(result.current.error).toContain('Error al procesar el análisis');
  });

  it('should handle missing API key', async () => {
    const originalEnv = process.env;
    process.env = { ...originalEnv };
    delete process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    

    const mockBrief = {
      projectTitle: 'Test Project',
      briefSummary: 'Test summary',
    };

    const { result, waitForNextUpdate } = renderHook(() => useBriefAnalysis(mockBrief));

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.analysis).toBeNull();
    expect(result.current.error).toContain('No se encontró la API key');

    process.env = originalEnv;
  });

  it('should re-analyze when reAnalyze is called', async () => {
    const mockBrief = {
      projectTitle: 'Test Project',
      briefSummary: 'Test summary',
    };

    const mockAnalysis = {
      overallScore: 85,
      completenessScore: 90,
      qualityScore: 80,
      professionalismScore: 85,
      readinessScore: 75,
      strengths: ['Clear objectives'],
      weaknesses: ['Generic messaging'],
      criticalIssues: [],
      recommendations: ['Define specific metrics'],
      sectionAnalysis: {},
      isReadyForProduction: true,
      estimatedImprovementTime: '15-20 minutos',
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify(mockAnalysis),
          },
        }],
      }),
    } as Response);

    const { result, waitForNextUpdate } = renderHook(() => useBriefAnalysis(mockBrief));

    await waitForNextUpdate();

    expect(result.current.analysis).toEqual(mockAnalysis);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Call reAnalyze
    await act(async () => {
      result.current.reAnalyze();
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

// Test utility functions
describe('useBriefAnalysis utility functions', () => {
  it('should return correct score colors', () => {
    const { getScoreColor } = require('../hooks/useBriefAnalysis');

    expect(getScoreColor(95)).toBe('#10b981'); // Verde excelente
    expect(getScoreColor(85)).toBe('#3b82f6'); // Azul bueno
    expect(getScoreColor(75)).toBe('#f59e0b'); // Amarillo regular
    expect(getScoreColor(65)).toBe('#ef4444'); // Rojo pobre
    expect(getScoreColor(50)).toBe('#6b7280'); // Gris muy pobre
  });

  it('should return correct status text', () => {
    const { getStatusText } = require('../hooks/useBriefAnalysis');

    expect(getStatusText('excellent')).toBe('Excelente');
    expect(getStatusText('good')).toBe('Bueno');
    expect(getStatusText('fair')).toBe('Regular');
    expect(getStatusText('poor')).toBe('Pobre');
    expect(getStatusText('missing')).toBe('Faltante');
    expect(getStatusText('unknown')).toBe('Sin evaluar');
  });

  it('should return correct score emojis', () => {
    const { getScoreEmoji } = require('../hooks/useBriefAnalysis');

    expect(getScoreEmoji(95)).toBe('🌟');
    expect(getScoreEmoji(85)).toBe('✅');
    expect(getScoreEmoji(75)).toBe('⚠️');
    expect(getScoreEmoji(65)).toBe('❌');
    expect(getScoreEmoji(50)).toBe('🚨');
  });
});