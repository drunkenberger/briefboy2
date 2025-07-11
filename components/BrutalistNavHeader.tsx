import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface BrutalistNavHeaderProps {
  currentPage?: 'home' | 'about' | 'learn' | 'contact';
}

export default function BrutalistNavHeader({ currentPage = 'home' }: BrutalistNavHeaderProps) {
  const router = useRouter();

  const navigateToApp = () => {
    router.push('/(tabs)');
  };

  const handleNavigation = (page: string) => {
    // TODO: Implement navigation to different pages
    console.log(`Navigate to ${page}`);
  };

  return (
    <View style={styles.header}>
      <View style={styles.container}>
        <Pressable style={styles.logo} onPress={() => router.push('/landing')}>
          <Text style={styles.logoText}>BRIEF BOY</Text>
        </Pressable>
        
        <View style={styles.nav}>
          <Pressable 
            style={[styles.navItem, currentPage === 'about' && styles.navItemActive]}
            onPress={() => handleNavigation('about')}
          >
            <Text style={[styles.navText, currentPage === 'about' && styles.navTextActive]}>
              ABOUT US
            </Text>
          </Pressable>
          
          <Pressable 
            style={[styles.navItem, currentPage === 'learn' && styles.navItemActive]}
            onPress={() => handleNavigation('learn')}
          >
            <Text style={[styles.navText, currentPage === 'learn' && styles.navTextActive]}>
              LEARN
            </Text>
          </Pressable>
          
          <Pressable 
            style={[styles.navItem, currentPage === 'contact' && styles.navItemActive]}
            onPress={() => handleNavigation('contact')}
          >
            <Text style={[styles.navText, currentPage === 'contact' && styles.navTextActive]}>
              CONTACT
            </Text>
          </Pressable>
          
          <View style={styles.divider} />
          
          <Pressable style={styles.signInButton} onPress={navigateToApp}>
            <Text style={styles.signInText}>USAR APP</Text>
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
    paddingTop: 50,
    paddingBottom: 0,
  },
  container: {
    flexDirection: width > 768 ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: width > 768 ? 'center' : 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: width > 768 ? 0 : 20,
  },
  logo: {
    alignSelf: 'flex-start',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  nav: {
    flexDirection: width > 768 ? 'row' : 'column',
    alignItems: width > 768 ? 'center' : 'flex-start',
    gap: width > 768 ? 0 : 15,
  },
  navItem: {
    paddingHorizontal: width > 768 ? 20 : 0,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  navItemActive: {
    borderBottomColor: '#FFD700',
  },
  navText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  navTextActive: {
    color: '#FFD700',
  },
  divider: {
    width: width > 768 ? 2 : '100%',
    height: width > 768 ? 20 : 2,
    backgroundColor: '#FFFFFF',
    marginHorizontal: width > 768 ? 20 : 0,
    marginVertical: width > 768 ? 0 : 10,
  },
  signInButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  signInText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});