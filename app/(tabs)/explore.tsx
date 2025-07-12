import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function ExploreScreen() {
  const router = useRouter();

  // Font scale is automatically handled by React Native system font settings

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text 
            style={styles.headerTitle}
            accessible={true}
            accessibilityRole="header"
          >
            EXPLORAR
          </Text>
          <Text 
            style={styles.headerSubtitle}
            accessible={true}
            accessibilityRole="text"
          >
            RECURSOS Y CARACTERÍSTICAS
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <View 
            style={styles.featureCard}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel="Característica: Briefs profesionales. Genera briefs publicitarios estructurados con IA avanzada"
          >
            <Text 
              style={styles.featureIcon}
              accessible={false}
              importantForAccessibility="no"
            >
              🎯
            </Text>
            <Text style={styles.featureTitle}>BRIEFS PROFESIONALES</Text>
            <Text style={styles.featureDescription}>
              Genera briefs publicitarios estructurados con IA avanzada
            </Text>
            <View style={styles.yellowAccent} accessible={false} />
          </View>

          <View 
            style={styles.featureCard}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel="Característica: Grabación de voz. Habla libremente y convierte tu voz en briefs estructurados"
          >
            <Text 
              style={styles.featureIcon}
              accessible={false}
              importantForAccessibility="no"
            >
              🎤
            </Text>
            <Text style={styles.featureTitle}>GRABACIÓN DE VOZ</Text>
            <Text style={styles.featureDescription}>
              Habla libremente y convierte tu voz en briefs estructurados
            </Text>
            <View style={styles.yellowAccent} accessible={false} />
          </View>

          <View 
            style={styles.featureCard}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel="Característica: Subir archivos. Soporta PDF, DOCX, TXT y más formatos de documentos"
          >
            <Text 
              style={styles.featureIcon}
              accessible={false}
              importantForAccessibility="no"
            >
              📁
            </Text>
            <Text style={styles.featureTitle}>SUBIR ARCHIVOS</Text>
            <Text style={styles.featureDescription}>
              Soporta PDF, DOCX, TXT y más formatos de documentos
            </Text>
            <View style={styles.yellowAccent} accessible={false} />
          </View>

          <View 
            style={styles.featureCard}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel="Característica: Chat con IA. Mejora y perfecciona tus briefs con asistencia inteligente"
          >
            <Text 
              style={styles.featureIcon}
              accessible={false}
              importantForAccessibility="no"
            >
              💬
            </Text>
            <Text style={styles.featureTitle}>CHAT CON IA</Text>
            <Text style={styles.featureDescription}>
              Mejora y perfecciona tus briefs con asistencia inteligente
            </Text>
            <View style={styles.yellowAccent} accessible={false} />
          </View>

          <View 
            style={styles.featureCard}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel="Característica: Exportar formatos. Descarga en TXT, MD, HTML, JSON o todos a la vez"
          >
            <Text 
              style={styles.featureIcon}
              accessible={false}
              importantForAccessibility="no"
            >
              📤
            </Text>
            <Text style={styles.featureTitle}>EXPORTAR FORMATOS</Text>
            <Text style={styles.featureDescription}>
              Descarga en TXT, MD, HTML, JSON o todos a la vez
            </Text>
            <View style={styles.yellowAccent} accessible={false} />
          </View>

          <View 
            style={styles.featureCard}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel="Característica: Historial local. Guarda y accede a todos tus briefs anteriores"
          >
            <Text 
              style={styles.featureIcon}
              accessible={false}
              importantForAccessibility="no"
            >
              💾
            </Text>
            <Text style={styles.featureTitle}>HISTORIAL LOCAL</Text>
            <Text style={styles.featureDescription}>
              Guarda y accede a todos tus briefs anteriores
            </Text>
            <View style={styles.yellowAccent} accessible={false} />
          </View>
        </View>

        <View style={styles.ctaSection}>
          <Text 
            style={styles.ctaTitle}
            accessible={true}
            accessibilityRole="header"
          >
            ¿LISTO PARA EMPEZAR?
          </Text>
          <Pressable 
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && styles.ctaButtonPressed
            ]}
            onPress={() => router.push('/(tabs)')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Crear mi primer brief"
            accessibilityHint="Navega a la pantalla principal para empezar a crear tu primer brief publicitario"
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
    fontSize: 48, // Will be scaled by system font settings
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
    marginBottom: 8,
    // Enhanced accessibility contrast
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16, // Will be scaled by system font settings
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 1,
    // Enhanced accessibility contrast
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    fontSize: 48, // Will be scaled by system font settings
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 20, // Will be scaled by system font settings
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 1,
    textAlign: 'center',
    // Enhanced accessibility contrast
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  featureDescription: {
    fontSize: 16, // Will be scaled by system font settings
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    opacity: 0.95, // Improved from 0.9 for better contrast
    // Enhanced accessibility contrast
    textShadowColor: '#000000',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
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
    fontSize: 32, // Will be scaled by system font settings
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 24,
    textAlign: 'center',
    // Enhanced accessibility contrast
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  ctaButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 24,
    paddingHorizontal: 48,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    // Enhanced accessibility and interaction states
    minHeight: 48, // Minimum touch target size
    minWidth: 48,
  },
  ctaButtonPressed: {
    backgroundColor: '#E6C200', // Darker yellow when pressed
    transform: [{ scale: 0.98 }],
  },
  ctaButtonFocused: {
    borderColor: '#00FFFF', // Cyan focus indicator
    borderWidth: 6,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaButtonText: {
    fontSize: 18, // Will be scaled by system font settings
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
    textAlign: 'center',
    // Enhanced accessibility contrast
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
});