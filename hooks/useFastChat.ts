import { useState, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface UseFastChatResult {
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  initializeChat: () => void;
  isConnected: boolean;
  error: string | null;
}

/**
 * Hook para chat rapido y fluido con Claude/Gemini
 * Disenado para ser mas rapido que GPT-4 para conversaciones interactivas
 */
export function useFastChat(brief: any, analysis: any): UseFastChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Funcion para inicializar el chat con mensaje de bienvenida
  const initializeChat = useCallback(() => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Hola! Soy tu asistente de marketing especializado en mejorar briefs publicitarios. 🚀

He analizado tu brief y veo que tiene un score de ${analysis?.overallScore || 'N/A'}/100. ${analysis?.isReadyForProduction ? 'Esta muy bien!' : 'Podemos mejorarlo juntos.'}

En que aspecto especifico te gustaria que trabajemos primero? Puedo ayudarte con:
• Objetivos mas especificos
• Mensajes clave mas impactantes
• Estrategia de canales
• Metricas de exito
• Cualquier otra area que veas critica

Por donde empezamos?`,
      timestamp: Date.now(),
    };
    
    setMessages([welcomeMessage]);
  }, [analysis]);

  const sendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent.trim(),
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);
    
    try {
      // Intentar con Claude primero (mas rapido)
      let response = await tryClaudeAPI(messageContent, [...messages, userMessage]);
      
      // Si Claude falla, intentar con Gemini
      if (!response) {
        response = await tryGeminiAPI(messageContent, [...messages, userMessage]);
      }
      
      // Como ultimo recurso, usar OpenAI
      if (!response) {
        response = await tryOpenAIAPI(messageContent, [...messages, userMessage]);
      }
      
      if (!response) {
        throw new Error('No se pudo obtener respuesta de ningun modelo');
      }
      
      setIsConnected(true);
      
    } catch (err: any) {
      setError(err.message || 'Error en la comunicacion');
      setIsConnected(false);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Disculpa, tuve un problema tecnico. Por favor intenta de nuevo o reformula tu pregunta.',
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  // Funcion para probar Claude API
  const tryClaudeAPI = async (messageContent: string, conversationMessages: ChatMessage[]) => {
    try {
      const claudeApiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
      if (!claudeApiKey) return null;

      const systemPrompt = `Eres un consultor experto en marketing digital y publicidad. Tu trabajo es ayudar a mejorar briefs publicitarios de manera conversacional y practica.

CONTEXTO DEL BRIEF:
${JSON.stringify(brief, null, 2)}

ANALISIS ACTUAL:
${JSON.stringify(analysis, null, 2)}

INSTRUCCIONES:
- Se conversacional y amigable
- Proporciona sugerencias especificas y actionables
- Pregunta detalles cuando necesites mas informacion
- Manten respuestas concisas pero utiles
- Enfocate en mejoras practicas
- Usa ejemplos especificos cuando sea relevante

Responde de manera directa y util.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1000,
          system: systemPrompt,
          messages: conversationMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const aiResponse = data.content?.[0]?.text;

      if (aiResponse) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          timestamp: Date.now(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        return assistantMessage;
      }

      return null;
    } catch (error) {
      console.error('Claude API error:', error);
      return null;
    }
  };

  // Funcion para probar Gemini API
  const tryGeminiAPI = async (messageContent: string, conversationMessages: ChatMessage[]) => {
    try {
      const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!geminiApiKey) return null;

      const systemPrompt = `Eres un consultor experto en marketing digital y publicidad. Ayuda a mejorar briefs publicitarios de manera conversacional y practica.

CONTEXTO: ${JSON.stringify(brief, null, 2)}
ANALISIS: ${JSON.stringify(analysis, null, 2)}

Se conversacional, especifico y proporciona sugerencias actionables.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: systemPrompt }]
            },
            ...conversationMessages.map(msg => ({
              parts: [{ text: msg.content }]
            }))
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (aiResponse) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          timestamp: Date.now(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        return assistantMessage;
      }

      return null;
    } catch (error) {
      console.error('Gemini API error:', error);
      return null;
    }
  };

  // Funcion para probar OpenAI API como backup
  const tryOpenAIAPI = async (messageContent: string, conversationMessages: ChatMessage[]) => {
    try {
      const openaiApiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      if (!openaiApiKey) return null;

      const systemPrompt = `Eres un consultor experto en marketing digital y publicidad. Ayuda a mejorar briefs publicitarios de manera conversacional y practica.

CONTEXTO: ${JSON.stringify(brief, null, 2)}
ANALISIS: ${JSON.stringify(analysis, null, 2)}

Se conversacional, especifico y proporciona sugerencias actionables.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationMessages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content;

      if (aiResponse) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          timestamp: Date.now(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        return assistantMessage;
      }

      return null;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return null;
    }
  };

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsConnected(true);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    clearChat,
    initializeChat,
    isConnected,
    error,
  };
}