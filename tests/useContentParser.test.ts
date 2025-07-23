import { renderHook, waitFor } from '@testing-library/react';
import { useContentParser } from '../hooks/useContentParser';

describe('useContentParser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'test-key';
  });

  it('does not parse when transcription is empty', () => {
    const { result } = renderHook(() => useContentParser('', true));
    
    expect(result.current.parsedBrief).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('does not parse when disabled', () => {
    const { result } = renderHook(() => 
      useContentParser('Test transcription content', false)
    );
    
    expect(result.current.parsedBrief).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('parses transcription successfully', async () => {
    const mockParsedBrief = {
      projectTitle: "Parsed Campaign",
      briefSummary: "Parsed summary",
      businessChallenge: "Parsed challenge"
    };

    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choices: [
            {
              message: {
                content: JSON.stringify(mockParsedBrief),
              },
            },
          ],
        }),
      })
    );

    const { result } = renderHook(() => 
      useContentParser('Test marketing transcription about campaign strategy', true)
    );

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.parsedBrief).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.parsedBrief).toEqual(mockParsedBrief);
    expect(result.current.error).toBeNull();
  });

  it('handles parsing errors', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('API Error'))
    );

    const { result } = renderHook(() => 
      useContentParser('Test transcription', true)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.parsedBrief).toBeNull();
    expect(result.current.error).toBe('API Error');
  });

  it('handles invalid JSON response', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choices: [
            {
              message: {
                content: 'Invalid JSON content',
              },
            },
          ],
        }),
      })
    );

    const { result } = renderHook(() => 
      useContentParser('Test transcription', true)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.parsedBrief).toBeNull();
    expect(result.current.error).toContain('JSON');
  });
});