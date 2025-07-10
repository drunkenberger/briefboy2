import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Constants for file validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt', '.jpg', '.jpeg', '.png'];
const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'image/jpeg',
  'image/jpg',
  'image/png'
];

interface UseDocumentProcessorResult {
  extractedText: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Helper function to convert a Blob to base64 string with robust error handling
 * @param blob The blob to convert
 * @returns Promise<string> The base64 content
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      try {
        const result = reader.result;
        if (typeof result !== 'string') {
          reject(new Error('FileReader no devolvió un string'));
          return;
        }
        
        // Validar que el resultado sea una data URL válida
        const dataUrlMatch = result.match(/^data:[^;]+;base64,(.+)$/);
        if (!dataUrlMatch || !dataUrlMatch[1]) {
          reject(new Error('FileReader no produjo una data URL válida'));
          return;
        }
        
        resolve(dataUrlMatch[1]);
      } catch (parseError) {
        reject(new Error(`Error parseando resultado de FileReader: ${parseError}`));
      }
    };
    
    reader.onerror = () => {
      const errorMsg = reader.error?.message || 'Error desconocido al leer blob';
      reject(new Error(`FileReader error: ${errorMsg}`));
    };
    
    reader.onabort = () => {
      reject(new Error('Lectura de blob fue abortada'));
    };
    
    try {
      reader.readAsDataURL(blob);
    } catch (readError) {
      reject(new Error(`Error iniciando FileReader: ${readError}`));
    }
  });
}

/**
 * Validates file size and type before processing
 * @param fileUri URI of the file to validate
 * @returns Promise<{ isValid: boolean; error?: string }>
 */
async function validateFile(fileUri: string, fileName?: string): Promise<{ isValid: boolean; error?: string }> {
  try {
    if (Platform.OS === 'web') {
      // En web, hacer validación simplificada
      console.log('📄 Validación web simplificada para:', { fileUri: fileUri.substring(0, 50) + '...', fileName });
      
      // Check file extension básico
      const fileToCheck = (fileName || fileUri).toLowerCase();
      const hasValidExtension = SUPPORTED_EXTENSIONS.some(ext => fileToCheck.endsWith(ext));

      if (!hasValidExtension) {
        console.log('❌ Extensión no válida:', { fileToCheck, extensions: SUPPORTED_EXTENSIONS });
        return {
          isValid: false,
          error: `Tipo de archivo no soportado. Formatos permitidos: ${SUPPORTED_EXTENSIONS.join(', ')}`
        };
      }

      console.log('✅ Archivo válido:', fileToCheck);
      return { isValid: true };
    } else {
      // En móvil, usar FileSystem con manejo de errores
      try {
        console.log('📱 Validando archivo en móvil:', fileUri);
        
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        if (!fileInfo.exists) {
          console.log('❌ Archivo no existe:', fileUri);
          return { isValid: false, error: 'El archivo no existe o no se puede acceder' };
        }

        console.log('📱 Información del archivo para validación:', {
          exists: fileInfo.exists,
          size: fileInfo.size,
          mimeType: (fileInfo as any).mimeType
        });

        // Check file size
        if (fileInfo.size && fileInfo.size > MAX_FILE_SIZE) {
          const sizeMB = (fileInfo.size / (1024 * 1024)).toFixed(1);
          console.log('❌ Archivo muy grande:', sizeMB + 'MB');
          return {
            isValid: false,
            error: `Archivo demasiado grande (${sizeMB}MB). Máximo permitido: 10MB`
          };
        }

        // Check file extension
        const fileName = fileUri.toLowerCase();
        const hasValidExtension = SUPPORTED_EXTENSIONS.some(ext => fileName.endsWith(ext));

        // Check MIME type if available
        const mimeType = (fileInfo as any).mimeType;
        const hasValidMimeType = mimeType && SUPPORTED_MIME_TYPES.includes(mimeType.toLowerCase());

        if (!hasValidExtension && !hasValidMimeType) {
          console.log('❌ Formato no soportado:', { fileName, mimeType, hasValidExtension, hasValidMimeType });
          return {
            isValid: false,
            error: `Tipo de archivo no soportado. Formatos permitidos: ${SUPPORTED_EXTENSIONS.join(', ')}`
          };
        }

        console.log('✅ Archivo válido:', fileName);
        return { isValid: true };
        
      } catch (fsError: any) {
        console.error('❌ Error en validación FileSystem:', fsError);
        
        // Proporcionar mensaje de error específico para validación
        let errorMessage = 'Error validando el archivo: ';
        
        if (fsError.message?.includes('permission')) {
          errorMessage += 'Sin permisos para acceder al archivo.';
        } else if (fsError.message?.includes('not found')) {
          errorMessage += 'El archivo no fue encontrado.';
        } else if (fsError.message?.includes('network') || fsError.message?.includes('connection')) {
          errorMessage += 'Problema de conexión al acceder al archivo.';
        } else {
          errorMessage += 'No se pudo acceder al archivo. Intenta seleccionarlo nuevamente.';
        }
        
        return {
          isValid: false,
          error: errorMessage
        };
      }
    }
  } catch (err) {
    return {
      isValid: false,
      error: 'Error al validar el archivo: ' + (err as Error).message
    };
  }
}

