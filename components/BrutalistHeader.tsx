import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter, usePathname, Link } from 'expo-router';

interface BrutalistHeaderProps {
  showBackButton?: boolean;
}

export default function BrutalistHeader({ showBackButton = false }: BrutalistHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  console.log('Current pathname:', pathname);

  // Helper function to handle navigation with fallback
  const navigateTo = (path: string) => {
    try {
      console.log(`🧭 Attempting navigation to: ${path}`);
      
      // Try different navigation methods
      if (Platform.OS === 'web') {
        // For web, try direct navigation first
        router.push(path);
      } else {
        // For native, use replace for tab navigation
        router.replace(path);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback: try alternative navigation
      router.navigate(path);
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Pressable onPress={() => router.push('/landing')}>
          <Text style={styles.logo}>BRIEF BOY</Text>
        </Pressable>
        <View style={styles.nav}>
          {showBackButton && (
            <Pressable onPress={() => router.back()} style={styles.navItem}>
              <Text style={styles.navText}>← VOLVER</Text>
            </Pressable>
          )}
          <Link href="/(tabs)/" asChild>
            <Pressable style={[styles.navItem, (pathname === '/(tabs)' || pathname === '/(tabs)/index') && styles.activeNavItem]}>
              <Text style={[styles.navText, (pathname === '/(tabs)' || pathname === '/(tabs)/index') && styles.activeNavText]}>APP</Text>
            </Pressable>
          </Link>
          <Link href="/(tabs)/briefs" asChild>
            <Pressable style={[styles.navItem, pathname === '/(tabs)/briefs' && styles.activeNavItem]}>
              <Text style={[styles.navText, pathname === '/(tabs)/briefs' && styles.activeNavText]}>BRIEFS</Text>
            </Pressable>
          </Link>
          <Link href="/(tabs)/profile" asChild>
            <Pressable style={[styles.navItem, pathname === '/(tabs)/profile' && styles.activeNavItem]}>
              <Text style={[styles.navText, pathname === '/(tabs)/profile' && styles.activeNavText]}>PERFIL</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#000000',
    borderBottomWidth: 4,
    borderBottomColor: '#FFFFFF',
    paddingTop: 44, // For iOS status bar
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8, // Reduced from 15 to 8
  },
  logo: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  nav: {
    flexDirection: 'row',
    gap: 20,
  },
  navItem: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  activeNavItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  activeNavText: {
    color: '#FFD700',
  },
});