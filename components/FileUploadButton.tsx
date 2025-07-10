import React, { useState, useEffect } from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  View, 
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useWhisperTranscription } from '../hooks/useWhisperTranscription';
import { useDocumentProcessor } from '../hooks/useDocumentProcessor';

interface FileUploadButtonProps {
  onTranscriptionComplete: (transcription: string) => void;
  isLoading?: boolean;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ 
  onTranscriptionComplete,
  isLoading = false 
}) => {
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'audio' | 'document' | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [readyToProcess, setReadyToProcess] = useState(false);
  const [directText, setDirectText] = useState<string>('');

  const { transcription, loading: whisperLoading, error: whisperError } = useWhisperTranscription(
    fileType === 'audio' ? fileUri : null,
    fileType === 'audio' && readyToProcess && !!fileUri
  );
  const { extractedText, loading: docLoading, error: docError } = useDocumentProcessor(
    fileType === 'document' ? fileUri : null,
    fileType === 'document' && readyToProcess && !!fileUri,
    fileName
  );

  const loading = isLoading || whisperLoading || docLoading;
  const error = whisperError || docError;

  // Debug logging para el estado del componente
  useEffect(() => {
    console.log('📊 FileUploadButton: Estado actual:', {
      hasFileUri: !!fileUri,
      fileType,
      fileName,
      readyToProcess,
      whisperLoading,
      docLoading,
      hasTranscription: !!transcription,
      hasExtractedText: !!extractedText,
      hasError: !!error
    });
  }, [fileUri, fileType, fileName, readyToProcess, whisperLoading, docLoading, transcription, extractedText, error]);

  useEffect(() => {
    if (transcription) {
      console.log('📤 FileUploadButton: Transcripción de audio completada:', transcription.substring(0, 100) + '...');
      onTranscriptionComplete(transcription);
      resetState();
    }
  }, [transcription]);

  useEffect(() => {
    if (extractedText) {
      console.log('📤 FileUploadButton: Extracción de documento completada:', extractedText.substring(0, 100) + '...');
      onTranscriptionComplete(extractedText);
      resetState();
    }
  }, [extractedText]);

  useEffect(() => {
    if (error) {
      console.log('🚨 FileUploadButton: Mostrando error al usuario:', error);
      
      // Limpiar el mensaje de error para mejor presentación
      let cleanError = error;
      if (error.includes('PDF y DOCX')) {
        cleanError = 'Los archivos PDF y DOCX no pueden ser procesados directamente.\n\n' +
          'Opciones disponibles:\n\n' +
          '1. 📸 Toma una captura de pantalla del documento y súbela como imagen\n\n' +
          '2. 📝 Copia el texto del documento y pégalo en el campo "Pegar texto directamente"\n\n' +
          '3. 💾 Guarda el documento como archivo .txt y vuelve a subirlo';
      }
      
      Alert.alert(
        '⚠️ Formato no soportado', 
        cleanError, 
        [
          { text: 'Entendido', onPress: resetState, style: 'default' }
        ],
        { cancelable: false }
      );
    }
  }, [error]);

  const resetState = () => {
    setFileUri(null);
    setFileType(null);
    setFileName('');
    setReadyToProcess(false);
    setDirectText('');
  };

  const handleProcessDirectText = () => {
    if (directText.trim()) {
      console.log('📝 FileUploadButton: Procesando texto directo:', directText.substring(0, 100) + '...');
      onTranscriptionComplete(directText.trim());
      setDirectText('');
    } else {
      Alert.alert('Texto requerido', 'Por favor ingresa el texto que deseas analizar.');
    }
  };

  const handleStartProcessing = () => {
    console.log('🔍 FileUploadButton: handleStartProcessing llamado', {
      hasFileUri: !!fileUri,
      fileType,
      fileName,
      currentReadyToProcess: readyToProcess
    });
    
    if (fileUri && fileType) {
      console.log('🚀 FileUploadButton: Iniciando procesamiento manual:', { 
        fileType, 
        fileName, 
        fileUri: fileUri.substring(0, 100) + '...',
        readyToProcess: false 
      });
      setReadyToProcess(true);
      console.log('🚀 FileUploadButton: Estado actualizado a readyToProcess = true');
    } else {
      console.error('❌ FileUploadButton: No se puede procesar -', { 
        hasFileUri: !!fileUri, 
        fileType, 
        fileName 
      });
      Alert.alert('Error', 'No hay archivo seleccionado para procesar.');
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const maxSize = 25 * 1024 * 1024; // 25MB

      if (file.size && file.size > maxSize) {
        Alert.alert('Archivo muy grande', 'El archivo debe ser menor a 25MB.');
        return;
      }

      setFileName(file.name);
      setFileUri(file.uri);

      if (file.mimeType?.startsWith('audio/') || file.mimeType?.startsWith('video/')) {
        setFileType('audio');
      } else {
        setFileType('document');
      }

    } catch (err) {
      Alert.alert('Error', 'No se pudo seleccionar el archivo.');
      console.error(err);
    }
  };

  const getStateText = () => {
    if (whisperLoading) return `Transcribiendo ${fileName}...`;
    if (docLoading) return `Procesando ${fileName}...`;
    if (loading) return 'Cargando...';
    if (fileUri && !readyToProcess) return 'Archivo seleccionado';
    return 'Subir archivo';
  };

  const getActionButtonText = () => {
    if (fileType === 'audio') return '🎤 Transcribir Audio';
    if (fileType === 'document') return '📄 Analizar Documento';
    return '🔍 Procesar Archivo';
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleFilePick}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" style={styles.icon} />
        ) : (
          <Text style={styles.icon}>📁</Text>
        )}
        <Text style={styles.buttonText}>{getStateText()}</Text>
      </Pressable>
      
      {fileUri && !readyToProcess && !loading && (
        <Pressable
          style={[styles.actionButton]}
          onPress={() => {
            console.log('👆 FileUploadButton: Botón presionado -', {
              fileUri: fileUri?.substring(0, 50) + '...',
              fileType,
              readyToProcess,
              loading
            });
            handleStartProcessing();
          }}
        >
          <Text style={styles.actionButtonText}>{getActionButtonText()}</Text>
        </Pressable>
      )}
      
      {fileUri && !readyToProcess && (
        <View style={styles.selectedFileInfo}>
          <Text style={styles.selectedFileName}>✅ {fileName}</Text>
          <Text style={styles.selectedFileType}>
            {fileType === 'audio' ? '🎵 Audio' : '📄 Documento'}
          </Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Formato no soportado</Text>
          {error.includes('PDF y DOCX') ? (
            <View style={styles.errorDetailsContainer}>
              <Text style={styles.errorSectionTitle}>Formatos soportados actualmente:</Text>
              <Text style={styles.errorBullet}>• Imágenes: JPG, PNG (procesadas con OCR)</Text>
              <Text style={styles.errorBullet}>• Texto plano: TXT</Text>
              
              <Text style={styles.errorSectionTitle}>Para procesar PDF y DOCX:</Text>
              <Text style={styles.errorOption}>1. Toma una captura de pantalla y súbela como imagen</Text>
              <Text style={styles.errorOption}>2. Copia el texto y pégalo directamente</Text>
              <Text style={styles.errorOption}>3. Convierte a .txt y vuelve a subir</Text>
            </View>
          ) : (
            <Text style={styles.errorMessage}>{error}</Text>
          )}
          <Pressable 
            style={styles.errorButton}
            onPress={resetState}
          >
            <Text style={styles.errorButtonText}>Intentar de nuevo</Text>
          </Pressable>
        </View>
      )}
      
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>O</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.textInputSection}>
        <Text style={styles.textInputTitle}>📝 Pegar texto directamente</Text>
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={6}
          placeholder="Pega aquí el texto de tu reunión, conversación o documento para generar un brief..."
          placeholderTextColor="#9ca3af"
          value={directText}
          onChangeText={setDirectText}
          textAlignVertical="top"
        />
        {directText.trim().length > 0 && (
          <Pressable
            style={styles.processTextButton}
            onPress={handleProcessDirectText}
            disabled={loading}
          >
            <Text style={styles.processTextButtonText}>🚀 Analizar Texto</Text>
          </Pressable>
        )}
      </View>
      
      <Text style={styles.helpText}>
        Sube un archivo o pega texto directamente para transcribir
      </Text>
      
      <View style={styles.supportedFormats}>
        <Text style={styles.formatTitle}>Formatos soportados:</Text>
        <Text style={styles.formatText}>• Audio: MP3, WAV, M4A (transcripción automática)</Text>
        <Text style={styles.formatText}>• Video: MP4, MOV, AVI (transcripción automática)</Text>
        <Text style={styles.formatText}>• Texto: TXT, RTF (extracción directa)</Text>
        <Text style={styles.formatText}>• Word: DOCX (extracción con IA)</Text>
        <Text style={styles.formatText}>• PDF: Extracción con IA</Text>
        <Text style={styles.formatNote}>Tamaño máximo: 25MB • Compatible con web y móvil</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  button: {
    backgroundColor: '#9333ea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 8,
  },
  buttonDisabled: {
    backgroundColor: '#a78bfa',
    opacity: 0.8,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  supportedFormats: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formatTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  formatText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  formatNote: {
    fontSize: 11,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedFileInfo: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  selectedFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 4,
  },
  selectedFileType: {
    fontSize: 12,
    color: '#0369a1',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  textInputSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textInputTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#f9fafb',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  processTextButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  processTextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#991b1b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  errorButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorDetailsContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  errorSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f1d1d',
    marginTop: 12,
    marginBottom: 6,
  },
  errorBullet: {
    fontSize: 13,
    color: '#991b1b',
    marginLeft: 8,
    marginBottom: 3,
    lineHeight: 18,
  },
  errorOption: {
    fontSize: 13,
    color: '#991b1b',
    marginLeft: 8,
    marginBottom: 4,
    lineHeight: 18,
  },
});

export default FileUploadButton;