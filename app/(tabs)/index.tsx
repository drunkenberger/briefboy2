import React, { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Alert, ActivityIndicator } from 'react-native';
import AudioRecorder from '../../components/AudioRecorder';
import BriefResult from '../../components/BriefResult';
import StructuredBriefImprovementModal from '../../components/StructuredBriefImprovementModal';
import ProfessionalBriefDisplay from '../../components/ProfessionalBriefDisplay';
import TranscriptionResult from '../../components/TranscriptionResult';
import BriefValidationAlert from '../../components/BriefValidationAlert';
import FileUploadButton from '../../components/FileUploadButton';
import { useBriefGeneration } from '../../hooks/useBriefGeneration';
import { useBriefStorage } from '../../hooks/useBriefStorage';
import { useWhisperTranscription } from '../../hooks/useWhisperTranscription';
import { checkApiKeysOnStartup } from '../../utils/apiKeyValidator';

/**
 * Pantalla principal: grabar audio y mostrar transcripción automática.
 */
const AudioToTextScreen: React.FC = () => {
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [improvedBrief, setImprovedBrief] = useState<any | null>(null);
  const [iaSuggestions, setIaSuggestions] = useState<string | null>(null);
  const [useNewDisplay, setUseNewDisplay] = useState(true);
  const [currentBriefId, setCurrentBriefId] = useState<string | null>(null);
  const [manualTranscription, setManualTranscription] = useState<string | null>(null);
  const [isFromFile, setIsFromFile] = useState(false);

  // Hook de transcripción automática (solo si hay audio)
  const { transcription: autoTranscription, loading, error } = useWhisperTranscription(
    audioUri,
    !!audioUri
  );

  // Usar transcripción manual (desde archivo) o automática (desde grabación)
  const transcription = manualTranscription || autoTranscription;

  // Debug logging para transcripciones
  useEffect(() => {
    console.log('📝 Estado de transcripciones:', {
      manualTranscription: manualTranscription ? manualTranscription.substring(0, 50) + '...' : 'null',
      autoTranscription: autoTranscription ? autoTranscription.substring(0, 50) + '...' : 'null',
      finalTranscription: transcription ? transcription.substring(0, 50) + '...' : 'null',
      loading,
      error,
      audioUri: audioUri ? audioUri.substring(0, 50) + '...' : 'null'
    });
  }, [manualTranscription, autoTranscription, transcription, loading, error, audioUri]);

  // Hook de generación de brief - SOLO después de que termine la transcripción
  const shouldGenerateBrief = !!transcription && !loading;
  const { brief, loading: loadingBrief, error: errorBrief } = useBriefGeneration(transcription, shouldGenerateBrief);
  const briefToShow = improvedBrief || brief;
  const iaSuggestionsToShow = improvedBrief ? iaSuggestions : null;

  // Hook de almacenamiento
  const { saveBrief, updateBrief } = useBriefStorage();

  // Verificar API keys en desarrollo
  useEffect(() => {
    checkApiKeysOnStartup();
  }, []);

  // Recibe la URI del audio grabado desde el componente hijo
  const handleAudioRecorded = (uri: string | null) => {
    console.log('🎤 handleAudioRecorded: Recibida URI de audio:', uri ? uri.substring(0, 100) + '...' : 'null');

    // Solo guardamos la URI, no iniciamos transcripción automática
    setAudioUri(null); // No activamos el hook automáticamente
    // Reset previous results
    setImprovedBrief(null);
    setIaSuggestions(null);
    setCurrentBriefId(null);
    setManualTranscription(null);
    setIsFromFile(false);
  };

  // Maneja la solicitud de transcripción del audio grabado
  const handleTranscriptionRequested = (uri: string) => {
    console.log('🎤 index.tsx: handleTranscriptionRequested recibida:', uri.substring(0, 100) + '...');

    // Reset estado previo
    setImprovedBrief(null);
    setIaSuggestions(null);
    setCurrentBriefId(null);
    setManualTranscription(null);
    setIsFromFile(false);

    // Activar transcripción
    console.log('🎤 index.tsx: Configurando audioUri para activar hook');
    setAudioUri(uri);
  };

  // Maneja la transcripción desde archivo de texto/documento
  const handleFileTranscription = (fileTranscription: string) => {
    console.log('📥 handleFileTranscription: Recibida transcripción de archivo:', fileTranscription.substring(0, 100) + '...');

    // Reset estado previo
    setAudioUri(null);
    setImprovedBrief(null);
    setIaSuggestions(null);
    setCurrentBriefId(null);

    // Establecer transcripción desde archivo
    setManualTranscription(fileTranscription);
    setIsFromFile(true);
  };



  // Guardar brief automáticamente cuando esté listo
  useEffect(() => {
    if (brief && transcription && !loadingBrief && !errorBrief) {
      const autoSave = async () => {
        try {
          const title = brief.projectTitle || `Brief ${new Date().toLocaleDateString()}`;
          const briefId = await saveBrief(title, transcription, brief, audioUri || undefined);
          setCurrentBriefId(briefId);
          console.log('Brief guardado automáticamente:', briefId);
        } catch (error) {
          console.error('Error auto-saving brief:', error);
          // No mostrar error al usuario para el auto-save, solo loggear
        }
      };
      autoSave();
    }
  }, [brief, transcription, loadingBrief, errorBrief, audioUri, saveBrief]);

  // Actualizar brief guardado cuando se mejore
  useEffect(() => {
    if (improvedBrief && currentBriefId) {
      const updateSaved = async () => {
        try {
          await updateBrief(currentBriefId, {
            brief: improvedBrief,
            title: improvedBrief.projectTitle || `Brief ${new Date().toLocaleDateString()}`,
          });
          console.log('Brief actualizado automáticamente:', currentBriefId);
        } catch (error) {
          console.error('Error updating saved brief:', error);
          // No mostrar error al usuario para el auto-update, solo loggear
        }
      };
      updateSaved();
    }
  }, [improvedBrief, currentBriefId, updateBrief]);

  const handleManualSave = () => {
    if (briefToShow) {
      Alert.prompt(
        'Guardar Brief',
        'Ingresa un título para este brief:',
        async (title) => {
          if (title) {
            try {
              const briefId = await saveBrief(title, transcription || '', briefToShow, audioUri || undefined);
              Alert.alert('✅ Guardado', `Brief "${title}" guardado exitosamente`);
              if (!currentBriefId) {
                setCurrentBriefId(briefId);
              }
            } catch (saveError) {
              console.error('Error saving brief:', saveError);
              Alert.alert(
                '❌ Error al Guardar',
                saveError instanceof Error ? saveError.message : 'No se pudo guardar el brief. Intenta nuevamente.',
                [
                  { text: 'Reintentar', onPress: () => handleManualSave() },
                  { text: 'Cancelar', style: 'cancel' }
                ]
              );
            }
          }
        },
        'plain-text',
        briefToShow.projectTitle || `Brief ${new Date().toLocaleDateString()}`
      );
    } else {
      Alert.alert(
        '⚠️ Sin Brief',
        'No hay un brief disponible para guardar. Graba un audio primero.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.appTitle}>📊 BriefBoy</Text>
          <Text style={styles.appSubtitle}>Generador de Briefs Publicitarios con IA</Text>
        </View>

        <AudioRecorder
          onAudioRecorded={handleAudioRecorded}
          onTranscriptionRequested={handleTranscriptionRequested}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>O</Text>
          <View style={styles.dividerLine} />
        </View>

        <FileUploadButton
          onTranscriptionComplete={handleFileTranscription}
          isLoading={loading || loadingBrief}
        />

        <TranscriptionResult
          loading={loading}
          error={error}
          transcription={transcription}
          isFromFile={isFromFile}
        />

        {transcription && !brief && loadingBrief && !loading && (
          <View style={styles.briefGenerationContainer}>
            <View style={styles.briefGenerationCard}>
              <ActivityIndicator size="large" color="#9333ea" />
              <Text style={styles.briefGenerationTitle}>Generando Brief...</Text>
              <Text style={styles.briefGenerationSubtitle}>
                IA analizando la transcripción y creando el brief publicitario
              </Text>
              {isFromFile && (
                <Text style={styles.fileIndicator}>
                  📁 Procesando contenido de archivo subido
                </Text>
              )}
            </View>
          </View>
        )}

        {transcription && errorBrief && (
          <View style={styles.briefGenerationContainer}>
            <View style={styles.briefGenerationCard}>
              <Text style={styles.errorIcon}>❌</Text>
              <Text style={styles.briefGenerationErrorTitle}>Error generando brief</Text>
              <Text style={styles.briefGenerationErrorText}>{errorBrief}</Text>
            </View>
          </View>
        )}

        {briefToShow && !loadingBrief && !errorBrief && (
          <BriefValidationAlert
            brief={briefToShow}
            onComplete={(completedBrief) => {
              setImprovedBrief(completedBrief);
              Alert.alert('✅ Completado', 'El brief ha sido completado automáticamente con contenido generado.');
            }}
          />
        )}

        {useNewDisplay ? (
          <ProfessionalBriefDisplay
            brief={briefToShow}
            loading={loadingBrief}
            error={errorBrief}
          />
        ) : (
          <BriefResult
            brief={briefToShow}
            loading={loadingBrief}
            error={errorBrief}
            iaSuggestions={iaSuggestionsToShow}
          />
        )}

        {brief && !loadingBrief && !errorBrief && (
          <View style={styles.actionsContainer}>
            <Pressable
              style={styles.improveButton}
              onPress={() => setShowChatModal(true)}
            >
              <Text style={styles.improveButtonText}>🔄 Mejora Estructurada</Text>
            </Pressable>

            <Pressable
              style={styles.toggleButton}
              onPress={() => setUseNewDisplay(!useNewDisplay)}
            >
              <Text style={styles.toggleButtonText}>
                {useNewDisplay ? '🔄 Vista Clásica' : '🎆 Vista Profesional'}
              </Text>
            </Pressable>
          </View>
        )}

        {briefToShow && (
          <View style={styles.saveContainer}>
            <Pressable
              style={styles.saveButton}
              onPress={handleManualSave}
            >
              <Text style={styles.saveButtonText}>
                {currentBriefId ? '💾 Guardar Copia' : '💾 Guardar Brief'}
              </Text>
            </Pressable>
            {currentBriefId && (
              <Text style={styles.autoSaveText}>
                ✅ Guardado automáticamente
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      <StructuredBriefImprovementModal
        visible={showChatModal}
        brief={brief}
        onClose={() => setShowChatModal(false)}
        onBriefImproved={b => { setImprovedBrief(b); }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
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
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  improveButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  improveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
  saveContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  autoSaveText: {
    fontSize: 14,
    color: '#16a34a',
    marginTop: 8,
    fontStyle: 'italic',
  },
  briefGenerationContainer: {
    marginTop: 16,
    width: '100%',
  },
  briefGenerationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#9333ea',
  },
  briefGenerationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 4,
  },
  briefGenerationSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  briefGenerationErrorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  briefGenerationErrorText: {
    fontSize: 14,
    color: '#991b1b',
    textAlign: 'center',
    lineHeight: 18,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  fileIndicator: {
    fontSize: 12,
    color: '#7c3aed',
    marginTop: 8,
    fontWeight: '500',
  },
});

export default AudioToTextScreen;