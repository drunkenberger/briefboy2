import React, { useEffect } from 'react';
import { Platform } from 'react-native';

interface PageSenseTrackerProps {
  // No se necesitan props, el tracking es automático
}

/**
 * Componente para tracking de visitas con PageSense
 * Solo funciona en web (React Native Web)
 */
const PageSenseTracker: React.FC<PageSenseTrackerProps> = () => {
  useEffect(() => {
    // Solo ejecutar en web
    if (Platform.OS === 'web') {
      // Verificar si el script ya existe para evitar duplicados
      if (document.querySelector('script[src*="pagesense.io"]')) {
        console.log('📊 PageSense ya está cargado');
        return;
      }

      console.log('📊 Inicializando PageSense tracking...');

      try {
        // Implementar el código de tracking de PageSense
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = 'https://cdn.pagesense.io/js/893169290/86e9c192bd0d427dba46e329ea6a2941.js';
        
        // Insertar el script antes del primer script existente
        const firstScript = document.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) {
          firstScript.parentNode.insertBefore(script, firstScript);
        } else {
          // Fallback: agregar al head si no hay scripts
          document.head.appendChild(script);
        }

        // Manejar eventos de carga
        script.onload = () => {
          console.log('✅ PageSense tracking cargado exitosamente');
        };

        script.onerror = (error) => {
          console.error('❌ Error cargando PageSense tracking:', error);
        };

        // Cleanup al desmontar (opcional)
        return () => {
          // En general no se debe remover el script de tracking
          // ya que puede interrumpir las métricas
          console.log('📊 PageSense tracker desmontado (script permanece)');
        };

      } catch (error) {
        console.error('❌ Error inicializando PageSense:', error);
      }
    } else {
      console.log('📊 PageSense tracking solo disponible en web');
    }
  }, []);

  // Este componente no renderiza nada visible
  return null;
};

export default PageSenseTracker;