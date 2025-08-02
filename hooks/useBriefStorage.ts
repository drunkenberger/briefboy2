import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { normalizeBrief, validateBrief, completeBrief, generateBriefTitle } from '../utils/briefValidation';
import { BriefData } from '../types/brief';

export interface SavedBrief {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  transcription: string;
  brief: BriefData;
  audioUri?: string;
}

const STORAGE_KEY = '@briefboy_saved_briefs';
const MAX_BRIEFS_LIMIT = 5; // Número máximo de briefs a mantener cuando hay problemas de almacenamiento

/**
 * Hook para manejar el almacenamiento local de briefs
 */
export function useBriefStorage() {
  const [savedBriefs, setSavedBriefs] = useState<SavedBrief[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar briefs guardados al inicializar
  useEffect(() => {
    loadSavedBriefs();
  }, []);

  const loadSavedBriefs = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const briefs = JSON.parse(stored);
        setSavedBriefs(briefs);
      }
    } catch (error) {
      console.error('Error loading saved briefs:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBrief = async (
    title: string,
    transcription: string,
    brief: any,
    audioUri?: string
  ): Promise<string> => {
    try {
      // Normalizar y validar el brief
      const normalizedBrief = normalizeBrief(brief);
      const validation = validateBrief(normalizedBrief);
      
      // Generar título automáticamente si está vacío o es muy genérico
      const finalTitle = title && title.trim() && !title.includes('Brief ') 
        ? title.trim() 
        : generateBriefTitle(normalizedBrief);
      
      // Completar brief si faltan campos críticos
      const completedBrief = validation.isValid ? normalizedBrief : completeBrief(normalizedBrief);
      
      console.log('Saving brief:', {
        title: finalTitle,
        validation: validation,
        hasRequiredFields: validation.isValid,
        completedFields: Object.keys(completedBrief).length
      });

      const newBrief: SavedBrief = {
        id: Date.now().toString(),
        title: finalTitle,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        transcription: transcription || '',
        brief: completedBrief,
        audioUri,
      };

      const updated = [newBrief, ...savedBriefs];
      
      // Intentar guardar, si falla por espacio, limpiar briefs antiguos
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setSavedBriefs(updated);
      } catch (storageError: any) {
        if (storageError.name === 'QuotaExceededError') {
          console.warn('Almacenamiento lleno, limpiando briefs antiguos...');
          // Mantener solo los últimos briefs según el límite definido
          const limitedBriefs = updated.slice(0, MAX_BRIEFS_LIMIT);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(limitedBriefs));
          setSavedBriefs(limitedBriefs);
        } else {
          throw storageError;
        }
      }
      
      return newBrief.id;
    } catch (error) {
      console.error('Error saving brief:', error);
      
      // Si hay un error, intentar guardar un brief básico
      try {
        const fallbackBrief: SavedBrief = {
          id: Date.now().toString(),
          title: title || `Brief ${new Date().toLocaleDateString()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          transcription: transcription || '',
          brief: brief || {},
          audioUri,
        };
        
        const updated = [fallbackBrief, ...savedBriefs];
        
        // Intentar guardar, si falla por espacio, limpiar briefs antiguos
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          setSavedBriefs(updated);
        } catch (storageError: any) {
          if (storageError.name === 'QuotaExceededError') {
            console.warn('Almacenamiento lleno en fallback, limpiando briefs antiguos...');
            // Mantener solo los últimos briefs según el límite definido
            const limitedBriefs = updated.slice(0, MAX_BRIEFS_LIMIT);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(limitedBriefs));
            setSavedBriefs(limitedBriefs);
          } else {
            throw storageError;
          }
        }
        
        console.warn('Brief guardado con datos básicos debido a error en normalización');
        return fallbackBrief.id;
      } catch (fallbackError) {
        console.error('Error en fallback save:', fallbackError);
        throw new Error('No se pudo guardar el brief. Verifica el almacenamiento del dispositivo.');
      }
    }
  };

  const updateBrief = async (id: string, updates: Partial<SavedBrief>) => {
    try {
      const updated = savedBriefs.map(brief => {
        if (brief.id === id) {
          const updatedBrief = { ...brief, ...updates, updatedAt: new Date().toISOString() };
          
          // Si se está actualizando el brief, normalizarlo
          if (updates.brief) {
            const normalizedBrief = normalizeBrief(updates.brief);
            updatedBrief.brief = normalizedBrief;
            
            // Actualizar título si es necesario
            if (!updatedBrief.title || updatedBrief.title.includes('Brief ')) {
              updatedBrief.title = generateBriefTitle(normalizedBrief);
            }
          }
          
          return updatedBrief;
        }
        return brief;
      });
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSavedBriefs(updated);
    } catch (error) {
      console.error('Error updating brief:', error);
      
      // Si hay error, intentar actualizar solo los campos básicos
      try {
        const updated = savedBriefs.map(brief => 
          brief.id === id 
            ? { 
                ...brief, 
                title: updates.title || brief.title || `Brief ${new Date().toLocaleDateString()}`,
                brief: updates.brief || brief.brief || {},
                updatedAt: new Date().toISOString() 
              }
            : brief
        );
        
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setSavedBriefs(updated);
        
        console.warn('Brief actualizado con datos básicos debido a error en normalización');
      } catch (fallbackError) {
        console.error('Error en fallback update:', fallbackError);
        throw new Error('No se pudo actualizar el brief. Verifica el almacenamiento del dispositivo.');
      }
    }
  };

  const deleteBrief = async (id: string) => {
    try {
      console.log('🗑️ useBriefStorage: Attempting to delete brief with id:', id);
      console.log('🗑️ useBriefStorage: Current savedBriefs count:', savedBriefs.length);
      console.log('🗑️ useBriefStorage: Current savedBriefs ids:', savedBriefs.map(b => b.id));
      
      const updated = savedBriefs.filter(brief => brief.id !== id);
      console.log('🗑️ useBriefStorage: After filtering, count:', updated.length);
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      console.log('🗑️ useBriefStorage: Saved to AsyncStorage successfully');
      
      setSavedBriefs(updated);
      console.log('🗑️ useBriefStorage: State updated successfully');
    } catch (error) {
      console.error('🗑️ useBriefStorage: Error deleting brief:', error);
      throw error;
    }
  };

  const getBriefById = (id: string): SavedBrief | undefined => {
    return savedBriefs.find(brief => brief.id === id);
  };

  const clearAllBriefs = async () => {
    try {
      console.log('🗑️ useBriefStorage: Clearing all briefs...');
      console.log('🗑️ useBriefStorage: Current count before clear:', savedBriefs.length);
      
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ useBriefStorage: Removed from AsyncStorage successfully');
      
      setSavedBriefs([]);
      console.log('🗑️ useBriefStorage: State cleared successfully');
    } catch (error) {
      console.error('🗑️ useBriefStorage: Error clearing all briefs:', error);
      throw error;
    }
  };

  const clearOldBriefs = async () => {
    try {
      // Mantener solo los últimos briefs según el límite definido
      const limitedBriefs = savedBriefs.slice(0, MAX_BRIEFS_LIMIT);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(limitedBriefs));
      setSavedBriefs(limitedBriefs);
      console.log(`Almacenamiento limpiado. Briefs: ${savedBriefs.length} -> ${limitedBriefs.length} (límite: ${MAX_BRIEFS_LIMIT})`);
    } catch (error) {
      console.error('Error limpiando almacenamiento:', error);
    }
  };

  const getStorageInfo = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const size = stored ? stored.length : 0;
      const count = savedBriefs.length;
      return { size, count };
    } catch (error) {
      console.error('Error obteniendo info de almacenamiento:', error);
      return { size: 0, count: 0 };
    }
  };

  return {
    savedBriefs,
    loading,
    saveBrief,
    updateBrief,
    deleteBrief,
    getBriefById,
    clearAllBriefs,
    clearOldBriefs,
    getStorageInfo,
    reload: loadSavedBriefs,
  };
}