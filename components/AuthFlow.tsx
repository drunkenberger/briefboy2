import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

type AuthMode = 'signin' | 'signup' | 'forgot';

interface AuthFlowProps {
  onCancel?: () => void;
}

const AuthFlow: React.FC<AuthFlowProps> = ({ onCancel }) => {
  const router = useRouter();
  const { signIn, signUp, resetPassword, validateBetaCode, loading } = useSupabaseAuth();
  
  const [mode, setMode] = useState<AuthMode>('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    betaCode: '',
  });
  const [betaCodeValid, setBetaCodeValid] = useState<boolean | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [accountCreated, setAccountCreated] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset beta code validation when code changes
    if (field === 'betaCode') {
      setBetaCodeValid(null);
    }
  };

  const handleValidateBetaCode = async () => {
    if (!formData.betaCode.trim()) {
      setBetaCodeValid(null);
      return;
    }

    setValidatingCode(true);
    try {
      const isValid = await validateBetaCode(formData.betaCode.trim());
      setBetaCodeValid(isValid);
      
      if (!isValid) {
        Alert.alert('Código inválido', 'El código de acceso no es válido o ya ha sido utilizado.');
      }
    } catch (error) {
      setBetaCodeValid(false);
      Alert.alert('Error', 'No se pudo validar el código. Intenta nuevamente.');
    } finally {
      setValidatingCode(false);
    }
  };

  const handleSignIn = async () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos.');
      return;
    }

    try {
      await signIn(formData.email.trim(), formData.password);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleSignUp = async () => {
    console.log('🚀 handleSignUp called');
    console.log('📝 Form data:', {
      email: formData.email,
      hasPassword: !!formData.password,
      passwordLength: formData.password.length,
      betaCode: formData.betaCode,
      betaCodeValid,
      loading
    });

    // Validate form
    if (!formData.email.trim() || !formData.password.trim() || !formData.betaCode.trim()) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (betaCodeValid !== true) {
      Alert.alert('Código requerido', 'Debes validar tu código de acceso antes de registrarte.');
      return;
    }

    console.log('✅ All validations passed, calling signUp...');

    try {
      console.log('🚀 Calling signUp from AuthFlow...');
      await signUp(
        formData.email.trim(),
        formData.password,
        formData.betaCode.trim(),
        formData.fullName.trim() || undefined
      );
      console.log('✅ signUp completed successfully - should show success message');
      
      // Set pending email for confirmation and show success state
      setPendingEmail(formData.email.trim());
      setAccountCreated(true);
    } catch (error) {
      console.error('❌ SignUp error in AuthFlow:', error);
      // Error is handled in the hook
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      Alert.alert('Email requerido', 'Ingresa tu email para recuperar la contraseña.');
      return;
    }

    try {
      await resetPassword(formData.email.trim());
      setMode('signin');
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const renderSignInForm = () => (
    <>
      <Text style={styles.title}>INICIAR SESIÓN</Text>
      <Text style={styles.subtitle}>Accede a tu cuenta de BriefBoy</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          placeholder="tu@email.com"
          placeholderTextColor="#666666"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Contraseña:</Text>
        <TextInput
          style={styles.input}
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          placeholder="Tu contraseña"
          placeholderTextColor="#666666"
          secureTextEntry
        />
      </View>

      <Pressable
        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
        onPress={handleSignIn}
        disabled={loading}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? 'INICIANDO SESIÓN...' : 'INICIAR SESIÓN'}
        </Text>
      </Pressable>

      <View style={styles.linksContainer}>
        <Pressable onPress={() => setMode('forgot')}>
          <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
        </Pressable>
        
        <Pressable onPress={() => setMode('signup')}>
          <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
        </Pressable>
      </View>
    </>
  );

  const renderSignUpForm = () => (
    <>
      <Text style={styles.title}>CREAR CUENTA</Text>
      <Text style={styles.subtitle}>Únete a BriefBoy con tu código de acceso</Text>

      {accountCreated && (
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>✅ ¡Cuenta creada exitosamente!</Text>
          <Text style={styles.successMessage}>
            📧 Hemos enviado un enlace de confirmación a:{'\n'}
            <Text style={styles.emailHighlight}>{pendingEmail}</Text>
            {'\n\n'}
            📮 Debes confirmar tu email antes de poder acceder a BriefBoy.
            {'\n\n'}
            Revisa tu bandeja de entrada y carpeta de spam.
          </Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre completo (opcional):</Text>
        <TextInput
          style={styles.input}
          value={formData.fullName}
          onChangeText={(value) => handleInputChange('fullName', value)}
          placeholder="Tu nombre completo"
          placeholderTextColor="#666666"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, styles.required]}>Email:</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          placeholder="tu@email.com"
          placeholderTextColor="#666666"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, styles.required]}>Contraseña:</Text>
        <TextInput
          style={styles.input}
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          placeholder="Mínimo 6 caracteres"
          placeholderTextColor="#666666"
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, styles.required]}>Confirmar contraseña:</Text>
        <TextInput
          style={styles.input}
          value={formData.confirmPassword}
          onChangeText={(value) => handleInputChange('confirmPassword', value)}
          placeholder="Repite tu contraseña"
          placeholderTextColor="#666666"
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, styles.required]}>Código de acceso:</Text>
        <View style={styles.betaCodeContainer}>
          <TextInput
            style={[
              styles.input,
              styles.betaCodeInput,
              betaCodeValid === true && styles.inputValid,
              betaCodeValid === false && styles.inputInvalid
            ]}
            value={formData.betaCode}
            onChangeText={(value) => handleInputChange('betaCode', value.toUpperCase())}
            placeholder="BRIEFBOY2024"
            placeholderTextColor="#666666"
            autoCapitalize="characters"
            autoCorrect={false}
            onBlur={handleValidateBetaCode}
          />
          <Pressable
            style={[
              styles.validateButton,
              validatingCode && styles.validateButtonDisabled,
              betaCodeValid === true && styles.validateButtonValid
            ]}
            onPress={handleValidateBetaCode}
            disabled={validatingCode}
          >
            <Text style={styles.validateButtonText}>
              {validatingCode ? '...' : betaCodeValid === true ? '✓' : 'Validar'}
            </Text>
          </Pressable>
        </View>
        {betaCodeValid === false && (
          <Text style={styles.errorText}>Código inválido o ya utilizado</Text>
        )}
        {betaCodeValid === true && (
          <Text style={styles.successText}>✓ Código válido</Text>
        )}
      </View>

      <Pressable
        style={[
          styles.primaryButton,
          (loading || betaCodeValid !== true) && styles.primaryButtonDisabled
        ]}
        onPress={handleSignUp}
        disabled={loading || betaCodeValid !== true}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
        </Text>
      </Pressable>

      <Text style={styles.helpText}>
        El código de acceso es requerido durante la fase beta.{'\n'}
        Si no tienes uno, contacta al equipo de BriefBoy.
      </Text>

      <View style={styles.linksContainer}>
        <Pressable onPress={() => setMode('signin')}>
          <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
        </Pressable>
      </View>
    </>
  );

  const renderForgotPasswordForm = () => (
    <>
      <Text style={styles.title}>RECUPERAR CONTRASEÑA</Text>
      <Text style={styles.subtitle}>Te enviaremos un enlace para restablecer tu contraseña</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          placeholder="tu@email.com"
          placeholderTextColor="#666666"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <Pressable
        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
        onPress={handleForgotPassword}
        disabled={loading}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? 'ENVIANDO...' : 'ENVIAR ENLACE'}
        </Text>
      </Pressable>

      <View style={styles.linksContainer}>
        <Pressable onPress={() => setMode('signin')}>
          <Text style={styles.linkText}>← Volver al inicio de sesión</Text>
        </Pressable>
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.authBox}>
          {mode === 'signin' && renderSignInForm()}
          {mode === 'signup' && renderSignUpForm()}
          {mode === 'forgot' && renderForgotPasswordForm()}

          {onCancel && (
            <Pressable style={styles.backButton} onPress={onCancel}>
              <Text style={styles.backButtonText}>← VOLVER AL INICIO</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#111111',
    borderWidth: 4,
    borderColor: '#FFD700',
    padding: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    letterSpacing: 0.5,
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  required: {
    color: '#FFD700',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  inputValid: {
    borderColor: '#10b981',
  },
  inputInvalid: {
    borderColor: '#ef4444',
  },
  betaCodeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  betaCodeInput: {
    flex: 1,
  },
  validateButton: {
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  validateButtonDisabled: {
    backgroundColor: '#666666',
    borderColor: '#444444',
  },
  validateButtonValid: {
    backgroundColor: '#10b981',
  },
  validateButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  successText: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 5,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 5,
    fontWeight: '600',
  },
  primaryButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  primaryButtonDisabled: {
    backgroundColor: '#666666',
    borderColor: '#444444',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
  linksContainer: {
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },
  linkText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
    letterSpacing: 0.5,
    textDecorationLine: 'underline',
  },
  helpText: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.8,
    marginBottom: 20,
  },
  backButton: {
    width: '100%',
    height: 45,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  successContainer: {
    width: '100%',
    backgroundColor: '#0a4d1a',
    borderWidth: 2,
    borderColor: '#10b981',
    padding: 20,
    marginBottom: 30,
    borderRadius: 4,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  successMessage: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  emailHighlight: {
    color: '#FFD700',
    fontWeight: '700',
  },
});

export default AuthFlow;