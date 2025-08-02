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

export function useSupabaseAuth(): AuthState & AuthActions & { initializing: boolean } {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: false, // This will only be true during actual auth actions (login/signup)
    isAuthenticated: false,
  });
  
  const [initializing, setInitializing] = useState(true); // Separate state for initial auth check

  // Debug logging (always enabled for production debugging)
  useEffect(() => {
    console.log('🔑 useSupabaseAuth: Hook initialized');
    console.log('🔑 Environment:', __DEV__ ? 'Development' : 'Production');
    console.log('🔑 Supabase URL exists:', !!process.env.EXPO_PUBLIC_SUPABASE_URL);
    console.log('🔑 Supabase Key exists:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
    
    // Show first few characters of URL for debugging (safe)
    if (process.env.EXPO_PUBLIC_SUPABASE_URL) {
      console.log('🔑 Supabase URL preview:', process.env.EXPO_PUBLIC_SUPABASE_URL.substring(0, 20) + '...');
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔑 Getting initial session...');
        
        // Check if Supabase is properly configured
        if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
          console.error('🚨 Supabase not configured - cannot authenticate');
          if (mounted) {
            setState({
              user: null,
              profile: null,
              session: null,
              loading: false,
              isAuthenticated: false,
            });
            setInitializing(false);
          }
          return;
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          if (mounted) {
            setState(prev => ({ ...prev, loading: false, isAuthenticated: false }));
            setInitializing(false);
          }
          return;
        }

        if (session?.user && mounted) {
          console.log('🔑 Found existing session for:', session.user.email);
          // Get user profile (with error handling)
          let profile = null;
          try {
            profile = await getProfile(session.user.id);
          } catch (error) {
            console.warn('⚠️ Failed to fetch profile, continuing without it:', error);
          }
          
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            isAuthenticated: true,
          });
          console.log('✅ Auth state updated with existing session');
        } else if (mounted) {
          // No session found
          console.log('📭 No existing session found');
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            isAuthenticated: false,
          });
        }
        
        if (mounted) {
          setInitializing(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            isAuthenticated: false,
          });
          setInitializing(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        console.log('🔍 Auth event details:', {
          event,
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          emailConfirmed: session?.user?.email_confirmed_at,
          mounted
        });
        
        if (!mounted) {
          console.log('⚠️ Component unmounted, ignoring auth state change');
          return;
        }

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ Processing SIGNED_IN event...');
          
          // Check if we already have this user to prevent duplicate processing
          setState(prev => {
            if (prev.isAuthenticated && prev.user?.id === session.user.id) {
              console.log('⚠️ User already authenticated, skipping duplicate SIGNED_IN processing');
              return prev;
            }
            
            console.log('🔄 Updating state for new SIGNED_IN event');
            return {
              user: session.user,
              profile: prev.profile, // Keep existing profile for now
              session,
              loading: false,
              isAuthenticated: true,
            };
          });
          
          // Load user profile if we don't have it
          setState(prev => {
            if (!prev.profile && session.user) {
              getProfile(session.user.id)
                .then(profile => {
                  console.log('👤 User profile loaded:', !!profile);
                  setState(current => ({
                    ...current,
                    profile
                  }));
                })
                .catch(error => {
                  console.warn('⚠️ Failed to fetch profile:', error);
                });
            }
            return prev;
          });
          
          setInitializing(false);
          console.log('🎉 User successfully authenticated and state updated');
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 Processing SIGNED_OUT event...');
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            isAuthenticated: false,
          });
          setInitializing(false);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('🔄 Processing TOKEN_REFRESHED event...');
          setState(prev => ({
            ...prev,
            session,
            user: session.user,
          }));
        } else {
          console.log('❓ Unhandled auth event or missing data');
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
      console.log('🔐 useSupabaseAuth handleSignIn called with:', { email, passwordLength: password.length });
      
      // Check if Supabase is configured
      if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('🚨 Cannot sign in - Supabase not configured');
        Alert.alert(
          'Error de Configuración',
          'La aplicación no está configurada correctamente. Contacta al administrador.',
          [{ text: 'Entendido' }]
        );
        return;
      }
      
      // Check if user is already authenticated to prevent loops
      if (state.isAuthenticated && state.user?.email === email) {
        console.log('⚠️ User already authenticated with same email, skipping sign in');
        return;
      }
      
      setState(prev => ({ ...prev, loading: true }));

      console.log('🚀 Calling Supabase signIn...');
      const { data, error } = await signIn(email, password);
      console.log('📊 Supabase signIn response:', { 
        hasUser: !!data.user, 
        hasSession: !!data.session, 
        error: error?.message 
      });
      
      if (error) {
        console.error('❌ Supabase signIn error:', error);
        setState(prev => ({ ...prev, loading: false }));
        throw error;
      }

      if (data.user && data.session) {
        console.log('✅ Sign in successful for:', data.user.email);
        console.log('🔑 Session details:', {
          userId: data.user.id,
          emailConfirmed: data.user.email_confirmed_at,
          sessionExpiry: data.session.expires_at
        });
        
        // The auth state change listener will handle updating the state
        // Remove the setTimeout workaround that could cause loops
        setState(prev => ({ ...prev, loading: false }));
      } else {
        console.log('⚠️ Sign in returned data but missing user or session');
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      console.error('❌ Sign in error in hook:', error);
      
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
    loading: state.loading, // Only use state.loading for auth actions
    initializing, // Expose initializing separately
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    validateBetaCode: handleValidateBetaCode,
  };
}