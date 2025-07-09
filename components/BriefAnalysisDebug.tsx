import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { testOpenAIConnection } from '../utils/apiTest';

interface BriefAnalysisDebugProps {
  brief: any;
  analysis: any;
  loading: boolean;
  error: string | null;
  onTestAnalysis: () => void;
}

/**
 * Componente de debug para el análisis de briefs
 */
const BriefAnalysisDebug: React.FC<BriefAnalysisDebugProps> = ({
  brief,
  analysis,
  loading,
  error,
  onTestAnalysis,
}) => {
  const [testing, setTesting] = useState(false);
  const handleShowDetails = () => {
    const details = {
      'API Key presente': !!process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      'Brief presente': !!brief,
      'Loading': loading,
      'Error': error,
      'Analysis presente': !!analysis,
      'Brief keys': brief ? Object.keys(brief) : [],
    };
    
    Alert.alert(
      'Debug Info',
      JSON.stringify(details, null, 2),
      [{ text: 'OK' }]
    );
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const result = await testOpenAIConnection();
      Alert.alert(
        result.success ? '✅ Test Exitoso' : '❌ Test Fallido',
        result.message,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert(
        '❌ Error en Test',
        error.message,
        [{ text: 'OK' }]
      );
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Debug del Análisis</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusItem}>
          API Key: {process.env.EXPO_PUBLIC_OPENAI_API_KEY ? '✅' : '❌'}
        </Text>
        <Text style={styles.statusItem}>
          Brief: {brief ? '✅' : '❌'}
        </Text>
        <Text style={styles.statusItem}>
          Loading: {loading ? '🔄' : '✅'}
        </Text>
        <Text style={styles.statusItem}>
          Error: {error ? '❌' : '✅'}
        </Text>
        <Text style={styles.statusItem}>
          Analysis: {analysis ? '✅' : '❌'}
        </Text>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error:</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <View style={styles.buttonsContainer}>
        <Pressable style={styles.button} onPress={onTestAnalysis}>
          <Text style={styles.buttonText}>🧪 Probar Análisis</Text>
        </Pressable>
        
        <Pressable 
          style={[styles.button, testing && styles.buttonDisabled]} 
          onPress={handleTestConnection}
          disabled={testing}
        >
          <Text style={styles.buttonText}>
            {testing ? '⏳ Probando...' : '🔗 Test API'}
          </Text>
        </Pressable>
        
        <Pressable style={styles.button} onPress={handleShowDetails}>
          <Text style={styles.buttonText}>📋 Ver Detalles</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff3cd',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 12,
  },
  statusContainer: {
    marginBottom: 12,
  },
  statusItem: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#721c24',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#721c24',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  button: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#ffc107',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  buttonText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BriefAnalysisDebug;