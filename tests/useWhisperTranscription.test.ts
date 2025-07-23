import { renderHook, waitFor } from '@testing-library/react';
import { useWhisperTranscription } from '../hooks/useWhisperTranscription';

const mockAudioUri = 'file://mock-audio.webm';
const mockTranscription = 'Esto es una transcripción de prueba.';

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

describe('useWhisperTranscription', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'test-key';
    // Reset fetch mock to default for each test
    (global.fetch as jest.Mock).mockReset();
  });

  it('no hace nada si audioUri es null', () => {
    const { result } = renderHook(() => useWhisperTranscription(null));
    expect(result.current.transcription).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('transcribe correctamente cuando la API responde bien', async () => {
    // Mock both the blob fetch (for web URIs) and the OpenAI API call
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.startsWith('blob:')) {
        // Mock blob URI fetch
        return Promise.resolve({
          blob: () => Promise.resolve(new Blob(['audio data'], { type: 'audio/webm' }))
        });
      } else if (url.includes('openai.com')) {
        // Mock OpenAI Whisper API call
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ text: mockTranscription }),
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
    
    const { result } = renderHook(() => useWhisperTranscription(mockAudioUri, true));
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.transcription).toBe(mockTranscription);
    expect(result.current.error).toBeNull();
  });

  it('maneja error de red', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.startsWith('blob:')) {
        // Mock blob URI fetch
        return Promise.resolve({
          blob: () => Promise.resolve(new Blob(['audio data'], { type: 'audio/webm' }))
        });
      } else if (url.includes('openai.com')) {
        // Mock network error for OpenAI API call
        return Promise.reject(new Error('Network error'));
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
    
    const { result } = renderHook(() => useWhisperTranscription(mockAudioUri, true));
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.transcription).toBeNull();
    expect(result.current.error).toBeTruthy(); // Just check that there's an error
  });

  it('maneja error de API key faltante', () => {
    process.env.EXPO_PUBLIC_OPENAI_API_KEY = '';
    const { result } = renderHook(() => useWhisperTranscription(mockAudioUri, true));
    
    expect(result.current.loading).toBe(false);
    expect(result.current.transcription).toBeNull();
    expect(result.current.error).toBe('No se encontró la API key de OpenAI');
  });

  it('no inicia transcripción si enabled es false', () => {
    const { result } = renderHook(() => useWhisperTranscription(mockAudioUri, false));
    
    expect(result.current.loading).toBe(false);
    expect(result.current.transcription).toBeNull();
    expect(result.current.error).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
});