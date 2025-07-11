import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import BrutalistFocusText from '../components/BrutalistFocusText';
import BrutalistNavHeader from '../components/BrutalistNavHeader';

const { width } = Dimensions.get('window');

export default function LandingPage() {
  const router = useRouter();

  const navigateToApp = () => {
    router.push('/(tabs)');
  };

  return (
    <View style={styles.wrapper}>
      <BrutalistNavHeader currentPage="home" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
        <View style={styles.heroGrid}>
          <View style={styles.heroLeft}>
            <BrutalistFocusText 
              sentence="BRIEF BOY"
              style={styles.heroTitleContainer}
              animationDuration={1.2}
              pauseBetweenAnimations={2}
              activeColor="#FFFFFF"
              inactiveColor="rgba(255, 255, 255, 0.4)"
              borderColor="#FFD700"
            />
            <View style={styles.yellowBar} />
            <Text style={styles.heroSubtitle}>
              GENERA BRIEFS PUBLICITARIOS PROFESIONALES EN SEGUNDOS. 
              SIN RODEOS. SIN COMPLICACIONES.
            </Text>
            <Pressable style={styles.ctaButton} onPress={navigateToApp}>
              <Text style={styles.ctaButtonText}>CREAR BRIEF AHORA</Text>
            </Pressable>
          </View>
          <View style={styles.heroRight}>
            <View style={styles.heroImageContainer}>
              <Image 
                source={require('../assets/images/briefboy-hero.jpeg')}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>
      </View>

      {/* Benefits Section */}
      <View style={styles.benefitsSection}>
        <Text style={styles.sectionTitle}>POR QUÉ BRIEF BOY</Text>
        <View style={styles.benefitsGrid}>
          <View style={styles.benefitRow}>
            <View style={styles.benefitCard}>
              <Text style={styles.benefitTitle}>VELOCIDAD BRUTAL</Text>
              <Text style={styles.benefitText}>
                De grabación de voz a brief profesional en menos de 60 segundos.
              </Text>
              <View style={styles.yellowAccent} />
            </View>
            <View style={styles.benefitCard}>
              <Text style={styles.benefitTitle}>IA AVANZADA</Text>
              <Text style={styles.benefitText}>
                GPT-4o analiza y estructura tu información automáticamente.
              </Text>
              <View style={styles.yellowAccent} />
            </View>
          </View>
          <View style={styles.benefitCardWide}>
            <Text style={styles.benefitTitle}>FORMATO PRO</Text>
            <Text style={styles.benefitText}>
              Exporta en TXT, MD, HTML o JSON. Listo para presentar.
            </Text>
            <View style={styles.yellowAccent} />
          </View>
        </View>
      </View>

      {/* How It Works */}
      <View style={styles.howItWorksSection}>
        <Text style={styles.sectionTitle}>CÓMO FUNCIONA</Text>
        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={styles.stepContent}>
              <Text style={styles.stepNumber}>01</Text>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>GRABA TU IDEA</Text>
                <Text style={styles.stepText}>
                  Habla libremente sobre tu proyecto publicitario
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.step}>
            <View style={styles.stepContent}>
              <Text style={styles.stepNumber}>02</Text>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>IA PROCESA</Text>
                <Text style={styles.stepText}>
                  Whisper + GPT-4o estructuran tu brief profesionalmente
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.step}>
            <View style={styles.stepContent}>
              <Text style={styles.stepNumber}>03</Text>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>JUNTO CON LA IA MEJORAS</Text>
                <Text style={styles.stepText}>
                  Chat inteligente te ayuda a perfeccionar cada sección
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.step}>
            <View style={styles.stepContent}>
              <Text style={styles.stepNumber}>04</Text>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>EXPORTA Y PRESENTA</Text>
                <Text style={styles.stepText}>
                  Descarga en múltiples formatos y comparte con tu equipo
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Testimonials */}
      <View style={styles.testimonialsSection}>
        <Text style={styles.sectionTitle}>TESTIMONIOS</Text>
        <View style={styles.testimonialCard}>
          <Text style={styles.testimonialText}>
            &quot;BRIEF BOY cambió completamente mi flujo de trabajo. 
            Lo que antes tomaba horas ahora lo hago en minutos.&quot;
          </Text>
          <Text style={styles.testimonialAuthor}>— CARLOS M., DIRECTOR CREATIVO</Text>
        </View>
        <View style={styles.testimonialCard}>
          <Text style={styles.testimonialText}>
            &quot;La calidad de los briefs es impresionante. 
            Mis clientes quedaron sorprendidos con el nivel de detalle.&quot;
          </Text>
          <Text style={styles.testimonialAuthor}>— MARÍA L., ACCOUNT MANAGER</Text>
        </View>
        <View style={styles.testimonialCard}>
          <Text style={styles.testimonialText}>
            &quot;Es como tener un estratega senior disponible 24/7. 
            Indispensable para agencias modernas.&quot;
          </Text>
          <Text style={styles.testimonialAuthor}>— JUAN P., CEO AGENCIA DIGITAL</Text>
        </View>
      </View>

      {/* Final CTA */}
      <View style={styles.finalCTA}>
        <Text style={styles.finalCTATitle}>
          DEJA DE PERDER TIEMPO{'\n'}EMPIEZA A CREAR
        </Text>
        <Pressable style={styles.finalCTAButton} onPress={navigateToApp}>
          <Text style={styles.finalCTAButtonText}>USAR BRIEF BOY GRATIS</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 BRIEF BOY</Text>
        <Text style={styles.footerTagline}>BRIEFS SIN BULLSHIT</Text>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  hero: {
    minHeight: 600,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    borderBottomWidth: 4,
    borderBottomColor: '#FFFFFF',
  },
  heroGrid: {
    flexDirection: width > 600 ? 'row' : 'column',
    alignItems: 'center',
    gap: 20,
  },
  heroLeft: {
    flex: width > 600 ? 1 : 0,
    width: width > 600 ? 'auto' : '100%',
  },
  heroRight: {
    flex: width > 600 ? 1 : 0,
    alignItems: 'center',
    width: width > 600 ? 'auto' : '100%',
  },
  heroTitleContainer: {
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -4,
    lineHeight: 70,
    marginBottom: 20,
  },
  yellowBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#FFD700',
    marginBottom: 30,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 40,
    fontWeight: '500',
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignSelf: 'flex-start',
  },
  ctaButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroImageContainer: {
    width: width > 600 ? (width - 60) / 2 : Math.min(300, width - 40),
    aspectRatio: 1,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  benefitsSection: {
    padding: 20,
    paddingVertical: 60,
    borderBottomWidth: 4,
    borderBottomColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 40,
    letterSpacing: -1,
  },
  benefitsGrid: {
    gap: 20,
  },
  benefitRow: {
    flexDirection: 'row',
    gap: 20,
  },
  benefitCard: {
    flex: 1,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    padding: 25,
    backgroundColor: '#000000',
  },
  benefitCardWide: {
    borderWidth: 4,
    borderColor: '#FFFFFF',
    padding: 25,
    backgroundColor: '#000000',
  },
  benefitTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  benefitText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 20,
  },
  yellowAccent: {
    width: 60,
    height: 4,
    backgroundColor: '#FFD700',
  },
  howItWorksSection: {
    padding: 20,
    paddingVertical: 60,
    borderBottomWidth: 4,
    borderBottomColor: '#FFFFFF',
  },
  stepsContainer: {
    gap: 0,
  },
  step: {
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginBottom: -4,
    backgroundColor: '#000000',
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  stepNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFD700',
    marginRight: 20,
    minWidth: 80,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  stepText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  testimonialsSection: {
    padding: 20,
    paddingVertical: 60,
    borderBottomWidth: 4,
    borderBottomColor: '#FFFFFF',
  },
  testimonialCard: {
    borderWidth: 4,
    borderColor: '#FFFFFF',
    padding: 30,
    marginBottom: 20,
    backgroundColor: '#000000',
  },
  testimonialText: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '700',
    letterSpacing: 1,
  },
  finalCTA: {
    padding: 20,
    paddingVertical: 80,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#FFFFFF',
  },
  finalCTATitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: -2,
    lineHeight: 48,
  },
  finalCTAButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 25,
    paddingHorizontal: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  finalCTAButtonText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footer: {
    padding: 20,
    paddingVertical: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  footerTagline: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
});