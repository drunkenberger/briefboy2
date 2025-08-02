import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator
} from 'react-native';
import { useIntegratedBriefStorage } from '../hooks/useIntegratedBriefStorage';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { DatabaseBrief } from '../types/brief';

// Helper function to create a safe, limited preview of brief data
const createSafeBriefPreview = (briefData: any, maxLength: number = 1000): string => {
  if (!briefData) return 'No hay contenido de brief disponible';

  try {
    // Define safe fields to display (non-sensitive information)
    const safeFields = {
      projectTitle: briefData.projectTitle || briefData.title,
      briefSummary: briefData.briefSummary || briefData.summary,
      strategicObjectives: Array.isArray(briefData.strategicObjectives) 
        ? briefData.strategicObjectives.slice(0, 3) // Limit to first 3 objectives
        : briefData.objectives,
      targetAudience: typeof briefData.targetAudience === 'object' && briefData.targetAudience
        ? {
            primary: typeof briefData.targetAudience.primary === 'string' 
              ? briefData.targetAudience.primary.substring(0, 200) + '...' 
              : briefData.targetAudience.primary
          }
        : briefData.targetAudience,
      brandPositioning: typeof briefData.brandPositioning === 'string'
        ? briefData.brandPositioning.substring(0, 150) + '...'
        : briefData.brandPositioning,
      // Add metadata info
      _metadata: {
        totalFields: Object.keys(briefData).length,
        lastModified: briefData.updated_at || briefData.updatedAt || 'N/A',
        structure: Object.keys(briefData).filter(key => !key.startsWith('_')).sort()
      }
    };

    // Create JSON string and limit length
    let jsonString = JSON.stringify(safeFields, null, 2);
    
    if (jsonString.length > maxLength) {
      jsonString = jsonString.substring(0, maxLength) + '\n\n... [Contenido truncado por seguridad y rendimiento]';
    }

    return jsonString;
  } catch (error) {
    console.warn('Error creating brief preview:', error);
    return `Error al mostrar preview del brief: ${error instanceof Error ? error.message : 'Error desconocido'}`;
  }
};

interface SupabaseBriefEditorProps {
  brief: DatabaseBrief | any;
  visible: boolean;
  onClose: () => void;
  onSave?: (updatedBrief: DatabaseBrief | any) => void;
}

