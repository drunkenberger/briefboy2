import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (__DEV__) {
  console.log('🔧 Supabase config check:');
  console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
}

if (!supabaseUrl || !supabaseAnonKey) {
  const error = 'Missing Supabase environment variables. Check your .env file contains EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY';
  console.error('❌', error);
  throw new Error(error);
}

// Custom storage adapter for React Native
const customStorageAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    }
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database Types
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  beta_code: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface BetaCode {
  id: string;
  code: string;
  max_uses: number;
  current_uses: number;
  expires_at?: string;
  created_by?: string;
  is_active: boolean;
  created_at: string;
}

// Auth helper functions
export const getCurrentUser = () => {
  return supabase.auth.getUser();
};

export const signOut = () => {
  return supabase.auth.signOut();
};

export const signUp = async (email: string, password: string, betaCode: string, fullName?: string) => {
  console.log('🔐 signUp called with:', { email, betaCode, fullName });
  
  // First validate the beta code
  console.log('🔍 Validating beta code:', betaCode);
  const { data: codeData, error: codeError } = await supabase
    .from('beta_codes')
    .select('*')
    .eq('code', betaCode)
    .eq('is_active', true)
    .single();

  if (codeError || !codeData) {
    console.error('❌ Beta code validation failed:', codeError);
    throw new Error('Código de acceso inválido o expirado');
  }

  console.log('✅ Beta code validated:', codeData);

  // Check if code has reached max uses
  if (codeData.current_uses >= codeData.max_uses) {
    console.error('❌ Code exhausted:', codeData.current_uses, '>=', codeData.max_uses);
    throw new Error('Este código de acceso ya ha sido utilizado el máximo de veces');
  }

  // Check if code is expired
  if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
    console.error('❌ Code expired:', codeData.expires_at);
    throw new Error('Este código de acceso ha expirado');
  }

  // Sign up the user
  console.log('📝 Creating user account...');
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        beta_code: betaCode,
      },
    },
  });

  if (authError) {
    console.error('❌ Auth signup error:', authError);
    throw authError;
  }
  
  console.log('✅ User created:', authData?.user?.email);

  // If user creation was successful, increment the beta code usage
  if (authData.user) {
    const { error: updateError } = await supabase
      .from('beta_codes')
      .update({ current_uses: codeData.current_uses + 1 })
      .eq('id', codeData.id);

    if (updateError) {
      console.warn('Failed to increment beta code usage:', updateError);
    }
  }

  return authData;
};

export const signIn = (email: string, password: string) => {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const resetPassword = (email: string) => {
  return supabase.auth.resetPasswordForEmail(email);
};

// Profile management
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Beta code utilities - NOTE: These functions now require service role access
// You'll need to create codes directly in Supabase SQL Editor or use service role key
export const createBetaCode = async (code: string, maxUses = 1, expiresAt?: Date) => {
  // WARNING: This function now requires service role permissions
  // Consider creating codes directly in Supabase SQL Editor instead
  const { data, error } = await supabase
    .from('beta_codes')
    .insert({
      code,
      max_uses: maxUses,
      expires_at: expiresAt?.toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const validateBetaCode = async (code: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('beta_codes')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return false;
  }

  // Check usage limits and expiration
  if (data.current_uses >= data.max_uses) {
    return false;
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return false;
  }

  return true;
};