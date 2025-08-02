In scripts/clearAllBriefs.js at lines 1 to 8, the AsyncStorage import syntax is incorrect. Replace the destructuring import of AsyncStorage with a default import by requiring '@react-native-async-storage/async-storage' directly and assigning it to AsyncStorage. This aligns with the correct usage of the package.const { AsyncStorage } = require('@react-native-async-storage/async-storage');

/**
 * Script para limpiar completamente todos los briefs guardados
 * Este script elimina todos los datos de AsyncStorage relacionados con briefs
 */

const STORAGE_KEY = '@briefboy_saved_briefs';

async function clearAllBriefs() {
  try {
    console.log('🗑️ Iniciando limpieza completa de briefs...');
    
    // Verificar datos actuales
    const currentData = await AsyncStorage.getItem(STORAGE_KEY);
    if (currentData) {
      const briefs = JSON.parse(currentData);
      console.log(`📊 Briefs encontrados: ${briefs.length}`);
      console.log('📄 Primeros 3 títulos:', briefs.slice(0, 3).map(b => b.title));
    } else {
      console.log('📋 No se encontraron briefs en storage');
      return;
    }
    
    // Limpiar completamente
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('✅ Storage limpiado completamente');
    
    // Verificar que se limpió
    const afterData = await AsyncStorage.getItem(STORAGE_KEY);
    if (afterData) {
      console.log('⚠️ Advertencia: Aún hay datos en storage');
    } else {
      console.log('🎉 Confirmado: Storage completamente limpio');
    }
    
  } catch (error) {
    console.error('❌ Error limpiando briefs:', error);
  }
}

// Función para limpiar también otros posibles keys relacionados
async function clearAllRelatedData() {
  try {
    console.log('🧹 Limpiando todos los datos relacionados...');
    
    // Obtener todas las keys
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('🔑 Keys encontradas:', allKeys);
    
    // Filtrar keys relacionadas con briefs
    const briefKeys = allKeys.filter(key => 
      key.includes('brief') || 
      key.includes('Brief') || 
      key.includes('briefboy') ||
      key.includes('BRIEF')
    );
    
    console.log('🎯 Keys de briefs a eliminar:', briefKeys);
    
    if (briefKeys.length > 0) {
      await AsyncStorage.multiRemove(briefKeys);
      console.log('✅ Todas las keys de briefs eliminadas');
    } else {
      console.log('📭 No se encontraron keys de briefs para eliminar');
    }
    
  } catch (error) {
    console.error('❌ Error limpiando datos relacionados:', error);
  }
}

// Ejecutar limpieza completa
async function main() {
  console.log('🚀 Iniciando limpieza completa de BriefBoy...');
  await clearAllBriefs();
  await clearAllRelatedData();
  console.log('🏁 Proceso completado');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { clearAllBriefs, clearAllRelatedData };