export default function SupabaseBriefEditor({ 
  brief, 
  visible, 
  onClose, 
  onSave 
}: SupabaseBriefEditorProps) {
  const { user } = useSupabaseAuth();
  const { updateExistingBrief, deleteIntegratedBrief } = useIntegratedBriefStorage();
  
  const [editedTitle, setEditedTitle] = useState('');
  const [editedTranscription, setEditedTranscription] = useState('');
  const [editedStatus, setEditedStatus] = useState<'draft' | 'completed' | 'archived'>('draft');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with brief data
  useEffect(() => {
    if (brief) {
      setEditedTitle(brief.title || '');
      setEditedTranscription(brief.transcription || '');
      setEditedStatus(brief.status || 'draft');
    }
  }, [brief]);

  const handleSave = async () => {
    if (!brief?.id) {
      Alert.alert('Error', 'No se puede guardar sin ID del brief');
      return;
    }

    if (!editedTitle.trim()) {
      Alert.alert('Error', 'El título es requerido');
      return;
    }

    setIsLoading(true);

    try {
      const updates = {
        title: editedTitle.trim(),
        transcription: editedTranscription.trim(),
        status: editedStatus
      };

      const success = await updateExistingBrief(brief.id, updates);

      if (success) {
        Alert.alert('✅ Guardado', 'Brief actualizado exitosamente');
        onSave?.({ ...brief, ...updates });
        onClose();
      } else {
        Alert.alert('❌ Error', 'No se pudo actualizar el brief');
      }
    } catch (error) {
      console.error('Error updating brief:', error);
      Alert.alert('❌ Error', 'Error al actualizar el brief');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!brief?.id) return;

    Alert.alert(
      'Eliminar Brief',
      '¿Estás seguro de que quieres eliminar este brief permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const success = await deleteIntegratedBrief(brief.id);
              if (success) {
                Alert.alert('✅ Eliminado', 'Brief eliminado exitosamente');
                onClose();
              } else {
                Alert.alert('❌ Error', 'No se pudo eliminar el brief');
              }
            } catch (error) {
              console.error('Error deleting brief:', error);
              Alert.alert('❌ Error', 'Error al eliminar el brief');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleStatusChange = (status: 'draft' | 'completed' | 'archived') => {
    setEditedStatus(status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'draft': return '#f59e0b';
      case 'archived': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'draft': return 'Borrador';
      case 'archived': return 'Archivado';
      default: return 'Borrador';
    }
  };

  if (!brief) return null;

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
          <Text style={styles.headerTitle}>Editar Brief</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Brief Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del Brief</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>ID:</Text>
                <Text style={styles.infoValue}>{brief.id?.substring(0, 8)}...</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Creado:</Text>
                <Text style={styles.infoValue}>
                  {brief.created_at ? new Date(brief.created_at).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Actualizado:</Text>
                <Text style={styles.infoValue}>
                  {brief.updated_at ? new Date(brief.updated_at).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Title Editor */}
          <View style={styles.section}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.textInput}
              value={editedTitle}
              onChangeText={setEditedTitle}
              placeholder="Título del brief"
              placeholderTextColor="#666666"
              multiline={false}
            />
          </View>

          {/* Status Editor */}
          <View style={styles.section}>
            <Text style={styles.label}>Estado</Text>
            <View style={styles.statusContainer}>
              {(['draft', 'completed', 'archived'] as const).map((status) => (
                <Pressable
                  key={status}
                  style={[
                    styles.statusButton,
                    editedStatus === status && styles.statusButtonActive,
                    { borderColor: getStatusColor(status) }
                  ]}
                  onPress={() => handleStatusChange(status)}
                >
                  <Text style={[
                    styles.statusButtonText,
                    editedStatus === status && { color: getStatusColor(status) }
                  ]}>
                    {getStatusText(status)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Transcription Editor */}
          <View style={styles.section}>
            <Text style={styles.label}>Transcripción</Text>
            <TextInput
              style={[styles.textInput, { height: 120 }]}
              value={editedTranscription}
              onChangeText={setEditedTranscription}
              placeholder="Transcripción del audio..."
              placeholderTextColor="#666666"
              multiline={true}
              textAlignVertical="top"
            />
          </View>

          {/* Brief Data Preview */}
          <View style={styles.section}>
            <Text style={styles.label}>Vista Previa del Brief (Sanitizada)</Text>
            <View style={styles.briefPreview}>
              <Text style={styles.briefPreviewText}>
                {createSafeBriefPreview(brief.brief_data || brief.brief)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <Pressable 
            style={[styles.button, styles.deleteButton]} 
            onPress={handleDelete}
            disabled={isLoading}
          >
            <Text style={styles.deleteButtonText}>🗑️ Eliminar</Text>
          </Pressable>

          <View style={styles.actionButtons}>
            <Pressable 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>

            <Pressable 
              style={[styles.button, styles.saveButton]} 
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#000000" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>💾 Guardar</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    backgroundColor: '#111111',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 16,
    letterSpacing: 1,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    flex: 1,
    minWidth: 120,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#111111',
    color: '#FFFFFF',
    padding: 16,
    fontSize: 16,
    fontFamily: 'monospace',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 2,
    backgroundColor: '#111111',
  },
  statusButtonActive: {
    backgroundColor: '#222222',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  briefPreview: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#111111',
    padding: 16,
    maxHeight: 200,
  },
  briefPreviewText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: '#FFD700',
    backgroundColor: '#111111',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    borderColor: '#FFFFFF',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  cancelButton: {
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#FFD700',
    borderColor: '#FFFFFF',
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
  },
});