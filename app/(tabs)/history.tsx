import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import ProfessionalBriefDisplay from '../../components/ProfessionalBriefDisplay';
import SavedBriefsList from '../../components/SavedBriefsList';
import { SavedBrief, useBriefStorage } from '../../hooks/useBriefStorage';

/**
 * Pantalla para mostrar el historial de briefs guardados
 */
const HistoryScreen: React.FC = () => {
  const { savedBriefs, loading, deleteBrief, clearAllBriefs } = useBriefStorage();
  const [selectedBrief, setSelectedBrief] = useState<SavedBrief | null>(null);
  const [showBriefModal, setShowBriefModal] = useState(false);

  const handleSelectBrief = (brief: SavedBrief) => {
    setSelectedBrief(brief);
    setShowBriefModal(true);
  };

  const handleDeleteBrief = (id: string) => {
    Alert.alert(
      'Eliminar Brief',
      '¿Estás seguro de que quieres eliminar este brief?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteBrief(id),
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Eliminar Todos los Briefs',
      '¿Estás seguro de que quieres eliminar todos los briefs guardados? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Todos',
          style: 'destructive',
          onPress: () => clearAllBriefs(),
        },
      ]
    );
  };

  const handleCloseModal = () => {
    setShowBriefModal(false);
    setSelectedBrief(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando briefs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SavedBriefsList
        briefs={savedBriefs}
        onSelectBrief={handleSelectBrief}
        onDeleteBrief={handleDeleteBrief}
      />
      
      {savedBriefs.length > 0 && (
        <View style={styles.footer}>
          <Pressable style={styles.clearButton} onPress={handleClearAll}>
            <Text style={styles.clearButtonText}>🗑️ Eliminar Todos</Text>
          </Pressable>
        </View>
      )}

      <Modal
        visible={showBriefModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedBrief?.title || 'Brief Guardado'}
            </Text>
            <Pressable style={styles.closeButton} onPress={handleCloseModal}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>
          
          {selectedBrief && (
            <ProfessionalBriefDisplay
              brief={selectedBrief.brief}
              loading={false}
              error={null}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  footer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  clearButton: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  clearButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginRight: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
});

export default HistoryScreen;