import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, TextInput, Alert, Linking } from 'react-native';
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

  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    message: ''
  });

  const openSocialMedia = (platform: string) => {
    const urls: { [key: string]: string } = {
      instagram: 'https://instagram.com/briefboy',
      linkedin: 'https://linkedin.com/company/briefboy',
      twitter: 'https://twitter.com/briefboy_ai',
      youtube: 'https://youtube.com/@BriefBoyChannel'
    };

    const url = urls[platform];
    if (url) {
      Linking.openURL(url).catch(() => 
        Alert.alert('Error', 'No se pudo abrir el enlace')
      );
    }
  };

  // Función para validar en tiempo real
  const validateField = (field: string, value: string) => {
    let error = '';
    
    switch (field) {
      case 'name':
        if (!value.trim()) {
          error = 'El nombre es requerido';
        } else if (!validateName(value.trim())) {
          error = 'Nombre inválido (solo letras, espacios y guiones, 2-50 caracteres)';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'El email es requerido';
        } else if (!validateEmail(value.trim())) {
          error = 'Formato de email inválido';
        }
        break;
      case 'message':
        if (!value.trim()) {
          error = 'El mensaje es requerido';
        } else if (value.trim().length < 10) {
          error = 'El mensaje debe tener al menos 10 caracteres';
        } else if (value.trim().length > 1000) {
          error = 'El mensaje no puede exceder 1000 caracteres';
        }
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    return error === '';
  };

  // Función para manejar cambios en los inputs
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Validar después de un pequeño delay para mejor UX
    setTimeout(() => validateField(field, value), 300);
  };

  // Función para sanitizar inputs
  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/[<>\"'&]/g, '') // Remover caracteres potencialmente peligrosos
      .replace(/\s+/g, ' ') // Normalizar espacios múltiples
      .substring(0, 1000); // Limitar longitud máxima
  };

  // Función para validar formato de email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  };

  // Función para validar nombre (solo letras, espacios, guiones y acentos)
  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-'\.]{2,50}$/;
    return nameRegex.test(name);
  };

  const handleSubmit = () => {
    // Sanitizar todos los inputs
    const sanitizedData = {
      name: sanitizeInput(formData.name),
      email: sanitizeInput(formData.email).toLowerCase(),
      company: sanitizeInput(formData.company),
      message: sanitizeInput(formData.message),
      briefType: formData.briefType
    };

    // Validación de campos requeridos
    if (!sanitizedData.name || !sanitizedData.email || !sanitizedData.message) {
      Alert.alert('Campos requeridos', 'Por favor completa al menos nombre, email y mensaje.');
      return;
    }

    // Validación de formato de nombre
    if (!validateName(sanitizedData.name)) {
      Alert.alert(
        'Nombre inválido', 
        'El nombre debe contener solo letras, espacios y guiones, entre 2 y 50 caracteres.'
      );
      return;
    }

    // Validación de formato de email
    if (!validateEmail(sanitizedData.email)) {
      Alert.alert(
        'Email inválido', 
        'Por favor ingresa una dirección de email válida (ejemplo: tu@email.com).'
      );
      return;
    }

    // Validación de longitud mínima del mensaje
    if (sanitizedData.message.length < 10) {
      Alert.alert(
        'Mensaje muy corto', 
        'Por favor proporciona más detalles en tu mensaje (mínimo 10 caracteres).'
      );
      return;
    }

    // Validación de longitud máxima del mensaje
    if (sanitizedData.message.length > 1000) {
      Alert.alert(
        'Mensaje muy largo', 
        'Por favor reduce tu mensaje a máximo 1000 caracteres.'
      );
      return;
    }

    // Si llegamos aquí, todos los datos son válidos
    console.log('Datos validados y sanitizados:', sanitizedData);
    
    // Limpiar errores de validación
    setValidationErrors({ name: '', email: '', message: '' });
    
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
              style={[
                styles.input,
                validationErrors.name ? styles.inputError : null
              ]}
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholder="Tu nombre completo"
              placeholderTextColor="#9ca3af"
              accessibilityLabel="Campo de nombre completo, requerido"
              accessibilityHint="Ingresa tu nombre completo para el formulario de contacto"
              accessibilityRole="text"
            />
            {validationErrors.name ? (
              <Text style={styles.errorText}>{validationErrors.name}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL *</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.email ? styles.inputError : null
              ]}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="tu@email.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="Campo de dirección de email, requerido"
              accessibilityHint="Ingresa tu dirección de correo electrónico para recibir respuesta"
              accessibilityRole="text"
              textContentType="emailAddress"
            />
            {validationErrors.email ? (
              <Text style={styles.errorText}>{validationErrors.email}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMPRESA / AGENCIA</Text>
            <TextInput
              style={styles.input}
              value={formData.company}
              onChangeText={(text) => setFormData({...formData, company: text})}
              placeholder="Nombre de tu empresa o agencia"
              placeholderTextColor="#9ca3af"
              accessibilityLabel="Campo de empresa o agencia, opcional"
              accessibilityHint="Ingresa el nombre de tu empresa o agencia si corresponde"
              accessibilityRole="text"
              textContentType="organizationName"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>TIPO DE PROYECTO</Text>
            <View 
              style={styles.selectWrapper}
              accessibilityRole="radiogroup"
              accessibilityLabel="Selecciona el tipo de proyecto"
            >
              {briefTypes.map((type, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.selectOption,
                    formData.briefType === type && styles.selectOptionSelected
                  ]}
                  onPress={() => setFormData({...formData, briefType: type})}
                  accessibilityRole="radio"
                  accessibilityState={{
                    selected: formData.briefType === type,
                    checked: formData.briefType === type
                  }}
                  accessibilityLabel={`Tipo de proyecto: ${type}`}
                  accessibilityHint={`Selecciona ${type} como tipo de proyecto${formData.briefType === type ? ', actualmente seleccionado' : ''}`}
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
              style={[
                styles.input, 
                styles.textArea,
                validationErrors.message ? styles.inputError : null
              ]}
              value={formData.message}
              onChangeText={(text) => handleInputChange('message', text)}
              placeholder="Describe tu proyecto, brief o consulta. Mientras más detalles, mejor podemos ayudarte..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              accessibilityLabel="Campo de mensaje detallado, requerido"
              accessibilityHint="Describe tu proyecto, brief mortal o consulta con el mayor detalle posible para recibir mejor ayuda"
              accessibilityRole="text"
            />
            {validationErrors.message ? (
              <Text style={styles.errorText}>{validationErrors.message}</Text>
            ) : null}
            <Text style={styles.characterCount}>
              {formData.message.length}/1000 caracteres
            </Text>
          </View>

          <Pressable 
            style={styles.submitButton} 
            onPress={handleSubmit}
            accessibilityRole="button"
            accessibilityLabel="Enviar formulario de emergencia publicitaria"
            accessibilityHint="Envía el formulario de contacto para recibir ayuda con tu brief en menos de 24 horas"
            accessibilityState={{ disabled: false }}
          >
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

        {/* Social Media Section */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>SÍGUENOS SI ODIAS LA MALA PUBLICIDAD</Text>
          <Text style={styles.socialSubtitle}>
            Compartimos casos de briefs mortales y cómo resucitarlos
          </Text>
          
          <View style={styles.socialGrid}>
            <Pressable 
              style={({ pressed }) => [
                styles.socialCard,
                pressed && styles.socialCardPressed
              ]}
              onPress={() => openSocialMedia('instagram')}
              accessibilityRole="button"
              accessibilityLabel="Seguir en Instagram"
              accessibilityHint="Abre Instagram para ver briefs del horror y casos de éxito en @briefboy"
            >
              <Text style={styles.socialIcon}>📷</Text>
              <Text style={styles.socialName}>INSTAGRAM</Text>
              <Text style={styles.socialHandle}>@briefboy</Text>
              <Text style={styles.socialDescription}>
                Briefs del horror y casos de éxito
              </Text>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [
                styles.socialCard,
                pressed && styles.socialCardPressed
              ]}
              onPress={() => openSocialMedia('linkedin')}
              accessibilityRole="button"
              accessibilityLabel="Seguir en LinkedIn"
              accessibilityHint="Abre LinkedIn para ver contenido B2B y casos de estudio en /company/briefboy"
            >
              <Text style={styles.socialIcon}>💼</Text>
              <Text style={styles.socialName}>LINKEDIN</Text>
              <Text style={styles.socialHandle}>/company/briefboy</Text>
              <Text style={styles.socialDescription}>
                Contenido B2B y casos de estudio
              </Text>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [
                styles.socialCard,
                pressed && styles.socialCardPressed
              ]}
              onPress={() => openSocialMedia('twitter')}
              accessibilityRole="button"
              accessibilityLabel="Seguir en X (Twitter)"
              accessibilityHint="Abre X (Twitter) para ver hot takes sobre la industria en @briefboy_ai"
            >
              <Text style={styles.socialIcon}>🐦</Text>
              <Text style={styles.socialName}>X (TWITTER)</Text>
              <Text style={styles.socialHandle}>@briefboy_ai</Text>
              <Text style={styles.socialDescription}>
                Hot takes sobre la industria
              </Text>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [
                styles.socialCard,
                pressed && styles.socialCardPressed
              ]}
              onPress={() => openSocialMedia('youtube')}
              accessibilityRole="button"
              accessibilityLabel="Suscribirse a YouTube"
              accessibilityHint="Abre YouTube para ver autopsias de campañas fallidas en @BriefBoyChannel"
            >
              <Text style={styles.socialIcon}>📺</Text>
              <Text style={styles.socialName}>YOUTUBE</Text>
              <Text style={styles.socialHandle}>@BriefBoyChannel</Text>
              <Text style={styles.socialDescription}>
                Autopsias de campañas fallidas
              </Text>
            </Pressable>
          </View>

          <View style={styles.socialStats}>
            <View style={styles.socialStatItem}>
              <Text style={styles.socialStatNumber}>47K</Text>
              <Text style={styles.socialStatLabel}>SEGUIDORES TOTALES</Text>
            </View>
            <View style={styles.socialStatItem}>
              <Text style={styles.socialStatNumber}>2.3M</Text>
              <Text style={styles.socialStatLabel}>IMPRESIONES MENSUALES</Text>
            </View>
            <View style={styles.socialStatItem}>
              <Text style={styles.socialStatNumber}>892</Text>
              <Text style={styles.socialStatLabel}>BRIEFS SALVADOS</Text>
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
            ¿PREFIERES PROBAR{'\n'}LA APP PRIMERO?
          </Text>
          <Pressable 
            style={styles.ctaButton} 
            onPress={() => router.push('/(tabs)')}
            accessibilityRole="button"
            accessibilityLabel="Usar BriefBoy gratis"
            accessibilityHint="Navega a la aplicación principal para generar tu primer brief profesional en 5 minutos"
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
  inputError: {
    borderColor: '#FF4444',
    borderWidth: 3,
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  characterCount: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.6,
    marginTop: 8,
    textAlign: 'right',
    fontWeight: '600',
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

  // Social Media Section
  socialSection: {
    padding: 40,
    paddingTop: 80,
    backgroundColor: '#000000',
  },
  socialTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 8,
    letterSpacing: -2,
    textAlign: 'center',
  },
  socialSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 48,
    textAlign: 'center',
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
    marginBottom: 48,
  },
  socialCard: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    minWidth: 160,
    maxWidth: 200,
    flex: 1,
  },
  socialCardPressed: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  socialIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  socialName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 4,
    letterSpacing: 1,
  },
  socialHandle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    opacity: 0.9,
  },
  socialDescription: {
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.7,
    fontWeight: '500',
    lineHeight: 16,
  },
  socialStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    borderTopWidth: 2,
    borderTopColor: '#FFD700',
    paddingTop: 32,
  },
  socialStatItem: {
    alignItems: 'center',
  },
  socialStatNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 4,
    letterSpacing: -1,
  },
  socialStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    opacity: 0.8,
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