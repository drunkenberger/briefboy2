import React, { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import AudioRecorder from '../../components/AudioRecorder';
import BriefResult from '../../components/BriefResult';
import StructuredBriefImprovementModal from '../../components/StructuredBriefImprovementModal';
import ProfessionalBriefDisplay from '../../components/ProfessionalBriefDisplay';
import TranscriptionResult from '../../components/TranscriptionResult';
import BriefValidationAlert from '../../components/BriefValidationAlert';
import { useBriefGeneration } from '../../hooks/useBriefGeneration';
import { useBriefStorage } from '../../hooks/useBriefStorage';
import { useWhisperTranscription } from '../../hooks/useWhisperTranscription';

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

  // Hook de transcripción automática
  const { transcription, loading, error } = useWhisperTranscription(audioUri, !!audioUri);

  // Hook de generación de brief (solo si hay transcripción)
  const { brief, loading: loadingBrief, error: errorBrief } = useBriefGeneration(transcription, !!transcription);
  const briefToShow = improvedBrief || brief;
  const iaSuggestionsToShow = improvedBrief ? iaSuggestions : null;

  // Hook de almacenamiento
  const { saveBrief, updateBrief } = useBriefStorage();

  // Recibe la URI del audio grabado desde el componente hijo
  const handleAudioRecorded = (uri: string | null) => {
    setAudioUri(uri);
    // Reset previous results
    setImprovedBrief(null);
    setIaSuggestions(null);
    setCurrentBriefId(null);
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
        
        <AudioRecorder onAudioRecorded={handleAudioRecorded} />
        
        <TranscriptionResult
          loading={loading}
          error={error}
          transcription={transcription}
        />
        
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
});

export default AudioToTextScreen;
