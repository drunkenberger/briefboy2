import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Animated,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { useFileProcessor } from '../hooks/useFileProcessor';

interface UnifiedInputProps {
  onContentReady: (content: string, type: 'audio' | 'text' | 'file', audioUri?: string) => void;
  isProcessing?: boolean;
}

type InputMode = 'selection' | 'audio' | 'text' | 'file';

const UnifiedInput: React.FC<UnifiedInputProps> = ({ onContentReady, isProcessing = false }) => {
  const [mode, setMode] = useState<InputMode>('selection');
  const [textInput, setTextInput] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [fileName, setFileName] = useState('');
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [processingFile, setProcessingFile] = useState(false);

  // File processor hook
  const { 
    processedContent, 
    loading: fileLoading, 
    error: fileError,
    reset: resetFileProcessor
  } = useFileProcessor({
    fileUri,
    fileName,
    enabled: processingFile,
  });
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const recordPulse = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in animation when mode changes
    if (mode !== 'selection') {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }
  }, [mode, slideAnim]);

  const animatePress = (callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Se requieren permisos de micrófono para grabar.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordPulse, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(recordPulse, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Duration counter
      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      (recording as any).durationInterval = interval;

    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      if ((recording as any).durationInterval) {
        clearInterval((recording as any).durationInterval);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      recordPulse.stopAnimation();
      recordPulse.setValue(1);
      
      setRecording(null);
      setIsRecording(false);

      if (uri) {
        // Auto-transcribe
        onContentReady('', 'audio', uri);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      animatePress(() => {
        onContentReady(textInput.trim(), 'text');
      });
    }
  };

  // Handle file processing completion
  useEffect(() => {
    if (processedContent && !fileLoading) {
      onContentReady(processedContent, 'file');
      resetFileState();
    }
  }, [processedContent, fileLoading]);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        setFileName(file.name);
        setFileUri(file.uri);
        setProcessingFile(true);
      }
    } catch (error) {
      console.error('Error picking file:', error);
    }
  };

  const resetFileState = () => {
    setFileUri(null);
    setFileName('');
    setProcessingFile(false);
    resetFileProcessor();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isProcessing || fileLoading) {
    return (
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
        <Text style={styles.processingText}>
          {fileLoading ? `Procesando ${fileName}...` : 'Procesando...'}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {mode === 'selection' && (
        <Animated.View style={[styles.selectionContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>¿Cómo quieres crear tu brief?</Text>
          <Text style={styles.subtitle}>Elige el método que prefieras</Text>

          <View style={styles.optionsGrid}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Pressable
                style={styles.optionCard}
                onPress={() => animatePress(() => setMode('audio'))}
              >
                <View style={styles.optionIcon}>
                  <Text style={styles.optionEmoji}>🎙️</Text>
                </View>
                <Text style={styles.optionTitle}>Grabar Audio</Text>
                <Text style={styles.optionDescription}>
                  Habla libremente sobre tu proyecto
                </Text>
              </Pressable>
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Pressable
                style={styles.optionCard}
                onPress={() => animatePress(() => setMode('text'))}
              >
                <View style={styles.optionIcon}>
                  <Text style={styles.optionEmoji}>✍️</Text>
                </View>
                <Text style={styles.optionTitle}>Escribir Texto</Text>
                <Text style={styles.optionDescription}>
                  Pega o escribe tu contenido
                </Text>
              </Pressable>
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Pressable
                style={styles.optionCard}
                onPress={() => animatePress(() => setMode('file'))}
              >
                <View style={styles.optionIcon}>
                  <Text style={styles.optionEmoji}>📄</Text>
                </View>
                <Text style={styles.optionTitle}>Subir Archivo</Text>
                <Text style={styles.optionDescription}>
                  Documentos, audio o imágenes
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>
      )}

      {mode === 'audio' && (
        <Animated.View style={[
          styles.inputContainer,
          {
            opacity: slideAnim,
            transform: [{ translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })}],
          }
        ]}>
          <Pressable
            style={styles.backButton}
            onPress={() => animatePress(() => setMode('selection'))}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </Pressable>

          <View style={styles.audioContainer}>
            <Text style={styles.modeTitle}>Grabación de Audio</Text>
            <Text style={styles.modeSubtitle}>
              Describe tu proyecto, objetivos y detalles importantes
            </Text>

            <Animated.View style={[
              styles.recordButton,
              { transform: [{ scale: recordPulse }] }
            ]}>
              <Pressable
                onPress={isRecording ? stopRecording : startRecording}
                style={[
                  styles.recordButtonInner,
                  isRecording && styles.recordingActive
                ]}
              >
                <Text style={styles.recordIcon}>
                  {isRecording ? '⏹' : '🎙️'}
                </Text>
              </Pressable>
            </Animated.View>

            {isRecording && (
              <View style={styles.recordingInfo}>
                <Text style={styles.recordingText}>Grabando...</Text>
                <Text style={styles.recordingDuration}>
                  {formatDuration(recordingDuration)}
                </Text>
              </View>
            )}

            <View style={styles.audioTips}>
              <Text style={styles.tipsTitle}>💡 Tips para mejor resultado:</Text>
              <Text style={styles.tipText}>• Menciona el nombre del proyecto</Text>
              <Text style={styles.tipText}>• Describe objetivos claros</Text>
              <Text style={styles.tipText}>• Incluye audiencia target</Text>
              <Text style={styles.tipText}>• Habla sobre presupuesto y timeline</Text>
            </View>
          </View>
        </Animated.View>
      )}

      {mode === 'text' && (
        <Animated.View style={[
          styles.inputContainer,
          {
            opacity: slideAnim,
            transform: [{ translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })}],
          }
        ]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Pressable
              style={styles.backButton}
              onPress={() => animatePress(() => setMode('selection'))}
            >
              <Text style={styles.backButtonText}>← Volver</Text>
            </Pressable>

            <View style={styles.textContainer}>
              <Text style={styles.modeTitle}>Escribir o Pegar Texto</Text>
              <Text style={styles.modeSubtitle}>
                Pega contenido de reuniones, emails o notas
              </Text>

              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={10}
                placeholder="Pega aquí tu texto o empieza a escribir..."
                placeholderTextColor="#9CA3AF"
                value={textInput}
                onChangeText={setTextInput}
                textAlignVertical="top"
              />

              <Text style={styles.charCount}>
                {textInput.length} caracteres
              </Text>

              <Pressable
                style={[
                  styles.submitButton,
                  !textInput.trim() && styles.submitButtonDisabled
                ]}
                onPress={handleTextSubmit}
                disabled={!textInput.trim()}
              >
                <Text style={styles.submitButtonText}>
                  Generar Brief →
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      )}

      {mode === 'file' && (
        <Animated.View style={[
          styles.inputContainer,
          {
            opacity: slideAnim,
            transform: [{ translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })}],
          }
        ]}>
          <Pressable
            style={styles.backButton}
            onPress={() => animatePress(() => {
              setMode('selection');
              resetFileState();
            })}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </Pressable>

          <View style={styles.fileContainer}>
            <Text style={styles.modeTitle}>Subir Archivo</Text>
            <Text style={styles.modeSubtitle}>
              Documentos, presentaciones, audio o imágenes
            </Text>

            {fileLoading ? (
              <View style={styles.fileLoadingContainer}>
                <ActivityIndicator size="large" color="#6B7280" />
                <Text style={styles.fileLoadingText}>
                  Procesando {fileName}...
                </Text>
              </View>
            ) : (
              <Pressable
                style={styles.uploadButton}
                onPress={handleFilePick}
              >
                <Text style={styles.uploadIcon}>📁</Text>
                <Text style={styles.uploadText}>
                  {fileName || 'Seleccionar archivo'}
                </Text>
              </Pressable>
            )}

            {fileError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>❌ {fileError}</Text>
                <Pressable
                  style={styles.retryButton}
                  onPress={() => {
                    resetFileState();
                    setMode('selection');
                  }}
                >
                  <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.supportedFormats}>
              <Text style={styles.formatsTitle}>Formatos soportados:</Text>
              <Text style={styles.formatText}>• Audio: MP3, WAV, M4A</Text>
              <Text style={styles.formatText}>• Documentos: TXT, PDF, DOCX</Text>
              <Text style={styles.formatText}>• Imágenes: JPG, PNG</Text>
              <Text style={styles.formatText}>• Tamaño máximo: 25MB</Text>
            </View>
          </View>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  selectionContainer: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
  },
  optionsGrid: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionEmoji: {
    fontSize: 28,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  inputContainer: {
    flex: 1,
    padding: 24,
  },
  backButton: {
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  audioContainer: {
    flex: 1,
    alignItems: 'center',
  },
  modeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  modeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  recordButton: {
    marginBottom: 32,
  },
  recordButtonInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  recordingActive: {
    backgroundColor: '#111827',
  },
  recordIcon: {
    fontSize: 40,
  },
  recordingInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  recordingText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
    marginBottom: 4,
  },
  recordingDuration: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  audioTips: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    lineHeight: 18,
  },
  textContainer: {
    flex: 1,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 200,
    marginBottom: 12,
    fontWeight: '500',
  },
  charCount: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'right',
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fileContainer: {
    flex: 1,
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 40,
    paddingHorizontal: 60,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginBottom: 32,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  supportedFormats: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  formatsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  formatText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    lineHeight: 18,
  },
  fileLoadingContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 40,
    paddingHorizontal: 60,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 32,
  },
  fileLoadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 16,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default UnifiedInput;