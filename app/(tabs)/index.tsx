import React, { useState, useEffect, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Alert, ActivityIndicator, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import AudioRecorder from '../../components/AudioRecorder';
import BriefResult from '../../components/BriefResult';
import StructuredBriefImprovementModal from '../../components/StructuredBriefImprovementModal';
import ProfessionalBriefDisplay from '../../components/ProfessionalBriefDisplay';
import TranscriptionResult from '../../components/TranscriptionResult';
import BriefValidationAlert from '../../components/BriefValidationAlert';
import FileUploadButton from '../../components/FileUploadButton';
import FinalBriefEditorModal from '../../components/FinalBriefEditorModal';
import { useBriefGeneration } from '../../hooks/useBriefGeneration';
import { useBriefStorage } from '../../hooks/useBriefStorage';
import { useWhisperTranscription } from '../../hooks/useWhisperTranscription';
import { checkApiKeysOnStartup } from '../../utils/apiKeyValidator';
import { FileExporter, Brief } from '../../utils/fileExporter';

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
  const [showFinalBriefEditor, setShowFinalBriefEditor] = useState(false);

  // Hook de transcripción automática (solo si hay audio)
  const { transcription: autoTranscription, loading, error } = useWhisperTranscription(
    audioUri,
    !!audioUri
  );

  // Usar transcripción manual (desde archivo) o automática (desde grabación)
  const transcription = manualTranscription || autoTranscription;

  // Debug logging para transcripciones - DESACTIVADO TEMPORALMENTE
  /*
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
  */

  // Hook de generación de brief - SOLO después de que termine la transcripción
  const shouldGenerateBrief = !!transcription && !loading;
  const { brief, loading: loadingBrief, error: errorBrief } = useBriefGeneration(transcription, shouldGenerateBrief);
  const briefToShow = improvedBrief || brief;
  const iaSuggestionsToShow = improvedBrief ? iaSuggestions : null;
  
  // Debug logging para estado de briefs - DESACTIVADO TEMPORALMENTE
  /*
  useEffect(() => {
    console.log('📊 Estado de briefs:', {
      brief: brief ? Object.keys(brief).length : 0,
      improvedBrief: improvedBrief ? Object.keys(improvedBrief).length : 0,
      briefToShow: briefToShow ? Object.keys(briefToShow).length : 0,
      briefKeys: brief ? Object.keys(brief) : [],
      improvedBriefKeys: improvedBrief ? Object.keys(improvedBrief) : [],
      briefToShowKeys: briefToShow ? Object.keys(briefToShow) : [],
      timestamp: new Date().toLocaleTimeString()
    });
  }, [brief, improvedBrief, briefToShow]);
  */

  // Hook de almacenamiento
  const { saveBrief, updateBrief, clearOldBriefs, getStorageInfo } = useBriefStorage();

  // Verificar API keys en desarrollo
  useEffect(() => {
    checkApiKeysOnStartup();
  }, []);

  // Función utilitaria para detectar errores de quota de almacenamiento
  const isQuotaExceededError = useCallback((error: any): boolean => {
    if (!error) return false;
    
    // Verificar por nombre de error (método más confiable)
    if (error.name === 'QuotaExceededError') return true;
    
    // Verificar por tipo de error de DOM
    if (error instanceof DOMException && error.name === 'QuotaExceededError') return true;
    
    // Verificar por código de error
    if (error.code === 22) return true; // DOMException.QUOTA_EXCEEDED_ERR
    
    // Verificar mensajes comunes en inglés (fallback)
    const message = error.message?.toLowerCase() || '';
    if (message.includes('quota') || message.includes('storage') || message.includes('exceeded')) {
      return true;
    }
    
    return false;
  }, []);

  // Función reutilizable para exportar briefs
  const handleExportBrief = useCallback(async (brief: any, format: 'txt' | 'md' | 'html' | 'json' | 'all' = 'txt') => {
    console.log('🚀 handleExportBrief called with:', {
      brief: !!brief,
      format,
      briefType: typeof brief,
      briefKeys: brief ? Object.keys(brief) : null
    });

    if (!brief) {
      console.error('❌ No brief available for export');
      Alert.alert('⚠️ Error', 'No hay brief disponible para exportar');
      return;
    }

    try {
      console.log(`📤 Starting export as ${format.toUpperCase()}`);
      switch (format) {
        case 'txt':
          console.log('📝 Calling FileExporter.downloadAsText');
          await FileExporter.downloadAsText(brief);
          break;
        case 'md':
          console.log('📝 Calling FileExporter.downloadAsMarkdown');
          await FileExporter.downloadAsMarkdown(brief);
          break;
        case 'html':
          console.log('🌐 Calling FileExporter.downloadAsHTML');
          await FileExporter.downloadAsHTML(brief);
          break;
        case 'json':
          console.log('📊 Calling FileExporter.downloadAsJSON');
          await FileExporter.downloadAsJSON(brief);
          break;
        case 'all':
          console.log('📦 Calling FileExporter.downloadAllFormats');
          await FileExporter.downloadAllFormats(brief);
          break;
        default:
          console.log('📝 Calling FileExporter.downloadAsText (default)');
          await FileExporter.downloadAsText(brief);
      }
      console.log(`✅ Export completed successfully for ${format.toUpperCase()}`);
    } catch (error) {
      console.error(`❌ Error exporting ${format.toUpperCase()}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('❌ Error', `No se pudo exportar el archivo ${format.toUpperCase()}: ${errorMessage}`);
    }
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



  // Guardar brief automáticamente cuando esté listo - DESACTIVADO TEMPORALMENTE
  /*
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
  */

  // Actualizar brief guardado cuando se mejore - DESACTIVADO TEMPORALMENTE
  /*
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
  */

  const handleManualSave = () => {
    if (briefToShow) {
      // Usar Alert.alert con input manual ya que Alert.prompt no está disponible en web
      Alert.alert(
        'Guardar Brief',
        'Se guardará con el título del proyecto actual',
        [
          {
            text: 'Guardar',
            onPress: async () => {
              try {
                const title = briefToShow.projectTitle || `Brief ${new Date().toLocaleDateString()}`;
                const briefId = await saveBrief(title, transcription || '', briefToShow, audioUri || undefined);
                Alert.alert('✅ Guardado', `Brief "${title}" guardado exitosamente`);
                if (!currentBriefId) {
                  setCurrentBriefId(briefId);
                }
              } catch (saveError) {
                console.error('Error saving brief:', saveError);
                
                // Si es error de quota de almacenamiento, ofrecer limpiar
                if (isQuotaExceededError(saveError)) {
                  Alert.alert(
                    '💾 Almacenamiento Lleno',
                    'El almacenamiento está lleno. ¿Deseas limpiar briefs antiguos?',
                    [
                      { 
                        text: 'Limpiar y Guardar', 
                        onPress: async () => {
                          try {
                            await clearOldBriefs();
                            // Reintentar guardar
                            const title = briefToShow.projectTitle || `Brief ${new Date().toLocaleDateString()}`;
                            const briefId = await saveBrief(title, transcription || '', briefToShow, audioUri || undefined);
                            Alert.alert('✅ Guardado', `Brief "${title}" guardado exitosamente después de limpiar`);
                            if (!currentBriefId) {
                              setCurrentBriefId(briefId);
                            }
                          } catch (cleanError) {
                            Alert.alert('❌ Error', 'No se pudo limpiar el almacenamiento');
                          }
                        }
                      },
                      { text: 'Cancelar', style: 'cancel' }
                    ]
                  );
                } else {
                  const errorMessage = saveError instanceof Error ? saveError.message : 'No se pudo guardar el brief. Intenta nuevamente.';
                  Alert.alert(
                    '❌ Error al Guardar',
                    errorMessage,
                    [
                      { text: 'Reintentar', onPress: () => handleManualSave() },
                      { text: 'Cancelar', style: 'cancel' }
                    ]
                  );
                }
              }
            }
          },
          { text: 'Cancelar', style: 'cancel' }
        ]
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
          
          <Pressable
            style={[styles.toggleButton, { marginTop: 12 }]}
            onPress={() => {
              console.log('🧪 TEST UI BUTTON PRESSED!');
              Alert.alert('Test', 'El botón funciona correctamente');
            }}
          >
            <Text style={styles.toggleButtonText}>🧪 Test UI</Text>
          </Pressable>
        </View>

        <AudioRecorder
          onAudioRecorded={handleAudioRecorded}
          onTranscriptionRequested={handleTranscriptionRequested}
        />

        <View style={styles.divider}>
          <Text style={styles.dividerText}>○ O ○</Text>
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

{briefToShow && !loadingBrief && !errorBrief && (
          useNewDisplay ? (
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
            />
          )
        )}

        {brief && !loadingBrief && !errorBrief && (
          <View style={styles.actionsContainer}>
            <Pressable
              style={styles.improveButton}
              onPress={() => {
                console.log('MEJORA ESTRUCTURADA PRESIONADO');
                try {
                  setShowChatModal(true);
                } catch (error) {
                  console.error('Error abriendo modal:', error);
                  Alert.alert('Error', 'No se pudo abrir el modal');
                }
              }}
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

        {/* Sección especial para brief mejorado */}
        {(improvedBrief || (briefToShow && briefToShow !== brief)) && (
          <View style={styles.finalBriefContainer}>
            <View style={styles.finalBriefHeader}>
              <Text style={styles.finalBriefTitle}>✨ Brief Final Mejorado</Text>
              <Text style={styles.finalBriefSubtitle}>
                Listo para producción con mejoras aplicadas
              </Text>
            </View>
            
            <View style={styles.finalBriefActions}>
              <Pressable
                style={styles.finalBriefButton}
                onPress={() => {
                  // Debug logging antes de abrir el editor
                  console.log('📝 Abriendo editor de brief final:', {
                    improvedBriefExists: !!improvedBrief,
                    improvedBriefFields: improvedBrief ? Object.keys(improvedBrief).length : 0,
                    improvedBriefKeys: improvedBrief ? Object.keys(improvedBrief) : [],
                    briefToShowExists: !!briefToShow,
                    briefToShowFields: briefToShow ? Object.keys(briefToShow).length : 0,
                    improvementMetadata: improvedBrief?.improvementMetadata || briefToShow?.improvementMetadata,
                    timestamp: new Date().toLocaleTimeString()
                  });
                  
                  // Mostrar editor específico para brief final
                  setShowFinalBriefEditor(true);
                }}
              >
                <Text style={styles.finalBriefButtonText}>📝 Editar Brief Final</Text>
              </Pressable>
              
              <Pressable
                style={styles.finalBriefButton}
                onPress={() => {
                  console.log('🔥 EXPORT TXT BUTTON PRESSED!');
                  handleExportBrief(briefToShow, 'txt');
                }}
              >
                <Text style={styles.finalBriefButtonText}>💾 Exportar TXT</Text>
              </Pressable>
              
              <Pressable
                style={[styles.finalBriefButton, { marginLeft: 8 }]}
                onPress={async () => {
                  console.log('📢 SHARE BUTTON PRESSED!');
                  if (!briefToShow) {
                    Alert.alert('⚠️ Error', 'No hay brief disponible para compartir');
                    return;
                  }
                  try {
                    const briefText = FileExporter.formatBriefAsText(briefToShow);
                    await Share.share({
                      message: briefText,
                      title: `Brief: ${briefToShow.projectTitle || 'Sin título'}`
                    });
                  } catch (error) {
                    console.error('Error sharing:', error);
                    Alert.alert('❌ Error', 'No se pudo compartir el brief');
                  }
                }}
              >
                <Text style={styles.finalBriefButtonText}>📤 Compartir</Text>
              </Pressable>
              
              <Pressable
                style={[styles.finalBriefButton, { marginLeft: 8 }]}
                onPress={async () => {
                  console.log('📋 COPY BUTTON PRESSED!');
                  if (!briefToShow) {
                    Alert.alert('⚠️ Error', 'No hay brief disponible para copiar');
                    return;
                  }
                  try {
                    const briefText = FileExporter.formatBriefAsText(briefToShow);
                    await Clipboard.setStringAsync(briefText);
                    Alert.alert('✅ Copiado', 'Brief copiado al portapapeles con formato profesional');
                  } catch (error) {
                    console.error('Error copying text:', error);
                    Alert.alert('❌ Error', 'No se pudo copiar el brief');
                  }
                }}
              >
                <Text style={styles.finalBriefButtonText}>📋 Copiar</Text>
              </Pressable>
            </View>
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
            
            <Pressable
              style={[styles.saveButton, { backgroundColor: '#2563eb', marginTop: 12 }]}
              onPress={() => {
                console.log('📤 TXT EXPORT BUTTON PRESSED!');
                handleExportBrief(briefToShow, 'txt');
              }}
            >
              <Text style={styles.saveButtonText}>📤 Exportar como TXT</Text>
            </Pressable>
            
            <Pressable
              style={[styles.saveButton, { backgroundColor: '#10b981', marginTop: 8 }]}
              onPress={() => {
                console.log('📝 MD EXPORT BUTTON PRESSED!');
                handleExportBrief(briefToShow, 'md');
              }}
            >
              <Text style={styles.saveButtonText}>📝 Exportar como Markdown</Text>
            </Pressable>
            
            <Pressable
              style={[styles.saveButton, { backgroundColor: '#f59e0b', marginTop: 8 }]}
              onPress={() => {
                console.log('🌐 HTML EXPORT BUTTON PRESSED!');
                handleExportBrief(briefToShow, 'html');
              }}
            >
              <Text style={styles.saveButtonText}>🌐 Exportar como HTML</Text>
            </Pressable>
            
            <Pressable
              style={[styles.saveButton, { backgroundColor: '#8b5cf6', marginTop: 8 }]}
              onPress={() => {
                console.log('📊 JSON EXPORT BUTTON PRESSED!');
                handleExportBrief(briefToShow, 'json');
              }}
            >
              <Text style={styles.saveButtonText}>📊 Exportar como JSON</Text>
            </Pressable>
            
            <Pressable
              style={[styles.saveButton, { backgroundColor: '#ef4444', marginTop: 8 }]}
              onPress={() => {
                console.log('📦 ALL FORMATS EXPORT BUTTON PRESSED!');
                handleExportBrief(briefToShow, 'all');
              }}
            >
              <Text style={styles.saveButtonText}>📦 Exportar TODOS los formatos</Text>
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
        onBriefImproved={(improvedBrief) => { 
          console.log('🎯 Brief mejorado recibido en index.tsx:', {
            originalBrief: brief ? Object.keys(brief).length : 0,
            improvedBrief: improvedBrief ? Object.keys(improvedBrief).length : 0,
            changes: improvedBrief !== brief,
            improvedBriefContent: improvedBrief,
            hasImprovementMetadata: !!improvedBrief?.improvementMetadata
          });
          
          // Asegurar que el brief mejorado se guarde correctamente
          if (improvedBrief && typeof improvedBrief === 'object') {
            setImprovedBrief(improvedBrief);
            console.log('✅ Brief mejorado guardado en estado');
          } else {
            console.warn('⚠️ Brief mejorado inválido:', improvedBrief);
          }
        }}
      />

      <FinalBriefEditorModal
        visible={showFinalBriefEditor}
        brief={improvedBrief || briefToShow}
        onClose={() => setShowFinalBriefEditor(false)}
        onBriefUpdated={(updatedBrief) => {
          console.log('📝 Brief final actualizado:', {
            updatedFields: updatedBrief ? Object.keys(updatedBrief).length : 0
          });
          setImprovedBrief(updatedBrief);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
    paddingBottom: 20,
  },
  appTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -2,
    textTransform: 'uppercase',
  },
  appSubtitle: {
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  divider: {
    alignItems: 'center',
    marginVertical: 40,
  },
  dividerText: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  improveButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    borderRadius: 0,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  improveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  toggleButton: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 0,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  saveContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderRadius: 0,
    minWidth: 260,
    marginBottom: 8,
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  autoSaveText: {
    fontSize: 14,
    color: '#FFD700',
    marginTop: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  briefGenerationContainer: {
    marginTop: 16,
    width: '100%',
  },
  briefGenerationCard: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 40,
    alignItems: 'center',
  },
  briefGenerationTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 8,
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  briefGenerationSubtitle: {
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  briefGenerationErrorTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  briefGenerationErrorText: {
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '700',
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  fileIndicator: {
    fontSize: 14,
    color: '#FFD700',
    marginTop: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  finalBriefContainer: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 24,
    marginVertical: 20,
  },
  finalBriefHeader: {
    marginBottom: 16,
  },
  finalBriefTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  finalBriefSubtitle: {
    fontSize: 14,
    color: '#FFD700',
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  finalBriefActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  finalBriefButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  finalBriefButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  briefContainer: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 0,
    marginVertical: 24,
  },
  briefTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  briefText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 26,
  },
  briefLabel: {
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default AudioToTextScreen;