// Script para desactivar el código BRIEFBOY2024 (alternativa si no se puede eliminar)
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deactivateBriefboy2024() {
  console.log('🔒 Desactivando código BRIEFBOY2024...\n');
  
  // Desactivar el código en lugar de eliminarlo
  console.log('1️⃣ Desactivando el código...');
  const { error: updateError } = await supabase
    .from('beta_codes')
    .update({ is_active: false })
    .eq('code', 'BRIEFBOY2024');
  
  if (updateError) {
    console.log('❌ Error desactivando código:', updateError);
    return;
  }

  console.log('✅ Código BRIEFBOY2024 desactivado exitosamente');
  
  // Verificar el cambio
  console.log('\n2️⃣ Verificando desactivación...');
  const { data: afterUpdate, error: verifyError } = await supabase
    .from('beta_codes')
    .select('*')
    .eq('code', 'BRIEFBOY2024');
  
  if (verifyError) {
    console.log('❌ Error verificando desactivación:', verifyError);
    return;
  }

  if (afterUpdate && afterUpdate.length > 0) {
    console.log('✅ Estado actualizado:', {
      code: afterUpdate[0].code,
      is_active: afterUpdate[0].is_active,
      current_uses: afterUpdate[0].current_uses,
      max_uses: afterUpdate[0].max_uses
    });
  }
  
  // Mostrar solo códigos activos
  console.log('\n3️⃣ Códigos ACTIVOS restantes:');
  const { data: active, error: listError } = await supabase
    .from('beta_codes')
    .select('code, is_active, current_uses, max_uses')
    .eq('is_active', true);
  
  if (listError) {
    console.log('❌ Error obteniendo códigos activos:', listError);
  } else {
    console.table(active);
  }
}

deactivateBriefboy2024().catch(console.error);