import { renderHook } from '@testing-library/react';
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
  });

  it('no hace nada si audioUri es null', () => {
    const { result } = renderHook(() => useWhisperTranscription(null));
    expect(result.current.transcription).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('transcribe correctamente cuando la API responde bien', async () => {
    (fetch as any).mockImplementationOnce(() =>
      Promise.resolve({
        blob: () => Promise.resolve(new Blob(['audio'])),
      })
    );
    (fetch as any).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ text: mockTranscription }),
      })
    );
    const { result } = renderHook(() => useWhisperTranscription(mockAudioUri));
    expect(result.current.loading).toBe(true);
    await waitForCondition(() => result.current.transcription === mockTranscription);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('maneja error de red', async () => {
    (fetch as any).mockImplementationOnce(() =>
      Promise.resolve({
        blob: () => Promise.resolve(new Blob(['audio'])),
      })
    );
    (fetch as any).mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );
    const { result } = renderHook(() => useWhisperTranscription(mockAudioUri));
    expect(result.current.loading).toBe(true);
    await waitForCondition(() => typeof result.current.error === 'string' && /Network error/.test(result.current.error));
    expect(result.current.transcription).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('maneja error de API key faltante', async () => {
    process.env.EXPO_PUBLIC_OPENAI_API_KEY = '';
    const { result } = renderHook(() => useWhisperTranscription(mockAudioUri));
    expect(result.current.loading).toBe(false);
    expect(result.current.transcription).toBeNull();
    expect(result.current.error).toBe('No se encontró la API key de OpenAI');
  });

  it('cancela la actualización de estado si el componente se desmonta', async () => {
    (fetch as any).mockImplementationOnce(() =>
      Promise.resolve({
        blob: () => Promise.resolve(new Blob(['audio'])),
      })
    );
    (fetch as any).mockImplementationOnce(() =>
      new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: () => Promise.resolve({ text: mockTranscription }) }), 100))
    );
    const { unmount, result } = renderHook(() => useWhisperTranscription(mockAudioUri));
    unmount();
    // Espera un poco y verifica que el estado no cambió tras desmontar
    await new Promise((res) => setTimeout(res, 200));
    expect(result.current.transcription).toBeNull();
    expect(result.current.error).toBeNull();
  });
});