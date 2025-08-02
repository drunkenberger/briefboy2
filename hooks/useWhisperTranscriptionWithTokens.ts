import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useTokenTracking } from './useTokenTracking';

/**
 * Estimates audio duration based on file size using a realistic average bitrate.
 * Uses 128kbps (16KB/s) which is more accurate for common audio formats.
 * @param fileSizeBytes - Size of the audio file in bytes
 * @returns Estimated duration in seconds
 */
const estimateAudioDuration = (fileSizeBytes: number): number => {
  // Use 128kbps (16KB/s) as a realistic average bitrate for common audio formats
  // This is much more accurate than the previous 16kbps (2KB/s)
  const AVERAGE_BITRATE_BYTES_PER_SECOND = 16000; // 128kbps
  return Math.ceil(fileSizeBytes / AVERAGE_BITRATE_BYTES_PER_SECOND);
};

interface UseWhisperTranscriptionResult {
  transcription: string | null;
  loading: boolean;
  error: string | null;
  tokensUsed: number;
  estimatedCost: number;
}

/**
 * Hook para transcribir audio automáticamente usando la API de Whisper de OpenAI con tracking de tokens.
 * @param audioUri URI local del archivo de audio a transcribir
 * @param enabled Si es true, inicia la transcripción automáticamente
 * @returns { transcription, loading, error, tokensUsed, estimatedCost }
 */
