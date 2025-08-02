import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const { user, profile, loading, initializing, isAuthenticated, signOut } = useSupabaseAuth();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

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

  // Mark auth as checked once initialization is complete or after timeout
  useEffect(() => {
    if (!initializing) {
      console.log('✅ Auth initialization complete:', { isAuthenticated, hasUser: !!user });
      setHasCheckedAuth(true);
    }
    
    // Fallback timeout to prevent infinite loading
    const timer = setTimeout(() => {
      if (!hasCheckedAuth) {
        console.warn('⚠️ Auth check timeout - forcing completion');
        setHasCheckedAuth(true);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timer);
  }, [initializing, isAuthenticated, user, hasCheckedAuth]);

  // Navigate based on auth state after check is complete
  useEffect(() => {
    if (hasCheckedAuth && !isAuthenticated) {
      console.log('🔐 AuthGuard: Not authenticated after check, redirecting to auth screen');
      console.log('📊 Auth state:', { hasCheckedAuth, isAuthenticated, hasUser: !!user });
      router.replace('/auth');
    }
  }, [hasCheckedAuth, isAuthenticated, router]);

  // Show loading screen during initial auth check
  if (initializing || !hasCheckedAuth) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Verificando autenticación...</Text>
      </View>
    );
  }

  // If not authenticated after check, show redirect message
  if (!isAuthenticated) {
    console.log('🔐 AuthGuard: User not authenticated:', {
      isAuthenticated,
      hasUser: !!user,
      hasProfile: !!profile,
      hasCheckedAuth
    });
    
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Redirigiendo al login...</Text>
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