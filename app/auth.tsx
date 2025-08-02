import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { router } from 'expo-router';

/**
 * Authentication Screen - Login and Register
 */
const AuthScreen: React.FC = () => {
  const { signIn, signUp, loading } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [betaCode, setBetaCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (isRegistering && !betaCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu código de acceso beta');
      return;
    }

    try {
      if (isRegistering) {
        console.log('🔐 Attempting registration with:', { email: email.trim(), betaCode: betaCode.trim(), hasFullName: !!fullName });
        await signUp(email.trim(), password, betaCode.trim(), fullName.trim() || undefined);
        // Success alert is handled by the signUp function in useSupabaseAuth
      } else {
        console.log('🔐 Attempting sign in with:', { email: email.trim(), passwordLength: password.length });
        await signIn(email.trim(), password);
        console.log('✅ Sign in call completed successfully');
        // The auth state change will automatically redirect when successful
      }
    } catch (error) {
      console.error('❌ Auth error in auth.tsx:', error);
      // Error alerts are handled by the signIn/signUp functions
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isRegistering ? 'CREAR CUENTA' : 'INICIAR SESIÓN'}
          </Text>
          <Text style={styles.subtitle}>
            {isRegistering 
              ? 'Crea tu cuenta para sincronizar tus briefs en la nube'
              : 'Accede a tus briefs sincronizados'
            }
          </Text>
        </View>

        <View style={styles.form}>
          {isRegistering && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>CÓDIGO DE ACCESO BETA *</Text>
                <TextInput
                  style={styles.input}
                  value={betaCode}
                  onChangeText={setBetaCode}
                  placeholder="BETA2024"
                  placeholderTextColor="#666666"
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>NOMBRE COMPLETO (OPCIONAL)</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Juan Pérez"
                  placeholderTextColor="#666666"
                  autoCapitalize="words"
                />
              </View>
            </>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              placeholderTextColor="#666666"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONTRASEÑA</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#666666"
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <Pressable
            style={[styles.authButton, loading && styles.authButtonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000000" size="small" />
            ) : (
              <Text style={styles.authButtonText}>
                {isRegistering ? 'CREAR CUENTA' : 'INICIAR SESIÓN'}
              </Text>
            )}
          </Pressable>

          <Pressable
            style={styles.switchButton}
            onPress={() => setIsRegistering(!isRegistering)}
            disabled={loading}
          >
            <Text style={styles.switchButtonText}>
              {isRegistering 
                ? '¿Ya tienes cuenta? Inicia sesión'
                : '¿No tienes cuenta? Regístrate'
              }
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← VOLVER</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 12,
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  form: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#000000',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  authButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginBottom: 20,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  switchButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    textDecorationLine: 'underline',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#333333',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default AuthScreen;