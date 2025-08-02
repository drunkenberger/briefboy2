import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import AuthFlow from './AuthFlow';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const { user, profile, loading, isAuthenticated, signOut } = useSupabaseAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

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
              await signOut();
              console.log('🚪 Sesión cerrada por el usuario');
            } catch (error) {
              console.error('Error signing out:', error);
            }
          }
        }
      ]
    );
  };

  // Implement proper timeout for auth loading
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.log('⚠️ Auth loading timeout reached after 3 seconds');
        setTimeoutReached(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Show loading screen only during initial auth check and if not timed out
  if (loading && !timeoutReached && !isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
        <Text style={styles.loadingSubtext}>Si esto toma mucho tiempo, hay un problema de conexión</Text>
      </View>
    );
  }

  // Always require authentication - no dev mode bypass

  if (!isAuthenticated) {
    // Debug info
    console.log('🔐 AuthGuard check:', {
      isAuthenticated,
      hasUser: !!user,
      hasProfile: !!profile,
      loading,
      timeoutReached
    });
    
    return (
      <AuthFlow onCancel={() => router.push('/landing')} />
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
      
      {/* Usuario info flotante para debugging */}
      {__DEV__ && user && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            {profile?.full_name || user.email}
          </Text>
        </View>
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
    marginBottom: 10,
  },
  loadingSubtext: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    paddingHorizontal: 40,
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
  debugInfo: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 9998,
    opacity: 0.6,
  },
  debugText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AuthGuard;