/**
 * Hook para extraer texto de documentos (PDF, DOCX, etc.) usando OpenAI GPT-4o.
 * @param fileUri URI local del archivo a procesar
 * @param enabled Si es true, inicia el procesamiento automáticamente
 * @param fileName Nombre del archivo original (opcional, para validación en web)
 * @returns { extractedText, loading, error }
 */
export function useDocumentProcessor(fileUri: string | null, enabled: boolean = true, fileName?: string): UseDocumentProcessorResult {
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileUri || !enabled) {
      console.log('📄 useDocumentProcessor: No se ejecutará -', { fileUri: !!fileUri, enabled });
      return;
    }
    
    console.log('📄 useDocumentProcessor: Iniciando proceso', { 
      fileUri: fileUri.substring(0, 100) + '...',
      enabled 
    });

    const processDocument = async () => {
      setLoading(true);
      setError(null);
      setExtractedText(null);

      try {
        // Validate file before processing
        console.log('📄 Validando archivo antes del procesamiento:', { fileUri: fileUri.substring(0, 50) + '...', fileName });
        const validation = await validateFile(fileUri, fileName);

        if (!validation.isValid) {
          throw new Error(validation.error);
        }

        const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error('No se encontró la API key de OpenAI');
        }

        console.log('📄 Iniciando procesamiento de documento con GPT-4o:', { 
          fileUri: fileUri.substring(0, 100) + '...', 
          platform: Platform.OS,
          startsWithData: fileUri.startsWith('data:'),
          startsWithBlob: fileUri.startsWith('blob:')
        });

        let base64Content: string;
        let mimeType: string;

        if (Platform.OS === 'web') {
          // En web, el fileUri ya es una data URL o blob URL
          console.log('📄 Procesamiento web - URI:', fileUri.substring(0, 50) + '...');
          
          if (fileUri.startsWith('data:')) {
            // Validar y parsear data URL con manejo robusto
            console.log('📄 Parseando data URL...');
            
            // Validar formato: data:[<mediatype>][;base64],<data>
            const dataUrlRegex = /^data:([^;]+)(;base64)?,(.+)$/;
            const match = fileUri.match(dataUrlRegex);
            
            if (!match) {
              throw new Error('Formato de data URL inválido. Se esperaba: data:[tipo];base64,[datos]');
            }
            
            const [, extractedMimeType, encoding, extractedData] = match;
            
            if (!extractedData || extractedData.trim().length === 0) {
              throw new Error('Data URL no contiene datos válidos');
            }
            
            if (!encoding || encoding !== ';base64') {
              throw new Error('Solo se soportan data URLs codificadas en base64');
            }
            
            base64Content = extractedData;
            mimeType = extractedMimeType || 'application/octet-stream';
            
            console.log('✅ Data URL parseada:', { 
              mimeType, 
              base64Length: base64Content.length,
              isBase64: true 
            });
            
          } else if (fileUri.startsWith('blob:')) {
            // Convertir blob URL a base64 con mejor manejo de errores
            console.log('📄 Procesando blob URL...');
            
            let response: Response;
            try {
              response = await fetch(fileUri);
              if (!response.ok) {
                throw new Error(`No se pudo acceder al blob: ${response.status} ${response.statusText}`);
              }
            } catch (fetchError: any) {
              throw new Error(`Error al acceder al blob URL: ${fetchError.message || 'Error de red'}`);
            }
            
            const blob = await response.blob();
            
            if (blob.size === 0) {
              throw new Error('El blob está vacío o no contiene datos');
            }
            
            console.log('📄 Blob obtenido:', { 
              type: blob.type, 
              size: blob.size 
            });
            
            // Convertir blob a base64 usando la función helper
            try {
              base64Content = await blobToBase64(blob);
            } catch (conversionError: any) {
              throw new Error(`Error convirtiendo blob a base64: ${conversionError.message}`);
            }
            
            mimeType = blob.type || 'application/octet-stream';
            
            console.log('✅ Blob convertido a base64:', { 
              mimeType, 
              base64Length: base64Content.length 
            });
            
          } else {
            // URI no soportada con información específica
            const supportedFormats = ['data:', 'blob:'];
            throw new Error(
              `Formato de URI no soportado: "${fileUri.substring(0, 10)}...". ` +
              `Formatos soportados en web: ${supportedFormats.join(', ')}`
            );
          }
        } else {
          // En móvil, usar FileSystem con manejo de errores
          try {
            console.log('📱 Procesamiento móvil - leyendo archivo:', fileUri);
            
            base64Content = await FileSystem.readAsStringAsync(fileUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            
            if (!base64Content || base64Content.trim().length === 0) {
              throw new Error('El archivo está vacío o no se pudo leer correctamente');
            }
            
            console.log('📱 Archivo leído exitosamente, tamaño base64:', base64Content.length);
            
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            
            if (!fileInfo.exists) {
              throw new Error('El archivo ya no existe en el sistema');
            }
            
            mimeType = (fileInfo as any).mimeType || 'application/octet-stream';
            
            console.log('📱 Información del archivo obtenida:', {
              exists: fileInfo.exists,
              size: fileInfo.size,
              mimeType,
              uri: fileUri.substring(0, 50) + '...'
            });
            
          } catch (fsError: any) {
            console.error('❌ Error en operaciones FileSystem:', fsError);
            
            // Proporcionar mensajes de error más específicos
            let errorMessage = 'Error leyendo el archivo: ';
            
            if (fsError.message?.includes('permission')) {
              errorMessage += 'Sin permisos para acceder al archivo. Verifica los permisos de la app.';
            } else if (fsError.message?.includes('not found') || fsError.message?.includes('does not exist')) {
              errorMessage += 'El archivo no fue encontrado. Puede haber sido movido o eliminado.';
            } else if (fsError.message?.includes('corrupted') || fsError.message?.includes('invalid')) {
              errorMessage += 'El archivo parece estar corrupto o en un formato inválido.';
            } else if (fsError.message?.includes('space') || fsError.message?.includes('storage')) {
              errorMessage += 'Espacio insuficiente en el dispositivo para procesar el archivo.';
            } else if (fsError.message?.includes('vacío')) {
              errorMessage += 'El archivo está vacío o no tiene contenido válido.';
            } else {
              errorMessage += fsError.message || 'Error desconocido al acceder al archivo.';
            }
            
            throw new Error(errorMessage);
          }
        }

        // Determinar si es imagen o documento
        const isImage = mimeType.startsWith('image/');
        
        let userMessage: any;
        let requestBody: any;

        if (isImage) {
          // Para imágenes, usar GPT-4o vision
          console.log('📄 Procesando como imagen con GPT-4o vision');
          userMessage = {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extrae el texto completo y detallado de esta imagen. Si es un brief, respeta su estructura y contenido. Si es una conversación, transcríbela tal cual.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Content}`,
                },
              },
            ],
          };
          
          requestBody = {
            model: 'gpt-4o',
            messages: [userMessage],
            max_tokens: 4000,
          };
        } else {
          // Para documentos, usar Document Intelligence API o extraer como texto
          console.log('📄 Procesando como documento de texto');
          
          // Intentar extraer texto directamente si es un formato de texto simple
          let documentText = '';
          
          if (mimeType === 'text/plain') {
            // Para archivos de texto plano, decodificar base64
            documentText = atob(base64Content);
            
            userMessage = {
              role: 'user',
              content: `Analiza el siguiente texto de documento y extrae toda la información relevante manteniendo su estructura:

${documentText}`,
            };
            
            requestBody = {
              model: 'gpt-4o-mini',
              messages: [userMessage],
              max_tokens: 4000,
            };
          } else {
            // Para otros formatos no soportados
            console.log('❌ Formato no soportado:', mimeType);
            throw new Error(`Formato de archivo no soportado: ${mimeType}\n\nFormatos soportados actualmente:\n• Imágenes: JPG, PNG (procesadas con OCR)\n• Texto plano: TXT\n\nPara procesar PDF y DOCX:\n1. Toma una captura de pantalla y súbela como imagen\n2. Copia el texto y pégalo directamente\n3. Convierte a .txt y vuelve a subir`);
          }
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Error de OpenAI API:', { status: response.status, error: errorText });
          throw new Error(`Error de la API (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;

        if (!text) {
          throw new Error('La API no devolvió texto extraído.');
        }

        console.log('✅ Texto extraído del documento:', { textLength: text.length });
        setExtractedText(text);

      } catch (err: any) {
        console.error('❌ Error en el procesamiento del documento:', err);
        setError(err.message || 'Error desconocido al procesar el documento');
      } finally {
        setLoading(false);
      }
    };

    processDocument();

  }, [fileUri, enabled]);

  return { extractedText, loading, error };
}
