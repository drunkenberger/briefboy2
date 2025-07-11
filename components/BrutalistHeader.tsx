import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

interface BrutalistHeaderProps {
  showBackButton?: boolean;
}

export default function BrutalistHeader({ showBackButton = false }: BrutalistHeaderProps) {
  const router = useRouter();

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
          <Pressable onPress={() => router.push('/(tabs)')} style={styles.navItem}>
            <Text style={styles.navText}>APP</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/history')} style={styles.navItem}>
            <Text style={styles.navText}>HISTORIAL</Text>
          </Pressable>
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
    paddingVertical: 15,
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
});