import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSupabaseBriefs } from './useSupabaseBriefs';
import { useBriefStorage } from './useBriefStorage';
import { useSupabaseAuth } from './useSupabaseAuth';
import { DatabaseBrief, BriefInput } from '../types/brief';
import { generateBriefTitle } from '../utils/briefValidation';

export interface UseIntegratedBriefStorageReturn {
  // From Supabase
  supabaseBriefs: DatabaseBrief[];
  supabaseLoading: boolean;
  supabaseError: string | null;
  
  // From local storage (for backwards compatibility)
  localBriefs: any[];
  localLoading: boolean;
  
  // Integrated operations
  saveNewBrief: (
    title: string, 
    transcription: string, 
    briefData: any, 
    audioUri?: string,
    tokensUsed?: number,
    tokensBreakdown?: Record<string, number>,
    estimatedCost?: number
  ) => Promise<string | null>;
  updateExistingBrief: (id: string, updates: Partial<BriefInput>) => Promise<boolean>;
  deleteBrief: (id: string) => Promise<boolean>;
  
  // Auto-save functionality
  autoSaveBrief: (
    briefData: any, 
    transcription?: string, 
    audioUri?: string,
    tokensUsed?: number,
    tokensBreakdown?: Record<string, number>,
    estimatedCost?: number
  ) => Promise<string | null>;
  
  // Utility functions
  refreshAll: () => Promise<void>;
  clearErrors: () => void;
  
  // Migration utilities
  migrateLocalToSupabase: () => Promise<void>;
  migrationPromptShown: boolean;
  shouldShowMigrationPrompt: boolean;
  
  // Combined data
  allBriefs: (DatabaseBrief | any)[];
  totalBriefs: number;
}

