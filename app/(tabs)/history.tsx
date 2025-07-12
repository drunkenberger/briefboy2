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
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  footer: {
    padding: 20,
    backgroundColor: '#000000',
    borderTopWidth: 4,
    borderTopColor: '#FFFFFF',
  },
  clearButton: {
    backgroundColor: '#000000',
    borderRadius: 0,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  clearButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#000000',
    borderBottomWidth: 4,
    borderBottomColor: '#FFFFFF',
  },
  modalTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginRight: 20,
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 0,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FFD700',
    fontWeight: '900',
  },
});

export default HistoryScreen;