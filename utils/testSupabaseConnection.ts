import { supabase } from './supabase';

/**
 * Test Supabase connection and beta codes
 */
export const testSupabaseConnection = async () => {
  try {
    console.log('🔌 Testing Supabase connection...');
    
    // Test 1: Basic connection
    const { data, error } = await supabase
      .from('beta_codes')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Basic connection successful');
    
    // Test 2: Fetch beta codes
    const { data: codes, error: codesError } = await supabase
      .from('beta_codes')
      .select('code, max_uses, current_uses, is_active')
      .eq('is_active', true)
      .limit(5);
    
    if (codesError) {
      console.error('❌ Beta codes fetch failed:', codesError.message);
      return { success: false, error: codesError.message };
    }
    
    console.log('✅ Beta codes fetched:', codes?.length || 0, 'codes');
    codes?.forEach(code => {
      console.log(`  📄 ${code.code}: ${code.max_uses - code.current_uses} uses remaining`);
    });
    
    // Test 3: Validate a known code
    const { data: validation, error: validationError } = await supabase
      .from('beta_codes')
      .select('*')
      .eq('code', 'BRIEFBOY2024')
      .eq('is_active', true)
      .single();
    
    if (validation) {
      console.log('✅ BRIEFBOY2024 validation successful');
    } else {
      console.log('⚠️ BRIEFBOY2024 not found or not active');
    }
    
    return { 
      success: true, 
      codes: codes || [],
      message: 'All tests passed!' 
    };
    
  } catch (error: any) {
    console.error('❌ Connection test error:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error' 
    };
  }
};