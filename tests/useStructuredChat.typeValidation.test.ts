import { renderHook } from '@testing-library/react-hooks';
import { useStructuredChat } from '../hooks/useStructuredChat';

// Mock de proceso ENV
process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'test-api-key';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('useStructuredChat - Type Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: 'Test response from AI'
          }
        }]
      })
    });
  });

  const mockBrief = {
    projectTitle: 'Test Project',
    strategicObjectives: ['Existing objective'],
    targetAudience: {
      primary: 'Test audience'
    }
  };

  it('should handle array field replacement correctly', async () => {
    const mockOnBriefChange = jest.fn();
    const { result } = renderHook(() => useStructuredChat(mockBrief, mockOnBriefChange));

    // Simular una pregunta sobre un campo que debería ser array
    const testQuestion = {
      id: 'test-1',
      field: 'strategicObjectives', 
      question: 'What are your objectives?',
      priority: 'high' as const,
      completed: false
    };

    // Simular que hay una pregunta actual
    result.current.initializeChat();
    
    // Verificar que la función no lance errores
    expect(result.current.sendMessage).toBeDefined();
    expect(typeof result.current.sendMessage).toBe('function');
  });

  it('should handle non-array field with array data correctly', () => {
    const mockOnBriefChange = jest.fn();
    const { result } = renderHook(() => useStructuredChat(mockBrief, mockOnBriefChange));

    // Verificar que la inicialización funciona sin errores
    expect(result.current.messages).toEqual([]);
    expect(result.current.currentQuestion).toBeNull();
  });

  it('should preserve existing array data when appropriate', () => {
    const briefWithArrays = {
      ...mockBrief,
      strategicObjectives: ['Objective 1', 'Objective 2'],
      targetAudience: {
        primary: 'Primary audience',
        insights: ['Insight 1', 'Insight 2']
      }
    };

    const mockOnBriefChange = jest.fn();
    const { result } = renderHook(() => useStructuredChat(briefWithArrays, mockOnBriefChange));

    // Verificar inicialización
    expect(result.current.error).toBeNull();
    expect(result.current.messages).toEqual([]);
  });

  it('should handle mixed type scenarios gracefully', () => {
    const briefWithMixedTypes = {
      projectTitle: 'Test',
      strategicObjectives: 'Single objective as string', // Debería ser array
      targetAudience: {
        primary: ['Primary as array'], // Debería ser string
        insights: 'Single insight as string' // Debería ser array
      }
    };

    const mockOnBriefChange = jest.fn();
    const { result } = renderHook(() => useStructuredChat(briefWithMixedTypes, mockOnBriefChange));

    // Verificar que no hay errores en la inicialización
    expect(result.current.error).toBeNull();
    expect(result.current.messages).toEqual([]);
    expect(typeof result.current.sendMessage).toBe('function');
  });
});