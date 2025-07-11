import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
  Share,
  ScrollView
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import EditableBriefView from './EditableBriefView';
import { FileExporter, Brief } from '../utils/fileExporter';

interface FinalBriefEditorModalProps {
  visible: boolean;
  brief: Brief | null;
  onClose: () => void;
  onBriefUpdated: (updatedBrief: Brief) => void;
}

const FinalBriefEditorModal: React.FC<FinalBriefEditorModalProps> = ({
  visible,
  brief,
  onClose,
  onBriefUpdated
}) => {
  const [workingBrief, setWorkingBrief] = useState(brief);
  const [isExporting, setIsExporting] = useState(false);

  // Debug logging para ver qué datos están llegando
  React.useEffect(() => {
    console.log('📝 FinalBriefEditorModal - Datos recibidos:', {
      visible,
      briefExists: !!brief,
      briefFields: brief ? Object.keys(brief).length : 0,
      briefKeys: brief ? Object.keys(brief) : [],
      projectTitle: brief?.projectTitle,
      briefSummary: brief?.briefSummary,
      improvementMetadata: brief?.improvementMetadata,
      timestamp: new Date().toLocaleTimeString()
    });
  }, [visible, brief]);

  // Sincronizar workingBrief cuando brief cambie
  React.useEffect(() => {
    if (brief && visible) {
      console.log('📝 FinalBriefEditorModal - Sincronizando workingBrief:', {
        briefChanged: brief !== workingBrief,
        newBriefFields: Object.keys(brief).length
      });
      setWorkingBrief(brief);
    } else if (visible && !brief) {
      console.warn('⚠️ FinalBriefEditorModal - Abierto sin brief válido');
    }
  }, [brief, visible, workingBrief]);

  const handleBriefChange = useCallback((updatedBrief: any) => {
    setWorkingBrief(updatedBrief);
  }, []);

  const handleSave = useCallback(() => {
    if (workingBrief) {
      onBriefUpdated(workingBrief);
      Alert.alert('✅ Guardado', 'Brief final actualizado correctamente');
    }
  }, [workingBrief, onBriefUpdated]);

  const handleExport = useCallback(() => {
    console.log('📤 FinalBriefEditorModal - handleExport called');
    console.log('📤 Working brief:', {
      exists: !!workingBrief,
      type: typeof workingBrief,
      keys: workingBrief ? Object.keys(workingBrief) : [],
      projectTitle: workingBrief?.projectTitle
    });
    
    if (!workingBrief || Object.keys(workingBrief).length === 0) {
      Alert.alert('⚠️ Error', 'No hay brief para exportar o el brief está vacío');
      return;
    }

    Alert.alert(
      '📤 Exportar Brief',
      'Selecciona el formato de exportación:',
      [
        {
          text: 'Copiar Texto',
          onPress: () => {
            console.log('📋 Copiar Texto selected');
            const briefText = FileExporter.formatBriefAsText(workingBrief);
            Clipboard.setStringAsync(briefText);
            Alert.alert('✅ Copiado', 'Brief copiado al portapapeles');
          }
        },
        {
          text: 'Compartir',
          onPress: async () => {
            try {
              setIsExporting(true);
              const briefText = FileExporter.formatBriefAsText(workingBrief);
              await Share.share({
                message: briefText,
                title: `Brief: ${workingBrief.projectTitle || 'Sin título'}`
              });
            } catch (error) {
              console.error('Error sharing:', error);
              Alert.alert('❌ Error', 'No se pudo compartir el brief');
            } finally {
              setIsExporting(false);
            }
          }
        },
        {
          text: 'Descargar Archivo',
          onPress: () => {
            // Mostrar submenu para tipos de archivo
            Alert.alert(
              '📁 Descargar Archivo',
              'Selecciona el formato del archivo:',
              [
                {
                  text: 'Texto (.txt)',
                  onPress: async () => {
                    try {
                      console.log('📝 TXT export selected from FinalBriefEditorModal');
                      console.log('📝 Brief to export:', {
                        exists: !!workingBrief,
                        keys: workingBrief ? Object.keys(workingBrief) : []
                      });
                      setIsExporting(true);
                      await FileExporter.downloadAsText(workingBrief);
                    } catch (error) {
                      console.error('❌ Error exporting TXT:', error);
                      Alert.alert('❌ Error', 'No se pudo exportar el archivo de texto');
                    } finally {
                      setIsExporting(false);
                    }
                  }
                },
                {
                  text: 'HTML (.html)',
                  onPress: async () => {
                    try {
                      setIsExporting(true);
                      await FileExporter.downloadAsHTML(workingBrief);
                    } catch (error) {
                      console.error('❌ Error exporting HTML:', error);
                      Alert.alert('❌ Error', 'No se pudo exportar el archivo HTML');
                    } finally {
                      setIsExporting(false);
                    }
                  }
                },
                {
                  text: 'JSON (.json)',
                  onPress: async () => {
                    try {
                      setIsExporting(true);
                      await FileExporter.downloadAsJSON(workingBrief);
                    } catch (error) {
                      console.error('❌ Error exporting JSON:', error);
                      Alert.alert('❌ Error', 'No se pudo exportar el archivo JSON');
                    } finally {
                      setIsExporting(false);
                    }
                  }
                },
                { text: 'Cancelar', style: 'cancel' }
              ]
            );
          }
        },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  }, [workingBrief]);

  // Mostrar mensaje de error si no hay brief
  if (visible && !brief) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>⚠️ Error</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No hay brief disponible para editar</Text>
            <Text style={styles.errorSubtext}>
              Primero aplica mejoras estructuradas para generar un brief final
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>📝 Editar Brief Final</Text>
            <Text style={styles.headerSubtitle}>
              ✨ Brief mejorado listo para producción
            </Text>
          </View>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          <EditableBriefView
            brief={workingBrief}
            onBriefChange={handleBriefChange}
            isUpdating={false}
          />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerActions}>
            <Pressable
              style={styles.secondaryButton}
              onPress={handleExport}
              disabled={isExporting}
            >
              <Text style={styles.secondaryButtonText}>
                {isExporting ? '📤 Exportando...' : '📤 Exportar'}
              </Text>
            </Pressable>
            
            <Pressable
              style={styles.primaryButton}
              onPress={handleSave}
            >
              <Text style={styles.primaryButtonText}>💾 Guardar Cambios</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  content: {
    flex: 1,
  },
  footer: {
    backgroundColor: '#ffffff',
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FinalBriefEditorModal;