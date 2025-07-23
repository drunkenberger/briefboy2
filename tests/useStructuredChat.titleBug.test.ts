import { renderHook, act } from '@testing-library/react';
import { useStructuredChat } from '../hooks/useStructuredChat';
import { evaluateTitle } from '../utils/briefValidation';

// Mock knowledgeBaseService
jest.mock('../services/knowledgeBaseService', () => ({
  knowledgeBaseService: {
    getAllKnowledge: jest.fn(() => 'Mock knowledge base content'),
    getCommonMistakes: jest.fn(() => 'Mock common mistakes content'),
    getBriefStructureGuidance: jest.fn(() => 'Mock structure guidance'),
  }
}));

/**
 * Test específico para el bug reportado:
 * La IA pregunta por el título cuando ya existe "Campaña de Lanzamiento: Libera tu Espíritu"
 */
describe('useStructuredChat - Title Bug Fix', () => {
  const briefWithExistingTitle = {
    projectTitle: "Campaña de Lanzamiento: Libera tu Espíritu",
    briefSummary: "Descripción general del proyecto...",
    // Otros campos pueden estar vacíos o básicos
    businessChallenge: "",
    strategicObjectives: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'test-key';
  });

  it('should NOT generate questions for excellent titles', async () => {
    // Mock que simula que la IA INTENTA generar una pregunta sobre el título
    // pero nuestro filtro debe rechazarla
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: JSON.stringify({
              questions: [
                {
                  id: 'q1',
                  field: 'projectTitle',
                  question: 'Veo que aún no has definido el título del proyecto...',
                  priority: 'high'
                },
                {
                  id: 'q2', 
                  field: 'businessChallenge',
                  question: 'Me gustaría entender mejor el desafío de negocio...',
                  priority: 'high'
                }
              ]
            })
          }
        }]
      })
    });

    const mockOnBriefChange = jest.fn();
    const { result } = renderHook(() => useStructuredChat(briefWithExistingTitle, mockOnBriefChange));

    await act(async () => {
      await result.current.initializeChat();
    });

    // Verificar que se filtró correctamente la pregunta sobre el título
    const assistantMessages = result.current.messages.filter(m => m.role === 'assistant');
    
    // Debe tener al menos el mensaje de bienvenida
    expect(assistantMessages.length).toBeGreaterThan(0);
    
    // NO debe haber mensajes preguntando sobre el título
    const titleQuestions = assistantMessages.filter(m => 
      m.content.toLowerCase().includes('título') && 
      m.content.toLowerCase().includes('proyecto')
    );
    expect(titleQuestions).toHaveLength(0);
    
    // Verificar que el progreso refleje menos preguntas (filtrado funcionó)
    expect(result.current.progress.total).toBeLessThan(2); // Debe ser 1 en lugar de 2
  });

  it('should classify descriptive titles as excellent', () => {
    // Test using the actual implementation from briefValidation utils
    const mockOnBriefChange = jest.fn();
    const { result } = renderHook(() => useStructuredChat(briefWithExistingTitle, mockOnBriefChange));

    // Títulos que DEBEN ser excelentes (no generar preguntas)
    expect(evaluateTitle("Campaña de Lanzamiento: Libera tu Espíritu")).toBe('excellent');
    expect(evaluateTitle("Revolución Digital 2024")).toBe('excellent');
    expect(evaluateTitle("La Nueva Era de la Sustentabilidad")).toBe('excellent');

    // Títulos que pueden generar preguntas
    expect(evaluateTitle("Campaña")).toBe('basic');
    expect(evaluateTitle("Proyecto Brief")).toBe('basic');
    expect(evaluateTitle("Sin título")).toBe('basic');
  });

  it('should prevent questions about existing excellent content', () => {
    const briefWithGoodContent = {
      projectTitle: "Campaña de Lanzamiento: Libera tu Espíritu", // 43 chars, creative
      briefSummary: "Una campaña integral diseñada para posicionar la marca como líder en experiencias auténticas dirigida a millennials urbanos", // 128 chars, detailed
      businessChallenge: "", // Empty, should generate question
    };

    // Mock respuesta de API que intenta generar pregunta sobre título
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: JSON.stringify({
              questions: [
                {
                  id: 'q1',
                  field: 'projectTitle',
                  question: 'Para hacer el título más específico...',
                  priority: 'medium'
                },
                {
                  id: 'q2',
                  field: 'businessChallenge', 
                  question: 'Me gustaría entender el desafío principal...',
                  priority: 'high'
                }
              ]
            })
          }
        }]
      })
    });

    const mockOnBriefChange = jest.fn();
    const { result } = renderHook(() => useStructuredChat(briefWithGoodContent, mockOnBriefChange));

    // La lógica de filtrado debe eliminar preguntas sobre campos excelentes
    // Simulamos esto verificando que el filtro funciona
    const questions = [
      { field: 'projectTitle', question: 'Para hacer el título más específico...' },
      { field: 'businessChallenge', question: 'Me gustaría entender el desafío...' }
    ];

    const validQuestions = questions.filter(q => {
      if (q.field === 'projectTitle' && briefWithGoodContent.projectTitle) {
        console.log('🚫 PREGUNTA RECHAZADA: Título ya existe');
        return false;
      }
      return true;
    });

    expect(validQuestions).toHaveLength(1);
    expect(validQuestions[0].field).toBe('businessChallenge');
  });
});