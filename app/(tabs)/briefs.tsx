import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import ProfessionalBriefDisplay from '../../components/ProfessionalBriefDisplay';
import SavedBriefsList from '../../components/SavedBriefsList';
import BriefsTestComponent from '../../components/BriefsTestComponent';
import { SavedBrief, useBriefStorage } from '../../hooks/useBriefStorage';
import { useIntegratedBriefStorage } from '../../hooks/useIntegratedBriefStorage';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { useSupabaseBriefs } from '../../hooks/useSupabaseBriefs';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Pantalla para mostrar los briefs guardados - Versión simplificada y funcional
 */
const BriefsScreen: React.FC = () => {
  const { user } = useSupabaseAuth();
  const { savedBriefs, loading, deleteBrief: deleteLocalBrief, clearAllBriefs } = useBriefStorage();
  const { 
    allBriefs, 
    supabaseLoading, 
    deleteBrief: deleteIntegratedBrief, 
    totalBriefs,
    migrateLocalToSupabase
  } = useIntegratedBriefStorage();
  
  // Direct hooks that we know work
  const { deleteBrief: deleteSupabaseBrief } = useSupabaseBriefs();
  
  const [selectedBrief, setSelectedBrief] = useState<SavedBrief | any | null>(null);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [showTestComponent, setShowTestComponent] = useState(false);
  
  // Use integrated briefs if user is authenticated, otherwise use local briefs
  const briefsToShow = user ? allBriefs : savedBriefs;
  const isLoading = user ? supabaseLoading : loading;

  if (showTestComponent) {
    return <BriefsTestComponent onBack={() => setShowTestComponent(false)} />;
  }

  const handleSelectBrief = (brief: SavedBrief | any) => {
    setSelectedBrief(brief);
    setShowBriefModal(true);
  };

  const handleDeleteBrief = (id: string) => {
    console.log('🗑️ BriefsScreen: Intentando eliminar brief:', { id, user: !!user });
    
    Alert.alert(
      'Eliminar Brief',
      '¿Estás seguro de que quieres eliminar este brief?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ BriefsScreen: Ejecutando eliminación...');
              
              // Use direct hooks that we know work
              if (user) {
                console.log('🗑️ BriefsScreen: Eliminando de Supabase con deleteSupabaseBrief');
                await deleteSupabaseBrief(id);
              }
              
              // Always also delete from local storage
              console.log('🗑️ BriefsScreen: Eliminando de local con deleteLocalBrief');
              await deleteLocalBrief(id);
              
            } catch (error) {
              console.error('🗑️ BriefsScreen: Error eliminando brief:', error);
              Alert.alert('Error', 'No se pudo eliminar el brief');
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    const totalCount = briefsToShow.length;
    const message = user 
      ? `¿Estás seguro de que quieres eliminar todos los ${totalCount} briefs de tu cuenta? Esta acción no se puede deshacer.`
      : `¿Estás seguro de que quieres eliminar todos los ${totalCount} briefs locales? Esta acción no se puede deshacer.`;
      
    Alert.alert(
      'Eliminar Todos los Briefs',
      message,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Todos',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ BriefsScreen: Eliminando todos los briefs...');
              
              if (user) {
                // Delete all Supabase briefs one by one
                for (const brief of briefsToShow) {
                  if ('created_at' in brief) { // This is a Supabase brief
                    await deleteSupabaseBrief(brief.id);
                  }
                }
              }
              
              // Always clear local briefs
              await clearAllBriefs();
              
            } catch (error) {
              console.error('🗑️ BriefsScreen: Error eliminando todos los briefs:', error);
              Alert.alert('Error', 'No se pudieron eliminar todos los briefs');
            }
          },
        },
      ]
    );
  };

  const handleCloseModal = () => {
    setShowBriefModal(false);
    setSelectedBrief(null);
  };

  // Emergency nuclear option - DEVELOPMENT ONLY
  const emergencyNuke = async () => {
    // Safety check: Only allow in development environment
    if (!__DEV__) {
      console.warn('⚠️ emergencyNuke is disabled in production');
      Alert.alert(
        'Función No Disponible',
        'Esta función destructiva solo está disponible en modo de desarrollo.'
      );
      return;
    }

    Alert.alert(
      '💥 RESET COMPLETO',
      '⚠️ ESTO BORRARÁ ABSOLUTAMENTE TODO:\n\n• Todos los briefs locales\n• Todos los briefs de Supabase\n• Todo el cache\n\n¿Estás 100% seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'SÍ, BORRAR TODO',
          style: 'destructive',
          onPress: () => {
            // Additional safety confirmation
            Alert.alert(
              '🚨 ÚLTIMA CONFIRMACIÓN',
              'Esta acción es IRREVERSIBLE y eliminará TODO permanentemente.\n\nTeclea "CONFIRMAR" para proceder:',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Proceder',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      console.log('💥 EMERGENCY NUKE INITIATED - DEV MODE ONLY');
                      
                      // 1. Clear all local briefs
                      await clearAllBriefs();
                      await AsyncStorage.removeItem('@briefboy_saved_briefs');
                      console.log('💥 Local storage nuked');
                      
                      // 2. Delete all Supabase briefs
                      if (user && allBriefs.length > 0) {
                        for (const brief of allBriefs) {
                          try {
                            if ('created_at' in brief) {
                              await deleteSupabaseBrief(brief.id);
                            }
                          } catch (error) {
                            console.log('Error deleting:', brief.id, error);
                          }
                        }
                        console.log('💥 Supabase briefs nuked');
                      }
                      
                      Alert.alert('💥 RESET COMPLETO', 'TODO HA SIDO ELIMINADO\n\nRecarga la página para ver los cambios.');
                      
                    } catch (error) {
                      console.error('💥 Error in emergency nuke:', error);
                      Alert.alert('Error', 'Error en el reset completo');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando briefs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with stats */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BRIEFS GUARDADOS</Text>
        <Text style={styles.headerSubtitle}>
          {user ? `${totalBriefs} briefs en tu cuenta (${user.email})` : `${savedBriefs.length} briefs locales`}
        </Text>
        
        <View style={styles.buttonRow}>
          <Pressable style={styles.testButton} onPress={() => setShowTestComponent(true)}>
            <Text style={styles.testButtonText}>🧪 Test</Text>
          </Pressable>
          {__DEV__ && (
            <Pressable style={styles.nukeButton} onPress={emergencyNuke}>
              <Text style={styles.nukeButtonText}>💥 RESET</Text>
            </Pressable>
          )}
        </View>
      </View>

      <SavedBriefsList
        key={`briefs-list-${briefsToShow.length}-${user?.id || 'local'}`}
        briefs={briefsToShow}
        onSelectBrief={handleSelectBrief}
        onDeleteBrief={handleDeleteBrief}
      />
      
      {briefsToShow.length > 0 && (
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
              brief={selectedBrief.brief || selectedBrief.brief_data}
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
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  testButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    opacity: 0.8,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  nukeButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  nukeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  clearButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
});

export default BriefsScreen;