import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface TranscriptionResultProps {
  loading: boolean;
  error: string | null;
  transcription: string | null;
  isFromFile?: boolean;
}

/**
 * Muestra el resultado de la transcripción de audio: estado, texto o error.
 * @param loading Estado de carga
 * @param error Mensaje de error (si existe)
 * @param transcription Texto transcrito (si existe)
 * @param isFromFile Si la transcripción viene de un archivo subido
 */
const TranscriptionResult: React.FC<TranscriptionResultProps> = ({ loading, error, transcription, isFromFile = false }) => {
  if (!loading && !error && !transcription) {
    return null; // No mostrar nada si no hay contenido
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingTitle}>
              {isFromFile ? 'Procesando archivo...' : 'Transcribiendo audio...'}
            </Text>
            <Text style={styles.loadingSubtitle}>
              {isFromFile ? 'Extrayendo contenido del archivo' : 'Procesando con Whisper AI'}
            </Text>
          </View>
        )}
        
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>❌</Text>
            <Text style={styles.errorTitle}>Error de transcripción</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {transcription && !loading && !error && (
          <View style={styles.transcriptionContainer}>
            <View style={styles.transcriptionHeader}>
              <Text style={styles.transcriptionIcon}>{isFromFile ? '📁' : '📝'}</Text>
              <Text style={styles.transcriptionTitle}>
                Transcripción Completada {isFromFile ? '(desde archivo)' : ''}
              </Text>
            </View>
            <View style={styles.transcriptionContent}>
              <Text style={styles.transcriptionText}>{transcription}</Text>
            </View>
            <View style={styles.transcriptionFooter}>
              <Text style={styles.transcriptionMeta}>
                {transcription.length} caracteres • ~{Math.ceil(transcription.split(' ').length / 150)} min lectura
              </Text>
              {isFromFile && (
                <Text style={styles.fileIndicator}>
                  📁 Transcrito desde archivo subido
                </Text>
              )}
            </View>
            
            <View style={styles.transcriptionTips}>
              <Text style={styles.transcriptionTipsTitle}>💡 Siguiente paso:</Text>
              <Text style={styles.transcriptionTipsText}>
                La IA está generando tu brief con esta transcripción. Para mejores resultados, revisa que el texto contenga información sobre objetivos, audiencia y presupuesto.
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    width: '100%',
  },
  card: {
    backgroundColor: '#000000',
    borderWidth: 4,
    borderColor: '#FFD700',
    padding: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '700',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  errorText: {
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '700',
  },
  transcriptionContainer: {
    width: '100%',
  },
  transcriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  transcriptionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  transcriptionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  transcriptionContent: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  transcriptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    fontWeight: '700',
  },
  transcriptionFooter: {
    alignItems: 'center',
  },
  transcriptionMeta: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '700',
  },
  fileIndicator: {
    fontSize: 12,
    color: '#FFD700',
    marginTop: 8,
    fontWeight: '700',
  },
  transcriptionTips: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 16,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  transcriptionTipsTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  transcriptionTipsText: {
    fontSize: 12,
    color: '#FFFFFF',
    lineHeight: 18,
    fontWeight: '700',
  },
});

export default TranscriptionResult;