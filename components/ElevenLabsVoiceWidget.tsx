import React, { useState } from 'react';
import { View, StyleSheet, Platform, Dimensions, Pressable, Text, Modal } from 'react-native';
import { WebView } from 'react-native-webview';

interface ElevenLabsVoiceWidgetProps {
  agentId?: string;
  width?: number;
  height?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ElevenLabsVoiceWidget: React.FC<ElevenLabsVoiceWidgetProps> = ({ 
  agentId = "agent_01jzzt3hd7ffqrttr04n9kwn6t",
  width = 60,
  height = 60
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>ElevenLabs Voice Assistant</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html, body {
          width: 100vw;
          height: 100vh;
          background: #000000;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        body {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .widget-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000000;
          position: relative;
          overflow: visible;
          padding: 20px;
          box-sizing: border-box;
        }
        
        elevenlabs-convai {
          width: 100% !important;
          height: 100% !important;
          min-height: 400px !important;
          display: block !important;
          overflow: visible !important;
        }
        
        .loading-message {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #FFD700;
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          z-index: 1;
          background: rgba(0, 0, 0, 0.8);
          padding: 20px;
          border-radius: 8px;
          border: 2px solid #FFD700;
        }
        
        .error-message {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #FF4444;
          font-size: 16px;
          text-align: center;
          z-index: 2;
          background: rgba(0, 0, 0, 0.9);
          padding: 20px;
          border-radius: 8px;
          border: 2px solid #FF4444;
          display: none;
        }
        
        /* Hide scrollbars */
        ::-webkit-scrollbar {
          display: none;
        }
        
        html {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      </style>
    </head>
    <body>
      <div class="widget-container">
        <div class="loading-message" id="loading">
          🎤 Cargando asistente de voz...
        </div>
        
        <div class="error-message" id="error">
          ❌ Error al cargar el asistente. Verifica tu conexión.
        </div>
        
        <!-- ElevenLabs Widget with Custom Design -->
        <elevenlabs-convai 
          agent-id="${agentId}"
          avatar-orb-color-1="#FFD700"
          avatar-orb-color-2="#000000"
          action-text="Hablar con BriefBoy"
          start-call-text="¡Hola! Soy tu asistente de briefs"
          override-language="es"
          dynamic-variables="{}"
        ></elevenlabs-convai>
      </div>
      
      <script>
        console.log('Initializing ElevenLabs widget...');
        
        // Function to handle widget loading states
        let loadingTimeout;
        let errorTimeout;
        
        function showLoading() {
          const loading = document.getElementById('loading');
          if (loading) loading.style.display = 'block';
        }
        
        function hideLoading() {
          const loading = document.getElementById('loading');
          if (loading) loading.style.display = 'none';
        }
        
        function showError() {
          const error = document.getElementById('error');
          const loading = document.getElementById('loading');
          if (loading) loading.style.display = 'none';
          if (error) error.style.display = 'block';
        }
        
        // Show loading initially
        showLoading();
        
        // Hide loading after widget should have loaded
        loadingTimeout = setTimeout(() => {
          hideLoading();
        }, 5000);
        
        // Show error if widget doesn't load after 10 seconds
        errorTimeout = setTimeout(() => {
          showError();
        }, 10000);
        
        // Listen for widget events when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
          console.log('DOM loaded, setting up ElevenLabs widget...');
          
          const widget = document.querySelector('elevenlabs-convai');
          
          if (widget) {
            console.log('Widget element found');
            
            // Listen for widget events
            widget.addEventListener('elevenlabs-convai:call', (event) => {
              console.log('Widget call event:', event);
              hideLoading();
              
              // Configure client tools if needed
              if (event.detail && event.detail.config) {
                event.detail.config.clientTools = {
                  redirectToExternalURL: ({ url }) => {
                    window.open(url, '_blank', 'noopener,noreferrer');
                  },
                };
              }
            });
            
            // Listen for when widget is ready
            widget.addEventListener('elevenlabs-convai:ready', () => {
              console.log('Widget is ready');
              hideLoading();
              clearTimeout(errorTimeout);
            });
            
            // Listen for widget errors
            widget.addEventListener('elevenlabs-convai:error', (error) => {
              console.error('Widget error:', error);
              showError();
            });
            
          } else {
            console.error('Widget element not found');
            showError();
          }
        });
        
        // Handle getUserMedia polyfill
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.log('getUserMedia not available, setting up polyfill');
          navigator.getUserMedia = navigator.getUserMedia || 
                                   navigator.webkitGetUserMedia || 
                                   navigator.mozGetUserMedia;
          
          if (!navigator.mediaDevices) {
            navigator.mediaDevices = {};
          }
          
          if (!navigator.mediaDevices.getUserMedia && navigator.getUserMedia) {
            navigator.mediaDevices.getUserMedia = function(constraints) {
              return new Promise((resolve, reject) => {
                navigator.getUserMedia(constraints, resolve, reject);
              });
            };
          }
        }

