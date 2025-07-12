import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function ExploreScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>EXPLORAR</Text>
          <Text style={styles.headerSubtitle}>RECURSOS Y CARACTERÍSTICAS</Text>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureTitle}>BRIEFS PROFESIONALES</Text>
            <Text style={styles.featureDescription}>
              Genera briefs publicitarios estructurados con IA avanzada
            </Text>
            <View style={styles.yellowAccent} />
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🎤</Text>
            <Text style={styles.featureTitle}>GRABACIÓN DE VOZ</Text>
            <Text style={styles.featureDescription}>
              Habla libremente y convierte tu voz en briefs estructurados
            </Text>
            <View style={styles.yellowAccent} />
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📁</Text>
            <Text style={styles.featureTitle}>SUBIR ARCHIVOS</Text>
            <Text style={styles.featureDescription}>
              Soporta PDF, DOCX, TXT y más formatos de documentos
            </Text>
            <View style={styles.yellowAccent} />
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureTitle}>CHAT CON IA</Text>
            <Text style={styles.featureDescription}>
              Mejora y perfecciona tus briefs con asistencia inteligente
            </Text>
            <View style={styles.yellowAccent} />
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📤</Text>
            <Text style={styles.featureTitle}>EXPORTAR FORMATOS</Text>
            <Text style={styles.featureDescription}>
              Descarga en TXT, MD, HTML, JSON o todos a la vez
            </Text>
            <View style={styles.yellowAccent} />
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>💾</Text>
            <Text style={styles.featureTitle}>HISTORIAL LOCAL</Text>
            <Text style={styles.featureDescription}>
              Guarda y accede a todos tus briefs anteriores
            </Text>
            <View style={styles.yellowAccent} />
          </View>
        </View>

        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>¿LISTO PARA EMPEZAR?</Text>
          <Pressable 
            style={styles.ctaButton} 
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.ctaButtonText}>CREAR MI PRIMER BRIEF</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    borderBottomWidth: 4,
    borderBottomColor: '#FFFFFF',
    paddingBottom: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 1,
  },
  sectionContainer: {
    gap: 20,
  },
  featureCard: {
    backgroundColor: '#000000',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    padding: 32,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 1,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    opacity: 0.9,
  },
  yellowAccent: {
    width: 60,
    height: 4,
    backgroundColor: '#FFD700',
  },
  ctaSection: {
    marginTop: 48,
    alignItems: 'center',
    paddingTop: 32,
    borderTopWidth: 4,
    borderTopColor: '#FFFFFF',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 24,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 24,
    paddingHorizontal: 48,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
});