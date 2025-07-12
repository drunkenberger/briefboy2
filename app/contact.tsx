import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import BrutalistNavHeader from '../components/BrutalistNavHeader';

export default function ContactScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    briefType: ''
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.message) {
      Alert.alert('Campos requeridos', 'Por favor completa al menos nombre, email y mensaje.');
      return;
    }

    // Aquí se integraría con el servicio de email
    Alert.alert(
      '✅ Mensaje Enviado', 
      'Gracias por contactarnos. Responderemos en 24 horas.',
      [{ text: 'OK', onPress: () => {
        setFormData({ name: '', email: '', company: '', message: '', briefType: '' });
      }}]
    );
  };

  const briefTypes = [
    'Brief para lanzamiento de producto',
    'Brief para rebranding',
    'Brief para campaña digital',
    'Brief para campaña tradicional',
    'Brief para evento/activación',
    'Consultoría estratégica',
    'Entrenamiento de equipos',
    'Otro (especificar en mensaje)'
  ];

  return (
    <View style={styles.wrapper}>
      <BrutalistNavHeader currentPage="contact" />
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>CONTACTO</Text>
          <Text style={styles.heroSubtitle}>
            ¿TIENES UN BRIEF QUE DA VERGÜENZA AJENA?
          </Text>
          <View style={styles.yellowBar} />
          <Text style={styles.heroDescription}>
            Mándanos tu brief mortal y te ayudamos a resucitarlo.
            También hacemos consultorías, entrenamientos y cirugías de emergencia para campañas en estado crítico.
          </Text>
        </View>

        {/* Contact Form */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>EMERGENCIAS PUBLICITARIAS</Text>
          <Text style={styles.formSubtitle}>
            Respuesta garantizada en menos de 24 horas
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>NOMBRE *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
              placeholder="Tu nombre completo"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              placeholder="tu@email.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMPRESA / AGENCIA</Text>
            <TextInput
              style={styles.input}
              value={formData.company}
              onChangeText={(text) => setFormData({...formData, company: text})}
              placeholder="Nombre de tu empresa o agencia"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>TIPO DE PROYECTO</Text>
            <View style={styles.selectWrapper}>
              {briefTypes.map((type, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.selectOption,
                    formData.briefType === type && styles.selectOptionSelected
                  ]}
                  onPress={() => setFormData({...formData, briefType: type})}
                >
                  <Text style={[
                    styles.selectOptionText,
                    formData.briefType === type && styles.selectOptionTextSelected
                  ]}>
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>MENSAJE *</Text>
            <Text style={styles.inputHelper}>
              Cuéntanos sobre tu brief mortal, proyecto o consulta
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.message}
              onChangeText={(text) => setFormData({...formData, message: text})}
              placeholder="Describe tu proyecto, brief o consulta. Mientras más detalles, mejor podemos ayudarte..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>🚀 ENVIAR EMERGENCIA</Text>
          </Pressable>

          <Text style={styles.formNote}>
            * Campos obligatorios. Todos los mensajes son confidenciales.
          </Text>
        </View>

        {/* Contact Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>OTRAS FORMAS DE CONTACTO</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>📧</Text>
              <Text style={styles.infoLabel}>EMAIL DIRECTO</Text>
              <Text style={styles.infoValue}>hello@briefboy.com</Text>
              <Text style={styles.infoDescription}>
                Para consultas generales y colaboraciones
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🚨</Text>
              <Text style={styles.infoLabel}>EMERGENCIAS</Text>
              <Text style={styles.infoValue}>emergency@briefboy.com</Text>
              <Text style={styles.infoDescription}>
                Para briefs en estado crítico (respuesta en 2 horas)
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🎓</Text>
              <Text style={styles.infoLabel}>ENTRENAMIENTOS</Text>
              <Text style={styles.infoValue}>training@briefboy.com</Text>
              <Text style={styles.infoDescription}>
                Workshops y entrenamientos corporativos
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>💼</Text>
              <Text style={styles.infoLabel}>CONSULTORÍAS</Text>
              <Text style={styles.infoValue}>consulting@briefboy.com</Text>
              <Text style={styles.infoDescription}>
                Proyectos estratégicos y consultorías especializadas
              </Text>
            </View>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>PREGUNTAS FRECUENTES</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>¿Cuánto cuesta una consultoría?</Text>
            <Text style={styles.faqAnswer}>
              Depende del nivel de emergencia. Los briefs en estado crítico requieren cirugía mayor. 
              Contáctanos para un diagnóstico gratuito.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>¿Hacen briefs completos desde cero?</Text>
            <Text style={styles.faqAnswer}>
              Sí. Desde el briefing inicial hasta la estrategia completa. 
              También resucitamos briefs que otros dieron por muertos.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>¿Trabajas con agencias o solo con marcas?</Text>
            <Text style={styles.faqAnswer}>
              Trabajamos con ambos. Muchas agencias nos consultan en secreto 
              para salvar proyectos complicados.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>¿Qué garantías ofrecen?</Text>
            <Text style={styles.faqAnswer}>
              Si tu brief sigue siendo una vergüenza después de nuestro tratamiento, 
              te devolvemos el dinero. Simple.
            </Text>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>
            ¿PREFIERES PROBAR{'\\n'}LA APP PRIMERO?
          </Text>
          <Pressable 
            style={styles.ctaButton} 
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.ctaButtonText}>USAR BRIEFBOY GRATIS</Text>
          </Pressable>
          <Text style={styles.ctaSubtext}>
            Genera tu primer brief profesional en 5 minutos
          </Text>
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
  scrollContent: {
    paddingBottom: 40,
  },

  // Hero Section
  heroSection: {
    padding: 40,
    paddingTop: 60,
  },
  heroTitle: {
    fontSize: 80,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: -3,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 24,
    lineHeight: 32,
  },
  yellowBar: {
    width: 150,
    height: 8,
    backgroundColor: '#FFD700',
    marginBottom: 32,
  },
  heroDescription: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 28,
    fontWeight: '500',
    opacity: 0.9,
  },

  // Form Section
  formSection: {
    padding: 40,
    paddingTop: 80,
    backgroundColor: '#111111',
  },
  formTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -2,
  },
  formSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 48,
    letterSpacing: 1,
  },
  inputGroup: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  inputHelper: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 12,
    opacity: 0.7,
    fontWeight: '700',
  },
  input: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 0,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#000000',
    fontWeight: '700',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  selectWrapper: {
    gap: 8,
  },
  selectOption: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    padding: 16,
    backgroundColor: '#000000',
  },
  selectOptionSelected: {
    borderColor: '#FFD700',
    backgroundColor: '#FFD700',
  },
  selectOptionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  selectOptionTextSelected: {
    color: '#000000',
  },
  submitButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
  formNote: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.7,
    fontWeight: '700',
  },

  // Info Section
  infoSection: {
    padding: 40,
    paddingTop: 80,
  },
  infoTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 48,
    letterSpacing: -2,
  },
  infoGrid: {
    gap: 24,
  },
  infoCard: {
    backgroundColor: '#000000',
    padding: 32,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  infoIcon: {
    fontSize: 32,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  infoDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
    opacity: 0.8,
    fontWeight: '700',
  },

  // FAQ Section
  faqSection: {
    padding: 40,
    paddingTop: 80,
    backgroundColor: '#111111',
  },
  faqTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 48,
    letterSpacing: -2,
  },
  faqItem: {
    marginBottom: 32,
    paddingBottom: 32,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  faqQuestion: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  faqAnswer: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 26,
    fontWeight: '500',
  },

  // CTA Section
  ctaSection: {
    padding: 40,
    paddingTop: 80,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: -1,
    lineHeight: 40,
  },
  ctaButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 20,
    paddingHorizontal: 40,
    marginBottom: 16,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
  ctaSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
    opacity: 0.8,
  },
});