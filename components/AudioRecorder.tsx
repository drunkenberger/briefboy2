import { Audio } from 'expo-av';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, Animated } from 'react-native';

interface AudioRecorderProps {
  onAudioRecorded?: (uri: string | null) => void;
}

/**
 * Componente para grabar audio usando expo-av.
 * Permite iniciar y detener la grabación, mostrando el estado actual.
 * Llama a onAudioRecorded(uri) cuando termina la grabación.
 */
const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioRecorded }) => {
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
      
      if (onAudioRecorded) onAudioRecorded(uri || null);
    } catch (error: any) {
      console.error('Error stopping recording:', error);
      setError('No se pudo detener la grabación.');
    }
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
              <Text style={styles.successText}>
                ✅ Audio guardado correctamente
              </Text>
            )}
          </View>
        </View>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {error}</Text>
          </View>
        )}
        
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>💡 Consejos:</Text>
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
    marginVertical: 16,
    width: '100%',
  },
  recorderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  recordingArea: {
    alignItems: 'center',
    marginBottom: 24,
  },
  recordButton: {
    marginBottom: 16,
  },
  recordButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  recordingInactive: {
    backgroundColor: '#2563eb',
  },
  recordingActive: {
    backgroundColor: '#dc2626',
  },
  recordButtonIcon: {
    fontSize: 32,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  durationText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#dc2626',
    fontFamily: 'monospace',
  },
  successText: {
    fontSize: 16,
    color: '#16a34a',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '500',
  },
  instructionsContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1e40af',
    marginBottom: 4,
  },
});

export default AudioRecorder;