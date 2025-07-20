import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AUTH_KEY = 'briefboy_authenticated';
const CORRECT_PASSWORD = process.env.EXPO_PUBLIC_APP_PASSWORD || 'betterbriefs';

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authTimestamp = await AsyncStorage.getItem(AUTH_KEY);
      if (authTimestamp) {
        // Verificar si la sesión no ha expirado (opcional: 24 horas)
        const sessionTime = parseInt(authTimestamp);
        const currentTime = Date.now();
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 horas en ms
        
        if (currentTime - sessionTime < sessionDuration) {
          setIsAuthenticated(true);
          console.log('🔐 Sesión válida encontrada');
        } else {
          await AsyncStorage.removeItem(AUTH_KEY);
          setIsAuthenticated(false);
          console.log('🕐 Sesión expirada, requiere nueva autenticación');
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (password.trim() === CORRECT_PASSWORD) {
      try {
        const timestamp = Date.now().toString();
        await AsyncStorage.setItem(AUTH_KEY, timestamp);
        setIsAuthenticated(true);
        setPassword('');
        console.log('🔐 Usuario autenticado exitosamente');
      } catch (error) {
        console.error('Error saving auth status:', error);
        Alert.alert('Error', 'Error guardando la sesión');
      }
    } else {
      Alert.alert('Contraseña incorrecta', 'La contraseña ingresada no es válida');
      setPassword('');
      console.log('🚫 Intento de acceso fallido');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar la sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(AUTH_KEY);
              setIsAuthenticated(false);
              console.log('🚪 Sesión cerrada por el usuario');
            } catch (error) {
              console.error('Error clearing auth status:', error);
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <View style={styles.authBox}>
          <Text style={styles.title}>BRIEF BOY</Text>
          <Text style={styles.subtitle}>ACCESO A LA APLICACIÓN</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña:</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Ingresa la contraseña"
              placeholderTextColor="#666666"
              onSubmitEditing={handleLogin}
              autoFocus
            />
          </View>

          <Pressable 
            style={[styles.loginButton, !password.trim() && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={!password.trim()}
          >
            <Text style={styles.loginButtonText}>ACCEDER</Text>
          </Pressable>

          <Text style={styles.helpText}>
            Esta aplicación está en modo de pruebas.{'\n'}
            Necesitas la contraseña para acceder a las herramientas de generación de briefs.
          </Text>

          <Pressable 
            style={styles.backButton} 
            onPress={() => router.push('/landing')}
          >
            <Text style={styles.backButtonText}>← VOLVER AL INICIO</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.authenticatedContainer}>
      {children}
      
      {/* Botón de logout flotante (solo para testing - se puede quitar en producción) */}
      {__DEV__ && (
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  authBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#111111',
    borderWidth: 4,
    borderColor: '#FFD700',
    padding: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
    letterSpacing: 1,
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  loginButtonDisabled: {
    backgroundColor: '#666666',
    borderColor: '#444444',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
  helpText: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.8,
    marginBottom: 20,
  },
  backButton: {
    width: '100%',
    height: 45,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  authenticatedContainer: {
    flex: 1,
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 35,
    height: 35,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    opacity: 0.6,
  },
  logoutButtonText: {
    fontSize: 16,
    opacity: 0.8,
  },
});

export default AuthGuard;