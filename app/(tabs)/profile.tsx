import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Animated,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { useIntegratedBriefStorage } from '../../hooks/useIntegratedBriefStorage';
import { useBriefStorage } from '../../hooks/useBriefStorage';
import { router } from 'expo-router';

/**
 * User Profile Page - Estadísticas y gestión de cuenta
 */
const ProfileScreen: React.FC = () => {
  const { user, signOut } = useSupabaseAuth();
  const { allBriefs, supabaseBriefs, localBriefs, totalBriefs, supabaseLoading } = useIntegratedBriefStorage();
  const { getStorageInfo } = useBriefStorage();
  
  const [storageInfo, setStorageInfo] = useState({ size: 0, count: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [componentMounted, setComponentMounted] = useState(false);
  
  // Animations
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    // Delay mounting to prevent blocking the UI thread
    const timer = setTimeout(() => {
      setComponentMounted(true);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
      ]).start();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!componentMounted) return;
    
    const loadStorageInfo = async () => {
      try {
        const info = await getStorageInfo();
        setStorageInfo(info);
      } catch (error) {
        console.error('Error loading storage info:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStorageInfo();
  }, [getStorageInfo, componentMounted]);

  // Check user premium status
  const isPremiumUser = React.useMemo(() => {
    // Check for premium indicators in user metadata or subscription status
    if (user?.user_metadata?.premium === true) return true;
    if (user?.user_metadata?.subscription === 'premium') return true;
    if (user?.user_metadata?.plan === 'premium') return true;
    
    // Could also check based on briefs count (e.g., > 50 briefs = premium)
    // Or check for specific email domains, payment status, etc.
    // For now, return false as default (standard user)
    return false;
  }, [user]);

  // Calculate statistics with optimized performance
  const stats = React.useMemo(() => {
    // Early return if no data
    if (!allBriefs || allBriefs.length === 0) {
      return {
        total: 0,
        weekly: 0,
        monthly: 0,
        cloud: 0,
        local: 0,
        storageUsedMB: '0',
        avgBriefSize: 0,
      };
    }

    const now = new Date();
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Process dates only once per brief
    let weeklyCount = 0;
    let monthlyCount = 0;
    
    for (const brief of allBriefs) {
      try {
        const dateString = 'created_at' in brief ? brief.created_at : brief.createdAt;
        if (!dateString) continue;
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) continue;
        
        if (date >= thisWeek) weeklyCount++;
        if (date >= thisMonth) monthlyCount++;
      } catch {
        // Skip invalid dates silently
      }
    }

    // Calculate storage usage
    const storageUsedMB = (storageInfo.size / 1024 / 1024).toFixed(2);
    const avgBriefSize = totalBriefs > 0 ? (storageInfo.size / totalBriefs / 1024).toFixed(1) : 0;

    return {
      total: totalBriefs,
      weekly: weeklyCount,
      monthly: monthlyCount,
      cloud: supabaseBriefs?.length || 0,
      local: localBriefs?.length || 0,
      storageUsedMB,
      avgBriefSize,
    };
  }, [allBriefs?.length, totalBriefs, supabaseBriefs?.length, localBriefs?.length, storageInfo.size]);

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar la sesión');
            }
          },
        },
      ]
    );
  };

  const renderStatCard = (title: string, value: string | number, subtitle?: string, icon?: string) => (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.statHeader}>
        {icon && <Text style={styles.statIcon}>{icon}</Text>}
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </Animated.View>
  );

  // Show loading state while data is being fetched
  if (!componentMounted || isLoading || supabaseLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.notAuthContainer}>
          <Text style={styles.notAuthIcon}>👤</Text>
          <Text style={styles.notAuthTitle}>Sin sesión</Text>
          <Text style={styles.notAuthSubtitle}>
            Inicia sesión para ver tu perfil y estadísticas
          </Text>
          <Pressable
            style={styles.loginButton}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Mi Perfil</Text>
            <Text style={styles.headerSubtitle}>
              {user.email}
            </Text>
            {isPremiumUser ? (
              <View style={styles.userBadge}>
                <Text style={styles.userBadgeText}>☁️ Usuario Premium</Text>
              </View>
            ) : (
              <View style={styles.standardUserBadge}>
                <Text style={styles.standardUserBadgeText}>👤 Usuario Estándar</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Statistics Grid */}
        <View style={styles.statsGrid}>
          {renderStatCard('Total de Briefs', stats.total, 'Creados hasta ahora', '📊')}
          {renderStatCard('Esta Semana', stats.weekly, 'Últimos 7 días', '📅')}
          {renderStatCard('Este Mes', stats.monthly, 'Últimos 30 días', '🗓️')}
          {renderStatCard('En la Nube', stats.cloud, 'Supabase sync', '☁️')}
          {renderStatCard('Locales', stats.local, 'Almacenamiento local', '📱')}
          {renderStatCard('Almacenamiento', `${stats.storageUsedMB} MB`, `~${stats.avgBriefSize} KB/brief`, '💾')}
        </View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.actionsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/briefs')}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Ver Mis Briefs</Text>
              <Text style={styles.actionSubtitle}>Gestionar briefs guardados</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/')}
          >
            <Text style={styles.actionIcon}>✨</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Crear Nuevo Brief</Text>
              <Text style={styles.actionSubtitle}>Generar brief con IA</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                'Próximamente',
                'La exportación masiva estará disponible pronto'
              );
            }}
          >
            <Text style={styles.actionIcon}>📤</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Exportar Todos</Text>
              <Text style={styles.actionSubtitle}>Descargar todos los briefs</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </Pressable>
        </Animated.View>

        {/* Account Section */}
        <Animated.View
          style={[
            styles.accountSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Cuenta</Text>
          
          <View style={styles.accountInfo}>
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Email</Text>
              <Text style={styles.accountValue}>{user.email}</Text>
            </View>
            
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>ID de Usuario</Text>
              <Text style={styles.accountValue}>{user.id.substring(0, 8)}...</Text>
            </View>
            
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Registrado</Text>
              <Text style={styles.accountValue}>
                {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A'}
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutIcon}>👋</Text>
            <Text style={styles.signOutText}>Cerrar Sesión</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
  },

  // Header
  header: {
    marginBottom: 32,
    paddingVertical: 24,
    borderBottomWidth: 4,
    borderBottomColor: '#FFFFFF',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 8,
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  userBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userBadgeText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  standardUserBadge: {
    backgroundColor: '#333333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  standardUserBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Statistics
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#000000',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    padding: 20,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 4,
    letterSpacing: -1,
  },
  statSubtitle: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.7,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Actions Section
  actionsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#333333',
    padding: 20,
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    letterSpacing: 0.5,
  },
  actionArrow: {
    fontSize: 20,
    color: '#FFD700',
    fontWeight: '900',
  },

  // Account Section
  accountSection: {
    marginBottom: 32,
  },
  accountInfo: {
    backgroundColor: '#000000',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    padding: 20,
    marginBottom: 20,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  accountLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  accountValue: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderWidth: 4,
    borderColor: '#FFD700',
    padding: 20,
  },
  signOutIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Not authenticated state
  notAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notAuthIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  notAuthTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  notAuthSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    opacity: 0.8,
  },
  loginButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default ProfileScreen;