        // Request microphone permission early
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => console.log('Microphone permission granted'))
            .catch((err) => console.log('Microphone permission denied:', err));
        }

        // Handle script loading
        window.addEventListener('load', () => {
          console.log('Page fully loaded');
          setTimeout(hideLoading, 2000);
        });
        
        // Handle any JavaScript errors
        window.addEventListener('error', (event) => {
          console.error('JavaScript error:', event.error);
          if (event.error && event.error.message && event.error.message.includes('getUserMedia')) {
            console.log('getUserMedia error detected, this is expected in iframe context');
          } else {
            showError();
          }
        });
        
        // Send messages to React Native WebView
        function sendMessage(message) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(message));
          }
        }
        
        // Notify React Native when widget is ready
        setTimeout(() => {
          sendMessage({ type: 'widget-initialized' });
        }, 1000);
      </script>
      
      <!-- ElevenLabs Widget Script -->
      <script 
        src="https://unpkg.com/@elevenlabs/convai-widget-embed" 
        async 
        type="text/javascript"
        onload="console.log('ElevenLabs script loaded successfully')"
        onerror="console.error('Failed to load ElevenLabs script'); showError();">
      </script>
    </body>
    </html>
  `;

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const simpleHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { 
          width: 100%; 
          height: 100%; 
          background: #000000; 
          overflow: hidden;
        }
        elevenlabs-convai {
          width: 100% !important;
          height: 100% !important;
          min-height: 500px !important;
          display: block !important;
        }
      </style>
    </head>
    <body>
      <elevenlabs-convai 
        agent-id="${agentId}"
        avatar-orb-color-1="#FFD700"
        avatar-orb-color-2="#000000"
        action-text="Hablar con BriefBoy"
        start-call-text="¡Hola! Soy tu asistente de briefs"
        override-language="es"
      ></elevenlabs-convai>
      <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async></script>
    </body>
    </html>
  `;

  return (
    <>
      {/* Floating Button */}
      <Pressable 
        style={[styles.floatingButton, { width, height }]}
        onPress={handleToggle}
      >
        <Text style={styles.buttonIcon}>🎤</Text>
      </Pressable>

      {/* Modal for Web */}
      {Platform.OS === 'web' && isOpen && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Asistente BriefBoy</Text>
              <Pressable style={styles.closeButton} onPress={handleToggle}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>
            <View style={styles.modalContent}>
              <iframe
                src={`data:text/html;charset=utf-8,${encodeURIComponent(simpleHtml)}`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  background: '#000000',
                }}
                allow="microphone; camera; autoplay; encrypted-media"
              />
            </View>
          </View>
        </View>
      )}

      {/* Modal for Native */}
      {Platform.OS !== 'web' && (
        <Modal
          visible={isOpen}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleToggle}
        >
          <View style={styles.nativeModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Asistente BriefBoy</Text>
              <Pressable style={styles.closeButton} onPress={handleToggle}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>
            <WebView
              source={{ html: simpleHtml }}
              style={styles.webView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              allowsProtectedMedia={true}
              allowsFullscreenVideo={true}
            />
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  // Floating Button
  floatingButton: {
    backgroundColor: '#FFD700',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  buttonIcon: {
    fontSize: 28,
  },

  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    height: '80%',
    maxHeight: 600,
    backgroundColor: '#000000',
    borderWidth: 4,
    borderColor: '#FFD700',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000000',
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#000000',
  },

  // Native Modal
  nativeModalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default ElevenLabsVoiceWidget;