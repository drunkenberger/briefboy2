import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface ZohoSalesIQWidgetProps {
  // No se aceptan props para forzar la configuración a través de variables de entorno.
}

/**
 * Widget de Zoho SalesIQ para React Native Web
 * En web: carga el script de Zoho directamente
 * En mobile: muestra indicador de disponibilidad
 */
const ZohoSalesIQWidget: React.FC<ZohoSalesIQWidgetProps> = () => {
  // Widget code fijo de Zoho SalesIQ
  const widgetCode = 'siqcac6ccaff06943ac0b9dc85c19f146c8382faef57bf5a58fb3189ff00dca96ab';

  useEffect(() => {
    console.log('🚀 Inicializando Zoho SalesIQ Widget...');

    // Solo ejecutar en web
    if (Platform.OS === 'web') {
      // Verificar si el script ya existe
      if (document.getElementById('zsiqscript')) {
        return;
      }

      // Configurar objeto global de Zoho ANTES de cargar el script
      (window as any).$zoho = (window as any).$zoho || {};
      (window as any).$zoho.salesiq = (window as any).$zoho.salesiq || {
        ready: function() {
          console.log('✅ Zoho SalesIQ cargado exitosamente');
          
          // Intentar forzar posición usando API de Zoho - INMEDIATO
          setTimeout(() => {
            try {
              if ((window as any).$zoho.salesiq.chat) {
                (window as any).$zoho.salesiq.chat.setPosition('left');
                console.log('🔄 Posición forzada a izquierda via API');
              }
              
              // Forzar posición con JavaScript puro - múltiples intentos
              const forcePosition = () => {
                const selectors = [
                  '#zsiq_float',
                  '[id*="zsiq_float"]',
                  '.zsiq_float',
                  '.zsiq_floatmain',
                  '#zsiq_floatmain'
                ];
                
                selectors.forEach(selector => {
                  const elements = document.querySelectorAll(selector);
                  elements.forEach(element => {
                    const htmlElement = element as HTMLElement;
                    htmlElement.style.setProperty('left', '20px', 'important');
                    htmlElement.style.setProperty('right', 'unset', 'important');
                    htmlElement.style.setProperty('bottom', '20px', 'important');
                    htmlElement.style.setProperty('position', 'fixed', 'important');
                    htmlElement.style.setProperty('z-index', '9999999', 'important');
                    htmlElement.style.setProperty('transform', 'none', 'important');
                  });
                });
                console.log('🔄 Posición forzada con JavaScript agresivo');
              };
              
              // Ejecutar inmediatamente
              forcePosition();
              
              // Repetir cada segundo por 10 segundos para asegurar
              const forceInterval = setInterval(forcePosition, 1000);
              setTimeout(() => clearInterval(forceInterval), 10000);
              
              // Observer para detectar cambios
              const observer = new MutationObserver(forcePosition);
              observer.observe(document.body, { 
                childList: true, 
                subtree: true, 
                attributes: true, 
                attributeFilter: ['style', 'class'] 
              });
              
              // Asegurar que el botón de cerrar del chat sea funcional
              const chatPanel = document.querySelector('#zsiq_chatpanel, .zsiq_chatpanel, [id*="zsiq_chat"]');
              if (chatPanel) {
                // Buscar el botón de cerrar
                const closeButton = chatPanel.querySelector('.zsiq_close, .zsiq_chat_close, [class*="zsiq_close"], [title*="Close"], [title*="Cerrar"]');
                if (closeButton) {
                  // Asegurar que sea visible y funcional
                  (closeButton as HTMLElement).style.display = 'block';
                  (closeButton as HTMLElement).style.visibility = 'visible';
                  (closeButton as HTMLElement).style.opacity = '1';
                  (closeButton as HTMLElement).style.pointerEvents = 'auto';
                  console.log('✅ Botón de cerrar del chat configurado');
                } else {
                  // Si no hay botón de cerrar, crear uno
                  const header = chatPanel.querySelector('.zsiq_chat_header, [class*="zsiq_header"], [class*="chat_header"]');
                  if (header) {
                    const customCloseBtn = document.createElement('button');
                    customCloseBtn.innerHTML = '✕';
                    customCloseBtn.style.cssText = `
                      position: absolute !important;
                      top: 10px !important;
                      right: 10px !important;
                      width: 30px !important;
                      height: 30px !important;
                      background-color: #000000 !important;
                      color: #FFD700 !important;
                      border: 2px solid #FFD700 !important;
                      cursor: pointer !important;
                      font-size: 16px !important;
                      font-weight: bold !important;
                      z-index: 9999999 !important;
                    `;
                    customCloseBtn.onclick = () => {
                      (chatPanel as HTMLElement).style.display = 'none';
                    };
                    header.appendChild(customCloseBtn);
                    console.log('🔧 Botón de cerrar personalizado creado');
                  }
                }
              }
            } catch (e) {
              console.warn('No se pudo forzar posición:', e);
            }
          }, 100);
        }
      };

      // Agregar estilos CSS personalizados para el widget de Zoho
      const style = document.createElement('style');
      style.id = 'zsiqstyle'; // Asignar ID para poder eliminarlo después
      style.textContent = `
        /* FORZAR posición del botón flotante de Zoho a la ESQUINA INFERIOR IZQUIERDA */
        #zsiq_float,
        .zsiq_float,
        [id*="zsiq_float"],
        [class*="zsiq_float"],
        div[id*="zsiq_float"],
        div[class*="zsiq_float"] {
          left: 20px !important;
          right: unset !important;
          bottom: 20px !important;
          position: fixed !important;
          z-index: 9999999 !important;
        }
        
        /* Contenedor principal del widget */
        #zsiq_chatpanel,
        .zsiq-widget,
        [id*="zsiq_chat"],
        [class*="zsiq_chat"] {
          left: 20px !important;
          right: unset !important;
          bottom: 80px !important;
        }
        
        /* Botón flotante principal - múltiples selectores */
        .zsiq_floatmain,
        #zsiq_floatmain,
        [class*="floatmain"],
        .zsiq_float_main,
        div.zsiq_floatmain,
        div#zsiq_floatmain {
          background-color: #FFD700 !important;
          border: 4px solid #FFFFFF !important;
          border-radius: 0 !important;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
          left: 20px !important;
          right: unset !important;
          position: fixed !important;
          bottom: 20px !important;
          z-index: 9999999 !important;
          transform: none !important;
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
        
        /* Contador de mensajes */
        .zsiq_floatmain .zsiq_unrdcnt {
          background-color: #000000 !important;
          color: #FFD700 !important;
          border: 2px solid #FFFFFF !important;
        }
        
        /* Iconos */
        .siqicon-sqchat,
        .siqicon {
          color: #000000 !important;
        }
        
        /* Selectores más específicos para override */
        div[id*="zsiq"]:not([id*="chat"]) {
          left: 30px !important;
          right: unset !important;
        }
        
        /* Override cualquier posición derecha - MUY AGRESIVO */
        *[style*="right"]:not(body):not(html) {
          right: unset !important;
          left: 20px !important;
        }
        
        /* Selectores aún más específicos para Zoho */
        [id^="zsiq"], [class^="zsiq"], [id*="float"], [class*="float"] {
          left: 20px !important;
          right: unset !important;
          bottom: 20px !important;
        }
        
        /* Override con máxima especificidad */
        body #zsiq_float,
        body .zsiq_float,
        body .zsiq_floatmain,
        body #zsiq_floatmain {
          left: 20px !important;
          right: unset !important;
          bottom: 20px !important;
          position: fixed !important;
          z-index: 9999999 !important;
        }
        
        /* ESTILOS PARA EL PANEL DE CHAT Y BOTÓN DE CERRAR */
        
        /* Panel principal del chat */
        #zsiq_chatpanel,
        .zsiq_chatpanel,
        [id*="zsiq_chat"] {
          position: fixed !important;
          left: 20px !important;
          bottom: 80px !important;
          right: unset !important;
          width: 350px !important;
          height: 500px !important;
          z-index: 999999 !important;
        }
        
        /* Header del chat con botón de cerrar */
        .zsiq_chatpanel .zsiq_chat_header,
        .zsiq_chat_header,
        [class*="zsiq_header"],
        [class*="chat_header"] {
          background-color: #FFD700 !important;
          padding: 15px !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          border-bottom: 3px solid #000000 !important;
        }
        
        /* Botón de cerrar - múltiples selectores */
        .zsiq_chatpanel .zsiq_close,
        .zsiq_close,
        .zsiq_chat_close,
        [class*="zsiq_close"],
        [class*="chat_close"],
        [class*="close_btn"],
        .zsiq_chatpanel .close,
        .zsiq_chatpanel [title*="Close"],
        .zsiq_chatpanel [title*="Cerrar"] {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          width: 30px !important;
          height: 30px !important;
          background-color: #000000 !important;
          color: #FFD700 !important;
          border: 2px solid #FFD700 !important;
          border-radius: 0 !important;
          cursor: pointer !important;
          font-size: 18px !important;
          font-weight: bold !important;
          text-align: center !important;
          line-height: 26px !important;
          position: relative !important;
          z-index: 9999999 !important;
        }
        
        /* Hover del botón de cerrar */
        .zsiq_close:hover,
        .zsiq_chat_close:hover,
        [class*="zsiq_close"]:hover {
          background-color: #FFD700 !important;
          color: #000000 !important;
          transform: scale(1.1) !important;
        }
        
        /* Asegurar que el ícono X sea visible */
        .zsiq_close::before,
        .zsiq_chat_close::before,
        [class*="zsiq_close"]::before {
          content: "✕" !important;
          font-size: 16px !important;
          font-weight: bold !important;
        }
        
        /* Header title del chat */
        .zsiq_chat_header .zsiq_title,
        .zsiq_title,
        [class*="zsiq_title"] {
          color: #000000 !important;
          font-weight: bold !important;
          font-size: 16px !important;
        }
        
        /* Body del chat */
        .zsiq_chatpanel .zsiq_chat_body,
        .zsiq_chat_body {
          background-color: #FFFFFF !important;
          max-height: 400px !important;
          overflow-y: auto !important;
        }
        
        /* Asegurar que todos los elementos de control sean visibles */
        .zsiq_chatpanel * {
          box-sizing: border-box !important;
        }
        
        /* Botones adicionales de la interfaz */
        .zsiq_chatpanel button,
        .zsiq_chatpanel .zsiq_btn {
          background-color: #FFD700 !important;
          color: #000000 !important;
          border: 2px solid #000000 !important;
          border-radius: 0 !important;
          font-weight: bold !important;
        }
        
        /* Asegurar que el widget siempre esté flotando */
        .zsiq_floatmain,
        #zsiq_float {
          pointer-events: auto !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        /* No permitir que otros elementos interfieran */
        .zsiq_floatmain {
          box-sizing: border-box !important;
          margin: 0 !important;
        }
        
        /* OVERRIDE FINAL - MÁXIMA PRIORIDAD */
        html body div#zsiq_float,
        html body div.zsiq_float,
        html body div.zsiq_floatmain,
        html body div#zsiq_floatmain,
        html body [id*="zsiq"][id*="float"],
        html body [class*="zsiq"][class*="float"] {
          left: 20px !important;
          right: unset !important;
          bottom: 20px !important;
          position: fixed !important;
          z-index: 999999999 !important;
          transform: none !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
      `;
      document.head.appendChild(style);

      // Crear elemento script
      const script = document.createElement('script');
      script.id = 'zsiqscript';
      script.src = `https://salesiq.zohopublic.com/widget?wc=siqcac6ccaff06943ac0b9dc85c19f146c8382faef57bf5a58fb3189ff00dca96ab`;
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
        const existingStyle = document.getElementById('zsiqstyle');
        if (existingStyle) {
          existingStyle.remove();
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
    bottom: 20,
    left: 20,
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