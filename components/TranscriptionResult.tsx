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
            <ActivityIndicator size="large" color="#2563eb" />
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 4,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#64748b',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: '#991b1b',
    textAlign: 'center',
    lineHeight: 20,
  },
  transcriptionContainer: {
    width: '100%',
  },
  transcriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  transcriptionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  transcriptionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  transcriptionContent: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transcriptionText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
  transcriptionFooter: {
    alignItems: 'center',
  },
  transcriptionMeta: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  fileIndicator: {
    fontSize: 12,
    color: '#7c3aed',
    marginTop: 8,
    fontWeight: '500',
  },
});

export default TranscriptionResult;