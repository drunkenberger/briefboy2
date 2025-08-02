import React, { useState, useCallback } from 'react';
import { 
  Alert, 
  Modal, 
  Pressable, 
  StyleSheet, 
  Text, 
  View,
  ScrollView,
  Animated,
  RefreshControl,
  StatusBar
} from 'react-native';
import ProfessionalBriefDisplay from './ProfessionalBriefDisplay';
import ImprovedSavedBriefsList from './ImprovedSavedBriefsList';
import { useBriefStorage } from '../hooks/useBriefStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIntegratedBriefStorage } from '../hooks/useIntegratedBriefStorage';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useSupabaseBriefs } from '../hooks/useSupabaseBriefs';
import { Theme } from '../constants/Theme';
import { router } from 'expo-router';
import { UnifiedBrief } from '../types/briefTypes';

/**
 * Improved screen for displaying saved briefs with better UX
 */
const ImprovedBriefsScreen: React.FC = () => {
  const { user, signOut } = useSupabaseAuth();
  const { savedBriefs, loading, deleteBrief: deleteLocalBrief, clearAllBriefs } = useBriefStorage();
  const { 
    allBriefs = [], 
    supabaseLoading = false, 
    deleteBrief: deleteIntegratedBrief, 
    totalBriefs = 0,
    migrateLocalToSupabase
  } = useIntegratedBriefStorage();
  
  const { deleteBrief: deleteSupabaseBrief } = useSupabaseBriefs();
  
  const [selectedBrief, setSelectedBrief] = useState<UnifiedBrief | null>(null);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [forceRefreshKey, setForceRefreshKey] = useState(0);
  
  // Animations
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
    ]).start();
  }, []);
  
  // Use integrated briefs if user is authenticated, otherwise use local briefs
  const briefsToShow = user ? allBriefs : savedBriefs;
  const isLoading = user ? supabaseLoading : loading;
  
  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh logic would go here if needed
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate refresh
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleSelectBrief = useCallback((brief: UnifiedBrief) => {
    setSelectedBrief(brief);
    setShowBriefModal(true);
  }, []);

  // Cross-platform refresh function
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Force refresh by incrementing the key - this will cause components to re-mount
      setForceRefreshKey(prev => prev + 1);
      
      // Close any open modals
      setShowBriefModal(false);
      setShowActions(false);
      setSelectedBrief(null);
      
      // Platform-specific refresh
      if (typeof window !== 'undefined') {
        // In web environment, we can use router refresh
        router.replace(router.pathname || '/(tabs)/briefs');
      } else {
        // In React Native, force a navigation refresh
        router.replace('/(tabs)/briefs');
      }
      
      // Wait a bit to ensure state updates propagate
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleDeleteBrief = useCallback((id: string) => {
    console.log('🗑️ handleDeleteBrief called with id:', id);
    
    // Prevent multiple calls
    if (loading || supabaseLoading) {
      console.log('🗑️ Delete already in progress, ignoring...');
      return;
    }
    
    // Find the brief to get full object for deletion
    const briefToDelete = briefsToShow.find(brief => brief.id === id);
    if (!briefToDelete) {
      console.error('❌ Brief not found for deletion:', id);
      Alert.alert('❌ Error', 'Brief no encontrado');
      return;
    }
    
    Alert.alert(
      'Eliminar Brief',
      `¿Estás seguro de que quieres eliminar "${briefToDelete.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteSingleBrief(briefToDelete);
              
              if (!result.success) {
                Alert.alert('❌ Error', 'No se pudo eliminar el brief. Intenta nuevamente.');
              }
              // Success is handled silently - the UI will update automatically
              
            } catch (error) {
              console.error('❌ Error eliminando brief:', error);
              Alert.alert('❌ Error', 'No se pudo eliminar el brief: ' + (error instanceof Error ? error.message : 'Error desconocido'));
            }
          },
        },
      ]
    );
  }, [loading, supabaseLoading, briefsToShow, deleteSingleBrief]);

  const handleClearAll = useCallback(() => {
    const totalCount = briefsToShow.length;
    console.log('🗑️ Starting bulk deletion process for', totalCount, 'briefs');
    
    // Prevent multiple calls
    if (loading || supabaseLoading) {
      console.log('🗑️ Clear all already in progress, ignoring...');
      return;
    }
    
    Alert.alert(
      'Eliminar Todos los Briefs',
      `¿Estás seguro de que quieres eliminar todos los ${totalCount} briefs? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Todos',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚀 Starting parallel deletion of', totalCount, 'briefs');
              
              // Delete all briefs in parallel using Promise.allSettled
              const deletionPromises = briefsToShow.map(brief => deleteSingleBrief(brief));
              const results = await Promise.allSettled(deletionPromises);
              
              // Count successes and failures
              const successes = results.filter(result => 
                result.status === 'fulfilled' && result.value.success
              );
              const failures = results.filter(result => 
                result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
              );
              
              const deletedCount = successes.length;
              const failedCount = failures.length;
              
              // Backup: clear local storage
              try {
                console.log('🧹 Clearing local storage as backup...');
                await clearAllBriefs();
              } catch (clearError) {
                console.error('❌ Error clearing local storage:', clearError);
              }
              
              console.log('✅ Bulk deletion completed. Deleted:', deletedCount, 'Failed:', failedCount);
              
              // Show appropriate success/failure message
              if (failedCount === 0) {
                Alert.alert('✅ Completado', `Todos los ${deletedCount} briefs han sido eliminados exitosamente`);
              } else {
                Alert.alert(
                  '⚠️ Parcialmente Completado', 
                  `${deletedCount} briefs eliminados, ${failedCount} fallaron. La aplicación se actualizará para reflejar los cambios.`,
                  [{ text: 'OK', onPress: () => handleRefresh() }]
                );
              }
              
            } catch (error) {
              console.error('❌ Error during bulk deletion:', error);
              Alert.alert('❌ Error', 'Ocurrió un error durante la eliminación: ' + (error instanceof Error ? error.message : 'Error desconocido'));
            }
          },
        },
      ]
    );
  }, [briefsToShow, loading, supabaseLoading, deleteSingleBrief, clearAllBriefs, handleRefresh]);

  const handleMigrateToSupabase = useCallback(() => {
    Alert.alert(
      'Migrar a la Nube',
      `¿Quieres migrar ${savedBriefs.length} briefs locales a tu cuenta en la nube?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Migrar',
          onPress: () => migrateLocalToSupabase(),
        },
      ]
    );
  }, [savedBriefs.length, migrateLocalToSupabase]);

  const handleCloseModal = useCallback(() => {
    setShowBriefModal(false);
    setSelectedBrief(null);
  }, []);

  const handleNavigateToProfile = useCallback(() => {
    router.push('/(tabs)/profile');
  }, []);

  const handleToggleActions = useCallback(() => {
    setShowActions(prev => !prev);
  }, []);

  const handleNavigateToApp = useCallback(() => {
    router.push('/(tabs)/');
  }, []);

  // Extracted deletion logic for better performance and reusability
  const deleteSingleBrief = useCallback(async (brief: UnifiedBrief): Promise<{ success: boolean; id: string; title: string }> => {
    try {
      console.log('🗑️ Attempting to delete brief:', brief.id, brief.title);
      
      // Try integrated deletion first (handles both Supabase and local)
      const integratedSuccess = await deleteIntegratedBrief(brief.id);
      if (integratedSuccess) {
        console.log('✅ Successfully deleted via integrated method:', brief.id);
        return { success: true, id: brief.id, title: brief.title };
      }

      // Fallback: try direct methods based on brief type
      if (user && 'created_at' in brief) {
        // Database brief - try Supabase deletion
        console.log('🔄 Trying direct Supabase deletion for:', brief.id);
        const supabaseSuccess = await deleteSupabaseBrief(brief.id);
        if (supabaseSuccess) {
          console.log('✅ Successfully deleted via Supabase:', brief.id);
          return { success: true, id: brief.id, title: brief.title };
        }
      } else {
        // Local brief - try local deletion
        console.log('🔄 Trying direct local deletion for:', brief.id);
        await deleteLocalBrief(brief.id);
        console.log('✅ Successfully deleted via local method:', brief.id);
        return { success: true, id: brief.id, title: brief.title };
      }

      console.error('❌ Failed to delete brief:', brief.id);
      return { success: false, id: brief.id, title: brief.title };
    } catch (error) {
      console.error('❌ Error deleting brief:', brief.id, error);
      return { success: false, id: brief.id, title: brief.title };
    }
  }, [deleteIntegratedBrief, user, deleteSupabaseBrief, deleteLocalBrief]);

  const handleForceClear = useCallback(async () => {
    try {
      console.log('🧹 Force clearing all local storage...');
      
      // Limpiar AsyncStorage directamente
      const STORAGE_KEY = '@briefboy_saved_briefs';
      await AsyncStorage.removeItem(STORAGE_KEY);
      
      // También limpiar el hook
      await clearAllBriefs();
      
      Alert.alert('✅ Limpieza Completa', 'Todos los briefs han sido eliminados. La aplicación se actualizará.', [
        {
          text: 'OK',
          onPress: () => {
            // Usar el método cross-platform para refrescar
            handleRefresh();
          }
        }
      ]);
    } catch (error) {
      console.error('Error in force clear:', error);
      Alert.alert('❌ Error', 'No se pudo limpiar completamente el storage');
    }
  }, [clearAllBriefs]);

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.header,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Mis Briefs</Text>
        <Text style={styles.headerSubtitle}>
          {user 
            ? `${totalBriefs} brief${totalBriefs !== 1 ? 's' : ''} guardado${totalBriefs !== 1 ? 's' : ''}`
            : `${savedBriefs.length} brief${savedBriefs.length !== 1 ? 's' : ''} local${savedBriefs.length !== 1 ? 'es' : ''}`
          }
        </Text>
        
        {user && (
          <Pressable 
            style={styles.userInfo}
            onPress={handleNavigateToProfile}
          >
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.cloudBadge}>
              <Text style={styles.cloudBadgeText}>☁️ Ver Perfil</Text>
            </View>
          </Pressable>
        )}
      </View>
      
      {briefsToShow.length > 0 && (
        <Pressable
          style={styles.actionsButton}
          onPress={handleToggleActions}
        >
          <Text style={styles.actionsButtonText}>⋯</Text>
        </Pressable>
      )}
    </Animated.View>
  );

  const renderActionMenu = () => {
    if (!showActions) return null;
    
    return (
      <Animated.View 
        style={[
          styles.actionMenu,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        {user && savedBriefs.length > 0 && (
          <Pressable style={styles.actionItem} onPress={handleMigrateToSupabase}>
            <Text style={styles.actionIcon}>☁️</Text>
            <Text style={styles.actionText}>Migrar briefs locales</Text>
          </Pressable>
        )}
        
        <Pressable style={styles.actionItem} onPress={handleClearAll}>
          <Text style={styles.actionIcon}>🗑️</Text>
          <Text style={styles.actionText}>Eliminar todos ({briefsToShow.length})</Text>
        </Pressable>
        
        <Pressable 
          style={styles.actionItem} 
          onPress={handleForceClear}
        >
          <Text style={styles.actionIcon}>🧹</Text>
          <Text style={styles.actionText}>Limpiar completamente</Text>
        </Pressable>
        
        {user && (
          <Pressable style={styles.actionItem} onPress={signOut}>
            <Text style={styles.actionIcon}>👋</Text>
            <Text style={styles.actionText}>Cerrar sesión</Text>
          </Pressable>
        )}
      </Animated.View>
    );
  };

  const renderModal = () => (
    <Modal
      visible={showBriefModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCloseModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderContent}>
            <Text style={styles.modalTitle} numberOfLines={2}>
              {selectedBrief?.title || 'Brief Guardado'}
            </Text>
            <Text style={styles.modalSubtitle}>
              Guardado el {selectedBrief && new Date(
                'created_at' in selectedBrief ? selectedBrief.created_at : selectedBrief.createdAt
              ).toLocaleDateString('es-ES')}
            </Text>
          </View>
          
          <Pressable style={styles.closeButton} onPress={handleCloseModal}>
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>
        </View>
        
        <ScrollView style={styles.modalContent}>
          {selectedBrief && (
            <ProfessionalBriefDisplay
              brief={selectedBrief.brief || selectedBrief.brief_data}
              loading={false}
              error={null}
            />
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  // Render empty state for non-authenticated users with no briefs
  const shouldShowEmptyState = !isLoading && briefsToShow.length === 0 && !user;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {shouldShowEmptyState ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateIcon}>📝</Text>
          <Text style={styles.emptyStateTitle}>No hay briefs guardados</Text>
          <Text style={styles.emptyStateSubtitle}>
            Crea tu primer brief desde la página principal
          </Text>
          <Pressable
            style={styles.emptyStateButton}
            onPress={handleNavigateToApp}
          >
            <Text style={styles.emptyStateButtonText}>Crear Brief</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {renderHeader()}
          {renderActionMenu()}
          
          <ImprovedSavedBriefsList
            key={forceRefreshKey}
            briefs={briefsToShow}
            onSelectBrief={handleSelectBrief}
            onDeleteBrief={handleDeleteBrief}
            isLoading={isLoading}
            onRefresh={handleRefresh}
            showEmptyActions={true}
          />
          
          {renderModal()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  
  // Header Styles
  header: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomWidth: 4,
    borderBottomColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
    minHeight: 80, // Asegurar altura mínima para evitar overlap
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 8,
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  userEmail: {
    fontSize: 12,
    color: '#FFD700',
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  cloudBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cloudBadgeText: {
    fontSize: 10,
    color: '#000000',
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  actionsButton: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  actionsButtonText: {
    fontSize: 20,
    color: '#FFD700',
    fontWeight: '900',
  },
  
  // Action Menu
  actionMenu: {
    backgroundColor: '#000000',
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#333333',
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 16,
  },
  actionText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#000000',
    borderBottomWidth: 4,
    borderBottomColor: '#FFFFFF',
  },
  modalHeaderContent: {
    flex: 1,
    marginRight: Theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#FFD700',
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1,
  },
  closeButton: {
    padding: 12,
    borderRadius: 0,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: '900',
  },
  modalContent: {
    flex: 1,
  },

  // Empty state styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    opacity: 0.8,
  },
  emptyStateButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default ImprovedBriefsScreen;