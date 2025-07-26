import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Profile, signUp, signIn, signOut, getProfile, validateBetaCode } from '../utils/supabase';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  signUp: (email: string, password: string, betaCode: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  validateBetaCode: (code: string) => Promise<boolean>;
}

export function useSupabaseAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    isAuthenticated: false,
  });

  // Debug logging
  useEffect(() => {
    if (__DEV__) {
      console.log('🔑 useSupabaseAuth: Hook initialized');
      console.log('🔑 Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
      console.log('🔑 Supabase Key exists:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        if (__DEV__) {
          console.log('🔑 Getting initial session...');
        }
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          if (mounted) {
            setState(prev => ({ ...prev, loading: false }));
          }
          return;
        }

        if (session?.user && mounted) {
          // Get user profile
          const profile = await getProfile(session.user.id);
          
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            isAuthenticated: true,
          });
        } else if (mounted) {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          // Get user profile
          const profile = await getProfile(session.user.id);
          
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            isAuthenticated: true,
          });
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            isAuthenticated: false,
          });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setState(prev => ({
            ...prev,
            session,
            user: session.user,
          }));
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignUp = async (email: string, password: string, betaCode: string, fullName?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      // First validate the beta code
      const isValidCode = await validateBetaCode(betaCode);
      if (!isValidCode) {
        throw new Error('Código de acceso inválido, expirado o ya utilizado');
      }

      const authData = await signUp(email, password, betaCode, fullName);
      console.log('🔍 Auth data returned:', { user: !!authData.user, session: !!authData.session });
      
      // Always require email confirmation - user should not be automatically logged in
      if (authData.user) {
        console.log('🎉 User created successfully, showing success alert');
        Alert.alert(
          '🎉 ¡Cuenta creada exitosamente!',
          `Tu cuenta ha sido creada con:\n\n📧 Email: ${email}\n🔑 Código: ${betaCode}\n\n📮 IMPORTANTE: Hemos enviado un enlace de confirmación a tu email. Debes confirmar tu email antes de poder acceder a la aplicación.\n\nRevisa tu bandeja de entrada (y carpeta de spam).`,
          [{ text: 'Entendido', style: 'default' }]
        );
        setState(prev => ({ ...prev, loading: false }));
      } else {
        console.log('❌ No user returned from signUp, this is unexpected');
        console.log('Full authData:', authData);
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      console.error('Sign up error:', error);
      
      let errorMessage = 'Error al crear la cuenta';
      
      if (error.message?.includes('already registered')) {
        errorMessage = 'Este email ya está registrado. Intenta iniciar sesión.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Email inválido. Verifica el formato.';
      } else if (error.message?.includes('Password')) {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (error.message?.includes('beta_code') || error.message?.includes('Código')) {
        errorMessage = error.message;
      } else {
        errorMessage = error.message || 'Error desconocido al crear la cuenta';
      }
      
      Alert.alert('Error de Registro', errorMessage);
      throw error;
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const { data, error } = await signIn(email, password);
      
      if (error) {
        throw error;
      }

      if (data.user && data.session) {
        // The auth state change listener will handle updating the state
        console.log('Sign in successful for:', data.user.email);
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      console.error('Sign in error:', error);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email o contraseña incorrectos.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = '📧 Email no confirmado\n\nDebes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada (y carpeta de spam) para el enlace de confirmación.\n\nSi no recibiste el email, intenta registrarte nuevamente.';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Demasiados intentos. Espera unos minutos.';
      } else {
        errorMessage = error.message || 'Error desconocido al iniciar sesión';
      }
      
      Alert.alert('Error de Inicio de Sesión', errorMessage);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await signOut();
      // The auth state change listener will handle updating the state
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      console.error('Sign out error:', error);
      Alert.alert('Error', 'No se pudo cerrar la sesión');
      throw error;
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        throw error;
      }

      Alert.alert(
        '📧 Email enviado',
        'Se ha enviado un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.',
        [{ text: 'Entendido' }]
      );
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      let errorMessage = 'Error al enviar el email de recuperación';
      
      if (error.message?.includes('rate limit')) {
        errorMessage = 'Demasiados intentos. Espera unos minutos.';
      } else {
        errorMessage = error.message || 'Error desconocido';
      }
      
      Alert.alert('Error', errorMessage);
      throw error;
    }
  };

  const handleValidateBetaCode = async (code: string): Promise<boolean> => {
    try {
      return await validateBetaCode(code);
    } catch (error) {
      console.error('Beta code validation error:', error);
      return false;
    }
  };

  return {
    ...state,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    validateBetaCode: handleValidateBetaCode,
  };
}