import { renderHook, act } from '@testing-library/react-hooks';
import { useFastChat } from '../hooks/useFastChat';

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('useFastChat', () => {
  const mockBrief = {
    projectTitle: 'Test Project',
    briefSummary: 'Test summary',
    strategicObjectives: ['Increase sales'],
  };

  const mockAnalysis = {
    overallScore: 85,
    isReadyForProduction: true,
    strengths: ['Clear objectives'],
    weaknesses: ['Generic messaging'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with welcome message', () => {
    const { result } = renderHook(() => useFastChat(mockBrief, mockAnalysis));
    
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe('assistant');
    expect(result.current.messages[0].content).toContain('¡Hola!');
    expect(result.current.messages[0].content).toContain('85/100');
    expect(result.current.isTyping).toBe(false);
    expect(result.current.isConnected).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should send message and get response from OpenAI (fallback)', async () => {
    // Mock failed Claude and Gemini responses, successful OpenAI
    mockFetch
      .mockResolvedValueOnce({ ok: false } as Response) // Claude fails
      .mockResolvedValueOnce({ ok: false } as Response) // Gemini fails
      .mockResolvedValueOnce({ // OpenAI succeeds
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: 'Great question! Let me help you with that.',
            },
          }],
        }),
      } as Response);

    const { result, waitForNextUpdate } = renderHook(() => useFastChat(mockBrief, mockAnalysis));

    await act(async () => {
      await result.current.sendMessage('How can I improve the objectives?');
    });

    await waitForNextUpdate();

    expect(result.current.messages).toHaveLength(3); // Welcome + user + assistant
    expect(result.current.messages[1].role).toBe('user');
    expect(result.current.messages[1].content).toBe('How can I improve the objectives?');
    expect(result.current.messages[2].role).toBe('assistant');
    expect(result.current.messages[2].content).toBe('Great question! Let me help you with that.');
    expect(result.current.isTyping).toBe(false);
    expect(result.current.isConnected).toBe(true);
  });

  it('should handle successful Claude response', async () => {
    // Mock successful Claude response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{
          text: 'Claude response: I can help you improve your brief!',
        }],
      }),
    } as Response);

    // Set Claude API key for this test
    process.env.EXPO_PUBLIC_CLAUDE_API_KEY = 'test-claude-key';

    const { result, waitForNextUpdate } = renderHook(() => useFastChat(mockBrief, mockAnalysis));

    await act(async () => {
      await result.current.sendMessage('Help me improve this brief');
    });

    await waitForNextUpdate();

    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[2].content).toBe('Claude response: I can help you improve your brief!');
    expect(result.current.isConnected).toBe(true);

    // Clean up
    delete process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
  });

  it('should handle successful Gemini response', async () => {
    // Mock failed Claude, successful Gemini response
    mockFetch
      .mockResolvedValueOnce({ ok: false } as Response) // Claude fails
      .mockResolvedValueOnce({ // Gemini succeeds
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: 'Gemini response: Let me analyze your brief and provide suggestions.',
              }],
            },
          }],
        }),
      } as Response);

    // Set Gemini API key for this test
    process.env.EXPO_PUBLIC_GEMINI_API_KEY = 'test-gemini-key';

    const { result, waitForNextUpdate } = renderHook(() => useFastChat(mockBrief, mockAnalysis));

    await act(async () => {
      await result.current.sendMessage('Analyze my brief');
    });

    await waitForNextUpdate();

    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[2].content).toBe('Gemini response: Let me analyze your brief and provide suggestions.');
    expect(result.current.isConnected).toBe(true);

    // Clean up
    delete process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  });

  it('should handle all APIs failing', async () => {
    // Mock all APIs failing
    mockFetch
      .mockResolvedValueOnce({ ok: false } as Response) // Claude fails
      .mockResolvedValueOnce({ ok: false } as Response) // Gemini fails
      .mockResolvedValueOnce({ ok: false } as Response); // OpenAI fails

    const { result, waitForNextUpdate } = renderHook(() => useFastChat(mockBrief, mockAnalysis));

    await act(async () => {
      await result.current.sendMessage('This should fail');
    });

    await waitForNextUpdate();

    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[2].role).toBe('assistant');
    expect(result.current.messages[2].content).toContain('❌ Disculpa, tuve un problema técnico');
    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it('should not send empty messages', async () => {
    const { result } = renderHook(() => useFastChat(mockBrief, mockAnalysis));

    await act(async () => {
      await result.current.sendMessage('');
    });

    expect(result.current.messages).toHaveLength(1); // Only welcome message
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should trim whitespace from messages', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: 'Response to trimmed message',
          },
        }],
      }),
    } as Response);

    const { result, waitForNextUpdate } = renderHook(() => useFastChat(mockBrief, mockAnalysis));

    await act(async () => {
      await result.current.sendMessage('   test message   ');
    });

    await waitForNextUpdate();

    expect(result.current.messages[1].content).toBe('test message');
  });

  it('should clear chat correctly', () => {
    const { result } = renderHook(() => useFastChat(mockBrief, mockAnalysis));

    act(() => {
      result.current.clearChat();
    });

    expect(result.current.messages).toHaveLength(0);
    expect(result.current.error).toBeNull();
    expect(result.current.isConnected).toBe(true);
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result, waitForNextUpdate } = renderHook(() => useFastChat(mockBrief, mockAnalysis));

    await act(async () => {
      await result.current.sendMessage('This will cause a network error');
    });

    await waitForNextUpdate();

    expect(result.current.error).toBeTruthy();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.messages[2].content).toContain('❌ Disculpa, tuve un problema técnico');
  });

  it('should set isTyping during message sending', async () => {
    let resolvePromise: (value: any) => void;
    const slowPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(slowPromise as any);

    const { result } = renderHook(() => useFastChat(mockBrief, mockAnalysis));

    act(() => {
      result.current.sendMessage('Test message');
    });

    expect(result.current.isTyping).toBe(true);

    // Resolve the promise
    resolvePromise!({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: 'Response',
          },
        }],
      }),
    });

    await act(async () => {
      await slowPromise;
    });

    expect(result.current.isTyping).toBe(false);
  });
});