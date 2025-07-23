import { renderHook, act, waitFor } from '@testing-library/react';
import { useBriefAnalysis } from '../hooks/useBriefAnalysis';
import { testOpenAIConnection, createSimpleAnalysis } from '../utils/apiTest';

// Mock the API test utilities
jest.mock('../utils/apiTest', () => ({
  testOpenAIConnection: jest.fn(() => Promise.resolve({ success: true, message: 'Connection successful' })),
  createSimpleAnalysis: jest.fn((brief: any) => ({
    overallScore: 75,
    completenessScore: 80,
    qualityScore: 70,
    professionalismScore: 75,
    readinessScore: 70,
    strengths: ['El brief tiene información básica estructurada'],
    weaknesses: ['Falta especificidad en los objetivos'],
    criticalIssues: [],
    recommendations: ['Definir objetivos más específicos'],
    sectionAnalysis: {},
    isReadyForProduction: false,
    estimatedImprovementTime: '20-30 minutos',
  }))
}));

// Get the mocked functions
const mockTestOpenAIConnection = testOpenAIConnection as jest.MockedFunction<typeof testOpenAIConnection>;
const mockCreateSimpleAnalysis = createSimpleAnalysis as jest.MockedFunction<typeof createSimpleAnalysis>;

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('useBriefAnalysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock implementations to defaults
    mockTestOpenAIConnection.mockResolvedValue({
      success: true,
      message: 'Connection successful'
    });
    
    process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'test-key';
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

    const { result } = renderHook(() => useBriefAnalysis(mockBrief));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.analysis).toBeDefined();
    expect(typeof result.current.analysis?.overallScore).toBe('number');
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors', async () => {
    const mockBrief = {
      projectTitle: 'Test Project',
      briefSummary: 'Test summary',
    };

    // Mock connection test to fail
    mockTestOpenAIConnection.mockResolvedValueOnce({
      success: false,
      message: 'API Error'
    });

    const { result } = renderHook(() => useBriefAnalysis(mockBrief));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.analysis).toBeDefined(); // Should fall back to offline analysis
    expect(result.current.error).toBeNull(); // No error, just fallback
  });

  it('should handle JSON parsing errors', async () => {
    const mockBrief = {
      projectTitle: 'Test Project',
      briefSummary: 'Test summary',
    };

    // Mock successful connection but invalid JSON response
    mockTestOpenAIConnection.mockResolvedValueOnce({
      success: true,
      message: 'Connected'
    });

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

    const { result } = renderHook(() => useBriefAnalysis(mockBrief));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.analysis).toBeDefined(); // Should use fallback analysis
    expect(result.current.error).toBeNull(); // No error, uses fallback
  });

  it('should handle missing API key', async () => {
    const originalEnv = process.env;
    process.env = { ...originalEnv };
    delete process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    

    const mockBrief = {
      projectTitle: 'Test Project',
      briefSummary: 'Test summary',
    };

    const { result } = renderHook(() => useBriefAnalysis(mockBrief));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.analysis).toBeDefined(); // Should use offline analysis
    expect(result.current.error).toBeNull(); // No error, uses offline analysis

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

    const { result } = renderHook(() => useBriefAnalysis(mockBrief));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.analysis).toBeDefined();
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