export function useWhisperTranscriptionWithTokens(
  audioUri: string | null, 
  enabled: boolean = true
): UseWhisperTranscriptionResult {
  const [transcription, setTranscription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);
  
  const { estimateWhisperTokens, trackTokenUsage, calculateCost } = useTokenTracking();

  useEffect(() => {
    if (!audioUri || !enabled) {
      console.log('🎤 useWhisperTranscriptionWithTokens: No se ejecutará -', { audioUri: !!audioUri, enabled });
      return;
    }
    
    let cancelled = false;
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    
    console.log('🎤 useWhisperTranscriptionWithTokens: Iniciando proceso', { 
      audioUri: audioUri.substring(0, 100) + '...',
      hasApiKey: !!apiKey,
      enabled 
    });
    
    if (!apiKey) {
      console.error('❌ useWhisperTranscriptionWithTokens: No se encontró la API key de OpenAI');
      setError('No se encontró la API key de OpenAI');
      setLoading(false);
      setTranscription(null);
      return;
    }

    const transcribe = async () => {
      setLoading(true);
      setError(null);
      setTranscription(null);
      setTokensUsed(0);
      setEstimatedCost(0);
      
      try {
        console.log('🎤 Iniciando transcripción con Whisper:', { audioUri: audioUri.substring(0, 100) + '...' });
        
        // Get audio duration for token estimation
        let audioDurationSeconds = 60; // Default estimate
        
        // Verificar que el archivo existe (solo para archivos locales, no para blobs o data URIs)
        if (!audioUri.startsWith('data:') && !audioUri.startsWith('blob:') && Platform.OS !== 'web') {
          const fileInfo = await FileSystem.getInfoAsync(audioUri);
          if (!fileInfo.exists) {
            throw new Error('El archivo de audio no existe');
          }
          console.log('📋 Información del archivo:', {
            exists: fileInfo.exists,
            size: fileInfo.size,
            uri: audioUri
          });
          
          // Use the reusable duration estimation function
          if (fileInfo.size) {
            audioDurationSeconds = estimateAudioDuration(fileInfo.size);
          }
        }
        
        const formData = new FormData();
        
        // [Rest of the transcription code remains the same as the original hook]
        // ... (preparar archivo, enviar a API, etc.)
        
        // Preparar el archivo según el tipo de URI
        if (audioUri.startsWith('blob:') && Platform.OS === 'web') {
          // Para blob URIs en web
          console.log('🔄 Procesando blob URI en web...');
          try {
            const response = await fetch(audioUri);
            const audioBlob = await response.blob();
            
            // Use the reusable duration estimation function
            audioDurationSeconds = estimateAudioDuration(audioBlob.size);
            
            // Para webm en web (formato por defecto de expo-av)
            const fileName = 'audio.webm';
            const mimeType = 'audio/webm';
            
            console.log('🎵 Blob preparado:', { 
              blobSize: audioBlob.size, 
              blobType: audioBlob.type || mimeType,
              fileName,
              estimatedDuration: audioDurationSeconds
            });
            
            formData.append('file', audioBlob, fileName);
          } catch (blobError) {
            console.error('❌ Error procesando blob:', blobError);
            throw new Error('No se pudo procesar el archivo de audio grabado');
          }
        } else if (audioUri.startsWith('data:')) {
          // Para URIs base64, extraer y crear un blob
          console.log('🔄 Procesando audio base64...');
          const base64Data = audioUri.split(',')[1];
          if (!base64Data) {
            throw new Error('URI base64 inválida');
          }
          
          const mimeType = audioUri.split(';')[0].split(':')[1];
          
          if (Platform.OS === 'web') {
            // En web, convertir base64 a blob
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            
            // Use the reusable duration estimation function
            audioDurationSeconds = estimateAudioDuration(byteArray.length);
            
            // Determinar extensión correcta basada en mimeType
            let extension = 'webm';
            if (mimeType.includes('mp3')) extension = 'mp3';
            else if (mimeType.includes('mp4') || mimeType.includes('m4a')) extension = 'm4a';
            else if (mimeType.includes('wav')) extension = 'wav';
            else if (mimeType.includes('mpeg')) extension = 'mpeg';
            
            const audioBlob = new Blob([byteArray], { type: mimeType });
            const fileName = `audio.${extension}`;
            console.log('🎵 Archivo de audio preparado:', { 
              mimeType, 
              extension, 
              fileName, 
              blobSize: audioBlob.size,
              estimatedDuration: audioDurationSeconds
            });
            formData.append('file', audioBlob, fileName);
          } else {
            // En móvil, usar la URI directamente
            formData.append('file', {
              uri: audioUri,
              type: mimeType,
              name: 'audio.webm',
            } as any);
          }
        } else {
          // Para archivos locales
          console.log('📁 Procesando archivo local...');
          const fileExtension = audioUri.split('.').pop()?.toLowerCase() || 'webm';
          const fileName = `audio.${fileExtension}`;
          
          // Determinar el tipo MIME correcto basado en la extensión
          let mimeType = 'audio/webm'; // Default para web
          if (fileExtension === 'm4a') mimeType = 'audio/m4a';
          else if (fileExtension === 'mp3') mimeType = 'audio/mpeg';
          else if (fileExtension === 'wav') mimeType = 'audio/wav';
          else if (fileExtension === '3gp') mimeType = 'audio/3gpp';
          else if (fileExtension === 'mp4') mimeType = 'audio/mp4';
          
          console.log('🎵 Archivo local preparado:', { 
            uri: audioUri.substring(0, 50) + '...', 
            extension: fileExtension, 
            mimeType, 
            fileName 
          });
          
          formData.append('file', {
            uri: audioUri,
            type: mimeType,
            name: fileName,
          } as any);
        }
        
        formData.append('model', 'whisper-1');
        formData.append('language', 'es'); // Especificar español para mejor precisión
        
        console.log('📤 Enviando a Whisper API...');
        const startTime = Date.now();
        
        const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
          body: formData,
        });

        const responseTime = Date.now() - startTime;
        console.log(`⏱️ Whisper API response time: ${responseTime}ms`);

        if (!res.ok) {
          const errorText = await res.text();
          const fileExtension = audioUri.split('.').pop()?.toLowerCase() || 'unknown';
          console.error('❌ Error de Whisper API:', {
            status: res.status,
            statusText: res.statusText,
            error: errorText,
            audioUri: audioUri.substring(0, 100) + '...',
            fileExtension,
            isDataUri: audioUri.startsWith('data:'),
            platform: Platform.OS,
            formDataInfo: {
              hasFile: !!formData.get('file'),
              model: formData.get('model'),
              language: formData.get('language')
            }
          });
          
          let errorMessage = `Error de transcripción (${res.status}): `;
          if (res.status === 413) {
            errorMessage += 'Archivo muy grande. Máximo 25MB.';
          } else if (res.status === 400) {
            errorMessage += 'Formato de archivo no soportado.';
          } else if (res.status === 401) {
            errorMessage += 'API key inválida.';
          } else if (res.status === 429) {
            errorMessage += 'Límite de uso excedido.';
          } else {
            try {
              const err = JSON.parse(errorText);
              errorMessage += err.error?.message || errorText || 'Error desconocido.';
            } catch {
              errorMessage += errorText || 'Error desconocido.';
            }
          }
          
          throw new Error(errorMessage);
        }
        
        const data = await res.json();
        console.log('✅ Transcripción completada:', {
          hasText: !!data.text,
          textLength: data.text?.length || 0,
          audioDuration: audioDurationSeconds
        });
        
        if (!data.text) {
          throw new Error('Whisper no devolvió texto transcrito');
        }
        
        // Calculate token usage
        const estimatedTokens = estimateWhisperTokens(audioDurationSeconds);
        const cost = calculateCost('whisper', estimatedTokens, 0);
        
        // Track token usage
        trackTokenUsage({
          service: 'whisper_transcription',
          model: 'whisper',
          input_tokens: estimatedTokens,
          output_tokens: 0,
          total_tokens: estimatedTokens,
          estimated_cost: cost
        });
        
        if (!cancelled) {
          setTranscription(data.text);
          setTokensUsed(estimatedTokens);
          setEstimatedCost(cost);
        }
      } catch (err: any) {
        console.error('❌ Error en transcripción:', err);
        if (!cancelled) setError(err.message || 'Error desconocido en transcripción');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    
    transcribe();
    return () => { cancelled = true; };
  }, [audioUri, enabled, estimateWhisperTokens, trackTokenUsage, calculateCost]);

  return { transcription, loading, error, tokensUsed, estimatedCost };
}