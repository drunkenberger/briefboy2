// Quick test script to verify Supabase connection
// Run with: node test-supabase.js

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

console.log('🧪 Testing Supabase Configuration...');
console.log('=====================================');

// Check environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('📍 Environment Check:');
console.log('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Environment variables missing! Check your .env file.');
  process.exit(1);
}

// Create client
console.log('\n🔌 Creating Supabase client...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🧪 Testing connection...');
    
    // Test 1: Basic connection test
    const { data, error } = await supabase.from('beta_codes').select('count').limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('Error details:', error);
      return false;
    }
    
    console.log('✅ Basic connection successful');
    
    // Test 2: Fetch beta codes
    const { data: codes, error: codesError } = await supabase
      .from('beta_codes')
      .select('code, max_uses, current_uses, is_active, created_at')
      .order('created_at', { ascending: false });
    
    if (codesError) {
      console.log('❌ Failed to fetch beta codes:', codesError.message);
      return false;
    }
    
    console.log('\n📋 Beta Codes Found:');
    if (codes && codes.length > 0) {
      codes.forEach(code => {
        const remaining = code.max_uses - code.current_uses;
        const status = code.is_active ? (remaining > 0 ? 'Active' : 'Exhausted') : 'Inactive';
        console.log(`  📄 ${code.code}: ${remaining}/${code.max_uses} uses remaining (${status})`);
      });
    } else {
      console.log('  No beta codes found');
    }
    
    // Test 3: Test specific code validation
    console.log('\n🔍 Testing BRIEFBOY2024 validation...');
    const { data: testCode, error: testError } = await supabase
      .from('beta_codes')
      .select('*')
      .eq('code', 'BRIEFBOY2024')
      .eq('is_active', true)
      .single();
    
    if (testError) {
      console.log('⚠️ BRIEFBOY2024 not found:', testError.message);
    } else if (testCode) {
      const canUse = testCode.current_uses < testCode.max_uses;
      console.log(`✅ BRIEFBOY2024 found: ${canUse ? 'Can be used' : 'Exhausted'}`);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    return true;
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
    console.log('Full error:', error);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n✅ Supabase is configured correctly!');
    console.log('The issue might be with the Expo app startup or Metro bundler.');
  } else {
    console.log('\n❌ Supabase configuration has issues.');
    console.log('Please check your Supabase project settings and API keys.');
  }
  process.exit(success ? 0 : 1);
});