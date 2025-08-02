import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useSupabaseAuth } from './useSupabaseAuth';
import { DatabaseBrief, BriefInput, BriefUpdate, BriefStats } from '../types/brief';

export interface UseSupabaseBriefsReturn {
  briefs: DatabaseBrief[];
  loading: boolean;
  error: string | null;
  stats: BriefStats | null;
  
  // CRUD operations
  createBrief: (brief: BriefInput) => Promise<DatabaseBrief | null>;
  updateBrief: (id: string, updates: BriefUpdate) => Promise<DatabaseBrief | null>;
  deleteBrief: (id: string) => Promise<boolean>;
  getBrief: (id: string) => Promise<DatabaseBrief | null>;
  
  // Utility functions
  refreshBriefs: () => Promise<void>;
  clearError: () => void;
  
  // Filter and search
  filterByStatus: (status: DatabaseBrief['status']) => DatabaseBrief[];
  searchBriefs: (query: string) => DatabaseBrief[];
}

export function useSupabaseBriefs(): UseSupabaseBriefsReturn {
  const { user } = useSupabaseAuth();
  const [briefs, setBriefs] = useState<DatabaseBrief[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BriefStats | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch all briefs for the current user
  const fetchBriefs = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('briefs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setBriefs(data || []);
    } catch (err) {
      console.error('Error fetching briefs:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los briefs');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch user stats (calculate from briefs data)
  const fetchStats = useCallback(async () => {
    if (!user || briefs.length === 0) {
      setStats(null);
      return;
    }

    try {
      // Calculate stats from existing briefs data
      const completedBriefs = briefs.filter(b => b.status === 'completed').length;
      const draftBriefs = briefs.filter(b => b.status === 'draft').length;
      const dates = briefs.map(b => b.created_at).sort();
      
      const stats: BriefStats = {
        user_id: user.id,
        total_briefs: briefs.length,
        completed_briefs: completedBriefs,
        draft_briefs: draftBriefs,
        last_brief_created: dates[dates.length - 1] || new Date().toISOString(),
        first_brief_created: dates[0] || new Date().toISOString()
      };

      setStats(stats);
    } catch (err) {
      console.error('Error calculating stats:', err);
      setStats(null);
    }
  }, [user, briefs]);

  // Create a new brief
  const createBrief = useCallback(async (briefInput: BriefInput): Promise<DatabaseBrief | null> => {
    if (!user) {
      setError('Usuario no autenticado');
      return null;
    }

    // Store previous state for rollback
    const previousBriefs = briefs;
    const previousStats = stats;

    try {
      setLoading(true);
      setError(null);

      const briefData = {
        ...briefInput,
        user_id: user.id,
        status: briefInput.status || 'draft'
      };

      // Create optimistic temporary brief for immediate UI feedback
      const tempBrief: DatabaseBrief = {
        id: `temp-${Date.now()}`,
        ...briefData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as DatabaseBrief;

      // Optimistic update
      setBriefs(prev => [tempBrief, ...prev]);

      const { data, error: createError } = await supabase
        .from('briefs')
        .insert([briefData])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Replace temporary brief with real data
      setBriefs(prev => prev.map(brief => 
        brief.id === tempBrief.id ? data : brief
      ));
      
      // Refresh stats after successful creation
      await fetchStats();

      return data;
    } catch (err) {
      console.error('Error creating brief:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el brief');
      
      // Rollback: restore previous state
      setBriefs(previousBriefs);
      setStats(previousStats);
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, fetchStats, briefs, stats]);

  // Update an existing brief
  const updateBrief = useCallback(async (id: string, updates: BriefUpdate): Promise<DatabaseBrief | null> => {
    if (!user) {
      setError('Usuario no autenticado');
      return null;
    }

    // Store previous state for rollback
    const previousBriefs = briefs;
    const originalBrief = briefs.find(brief => brief.id === id);
    
    if (!originalBrief) {
      setError('Brief no encontrado');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Optimistic update: apply changes immediately for better UX
      const optimisticBrief: DatabaseBrief = {
        ...originalBrief,
        ...updates,
        // Handle partial brief_data updates properly
        brief_data: updates.brief_data 
          ? { ...originalBrief.brief_data, ...updates.brief_data }
          : originalBrief.brief_data,
        updated_at: new Date().toISOString()
      };

      setBriefs(prev => prev.map(brief => 
        brief.id === id ? optimisticBrief : brief
      ));

      const { data, error: updateError } = await supabase
        .from('briefs')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Replace optimistic update with real data
      setBriefs(prev => prev.map(brief => 
        brief.id === id ? data : brief
      ));

      // Refresh stats after successful update
      await fetchStats();

      return data;
    } catch (err) {
      console.error('Error updating brief:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el brief');
      
      // Rollback: restore previous state
      setBriefs(previousBriefs);
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, briefs, fetchStats]);

  // Delete a brief
  const deleteBrief = useCallback(async (id: string): Promise<boolean> => {
    if (!user) {
      setError('Usuario no autenticado');
      return false;
    }

    // Store previous state for rollback
    const previousBriefs = briefs;
    const previousStats = stats;
    const briefToDelete = briefs.find(brief => brief.id === id);
    
    if (!briefToDelete) {
      setError('Brief no encontrado');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // Optimistic update: remove from UI immediately
      setBriefs(prev => prev.filter(brief => brief.id !== id));

      const { error: deleteError } = await supabase
        .from('briefs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }
      
      // Refresh stats after successful deletion
      await fetchStats();

      return true;
    } catch (err) {
      console.error('Error deleting brief:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar el brief');
      
      // Rollback: restore previous state
      setBriefs(previousBriefs);
      setStats(previousStats);
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchStats, briefs, stats]);

  // Get a single brief
  const getBrief = useCallback(async (id: string): Promise<DatabaseBrief | null> => {
    if (!user) {
      setError('Usuario no autenticado');
      return null;
    }

    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('briefs')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      return data;
    } catch (err) {
      console.error('Error fetching brief:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el brief');
      return null;
    }
  }, [user]);

  // Refresh briefs
  const refreshBriefs = useCallback(async () => {
    await fetchBriefs();
    await fetchStats();
  }, [fetchBriefs, fetchStats]);

  // Filter briefs by status
  const filterByStatus = useCallback((status: DatabaseBrief['status']) => {
    return briefs.filter(brief => brief.status === status);
  }, [briefs]);

  // Search briefs
  const searchBriefs = useCallback((query: string) => {
    if (!query.trim()) return briefs;
    
    const lowercaseQuery = query.toLowerCase();
    return briefs.filter(brief => 
      brief.title.toLowerCase().includes(lowercaseQuery) ||
      brief.transcription?.toLowerCase().includes(lowercaseQuery) ||
      JSON.stringify(brief.brief_data).toLowerCase().includes(lowercaseQuery)
    );
  }, [briefs]);

  // Load briefs when user changes
  useEffect(() => {
    if (user) {
      fetchBriefs();
    } else {
      setBriefs([]);
      setStats(null);
    }
  }, [user, fetchBriefs]);

  // Calculate stats when briefs change
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Set up real-time subscription (temporarily disabled to fix performance issues)
  // TODO: Re-enable after optimizing the stats calculation
  /*
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('briefs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'briefs',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time brief change:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setBriefs(prev => [payload.new as DatabaseBrief, ...prev]);
              break;
            case 'UPDATE':
              setBriefs(prev => prev.map(brief => 
                brief.id === payload.new.id ? payload.new as DatabaseBrief : brief
              ));
              break;
            case 'DELETE':
              setBriefs(prev => prev.filter(brief => brief.id !== payload.old.id));
              break;
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]); // Simplified dependencies
  */

  return {
    briefs,
    loading,
    error,
    stats,
    createBrief,
    updateBrief,
    deleteBrief,
    getBrief,
    refreshBriefs,
    clearError,
    filterByStatus,
    searchBriefs
  };
}