import { useEffect, useState } from 'react';

interface UseWhisperTranscriptionResult {
  transcription: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para transcribir audio automáticamente usando la API de Whisper de OpenAI.
 * @param audioUri URI local del archivo de audio a transcribir
 * @param enabled Si es true, inicia la transcripción automáticamente
 * @returns { transcription, loading, error }
 */
export function useWhisperTranscription(audioUri: string | null, enabled: boolean = true): UseWhisperTranscriptionResult {
  const [transcription, setTranscription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!audioUri || !enabled) return;
    let cancelled = false;
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      setError('No se encontró la API key de OpenAI');
      setLoading(false);
      setTranscription(null);
      return;
    }
    const transcribe = async () => {
      setLoading(true);
      setError(null);
      setTranscription(null);
      try {
        // Leer el archivo de audio como blob
        const response = await fetch(audioUri);
        const audioBlob = await response.blob();
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', 'whisper-1');
        // Puedes agregar más parámetros según la API de OpenAI

        const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || 'Error al transcribir el audio');
        }
        const data = await res.json();
        if (!cancelled) setTranscription(data.text || '');
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Error desconocido');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    transcribe();
    return () => { cancelled = true; };
  }, [audioUri, enabled]);

  return { transcription, loading, error };
}