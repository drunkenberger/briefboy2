// Script para eliminar el código BRIEFBOY2024 de la base de datos
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteBriefboy2024() {
  console.log('🗑️ Eliminando código BRIEFBOY2024...\n');
  
  // Primero verificar que existe
  console.log('1️⃣ Verificando que el código existe:');
  const { data: existing, error: checkError } = await supabase
    .from('beta_codes')
    .select('*')
    .eq('code', 'BRIEFBOY2024');
  
  if (checkError) {
    console.log('❌ Error verificando código:', checkError);
    return;
  }

  if (!existing || existing.length === 0) {
    console.log('ℹ️ El código BRIEFBOY2024 no existe en la base de datos');
    return;
  }

  console.log('✅ Código encontrado:', existing[0]);
  
  // Eliminar el código
  console.log('\n2️⃣ Eliminando el código...');
  const { error: deleteError } = await supabase
    .from('beta_codes')
    .delete()
    .eq('code', 'BRIEFBOY2024');
  
  if (deleteError) {
    console.log('❌ Error eliminando código:', deleteError);
    return;
  }

  console.log('✅ Código BRIEFBOY2024 eliminado exitosamente');
  
  // Verificar que se eliminó
  console.log('\n3️⃣ Verificando eliminación...');
  const { data: afterDelete, error: verifyError } = await supabase
    .from('beta_codes')
    .select('*')
    .eq('code', 'BRIEFBOY2024');
  
  if (verifyError) {
    console.log('❌ Error verificando eliminación:', verifyError);
    return;
  }

  if (!afterDelete || afterDelete.length === 0) {
    console.log('✅ Confirmado: El código BRIEFBOY2024 ya no existe');
  } else {
    console.log('❌ El código aún existe, algo salió mal');
  }
  
  // Mostrar códigos restantes
  console.log('\n4️⃣ Códigos restantes en la base de datos:');
  const { data: remaining, error: listError } = await supabase
    .from('beta_codes')
    .select('code, is_active, current_uses, max_uses');
  
  if (listError) {
    console.log('❌ Error obteniendo códigos restantes:', listError);
  } else {
    console.table(remaining);
  }
}

deleteBriefboy2024().catch(console.error);