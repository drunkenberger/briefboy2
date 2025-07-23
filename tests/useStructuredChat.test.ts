import { act, renderHook, waitFor } from '@testing-library/react';
import { useStructuredChat } from '../hooks/useStructuredChat';

// Mock knowledgeBaseService
jest.mock('../services/knowledgeBaseService', () => ({
  knowledgeBaseService: {
    getAllKnowledge: jest.fn(() => 'Mock knowledge base content'),
    getCommonMistakes: jest.fn(() => 'Mock common mistakes content'),
    getBriefStructureGuidance: jest.fn(() => 'Mock structure guidance'),
  }
}));

const mockBrief = {
  projectTitle: "Test Marketing Campaign",
  briefSummary: "Test brief summary for marketing campaign",
  businessChallenge: "Test business challenge description",
  strategicObjectives: [
    "Increase brand awareness by 25%",
    "Drive customer acquisition",
    "Improve market positioning"
  ],
  targetAudience: {
    primary: "Young professionals aged 25-35",
    secondary: "Tech enthusiasts",
    insights: ["Values efficiency", "Active on social media"]
  },
  brandPositioning: "Premium tech brand for modern professionals",
  creativeStrategy: {
    bigIdea: "Technology that empowers your potential",
    tone: "Professional yet approachable",
    messaging: ["Innovation", "Reliability", "Growth"]
  }
};

describe('useStructuredChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'test-key';
    
    // Mock fetch for successful API responses
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          choices: [
            {
              message: {
                content: JSON.stringify([
                  {
                    id: 'q1',
                    field: 'targetAudience',
                    question: 'Test question about target audience',
                    priority: 'high',
                    completed: false
                  }
                ])
              },
            },
          ],
        }),
      })
    );
  });

  it('initializes with empty state and new properties', () => {
    const mockOnBriefChange = jest.fn();
    const { result } = renderHook(() => useStructuredChat(mockBrief, mockOnBriefChange));
    
    expect(result.current.messages).toEqual([]);
    expect(result.current.currentQuestion).toBeNull();
    expect(result.current.isTyping).toBe(false);
    expect(result.current.isConnected).toBe(true);
    expect(result.current.briefQuality).toBeNull();
    expect(typeof result.current.evaluateBriefQuality).toBe('function');
  });

  it('can clear chat messages', () => {
    const mockOnBriefChange = jest.fn();
    const { result } = renderHook(() => useStructuredChat(mockBrief, mockOnBriefChange));
    
    act(() => {
      result.current.clearChat();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.currentQuestion).toBeNull();
  });

  it('provides sendMessage function', () => {
    const mockOnBriefChange = jest.fn();
    const { result } = renderHook(() => useStructuredChat(mockBrief, mockOnBriefChange));
    
    expect(typeof result.current.sendMessage).toBe('function');
  });

  it('provides initializeChat function', () => {
    const mockOnBriefChange = jest.fn();
    const { result } = renderHook(() => useStructuredChat(mockBrief, mockOnBriefChange));
    
    expect(typeof result.current.initializeChat).toBe('function');
  });

  it('evaluates brief quality successfully', async () => {
    const mockQualityResponse = {
      overallScore: 85,
      isExcellent: false,
      readyForProduction: true,
      strengths: ["Well-defined objectives", "Clear target audience"],
      remainingGaps: ["Could use more specific metrics"],
      recommendation: "Ready for production with minor adjustments"
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: JSON.stringify(mockQualityResponse)
          }
        }]
      })
    });

    const mockOnBriefChange = jest.fn();
    const { result } = renderHook(() => useStructuredChat(mockBrief, mockOnBriefChange));

    await act(async () => {
      await result.current.evaluateBriefQuality();
    });

    expect(result.current.briefQuality).toEqual(mockQualityResponse);
    expect(result.current.briefQuality?.overallScore).toBe(85);
    expect(result.current.briefQuality?.readyForProduction).toBe(true);
  });

  it('handles brief quality evaluation errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const mockOnBriefChange = jest.fn();
    const { result } = renderHook(() => useStructuredChat(mockBrief, mockOnBriefChange));

    await act(async () => {
      await result.current.evaluateBriefQuality();
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.briefQuality).toBeNull();
  });

  it('clears brief quality when clearing chat', () => {
    const mockOnBriefChange = jest.fn();
    const { result } = renderHook(() => useStructuredChat(mockBrief, mockOnBriefChange));
    
    // Simular que se estableció alguna calidad
    act(() => {
      result.current.clearChat();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.currentQuestion).toBeNull();
    expect(result.current.briefQuality).toBeNull();
  });
});