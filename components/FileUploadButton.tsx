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
        <Text style={styles.dividerText}>○ O ○</Text>
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
      
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Consejos para mejores resultados:</Text>
        <Text style={styles.tipsText}>• Incluye contexto sobre la marca o producto</Text>
        <Text style={styles.tipsText}>• Describe objetivos específicos y métricas</Text>
        <Text style={styles.tipsText}>• Menciona audiencia target y insights</Text>
        <Text style={styles.tipsText}>• Agrega información sobre presupuesto y timeline</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  button: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 0,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#000000',
    opacity: 0.6,
    borderColor: '#FFFFFF',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  helpText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  supportedFormats: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 0,
    marginTop: 16,
  },
  formatTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  formatText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 4,
    fontWeight: '700',
  },
  formatNote: {
    fontSize: 11,
    color: '#FFD700',
    marginTop: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  actionButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 0,
    marginTop: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  selectedFileInfo: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 0,
    marginTop: 12,
    marginBottom: 12,
  },
  selectedFileName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  selectedFileType: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  divider: {
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerText: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  textInputSection: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 20,
    marginBottom: 20,
  },
  textInputTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 0,
    padding: 16,
    fontSize: 14,
    color: '#FFFFFF',
    backgroundColor: '#000000',
    minHeight: 120,
    textAlignVertical: 'top',
    fontWeight: '700',
  },
  processTextButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 0,
    marginTop: 16,
    alignItems: 'center',
  },
  processTextButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  errorContainer: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 20,
    marginVertical: 16,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  errorMessage: {
    fontSize: 14,
    color: '#FFD700',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '700',
  },
  errorButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 0,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  errorButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  errorDetailsContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  errorSectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFD700',
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  errorBullet: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
    marginBottom: 4,
    lineHeight: 20,
    fontWeight: '700',
  },
  errorOption: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
    marginBottom: 6,
    lineHeight: 20,
    fontWeight: '700',
  },
  tipsContainer: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 0,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tipsText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 4,
    fontWeight: '700',
  },
});

export default FileUploadButton;