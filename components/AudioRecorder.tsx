import { Audio } from 'expo-av';
import React, { useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

interface AudioRecorderProps {
  onAudioRecorded?: (uri: string | null) => void;
  onTranscriptionRequested?: (uri: string) => void;
}

/**
 * Componente para grabar audio usando expo-av.
 * Permite iniciar y detener la grabación, mostrando el estado actual.
 * Llama a onAudioRecorded(uri) cuando termina la grabación.
 */
const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioRecorded,
  onTranscriptionRequested
}: AudioRecorderProps) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const pulseAnimation = new Animated.Value(1);

  const startRecording = async () => {
    try {
      setError(null);
      const { status } = await Audio.requestPermissionsAsync();

      if (status !== 'granted') {
        setError('Se requieren permisos de micrófono para grabar.');
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

      // Animar el botón de grabación
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Contador de duración
      const durationInterval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Guardar el interval para limpiarlo después
      (recording as any).durationInterval = durationInterval;

    } catch (error: any) {
      console.error('Error starting recording:', error);
      setError('No se pudo iniciar la grabación. Verifica los permisos.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      // Limpiar el interval de duración
      if ((recording as any).durationInterval) {
        clearInterval((recording as any).durationInterval);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri || null);
      setRecording(null);
      setIsRecording(false);

      // Detener animación
      pulseAnimation.stopAnimation();
      pulseAnimation.setValue(1);

      // Notificar que se grabó
      if (onAudioRecorded) onAudioRecorded(uri || null);
      
      // Auto-transcribir después de grabar
      if (uri && onTranscriptionRequested) {
        console.log('🚀 Auto-transcribiendo audio grabado...');
        setTimeout(() => {
          onTranscriptionRequested(uri);
        }, 500); // Pequeño delay para mejor UX
      }
    } catch (error: any) {
      console.error('Error stopping recording:', error);
      setError('No se pudo detener la grabación.');
    }
  };

  const handleTranscriptionRequest = () => {
    if (recordedUri && onTranscriptionRequested) {
      const uriLength = recordedUri.length;
      const preview = uriLength > 50 ?
        `${recordedUri.substring(0, 30)}...${recordedUri.substring(uriLength - 20)}` :
        recordedUri;

      console.log('🎤 AudioRecorder: Solicitando transcripción de audio grabado:', {
        length: uriLength,
        preview: preview,
        fullUri: recordedUri
      });
      onTranscriptionRequested(recordedUri);
    } else {
      console.error('❌ AudioRecorder: No se puede transcribir -', {
        hasRecordedUri: !!recordedUri,
        hasCallback: !!onTranscriptionRequested
      });
    }
  };

  const resetRecording = () => {
    setRecordedUri(null);
    setRecordingDuration(0);
    setError(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.recorderCard}>
        <Text style={styles.title}>🎙️ Grabadora de Audio</Text>
        <Text style={styles.subtitle}>Graba tu reunión o notas para generar un brief profesional</Text>

        <View style={styles.recordingArea}>
          <Animated.View style={[styles.recordButton, { transform: [{ scale: pulseAnimation }] }]}>
            <Pressable
              onPress={isRecording ? stopRecording : startRecording}
              style={[styles.recordButtonInner, isRecording ? styles.recordingActive : styles.recordingInactive]}
            >
              <Text style={styles.recordButtonIcon}>
                {isRecording ? '⏹️' : '🎙️'}
              </Text>
            </Pressable>
          </Animated.View>

          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              {isRecording ? 'Grabando...' : recordedUri ? 'Grabación completada' : 'Listo para grabar'}
            </Text>

            {isRecording && (
              <Text style={styles.durationText}>
                {formatDuration(recordingDuration)}
              </Text>
            )}

            {recordedUri && !isRecording && (
              <View style={styles.processingContainer}>
                <Text style={styles.successText}>
                  ✅ Procesando audio...
                </Text>
                <Text style={styles.processingSubtext}>
                  Transcripción automática en progreso
                </Text>
              </View>
            )}
          </View>
        </View>

        {recordedUri && !isRecording && (
          <View style={styles.actionContainer}>
            <Pressable
              style={styles.resetButton}
              onPress={resetRecording}
            >
              <Text style={styles.resetButtonText}>🔄 Nueva Grabación</Text>
            </Pressable>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {error}</Text>
          </View>
        )}

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>💡 Consejos:</Text>
          <Text style={styles.instructionsText}>• Tiempo máximo de grabación: 8 minutos</Text>
          <Text style={styles.instructionsText}>• Para análisis más largos, sube texto o archivo manualmente</Text>
          <Text style={styles.instructionsText}>• Habla claro y con volumen normal</Text>
          <Text style={styles.instructionsText}>• Menciona objetivos, audiencia y presupuesto</Text>
          <Text style={styles.instructionsText}>• Incluye detalles sobre canales y timelines</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  recorderCard: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 32,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  recordingArea: {
    alignItems: 'center',
    marginBottom: 24,
  },
  recordButton: {
    marginBottom: 16,
  },
  recordButtonInner: {
    width: 100,
    height: 100,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  recordingInactive: {
    backgroundColor: '#000000',
  },
  recordingActive: {
    backgroundColor: '#FFD700',
  },
  recordButtonIcon: {
    fontSize: 40,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  durationText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFD700',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  successText: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  errorContainer: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 20,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    gap: 12,
  },
  transcribeButton: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 0,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  transcribeButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  resetButton: {
    backgroundColor: '#000000',
    borderRadius: 0,
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  processingContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  processingSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  instructionsContainer: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 20,
    marginTop: 32,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  instructionsText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 6,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default AudioRecorder;