import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

// Importar la imagen del personaje
const briefboyAvatar = require('../assets/images/donbrief-avatar.png');

interface ElevenLabsDirectWidgetProps {
  agentId?: string;
}

const ElevenLabsDirectWidget: React.FC<ElevenLabsDirectWidgetProps> = ({ 
  agentId = "agent_01jzzt3hd7ffqrttr04n9kwn6t"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Configurar getUserMedia si no existe
    const setupGetUserMedia = () => {
      if (!navigator.mediaDevices) {
        (navigator as any).mediaDevices = {};
      }
      
      if (!navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia = function(constraints) {
          const getUserMedia = (navigator as any).getUserMedia || 
                              (navigator as any).webkitGetUserMedia || 
                              (navigator as any).mozGetUserMedia;
          
          if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
          }
          
          return new Promise((resolve, reject) => {
            getUserMedia.call(navigator, constraints, resolve, reject);
          });
        };
      }
    };

    // Función para cargar el script
    const loadScript = () => {
      if (scriptLoaded.current) return;

      setupGetUserMedia();

      // Verificar si el script ya existe
      const existingScript = document.querySelector('script[src*="elevenlabs/convai-widget-embed"]');
      if (existingScript) {
        scriptLoaded.current = true;
        initializeWidget();
        return;
      }

      // Crear y cargar el script
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      
      script.onload = () => {
        console.log('ElevenLabs script loaded successfully');
        scriptLoaded.current = true;
        initializeWidget();
      };
      
      script.onerror = (error) => {
        console.error('Failed to load ElevenLabs script:', error);
      };
      
      document.body.appendChild(script);
    };

    // Función para inicializar el widget
    const initializeWidget = () => {
      if (!containerRef.current) return;

      // Limpiar contenedor
      containerRef.current.innerHTML = '';

      // Crear elemento del widget
      const widget = document.createElement('elevenlabs-convai');
      widget.setAttribute('agent-id', agentId);
      widget.setAttribute('avatar-orb-color-1', '#FFD700');
      widget.setAttribute('avatar-orb-color-2', '#000000');
      widget.setAttribute('action-text', 'Hablar con BriefBoy');
      widget.setAttribute('start-call-text', '¡Hola! Soy tu asistente de briefs');
      widget.setAttribute('override-language', 'es');
      
      // Agregar imagen del avatar
      // En web con Expo, la imagen importada es una URL
      if (typeof briefboyAvatar === 'string') {
        widget.setAttribute('avatar-image-url', briefboyAvatar);
      } else if (briefboyAvatar && briefboyAvatar.uri) {
        widget.setAttribute('avatar-image-url', briefboyAvatar.uri);
      } else {
        // Si no funciona, puedes usar una URL directa a tu imagen
        // widget.setAttribute('avatar-image-url', 'https://tu-imagen-url.com/avatar.png');
        console.log('Avatar image format:', briefboyAvatar);
      }

      // Agregar el widget al contenedor
      containerRef.current.appendChild(widget);
    };

    // Cargar el script después de un pequeño delay para asegurar que el DOM esté listo
    const timeoutId = setTimeout(loadScript, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [agentId]);

  if (Platform.OS !== 'web') {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <div 
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    borderRadius: 0,
    overflow: 'hidden',
  },
});

export default ElevenLabsDirectWidget;