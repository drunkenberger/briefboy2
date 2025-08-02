import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useSupabaseBriefs } from '../hooks/useSupabaseBriefs';
import { useIntegratedBriefStorage } from '../hooks/useIntegratedBriefStorage';
import { useBriefStorage } from '../hooks/useBriefStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BriefsTestComponentProps {
  onBack?: () => void;
}

export default function BriefsTestComponent({ onBack }: BriefsTestComponentProps = {}) {
  const { user, loading: authLoading } = useSupabaseAuth();
  const { 
    briefs, 
    loading: briefsLoading, 
    error: briefsError,
    createBrief,
    deleteBrief: deleteSupabaseBrief,
    stats 
  } = useSupabaseBriefs();
  
  const { 
    allBriefs, 
    totalBriefs,
    autoSaveBrief 
  } = useIntegratedBriefStorage();

  const { 
    savedBriefs: localBriefs, 
    clearAllBriefs: clearLocal,
    deleteBrief: deleteLocalBrief 
  } = useBriefStorage();

  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testCreateBrief = async () => {
    if (!user) {
      addTestResult('❌ No hay usuario autenticado');
      return;
    }

    try {
      addTestResult('🔄 Creando brief de prueba...');
      
      const testBrief = {
        title: `Test Brief ${new Date().toLocaleTimeString()}`,
        transcription: 'Esta es una transcripción de prueba para verificar que Supabase funciona correctamente.',
        brief_data: {
          projectTitle: 'Test Marketing Campaign',
          briefSummary: 'Brief de prueba para verificar la integración con Supabase',
          businessChallenge: 'Probar que la funcionalidad de guardado funciona',
          strategicObjectives: ['Verificar conexión', 'Probar CRUD operations'],
          targetAudience: {
            primary: 'Desarrolladores testing la app',
            secondary: 'QA testers',
            insights: ['Necesitan feedback rápido', 'Valoran logs detallados']
          }
        },
        status: 'draft' as const
      };

      const result = await createBrief(testBrief);
      
      if (result) {
        addTestResult(`✅ Brief creado exitosamente! ID: ${result.id.substring(0, 8)}...`);
      } else {
        addTestResult('❌ Error: createBrief retornó null');
      }
    } catch (error) {
      addTestResult(`❌ Error creando brief: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testAutoSave = async () => {
    try {
      addTestResult('🔄 Probando auto-save...');
      
      const testBriefData = {
        projectTitle: `Auto-saved Brief ${new Date().toLocaleTimeString()}`,
        briefSummary: 'Brief guardado automáticamente para prueba',
        businessChallenge: 'Probar auto-save functionality',
        strategicObjectives: ['Auto-save test', 'Integration test']
      };

      const result = await autoSaveBrief(
        testBriefData, 
        'Transcripción de auto-save test',
        undefined
      );
      
      if (result) {
        addTestResult(`✅ Auto-save exitoso! ID: ${result.substring(0, 8)}...`);
      } else {
        addTestResult('❌ Error: autoSaveBrief retornó null');
      }
    } catch (error) {
      addTestResult(`❌ Error en auto-save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testClearAllLocal = async () => {
    try {
      addTestResult('🗑️ Probando eliminar todos los briefs locales...');
      addTestResult(`🗑️ Briefs locales antes: ${localBriefs.length}`);
      
      await clearLocal();
      addTestResult('✅ clearLocal() ejecutado exitosamente');
      addTestResult('🔄 Recargando página para ver cambios...');
      
      // Force a small delay to see the change
      setTimeout(() => {
        addTestResult(`📊 Briefs locales después: ${localBriefs.length}`);
      }, 1000);
    } catch (error) {
      addTestResult(`❌ Error en clearLocal(): ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testDeleteSingleLocal = async () => {
    if (localBriefs.length === 0) {
      addTestResult('❌ No hay briefs locales para eliminar');
      return;
    }

    try {
      const firstBrief = localBriefs[0];
      addTestResult(`🗑️ Probando eliminar brief local: ${firstBrief.title} (ID: ${firstBrief.id})`);
      addTestResult(`🗑️ Briefs locales antes: ${localBriefs.length}`);
      
      await deleteLocalBrief(firstBrief.id);
      addTestResult('✅ deleteLocalBrief() ejecutado exitosamente');
    } catch (error) {
      addTestResult(`❌ Error en deleteLocalBrief(): ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const nukeLiterally = async () => {
    try {
      addTestResult('💥 INICIANDO RESET COMPLETO - BORRANDO TODO...');
      addTestResult(`📊 Estado inicial: ${localBriefs.length} locales, ${briefs.length} Supabase, ${allBriefs.length} total`);
      
      // 1. Clear local storage completely
      addTestResult('🗑️ Paso 1: Limpiando AsyncStorage completamente...');
      await clearLocal();
      
      // Also manually clear AsyncStorage keys
      try {
        await AsyncStorage.removeItem('@briefboy_saved_briefs');
        addTestResult('✅ Clave @briefboy_saved_briefs eliminada');
      } catch (error) {
        addTestResult(`⚠️ Error eliminando clave principal: ${error}`);
      }
      
      addTestResult('✅ Storage local limpiado completamente');
      
      // 2. Delete ALL Supabase briefs if user is logged in
      if (user && briefs.length > 0) {
        addTestResult(`🗑️ Paso 2: Eliminando ${briefs.length} briefs de Supabase...`);
        const briefsToDelete = [...briefs]; // Create a copy
        
        for (let i = 0; i < briefsToDelete.length; i++) {
          const brief = briefsToDelete[i];
          try {
            await deleteSupabaseBrief(brief.id);
            addTestResult(`✅ Eliminado Supabase ${i + 1}/${briefsToDelete.length}: ${brief.title.substring(0, 30)}...`);
          } catch (error) {
            addTestResult(`❌ Error eliminando ${brief.title}: ${error}`);
          }
        }
        addTestResult('✅ Todos los briefs de Supabase procesados');
      } else {
        addTestResult('ℹ️ No hay briefs de Supabase o usuario no autenticado');
      }
      
      // 3. Clear any remaining localStorage (web only)
      addTestResult('🗑️ Paso 3: Limpiando localStorage residual...');
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const keys = Object.keys(window.localStorage);
          let removedCount = 0;
          for (const key of keys) {
            if (key.toLowerCase().includes('brief')) {
              window.localStorage.removeItem(key);
              addTestResult(`🗑️ localStorage key removed: ${key}`);
              removedCount++;
            }
          }
          addTestResult(`✅ ${removedCount} localStorage keys removed`);
        } else {
          addTestResult('ℹ️ localStorage no disponible (React Native)');
        }
      } catch (error) {
        addTestResult(`⚠️ Error limpiando localStorage: ${error}`);
      }
      
      addTestResult('💥 RESET COMPLETO TERMINADO');
      addTestResult('🔄 RECARGA LA PÁGINA MANUALMENTE PARA VER CAMBIOS');
      
    } catch (error) {
      addTestResult(`❌ Error en reset completo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        addTestResult(`✅ Usuario autenticado: ${user.email}`);
      } else {
        addTestResult('⚠️ No hay usuario autenticado');
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (briefsError) {
      addTestResult(`❌ Error cargando briefs: ${briefsError}`);
    }
  }, [briefsError]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {onBack && (
          <Pressable style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </Pressable>
        )}
        <Text style={styles.title}>🧪 Test de Briefs en Supabase</Text>
      </View>
      
      {/* Status */}
      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>Estado Actual</Text>
        <Text style={styles.statusText}>
          🔐 Usuario: {authLoading ? 'Cargando...' : (user ? `✅ ${user.email}` : '❌ No autenticado')}
        </Text>
        <Text style={styles.statusText}>
          📊 Briefs: {briefsLoading ? 'Cargando...' : `${briefs.length} en Supabase`}
        </Text>
        <Text style={styles.statusText}>
          📈 Total integrado: {totalBriefs} briefs
        </Text>
        <Text style={styles.statusText}>
          📱 Briefs locales: {localBriefs.length} briefs
        </Text>
        {stats && (
          <Text style={styles.statusText}>
            📋 Stats: {stats.completed_briefs} completados, {stats.draft_briefs} borradores
          </Text>
        )}
      </View>

      {/* Test Buttons */}
      <View style={styles.buttonsSection}>
        <Text style={styles.sectionTitle}>Pruebas</Text>
        <Pressable 
          style={[styles.button, !user && styles.buttonDisabled]} 
          onPress={testCreateBrief}
          disabled={!user}
        >
          <Text style={styles.buttonText}>🔧 Crear Brief Test</Text>
        </Pressable>
        
        <Pressable 
          style={[styles.button, styles.buttonSecondary]} 
          onPress={testAutoSave}
        >
          <Text style={styles.buttonText}>💾 Test Auto-Save</Text>
        </Pressable>
        
        <Pressable style={[styles.button, styles.buttonClear]} onPress={clearResults}>
          <Text style={styles.buttonText}>🗑️ Limpiar Resultados</Text>
        </Pressable>
        
        <Pressable 
          style={[styles.button, styles.buttonLocal]} 
          onPress={testDeleteSingleLocal}
        >
          <Text style={styles.buttonText}>🗑️ Eliminar 1 Brief Local</Text>
        </Pressable>
        
        <Pressable 
          style={[styles.button, styles.buttonLocal]} 
          onPress={testClearAllLocal}
        >
          <Text style={styles.buttonText}>🗑️ Eliminar Todos Locales</Text>
        </Pressable>
        
        <Pressable 
          style={[styles.button, styles.buttonNuke]} 
          onPress={nukeLiterally}
        >
          <Text style={styles.buttonText}>💥 RESET COMPLETO - BORRAR TODO</Text>
        </Pressable>
      </View>

      {/* Results */}
      <View style={styles.resultsSection}>
        <Text style={styles.sectionTitle}>Resultados ({testResults.length})</Text>
        <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
          {testResults.map((result, index) => (
            <Text key={index} style={styles.resultText}>
              {result}
            </Text>
          ))}
          {testResults.length === 0 && (
            <Text style={styles.noResultsText}>No hay resultados aún...</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#111111',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFD700',
    textAlign: 'center',
  },
  statusSection: {
    backgroundColor: '#111111',
    padding: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
    marginBottom: 20,
  },
  buttonsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginBottom: 10,
  },
  buttonSecondary: {
    backgroundColor: '#111111',
  },
  buttonClear: {
    backgroundColor: '#dc2626',
  },
  buttonLocal: {
    backgroundColor: '#16a34a',
  },
  buttonNuke: {
    backgroundColor: '#dc2626',
    borderColor: '#991b1b',
    borderWidth: 3,
  },
  buttonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.5,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  resultsSection: {
    flex: 1,
    backgroundColor: '#111111',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    padding: 16,
  },
  resultsList: {
    flex: 1,
  },
  resultText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  noResultsText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});