export function useIntegratedBriefStorage(): UseIntegratedBriefStorageReturn {
  const { user } = useSupabaseAuth();
  
  // Safely use Supabase hooks with explicit error handling
  let supabaseHookResult;
  let supabaseInitializationError: string | null = null;
  
  try {
    supabaseHookResult = useSupabaseBriefs();
  } catch (error) {
    console.error('❌ Critical: Supabase briefs hook initialization failed:', error);
    
    // Create detailed error message for diagnosis
    const errorMessage = error instanceof Error 
      ? `Supabase initialization failed: ${error.message}` 
      : 'Supabase configuration error - check environment variables and network connectivity';
    
    supabaseInitializationError = errorMessage;
    
    // Return explicit error state instead of mock functions
    supabaseHookResult = {
      briefs: [],
      loading: false,
      error: errorMessage,
      createBrief: async () => {
        console.error('❌ Cannot create brief: Supabase not initialized');
        throw new Error('Supabase service unavailable');
      },
      updateBrief: async () => {
        console.error('❌ Cannot update brief: Supabase not initialized');
        throw new Error('Supabase service unavailable');
      },
      deleteBrief: async () => {
        console.error('❌ Cannot delete brief: Supabase not initialized');
        throw new Error('Supabase service unavailable');
      },
      refreshBriefs: async () => {
        console.error('❌ Cannot refresh briefs: Supabase not initialized');
        throw new Error('Supabase service unavailable');
      },
      clearError: () => {
        console.warn('⚠️ Cannot clear error: Supabase not initialized');
      },
    };
  }
  
  const {
    briefs: supabaseBriefs = [],
    loading: supabaseLoading = false,
    error: supabaseError = null,
    createBrief,
    updateBrief,
    deleteBrief: deleteSupabaseBrief,
    refreshBriefs: refreshSupabase,
    clearError: clearSupabaseError
  } = supabaseHookResult;
  
  const {
    savedBriefs: localBriefs = [],
    loading: localLoading = false,
    saveBrief: saveLocalBrief,
    updateBrief: updateLocalBrief,
    deleteBrief: deleteLocalBrief
  } = useBriefStorage();

  const [migrationInProgress, setMigrationInProgress] = useState(false);
  const [lastAutoSaveId, setLastAutoSaveId] = useState<string | null>(null);
  const [migrationPromptShown, setMigrationPromptShown] = useState(false);

  // Early initialization check
  const isInitialized = React.useMemo(() => {
    return supabaseBriefs !== undefined && localBriefs !== undefined;
  }, [supabaseBriefs, localBriefs]);

  const clearErrors = useCallback(() => {
    clearSupabaseError();
  }, [clearSupabaseError]);

  // Auto-save functionality - saves to both local and Supabase if user is authenticated
  const autoSaveBrief = useCallback(async (
    briefData: any, 
    transcription?: string, 
    audioUri?: string,
    tokensUsed?: number,
    tokensBreakdown?: Record<string, number>,
    estimatedCost?: number
  ): Promise<string | null> => {
    if (!briefData) return null;

    const title = generateBriefTitle(briefData);
    
    try {
      let supabaseId: string | null = null;
      
      // Save to Supabase if user is authenticated
      if (user) {
        if (supabaseInitializationError) {
          console.warn('⚠️ Skipping Supabase save - service unavailable:', supabaseInitializationError);
        } else {
          const briefInput: BriefInput = {
            title,
            transcription: transcription || '',
            brief_data: briefData,
            audio_url: audioUri,
            status: 'draft',
            tokens_used: tokensUsed || 0,
            tokens_breakdown: tokensBreakdown || {},
            estimated_cost: estimatedCost || 0
          };

          const savedBrief = await createBrief(briefInput);
          supabaseId = savedBrief?.id || null;
        }
      }
      
      // Always save to local storage as backup
      const localId = await saveLocalBrief(title, transcription || '', briefData, audioUri);
      
      // Return Supabase ID if available, otherwise local ID
      const resultId = supabaseId || localId;
      setLastAutoSaveId(resultId);
      
      return resultId;
    } catch (error) {
      console.error('Error in auto-save:', error);
      
      // Fallback to local storage only
      try {
        const localId = await saveLocalBrief(title, transcription || '', briefData, audioUri);
        setLastAutoSaveId(localId);
        return localId;
      } catch (localError) {
        console.error('Error in local fallback save:', localError);
        return null;
      }
    }
  }, [user, createBrief, saveLocalBrief]);

  // Save a new brief explicitly
  const saveNewBrief = useCallback(async (
    title: string,
    transcription: string,
    briefData: any,
    audioUri?: string,
    tokensUsed?: number,
    tokensBreakdown?: Record<string, number>,
    estimatedCost?: number
  ): Promise<string | null> => {
    try {
      let supabaseId: string | null = null;
      
      // Save to Supabase if user is authenticated
      if (user) {
        if (supabaseInitializationError) {
          console.warn('⚠️ Skipping Supabase save - service unavailable:', supabaseInitializationError);
        } else {
          const briefInput: BriefInput = {
            title,
            transcription,
            brief_data: briefData,
            audio_url: audioUri,
            status: 'completed', // Explicitly saved briefs are marked as completed
            tokens_used: tokensUsed || 0,
            tokens_breakdown: tokensBreakdown || {},
            estimated_cost: estimatedCost || 0
          };

          const savedBrief = await createBrief(briefInput);
          supabaseId = savedBrief?.id || null;
        }
      }
      
      // Always save to local storage
      const localId = await saveLocalBrief(title, transcription, briefData, audioUri);
      
      return supabaseId || localId;
    } catch (error) {
      console.error('Error saving new brief:', error);
      return null;
    }
  }, [user, createBrief, saveLocalBrief]);

  // Update an existing brief
  const updateExistingBrief = useCallback(async (
    id: string,
    updates: Partial<BriefInput>
  ): Promise<boolean> => {
    try {
      let supabaseSuccess = false;
      let localSuccess = false;
      
      // Try to update in Supabase first
      if (user) {
        if (supabaseInitializationError) {
          console.warn('⚠️ Skipping Supabase update - service unavailable:', supabaseInitializationError);
        } else {
          const updatedBrief = await updateBrief(id, updates);
          supabaseSuccess = !!updatedBrief;
        }
      }
      
      // Update in local storage
      try {
        await updateLocalBrief(id, updates);
        localSuccess = true;
      } catch (localError) {
        console.warn('Failed to update local brief:', localError);
      }
      
      return supabaseSuccess || localSuccess;
    } catch (error) {
      console.error('Error updating brief:', error);
      return false;
    }
  }, [user, updateBrief, updateLocalBrief]);

  // Delete a brief from both storages
  const deleteBrief = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('🗑️ useIntegratedBriefStorage: Starting delete for id:', id);
      console.log('🗑️ useIntegratedBriefStorage: User authenticated:', !!user);
      console.log('🗑️ useIntegratedBriefStorage: Available briefs:', {
        supabase: supabaseBriefs.length,
        local: localBriefs.length
      });
      
      let supabaseSuccess = false;
      let localSuccess = false;
      
      // Try to delete from Supabase first
      if (user) {
        if (supabaseInitializationError) {
          console.warn('⚠️ Skipping Supabase delete - service unavailable:', supabaseInitializationError);
          console.log('🗑️ useIntegratedBriefStorage: Skipping Supabase delete due to initialization error');
        } else {
          console.log('🗑️ useIntegratedBriefStorage: Attempting Supabase delete...');
          try {
            supabaseSuccess = await deleteSupabaseBrief(id);
            console.log('🗑️ useIntegratedBriefStorage: Supabase delete result:', supabaseSuccess);
          } catch (supabaseError) {
            console.error('🗑️ useIntegratedBriefStorage: Supabase delete error:', supabaseError);
          }
        }
      }
      
      // Try to delete from local storage
      console.log('🗑️ useIntegratedBriefStorage: Attempting local delete...');
      try {
        await deleteLocalBrief(id);
        localSuccess = true;
        console.log('🗑️ useIntegratedBriefStorage: Local delete successful');
      } catch (localError) {
        console.log('🗑️ useIntegratedBriefStorage: Local delete failed (may not exist locally):', localError);
      }
      
      const overallSuccess = supabaseSuccess || localSuccess;
      console.log('🗑️ useIntegratedBriefStorage: Overall delete result:', {
        supabaseSuccess,
        localSuccess,
        overallSuccess
      });
      
      return overallSuccess;
    } catch (error) {
      console.error('🗑️ useIntegratedBriefStorage: Unexpected error during delete:', error);
      return false;
    }
  }, [user, deleteSupabaseBrief, deleteLocalBrief]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await refreshSupabase();
    // Local storage is automatically refreshed by the hook
  }, [refreshSupabase]);

  // Migrate local briefs to Supabase
  const migrateLocalToSupabase = useCallback(async () => {
    if (!user || migrationInProgress) return;
    
    setMigrationInProgress(true);
    
    try {
      console.log(`Starting migration of ${localBriefs.length} local briefs to Supabase...`);
      
      for (const localBrief of localBriefs) {
        try {
          const briefInput: BriefInput = {
            title: localBrief.title,
            transcription: localBrief.transcription || '',
            brief_data: localBrief.brief,
            audio_url: localBrief.audioUri,
            status: 'completed'
          };
          
          const savedBrief = await createBrief(briefInput);
          if (savedBrief) {
            console.log(`Migrated brief: ${localBrief.title}`);
          }
        } catch (briefError) {
          console.error(`Failed to migrate brief ${localBrief.title}:`, briefError);
        }
      }
      
      console.log('Migration completed');
      await refreshSupabase();
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      setMigrationInProgress(false);
    }
  }, [user, localBriefs, createBrief, refreshSupabase, migrationInProgress]);

  // Manual migration prompt when user logs in with local briefs
  useEffect(() => {
    const shouldPromptMigration = user && 
      localBriefs.length > 0 && 
      supabaseBriefs.length === 0 && 
      !migrationInProgress && 
      !supabaseLoading && 
      !migrationPromptShown &&
      !supabaseInitializationError; // Only prompt if Supabase is working

    if (shouldPromptMigration) {
      console.log(`📤 User logged in with ${localBriefs.length} local briefs - prompting for migration`);
      setMigrationPromptShown(true);
      
      // Trigger user notification/modal for manual migration
      // This could be handled by showing a banner, modal, or notification
      // For now, we'll log the prompt and let the UI components handle the display
      console.log('✨ Migration available: User can migrate local briefs to cloud storage');
      
      // The actual UI prompt should be handled by components that consume this hook
      // They can check if user has local briefs and show appropriate UI
    }
  }, [user?.id, localBriefs.length, supabaseBriefs.length, migrationInProgress, supabaseLoading, migrationPromptShown, supabaseInitializationError]);

  // Combine briefs from both sources, avoiding duplicates (memoized)
  const allBriefs = useMemo(() => {
    if (!isInitialized) {
      console.log('🔄 useIntegratedBriefStorage: Not yet initialized, returning empty array');
      return [];
    }
    
    try {
      if (!user) return localBriefs || []; // If no user, only show local briefs
      
      const safeBriefs = supabaseBriefs || [];
      const safeLocalBriefs = localBriefs || [];
      
      const filteredLocalBriefs = safeLocalBriefs.filter(local => 
        !safeBriefs.some(supabase => 
          supabase.title === local.title && 
          supabase.created_at && local.createdAt &&
          Math.abs(new Date(supabase.created_at).getTime() - new Date(local.createdAt).getTime()) < 5000 // 5 second tolerance
        )
      );
      
      return [...safeBriefs, ...filteredLocalBriefs];
    } catch (error) {
      console.error('Error combining briefs:', error);
      return [];
    }
  }, [isInitialized, supabaseBriefs, localBriefs, user]);

  const totalBriefs = allBriefs?.length || 0;

  // Calculate if migration prompt should be shown to UI components
  const shouldShowMigrationPrompt = user && 
    localBriefs.length > 0 && 
    supabaseBriefs.length === 0 && 
    !migrationInProgress && 
    !supabaseLoading && 
    !supabaseInitializationError;

  return {
    // From Supabase
    supabaseBriefs,
    supabaseLoading,
    supabaseError,
    
    // From local storage
    localBriefs,
    localLoading,
    
    // Integrated operations
    saveNewBrief,
    updateExistingBrief,
    deleteBrief,
    autoSaveBrief,
    
    // Utility functions
    refreshAll,
    clearErrors,
    migrateLocalToSupabase,
    migrationPromptShown,
    shouldShowMigrationPrompt,
    
    // Combined data
    allBriefs,
    totalBriefs
  };
}