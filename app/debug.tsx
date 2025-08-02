import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

const DebugScreen: React.FC = () => {
  const router = useRouter();
  const auth = useSupabaseAuth();
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Capture console logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (level: string, ...args: any[]) => {
      const message = `[${level}] ${args.join(' ')}`;
      setLogs(prev => [...prev.slice(-50), message]); // Keep last 50 logs
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog('LOG', ...args);
    };

    console.error = (...args) => {
      originalError(...args);
      addLog('ERROR', ...args);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog('WARN', ...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const debugInfo = {
    'Environment': __DEV__ ? 'Development' : 'Production',
    'Platform': typeof window !== 'undefined' ? 'Web' : 'Native',
    'Supabase URL Set': !!process.env.EXPO_PUBLIC_SUPABASE_URL,
    'Supabase Key Set': !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    'User': auth.user?.email || 'None',
    'Authenticated': auth.isAuthenticated,
    'Loading': auth.loading,
    'Initializing': auth.initializing,
    'Has Profile': !!auth.profile,
    'Session Exists': !!auth.session,
    'Timestamp': new Date().toISOString(),
  };

  const testAuth = async () => {
    try {
      console.log('🧪 Testing authentication...');
      await auth.signIn('test@example.com', 'testpassword');
    } catch (error) {
      console.error('🧪 Test auth failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🐛 Debug Information</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 System Info</Text>
          {Object.entries(debugInfo).map(([key, value]) => (
            <View key={key} style={styles.infoRow}>
              <Text style={styles.infoKey}>{key}:</Text>
              <Text style={styles.infoValue}>
                {typeof value === 'boolean' ? (value ? '✅' : '❌') : String(value)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Test Actions</Text>
          <Pressable style={styles.testButton} onPress={testAuth}>
            <Text style={styles.testButtonText}>Test Authentication</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Recent Logs</Text>
          <ScrollView style={styles.logsContainer} nestedScrollEnabled>
            {logs.map((log, index) => (
              <Text key={index} style={styles.logText}>
                {log}
              </Text>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

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
    paddingTop: 50,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  title: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: '900',
  },
  backButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  backButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoKey: {
    color: '#CCCCCC',
    flex: 1,
    fontWeight: '600',
  },
  infoValue: {
    color: '#FFFFFF',
    flex: 1,
    fontWeight: '400',
  },
  testButton: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    marginBottom: 10,
  },
  testButtonText: {
    color: '#000000',
    fontWeight: '700',
  },
  logsContainer: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#333333',
    padding: 10,
    maxHeight: 300,
  },
  logText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});

export default DebugScreen;