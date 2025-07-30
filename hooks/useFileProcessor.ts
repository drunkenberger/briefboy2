import { useState, useEffect } from 'react';
import { useWhisperTranscription } from './useWhisperTranscription';
import { useDocumentProcessor } from './useDocumentProcessor';

interface UseFileProcessorProps {
  fileUri: string | null;
  fileName: string;
  enabled: boolean;
}

export function useFileProcessor({ fileUri, fileName, enabled }: UseFileProcessorProps) {
  const [fileType, setFileType] = useState<'audio' | 'document' | null>(null);
  const [processedContent, setProcessedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Determine file type
  useEffect(() => {
    if (!fileUri || !fileName) {
      setFileType(null);
      return;
    }

    const extension = fileName.toLowerCase().split('.').pop();
    const audioExtensions = ['mp3', 'wav', 'm4a', 'aac', 'mp4', 'mov', 'avi'];
    const documentExtensions = ['txt', 'pdf', 'docx', 'doc', 'rtf'];

    if (audioExtensions.includes(extension || '')) {
      setFileType('audio');
    } else if (documentExtensions.includes(extension || '')) {
      setFileType('document');
    } else {
      setFileType(null);
      setError(`Formato de archivo no soportado: ${extension}`);
    }
  }, [fileUri, fileName]);

  // Audio transcription
  const { 
    transcription, 
    loading: audioLoading, 
    error: audioError 
  } = useWhisperTranscription(
    fileType === 'audio' ? fileUri : null,
    fileType === 'audio' && enabled && !!fileUri
  );

  // Document processing
  const { 
    extractedText, 
    loading: docLoading, 
    error: docError 
  } = useDocumentProcessor(
    fileType === 'document' ? fileUri : null,
    fileType === 'document' && enabled && !!fileUri,
    fileName
  );

  // Set processed content when ready
  useEffect(() => {
    if (transcription) {
      setProcessedContent(transcription);
      setError(null);
    }
  }, [transcription]);

  useEffect(() => {
    if (extractedText) {
      setProcessedContent(extractedText);
      setError(null);
    }
  }, [extractedText]);

  // Set errors
  useEffect(() => {
    if (audioError) {
      setError(audioError);
    }
  }, [audioError]);

  useEffect(() => {
    if (docError) {
      setError(docError);
    }
  }, [docError]);

  return {
    fileType,
    processedContent,
    loading: audioLoading || docLoading,
    error: error || audioError || docError,
    reset: () => {
      setProcessedContent(null);
      setError(null);
      setFileType(null);
    }
  };
}