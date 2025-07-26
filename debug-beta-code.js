// Debug script para verificar qué está pasando con el código BRIEFBOY2024
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugBetaCode() {
  console.log('🔍 Debugging BRIEFBOY2024...\n');
  
  // Test 1: Buscar el código directamente
  console.log('1️⃣ Buscando código directamente:');
  const { data: direct, error: directError } = await supabase
    .from('beta_codes')
    .select('*')
    .eq('code', 'BRIEFBOY2024');
  
  if (directError) {
    console.log('❌ Error directo:', directError);
  } else {
    console.log('✅ Resultado directo:', direct);
  }
  
  // Test 2: Buscar con filtro is_active
  console.log('\n2️⃣ Buscando con filtro is_active:');
  const { data: active, error: activeError } = await supabase
    .from('beta_codes')
    .select('*')
    .eq('code', 'BRIEFBOY2024')
    .eq('is_active', true);
  
  if (activeError) {
    console.log('❌ Error con is_active:', activeError);
  } else {
    console.log('✅ Resultado con is_active:', active);
  }
  
  // Test 3: Con .single()
  console.log('\n3️⃣ Buscando con .single():');
  const { data: single, error: singleError } = await supabase
    .from('beta_codes')
    .select('*')
    .eq('code', 'BRIEFBOY2024')
    .eq('is_active', true)
    .single();
  
  if (singleError) {
    console.log('❌ Error con single():', singleError);
  } else {
    console.log('✅ Resultado con single():', single);
  }
  
  // Test 4: Simular la validación completa
  console.log('\n4️⃣ Simulando validación completa:');
  if (single) {
    const isValid = single.current_uses < single.max_uses && 
                   (!single.expires_at || new Date(single.expires_at) > new Date());
    console.log('¿Es válido?:', isValid);
    console.log('Usos actuales:', single.current_uses);
    console.log('Usos máximos:', single.max_uses);
    console.log('Fecha expiración:', single.expires_at || 'Sin expiración');
  }
  
  // Test 5: Ver todos los códigos
  console.log('\n5️⃣ Todos los códigos en la base de datos:');
  const { data: all, error: allError } = await supabase
    .from('beta_codes')
    .select('code, is_active, current_uses, max_uses');
  
  if (allError) {
    console.log('❌ Error obteniendo todos:', allError);
  } else {
    console.table(all);
  }
}

debugBetaCode().catch(console.error);