/**
 * Utilidad para verificar la configuración de API keys
 * Úsala para debuggear problemas de configuración
 */

interface ApiKeyStatus {
  name: string;
  key: string;
  configured: boolean;
  valid: boolean;
  error?: string;
}

export const validateApiKeys = (): ApiKeyStatus[] => {
  const keys = [
    {
      name: 'OpenAI',
      key: 'EXPO_PUBLIC_OPENAI_API_KEY',
      value: process.env.EXPO_PUBLIC_OPENAI_API_KEY
    },
    {
      name: 'Claude',
      key: 'EXPO_PUBLIC_CLAUDE_API_KEY', 
      value: process.env.EXPO_PUBLIC_CLAUDE_API_KEY
    },
    {
      name: 'Gemini',
      key: 'EXPO_PUBLIC_GEMINI_API_KEY',
      value: process.env.EXPO_PUBLIC_GEMINI_API_KEY
    }
  ];

  return keys.map(({ name, key, value }) => {
    const configured = !!value;
    let valid = false;
    let error = '';

    if (configured) {
      // Validaciones básicas de formato
      switch (name) {
        case 'OpenAI':
          valid = value!.startsWith('sk-proj-') || value!.startsWith('sk-');
          if (!valid) error = 'Debe empezar con "sk-proj-" o "sk-"';
          break;
        case 'Claude':
          valid = value!.startsWith('sk-ant-api03-');
          if (!valid) error = 'Debe empezar con "sk-ant-api03-"';
          break;
        case 'Gemini':
          valid = value!.length > 30 && !value!.includes(' ');
          if (!valid) error = 'Formato inválido (debe ser una cadena larga sin espacios)';
          break;
      }
    } else {
      error = 'No configurada';
    }

    return {
      name,
      key,
      configured,
      valid,
      error: error || undefined
    };
  });
};

export const logApiKeyStatus = () => {
  const status = validateApiKeys();
  
  console.log('🔑 Estado de API Keys:');
  console.log('='.repeat(50));
  
  status.forEach(({ name, key, configured, valid, error }) => {
    const icon = configured && valid ? '✅' : configured ? '⚠️' : '❌';
    console.log(`${icon} ${name}: ${configured ? 'Configurada' : 'No configurada'}`);
    console.log(`   Variable: ${key}`);
    if (error) {
      console.log(`   Error: ${error}`);
    }
    console.log('');
  });

  const configuredCount = status.filter(s => s.configured && s.valid).length;
  
  if (configuredCount === 0) {
    console.log('❌ PROBLEMA: No hay API keys válidas configuradas');
    console.log('💡 Solución: Configura al menos una API key en el archivo .env');
  } else {
    console.log(`✅ ${configuredCount} API key(s) válida(s) configurada(s)`);
    console.log('✅ El sistema de respaldo debería funcionar correctamente');
  }
  
  console.log('='.repeat(50));
};

// Función para usar en desarrollo
export const checkApiKeysOnStartup = () => {
  if (__DEV__) {
    logApiKeyStatus();
  }
};