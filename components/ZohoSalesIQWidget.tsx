import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface ZohoSalesIQWidgetProps {
  widgetCode?: string;
}

/**
 * Widget de Zoho SalesIQ para React Native Web
 * En web: carga el script de Zoho directamente
 * En mobile: muestra indicador de disponibilidad
 */
const ZohoSalesIQWidget: React.FC<ZohoSalesIQWidgetProps> = ({ 
  widgetCode = "siqcac6ccaff06943ac0b9dc85c19f146c8382faef57bf5a58fb3189ff00dca96ab" 
}) => {
  useEffect(() => {
    // Solo ejecutar en web
    if (Platform.OS === 'web') {
      // Verificar si el script ya existe
      if (document.getElementById('zsiqscript')) {
        return;
      }

      // Agregar estilos CSS personalizados para el widget de Zoho
      const style = document.createElement('style');
      style.textContent = `
        /* Personalizar el botón flotante de Zoho */
        #zsiq_float {
          left: 30px !important;
          right: auto !important;
          bottom: 140px !important;
        }
        
        /* Cambiar colores del botón */
        .zsiq_floatmain {
          background-color: #FFD700 !important;
          border: 4px solid #FFFFFF !important;
          border-radius: 0 !important;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
        }
        
        /* Cambiar color del icono */
        .zsiq_floatmain svg,
        .zsiq_floatmain path,
        .zsiq_floatmain .siqicon-chat {
          fill: #000000 !important;
          color: #000000 !important;
        }
        
        /* Hover effect */
        .zsiq_floatmain:hover {
          background-color: #FFC700 !important;
          transform: scale(1.05) !important;
        }
        
        /* Ocultar el contador de mensajes si existe */
        .zsiq_floatmain .zsiq_unrdcnt {
          background-color: #000000 !important;
          color: #FFD700 !important;
          border: 2px solid #FFFFFF !important;
        }
        
        /* Selectores adicionales por si cambian */
        .siqicon-sqchat,
        .siqicon {
          color: #000000 !important;
        }
        
        /* Widget principal */
        #zsiq_chatpanel,
        .zsiq-widget {
          left: 30px !important;
          right: auto !important;
        }
        
        /* Botón con diferentes clases posibles */
        [class*="zsiq_float"],
        [id*="zsiq_float"] {
          background-color: #FFD700 !important;
          left: 30px !important;
          right: auto !important;
          bottom: 140px !important;
        }
      `;
      document.head.appendChild(style);

      // Configurar objeto global de Zoho
      (window as any).$zoho = (window as any).$zoho || {};
      (window as any).$zoho.salesiq = (window as any).$zoho.salesiq || {
        ready: function() {
          console.log('✅ Zoho SalesIQ cargado exitosamente');
          
          // Personalización del widget
          if ((window as any).$zoho.salesiq) {
            // Intentar configurar la posición
            if ((window as any).$zoho.salesiq.chat) {
              (window as any).$zoho.salesiq.chat.setPosition('left');
            }
            
            // Intentar cambiar el color del tema si la API lo permite
            if ((window as any).$zoho.salesiq.theme) {
              (window as any).$zoho.salesiq.theme.primaryColor('#FFD700');
            }
          }
        }
      };

      // Crear elemento script
      const script = document.createElement('script');
      script.id = 'zsiqscript';
      script.src = `https://salesiq.zohopublic.com/widget?wc=${widgetCode}`;
      script.defer = true;
      script.type = 'text/javascript';
      
      // Manejo de eventos
      script.onload = () => {
        console.log('✅ Script de Zoho SalesIQ cargado');
      };

      script.onerror = (error) => {
        console.error('❌ Error cargando Zoho SalesIQ:', error);
      };

      // Agregar script al DOM
      document.body.appendChild(script);

      // Cleanup al desmontar
      return () => {
        const existingScript = document.getElementById('zsiqscript');
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, [widgetCode]);

  // En plataformas móviles, mostrar indicador
  if (Platform.OS !== 'web') {
    return (
      <View style={styles.mobileIndicator}>
        <Text style={styles.mobileText}>
          💬 CHAT DISPONIBLE EN WEB
        </Text>
      </View>
    );
  }

  // En web, el widget de Zoho se renderiza automáticamente
  // No necesitamos devolver ningún JSX
  return null;
};

const styles = StyleSheet.create({
  mobileIndicator: {
    position: 'absolute',
    bottom: 140,
    left: 30,
    backgroundColor: '#FFD700',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 9999,
  },
  mobileText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});

export default ZohoSalesIQWidget;