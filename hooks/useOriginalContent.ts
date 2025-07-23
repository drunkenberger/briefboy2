import { useState, useCallback } from 'react';

export interface OriginalContent {
  transcription: string;
  source: 'audio' | 'file';
  timestamp: number;
}

export interface UseOriginalContentResult {
  originalContent: OriginalContent | null;
  setOriginalContentFromAudio: (transcription: string) => void;
  setOriginalContentFromFile: (transcription: string) => void;
  clearOriginalContent: () => void;
  hasContent: boolean;
}

/**
 * Hook para manejar el contenido original del usuario sin mejoras automáticas.
 * Este hook preserva exactamente lo que el usuario proporcionó, sin IA.
 */
export function useOriginalContent(): UseOriginalContentResult {
  const [originalContent, setOriginalContent] = useState<OriginalContent | null>(null);

  const setOriginalContentFromAudio = useCallback((transcription: string) => {
    console.log('📝 useOriginalContent: Guardando contenido original desde audio');
    setOriginalContent({
      transcription: transcription.trim(),
      source: 'audio',
      timestamp: Date.now(),
    });
  }, []);

  const setOriginalContentFromFile = useCallback((transcription: string) => {
    console.log('📄 useOriginalContent: Guardando contenido original desde archivo');
    setOriginalContent({
      transcription: transcription.trim(),
      source: 'file',
      timestamp: Date.now(),
    });
  }, []);

  const clearOriginalContent = useCallback(() => {
    console.log('🗑️ useOriginalContent: Limpiando contenido original');
    setOriginalContent(null);
  }, []);

  const hasContent = !!originalContent?.transcription;

  return {
    originalContent,
    setOriginalContentFromAudio,
    setOriginalContentFromFile,
    clearOriginalContent,
    hasContent,
  };
}