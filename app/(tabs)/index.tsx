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
import ExportDropdown from '../../components/ExportDropdown';
import { useBriefGeneration } from '../../hooks/useBriefGeneration';
import { useBriefStorage } from '../../hooks/useBriefStorage';
import { useWhisperTranscription } from '../../hooks/useWhisperTranscription';
import { useContentParser } from '../../hooks/useContentParser';
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
  const [enableContentParser, setEnableContentParser] = useState(false); // usar brief generation por defecto

  // Hook de transcripción automática (solo si hay audio)
  const { transcription: autoTranscription, loading, error } = useWhisperTranscription(
    audioUri,
    !!audioUri
  );

  // Usar transcripción manual (desde archivo) o automática (desde grabación)
  const transcription = manualTranscription || autoTranscription;

  // Debug logging para transcripciones 
  useEffect(() => {
    if (__DEV__) {
      console.log('📝 Estado de transcripciones:', {
        manualTranscription: manualTranscription ? manualTranscription.substring(0, 50) + '...' : 'null',
        autoTranscription: autoTranscription ? autoTranscription.substring(0, 50) + '...' : 'null',
        finalTranscription: transcription ? transcription.substring(0, 50) + '...' : 'null',
        loading,
        error,
        audioUri: audioUri ? audioUri.substring(0, 50) + '...' : 'null'
      });
    }
  }, [manualTranscription, autoTranscription, transcription, loading, error, audioUri]);

  // Hook de generación de brief - enableContentParser controla qué método usar
  const shouldGenerateBrief = !!transcription && !loading && !enableContentParser;
  const shouldParseContent = !!transcription && !loading && enableContentParser;
  
  // Hook para parsear contenido sin mejoras (nuevo flujo)
  const { parsedBrief, loading: loadingParser, error: errorParser } = useContentParser(transcription, shouldParseContent);
  
  // Hook para generar brief con mejoras (flujo anterior)
  const { brief: generatedBrief, loading: loadingGeneration, error: errorGeneration } = useBriefGeneration(transcription, shouldGenerateBrief);
  
  // Usar el brief parseado o generado según el modo
  const brief = enableContentParser ? parsedBrief : generatedBrief;
  const loadingBrief = enableContentParser ? loadingParser : loadingGeneration;
  const errorBrief = enableContentParser ? errorParser : errorGeneration;
  const briefToShow = improvedBrief || brief;
  const iaSuggestionsToShow = improvedBrief ? iaSuggestions : null;
  
  // Debug logging para estado de briefs - CORREGIDO: removida briefToShow de dependencias
  useEffect(() => {
    if (__DEV__) {
      console.log('📊 Estado de briefs:', {
        brief: brief ? Object.keys(brief).length : 0,
        improvedBrief: improvedBrief ? Object.keys(improvedBrief).length : 0,
        briefKeys: brief ? Object.keys(brief) : [],
        improvedBriefKeys: improvedBrief ? Object.keys(improvedBrief) : [],
        loadingBrief,
        errorBrief,
        shouldGenerateBrief
      });
    }
  }, [brief, improvedBrief, loadingBrief, errorBrief, shouldGenerateBrief]);

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
    if (__DEV__) {
      console.log('🚀 handleExportBrief called with:', {
        brief: !!brief,
        format,
        briefType: typeof brief,
        briefKeys: brief ? Object.keys(brief) : null
      });
    }

    if (!brief) {
      if (__DEV__) {
        console.error('❌ No brief available for export');
      }
      Alert.alert('⚠️ Error', 'No hay brief disponible para exportar');
      return;
    }

    try {
      if (__DEV__) {
        console.log(`📤 Starting export as ${format.toUpperCase()}`);
      }
      switch (format) {
        case 'txt':
          if (__DEV__) console.log('📝 Calling FileExporter.downloadAsText');
          await FileExporter.downloadAsText(brief);
          break;
        case 'md':
          if (__DEV__) console.log('📝 Calling FileExporter.downloadAsMarkdown');
          await FileExporter.downloadAsMarkdown(brief);
          break;
        case 'html':
          if (__DEV__) console.log('🌐 Calling FileExporter.downloadAsHTML');
          await FileExporter.downloadAsHTML(brief);
          break;
        case 'json':
          if (__DEV__) console.log('📊 Calling FileExporter.downloadAsJSON');
          await FileExporter.downloadAsJSON(brief);
          break;
        case 'all':
          if (__DEV__) console.log('📦 Calling FileExporter.downloadAllFormats');
          await FileExporter.downloadAllFormats(brief);
          break;
        default:
          if (__DEV__) console.log('📝 Calling FileExporter.downloadAsText (default)');
          await FileExporter.downloadAsText(brief);
      }
      if (__DEV__) {
        console.log(`✅ Export completed successfully for ${format.toUpperCase()}`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error(`❌ Error exporting ${format.toUpperCase()}:`, error);
      }
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('❌ Error', `No se pudo exportar el archivo ${format.toUpperCase()}: ${errorMessage}`);
    }
  }, []);

  // Recibe la URI del audio grabado desde el componente hijo
  const handleAudioRecorded = (uri: string | null) => {
    if (__DEV__) {
      console.log('🎤 handleAudioRecorded: Recibida URI de audio:', uri ? uri.substring(0, 100) + '...' : 'null');
    }

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
    if (__DEV__) {
      console.log('🎤 index.tsx: handleTranscriptionRequested recibida:', uri.substring(0, 100) + '...');
    }

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
    if (__DEV__) {
      console.log('📥 handleFileTranscription: Recibida transcripción de archivo:', fileTranscription.substring(0, 100) + '...');
    }

    // Reset estado previo
    setAudioUri(null);
    setImprovedBrief(null);
    setIaSuggestions(null);
    setCurrentBriefId(null);

    // Establecer transcripción desde archivo
    setManualTranscription(fileTranscription);
    setIsFromFile(true);
  };



  // Auto-save brief with debouncing to prevent excessive saves
  useEffect(() => {
    if (brief && transcription && !loadingBrief && !errorBrief && !currentBriefId) {
      const timer = setTimeout(async () => {
        try {
          const title = brief.projectTitle || `Brief ${new Date().toLocaleDateString()}`;
          const briefId = await saveBrief(title, transcription, brief, audioUri || undefined);
          setCurrentBriefId(briefId);
          if (__DEV__) {
            console.log('Brief guardado automáticamente:', briefId);
          }
        } catch (error) {
          console.error('Error auto-saving brief:', error);
        }
      }, 1000); // Debounce 1 segundo

      return () => clearTimeout(timer);
    }
  }, [brief, transcription, loadingBrief, errorBrief, audioUri, saveBrief, currentBriefId]);

  // Update saved brief with debouncing
  useEffect(() => {
    if (improvedBrief && currentBriefId) {
      const timer = setTimeout(async () => {
        try {
          await updateBrief(currentBriefId, {
            brief: improvedBrief,
            title: improvedBrief.projectTitle || `Brief ${new Date().toLocaleDateString()}`,
          });
          if (__DEV__) {
            console.log('Brief actualizado automáticamente:', currentBriefId);
          }
        } catch (error) {
          console.error('Error updating saved brief:', error);
        }
      }, 1000); // Debounce 1 segundo

      return () => clearTimeout(timer);
    }
  }, [improvedBrief, currentBriefId, updateBrief]);

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
          <Text style={styles.appTitle}>BRIEFBOY</Text>
          <View style={styles.yellowBar} />
          <Text style={styles.appSubtitle}>GENERADOR DE BRIEFS PUBLICITARIOS CON IA</Text>
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
              <Text style={styles.briefGenerationTitle}>
                Generando Brief...
              </Text>
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
          <View style={styles.primaryActionsContainer}>
            <Pressable
              style={styles.primaryActionButton}
              onPress={() => {
                if (__DEV__) {
                  console.log('🔍 Abriendo modal de análisis');
                }
                setShowChatModal(true);
              }}
            >
              <Text style={styles.primaryActionIcon}>📊</Text>
              <Text style={styles.primaryActionText}>Mejorar Brief</Text>
              <Text style={styles.primaryActionSubtext}>Análisis y optimización con IA</Text>
            </Pressable>

            <View style={styles.secondaryActionsRow}>
              <Pressable
                style={styles.secondaryActionButton}
                onPress={async () => {
                  if (!briefToShow) return;
                  try {
                    const briefText = FileExporter.formatBriefAsText(briefToShow);
                    await Clipboard.setStringAsync(briefText);
                    Alert.alert('✅', 'Brief copiado al portapapeles');
                  } catch (error) {
                    Alert.alert('❌ Error', 'No se pudo copiar');
                  }
                }}
              >
                <Text style={styles.secondaryActionIcon}>📋</Text>
                <Text style={styles.secondaryActionText}>Copiar</Text>
              </Pressable>
              
              <Pressable
                style={styles.secondaryActionButton}
                onPress={async () => {
                  if (!briefToShow) return;
                  try {
                    const briefText = FileExporter.formatBriefAsText(briefToShow);
                    await Share.share({
                      message: briefText,
                      title: `Brief: ${briefToShow.projectTitle || 'Sin título'}`
                    });
                  } catch (error) {
                    Alert.alert('❌ Error', 'No se pudo compartir');
                  }
                }}
              >
                <Text style={styles.secondaryActionIcon}>📤</Text>
                <Text style={styles.secondaryActionText}>Compartir</Text>
              </Pressable>
              
              <Pressable
                style={styles.secondaryActionButton}
                onPress={() => setUseNewDisplay(!useNewDisplay)}
              >
                <Text style={styles.secondaryActionIcon}>🔄</Text>
                <Text style={styles.secondaryActionText}>Vista</Text>
              </Pressable>
            </View>
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
                style={[styles.finalBriefButton, { marginLeft: 8 }]}
                onPress={async () => {
                  if (__DEV__) {
                    console.log('📢 SHARE BUTTON PRESSED!');
                  }
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
                  if (__DEV__) {
                    console.log('📋 COPY BUTTON PRESSED!');
                  }
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
            
            {/* Acciones simplificadas para brief mejorado */}
            <View style={styles.finalBriefQuickActions}>
              <ExportDropdown 
                briefToShow={briefToShow} 
                handleExportBrief={handleExportBrief}
              />
              
              <View style={styles.finalBriefActionRow}>
                <Pressable
                  style={styles.finalBriefActionButton}
                  onPress={async () => {
                    if (!briefToShow) return;
                    try {
                      const briefText = FileExporter.formatBriefAsText(briefToShow);
                      await Share.share({
                        message: briefText,
                        title: `Brief: ${briefToShow.projectTitle || 'Sin título'}`
                      });
                    } catch (error) {
                      Alert.alert('❌ Error', 'No se pudo compartir');
                    }
                  }}
                >
                  <Text style={styles.finalBriefActionIcon}>📤</Text>
                  <Text style={styles.finalBriefActionText}>Compartir</Text>
                </Pressable>
                
                <Pressable
                  style={styles.finalBriefActionButton}
                  onPress={async () => {
                    if (!briefToShow) return;
                    try {
                      const briefText = FileExporter.formatBriefAsText(briefToShow);
                      await Clipboard.setStringAsync(briefText);
                      Alert.alert('✅', 'Brief copiado al portapapeles');
                    } catch (error) {
                      Alert.alert('❌ Error', 'No se pudo copiar');
                    }
                  }}
                >
                  <Text style={styles.finalBriefActionIcon}>📋</Text>
                  <Text style={styles.finalBriefActionText}>Copiar</Text>
                </Pressable>
                
                <Pressable
                  style={styles.finalBriefActionButton}
                  onPress={handleManualSave}
                >
                  <Text style={styles.finalBriefActionIcon}>💾</Text>
                  <Text style={styles.finalBriefActionText}>Guardar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {briefToShow && !improvedBrief && (
          <View style={styles.saveContainer}>
            <View style={styles.bottomActionsRow}>
              <Pressable
                style={styles.bottomActionButton}
                onPress={handleManualSave}
              >
                <Text style={styles.bottomActionIcon}>💾</Text>
                <Text style={styles.bottomActionText}>
                  {currentBriefId ? 'Guardar Copia' : 'Guardar'}
                </Text>
              </Pressable>
              
              <ExportDropdown 
                briefToShow={briefToShow} 
                handleExportBrief={handleExportBrief}
              />
            </View>
            
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
    borderBottomWidth: 4,
    borderBottomColor: '#FFFFFF',
  },
  appTitle: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 16,
    letterSpacing: -3,
    textTransform: 'uppercase',
  },
  yellowBar: {
    width: 120,
    height: 8,
    backgroundColor: '#FFD700',
    marginBottom: 16,
  },
  appSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    gap: 20,
  },
  dividerLine: {
    height: 2,
    width: 60,
    backgroundColor: '#FFD700',
  },
  dividerText: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: '900',
    letterSpacing: 2,
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
  primaryActionsContainer: {
    marginTop: 24,
    width: '100%',
  },
  primaryActionButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  primaryActionText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  primaryActionSubtext: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    opacity: 0.8,
    letterSpacing: 0.5,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  secondaryActionButton: {
    flex: 1,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#333333',
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryActionIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
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
  bottomActionsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  bottomActionButton: {
    backgroundColor: '#000000',
    borderWidth: 3,
    borderColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bottomActionIcon: {
    fontSize: 20,
  },
  bottomActionText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  exportSection: {
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
  },
  exportSectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  exportButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  exportButton: {
    backgroundColor: '#000000',
    borderWidth: 3,
    borderColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    minHeight: 80,
  },
  exportButtonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  exportButtonText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  exportAllButton: {
    backgroundColor: '#FFD700',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 280,
  },
  exportAllButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
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
    backgroundColor: '#111111',
    borderWidth: 4,
    borderColor: '#FFD700',
    padding: 32,
    marginVertical: 40,
  },
  finalBriefHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  finalBriefTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 12,
    letterSpacing: -2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  finalBriefSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  finalBriefActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  finalBriefButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  finalBriefButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  finalBriefPrimaryButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  finalBriefPrimaryButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  finalBriefQuickActions: {
    marginTop: 24,
    alignItems: 'center',
  },
  finalBriefActionRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  finalBriefActionButton: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
  },
  finalBriefActionIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  finalBriefActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
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