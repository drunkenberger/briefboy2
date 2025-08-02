import { useEffect, useState } from 'react';
import { knowledgeBaseService } from '../services/knowledgeBaseService';
import { useTokenTracking, extractOpenAITokenUsage, estimateClaudeTokens, estimateGeminiTokens } from './useTokenTracking';

// [Same SYSTEM_PROMPT and buildUserPrompt as original - truncated for brevity]
const SYSTEM_PROMPT = `Eres Elena Rodríguez, una Directora de Marketing experimentada con más de 15 años de experiencia en agencias top como Ogilvy, BBDO y TBWA. Tu tarea es CREAR un Brief de Marketing integral (no analizar uno existente) a partir de una transcripción de reunión.

BASE DE CONOCIMIENTO - MEJORES PRÁCTICAS DE BRIEFS:
${knowledgeBaseService.getAllKnowledge()}

Basándote en esta base de conocimiento, asegúrate de que tu brief siga las mejores prácticas de la industria y evite errores comunes.

**IMPORTANTE:** NO estás analizando un brief existente. Estás CREANDO un nuevo brief de marketing desde cero basándote en la transcripción.

**TU TAREA:**
1. Leer la transcripción de una reunión/discusión de marketing
2. Extraer información clave sobre la campaña/proyecto
3. CREAR un Brief de Marketing completo con todas las secciones llenas
4. Usar tu experiencia en marketing para llenar cualquier vacío

**ESTÁNDARES PROFESIONALES:**
*   Crear insights accionables y recomendaciones específicas y medibles
*   Llenar cualquier vacío estratégico con recomendaciones profesionales basadas en las mejores prácticas de la industria
*   Asegurar que TODOS los campos en la salida JSON estén poblados con contenido detallado y específico
*   NUNCA dejar campos vacíos - siempre proporcionar contenido integral para cada campo
*   Si falta información en la transcripción, usa tu experiencia en marketing para crear ejemplos con contenido realista pero informa al usuario que falta información
*   **ESCRIBIR TODO EL CONTENIDO EN ESPAÑOL** - Todos los textos, descripciones, objetivos y recomendaciones deben estar en español

**FORMATO DE SALIDA:**
Responde ÚNICAMENTE con un objeto JSON válido en la siguiente estructura integral. No incluyas texto adicional, explicaciones o formato markdown. TODO EL CONTENIDO DEL JSON DEBE ESTAR EN ESPAÑOL.

{
  "projectTitle": "Nombre específico de la campaña o proyecto",
  "briefSummary": "Resumen ejecutivo de 2-3 oraciones describiendo el objetivo y estrategia de la campaña",
  "businessChallenge": "Descripción detallada del principal desafío empresarial que esta campaña debe resolver",
  "strategicObjectives": [
    "Objetivo empresarial específico y medible 1",
    "Objetivo empresarial específico y medible 2",
    "Objetivo empresarial específico y medible 3"
  ],
  "targetAudience": {
    "primary": "Descripción detallada de la audiencia objetivo primaria incluyendo demografía, psicografía, comportamientos y necesidades",
    "secondary": "Descripción de audiencia secundaria (si aplica)",
    "insights": [
      "Insight clave sobre la audiencia 1",
      "Insight clave sobre la audiencia 2",
      "Insight clave sobre la audiencia 3"
    ]
  },
  "brandPositioning": "Declaración clara de cómo la marca se posiciona en el mercado y en la mente de los consumidores",
  "creativeStrategy": {
    "bigIdea": "El punto de partida creativo que guiará toda la campaña",
    "messageHierarchy": [
      "Mensaje principal",
      "Mensaje secundario de apoyo",
      "Mensaje terciario/CTA"
    ],
    "toneAndManner": "Descripción de cómo debe sonar y sentirse la comunicación",
    "creativeMandatories": [
      "Elemento obligatorio 1 (logo, tagline, etc.)",
      "Elemento obligatorio 2"
    ]
  },
  "channelStrategy": {
    "recommendedMix": [
      {
        "channel": "Nombre del canal (ej: Instagram)",
        "allocation": "% o cantidad de presupuesto",
        "rationale": "Por qué este canal",
        "kpis": ["KPI 1", "KPI 2"]
      }
    ],
    "integratedApproach": "Cómo trabajarán todos los canales juntos de manera integrada"
  },
  "successMetrics": {
    "primary": [
      "KPI primario 1 (ej: 20% aumento en conocimiento de marca)",
      "KPI primario 2"
    ],
    "secondary": [
      "KPI secundario 1",
      "KPI secundario 2"
    ],
    "measurementFramework": "Cómo se medirá y rastreará el éxito"
  },
  "budgetConsiderations": {
    "estimatedRange": "Rango total de presupuesto (ej: $100K-$150K)",
    "keyInvestments": [
      "Área de inversión principal 1",
      "Área de inversión principal 2"
    ],
    "costOptimization": [
      "Estrategia de optimización de costos 1",
      "Estrategia de optimización de costos 2"
    ]
  },
  "riskAssessment": {
    "risks": [
      {
        "risk": "Descripción del riesgo",
        "likelihood": "Alto/Medio/Bajo",
        "impact": "Alto/Medio/Bajo",
        "mitigation": "Estrategia de mitigación"
      }
    ]
  },
  "implementationRoadmap": {
    "phases": [
      {
        "phase": "Fase 1: Planificación",
        "duration": "2 semanas",
        "deliverables": ["Entregable 1", "Entregable 2"],
        "dependencies": ["Dependencia 1"]
      }
    ]
  },
  "nextSteps": [
    "Próximo paso inmediato 1",
    "Próximo paso 2",
    "Próximo paso 3"
  ],
  "appendix": {
    "assumptions": [
      "Suposición clave 1",
      "Suposición clave 2"
    ],
    "references": [
      "Referencia o fuente 1",
      "Referencia o fuente 2"
    ]
  }
}`;

function buildUserPrompt(transcription: string) {
  return `**SOLICITUD DE CREACIÓN DE BRIEF DE MARKETING**

Basándote en la siguiente transcripción de reunión, CREA un Brief de Marketing integral desde cero:

---
"${transcription}"
---

**INSTRUCCIONES:**
Esta transcripción contiene discusiones sobre una campaña/proyecto de marketing. Tu trabajo es CREAR (no analizar) un Brief de Marketing completo mediante:

1. **Extraer información clave** de la transcripción sobre:
   - Detalles de la campaña/proyecto
   - Objetivos y desafíos empresariales
   - Insights de audiencia objetivo
   - Posicionamiento de marca y mensajería
   - Preferencias de canales y presupuesto
   - Cronograma y métricas de éxito

2. **Crear contenido completo** para cada sección del brief:
   - Escribir descripciones detalladas, no solo puntos clave
   - Proporcionar recomendaciones específicas y accionables
   - Llenar vacíos con tu experiencia en marketing pero informa al usuario que falta información y que estás agregando ejemplos con contenido realista
   - Hacerlo listo para producción

3. **Entregar un brief completo** que los equipos de marketing puedan usar inmediatamente

**RECUERDA:** Estás CREANDO un nuevo Brief de Marketing, no analizando uno existente. Genera contenido integral para cada campo basándote en la transcripción y tu experiencia profesional.

**IMPORTANTE: TODO EL CONTENIDO DE TU RESPUESTA DEBE ESTAR EN ESPAÑOL. Escribe todos los textos, descripciones, objetivos, recomendaciones y contenido del brief completamente en español.**`;
}

interface UseBriefGenerationResult {
  brief: any | null;
  loading: boolean;
  error: string | null;
  tokensUsed: number;
  tokensBreakdown: Record<string, number>;
  estimatedCost: number;
}

/**
 * Hook para generar un brief publicitario a partir de un transcript usando OpenAI con tracking de tokens.
 * @param transcript Texto transcrito de la reunión
 * @param enabled Si es true, inicia la generación automáticamente
 * @returns { brief, loading, error, tokensUsed, tokensBreakdown, estimatedCost }
 */
export function useBriefGenerationWithTokens(
  transcript: string | null, 
  enabled: boolean = true
): UseBriefGenerationResult {
  const [brief, setBrief] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [tokensBreakdown, setTokensBreakdown] = useState<Record<string, number>>({});
  const [estimatedCost, setEstimatedCost] = useState(0);
  
  const { countTokens, trackTokenUsage, calculateCost } = useTokenTracking();

  useEffect(() => {
    if (!transcript || !enabled) return;
    let cancelled = false;
    
    // Verificar que al menos una API key esté disponible
    const openaiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    const claudeKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
    const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!openaiKey && !claudeKey && !geminiKey) {
      setError('No se encontró ninguna API key configurada (OpenAI, Claude o Gemini)');
      setLoading(false);
      setBrief(null);
      return;
    }

    console.log('[BriefGenerationWithTokens] APIs disponibles:', {
      openai: !!openaiKey,
      claude: !!claudeKey,
      gemini: !!geminiKey
    });

    const generateBrief = async () => {
      try {
        setLoading(true);
        setError(null);
        setBrief(null);
        setTokensUsed(0);
        setTokensBreakdown({});
        setEstimatedCost(0);
        
        // Count input tokens
        const systemPromptTokens = countTokens(SYSTEM_PROMPT);
        const userPromptTokens = countTokens(buildUserPrompt(transcript));
        const totalInputTokens = systemPromptTokens + userPromptTokens;
        
        console.log('[BriefGenerationWithTokens] Token counts:', {
          systemPrompt: systemPromptTokens,
          userPrompt: userPromptTokens,
          totalInput: totalInputTokens
        });
        
        // Intentar con múltiples modelos como respaldo
        let response;
        let responseData: any = null;
        let lastError;
        let modelUsed = '';
        let outputTokens = 0;

        // Primer intento: OpenAI GPT-4o-mini (más rápido y barato)
        if (openaiKey) {
          try {
            console.log('🤖 Intentando generar brief con OpenAI GPT-4o-mini...');
            modelUsed = 'gpt-4o-mini';
            
            // Create abort controller with 15 second timeout
            const abortController = new AbortController();
            const timeoutId = setTimeout(() => {
              console.warn('⏰ OpenAI request timeout after 15 seconds');
              abortController.abort();
            }, 15000);
            
            response = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`,
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                  { role: 'system', content: SYSTEM_PROMPT },
                  { role: 'user', content: buildUserPrompt(transcript) },
                ],
                temperature: 0.2,
                max_tokens: 3000,
                response_format: { type: "json_object" },
              }),
              signal: abortController.signal,
            });
            
            // Clear timeout if request completes successfully
            clearTimeout(timeoutId);

            if (response.ok) {
              console.log('✅ OpenAI GPT-4o-mini funcionó correctamente');
              const data = await response.json();
              responseData = data;
              
              // Extract token usage from OpenAI response
              const usage = extractOpenAITokenUsage(data);
              if (usage) {
                outputTokens = usage.output_tokens || 0;
                const totalTokens = (usage.total_tokens || 0);
                const cost = calculateCost('gpt-4o-mini', usage.input_tokens || totalInputTokens, outputTokens);
                
                trackTokenUsage({
                  service: 'gpt4_generation',
                  model: 'gpt-4o-mini',
                  input_tokens: usage.input_tokens || totalInputTokens,
                  output_tokens: outputTokens,
                  total_tokens: totalTokens,
                  estimated_cost: cost
                });
                
                setTokensUsed(totalTokens);
                setTokensBreakdown({
                  gpt4_generation: totalTokens,
                  total: totalTokens
                });
                setEstimatedCost(cost);
              }
            } else {
              const errorText = await response.text();
              console.error('OpenAI API Error:', response.status, errorText);
              throw new Error(`Error de OpenAI (${response.status})`);
            }
          } catch (openaiError: any) {
            // Handle timeout specifically
            if (openaiError.name === 'AbortError') {
              console.warn('⚠️ OpenAI timeout después de 15 segundos');
              lastError = new Error('OpenAI timeout');
            } else {
              console.warn('⚠️ OpenAI falló:', openaiError);
              lastError = openaiError;
            }
          }
        }

        // Segundo intento: Claude (solo si no hay respuesta exitosa)
        if (!response?.ok && claudeKey) {
          try {
            console.log('🤖 Intentando generar brief con Claude...');
            modelUsed = 'claude-3-haiku';
            
            // Create abort controller with 15 second timeout
            const abortController = new AbortController();
            const timeoutId = setTimeout(() => {
              console.warn('⏰ Claude request timeout after 15 seconds');
              abortController.abort();
            }, 15000);
            
            response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': claudeKey,
                'anthropic-version': '2023-06-01',
              },
              body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 3000,
                messages: [
                  { role: 'user', content: `${SYSTEM_PROMPT}\n\n${buildUserPrompt(transcript)}` },
                ],
                temperature: 0.2,
              }),
              signal: abortController.signal,
            });
            
            // Clear timeout if request completes successfully
            clearTimeout(timeoutId);

            if (response.ok) {
              console.log('✅ Claude funcionó correctamente');
              const data = await response.json();
              responseData = data;
              
              // Estimate Claude tokens
              const outputText = data.content?.[0]?.text || '';
              outputTokens = countTokens(outputText);
              const totalTokens = totalInputTokens + outputTokens;
              const cost = calculateCost('claude-3-haiku', totalInputTokens, outputTokens);
              
              trackTokenUsage({
                service: 'claude_generation',
                model: 'claude-3-haiku',
                input_tokens: totalInputTokens,
                output_tokens: outputTokens,
                total_tokens: totalTokens,
                estimated_cost: cost
              });
              
              setTokensUsed(totalTokens);
              setTokensBreakdown({
                claude_generation: totalTokens,
                total: totalTokens
              });
              setEstimatedCost(cost);
            } else {
              const errorText = await response.text();
              console.error('Claude API Error:', response.status, errorText);
              throw new Error(`Error de Claude (${response.status})`);
            }
          } catch (claudeError: any) {
            // Handle timeout specifically
            if (claudeError.name === 'AbortError') {
              console.warn('⚠️ Claude timeout después de 15 segundos');
              lastError = new Error('Claude timeout');
            } else {
              console.warn('⚠️ Claude falló:', claudeError);
              lastError = claudeError;
            }
          }
        }

        // Tercer intento: Gemini (solo si no hay respuesta exitosa)
        if (!response?.ok && geminiKey) {
          try {
            console.log('🤖 Intentando generar brief con Gemini...');
            modelUsed = 'gemini-1.5-flash';
            
            // Create abort controller with 15 second timeout
            const abortController = new AbortController();
            const timeoutId = setTimeout(() => {
              console.warn('⏰ Gemini request timeout after 15 seconds');
              abortController.abort();
            }, 15000);
            
            response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  contents: [{
                    parts: [{
                      text: `${SYSTEM_PROMPT}\n\n${buildUserPrompt(transcript)}`
                    }]
                  }],
                  generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 3000,
                  },
                }),
                signal: abortController.signal,
              }
            );
            
            // Clear timeout if request completes successfully
            clearTimeout(timeoutId);

            if (response.ok) {
              console.log('✅ Gemini funcionó correctamente');
              const data = await response.json();
              responseData = data;
              
              // Estimate Gemini tokens
              const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
              outputTokens = countTokens(outputText);
              const totalTokens = totalInputTokens + outputTokens;
              const cost = calculateCost('gemini-1.5-flash', totalInputTokens, outputTokens);
              
              trackTokenUsage({
                service: 'gemini_generation',
                model: 'gemini-1.5-flash',
                input_tokens: totalInputTokens,
                output_tokens: outputTokens,
                total_tokens: totalTokens,
                estimated_cost: cost
              });
              
              setTokensUsed(totalTokens);
              setTokensBreakdown({
                gemini_generation: totalTokens,
                total: totalTokens
              });
              setEstimatedCost(cost);
            } else {
              const errorText = await response.text();
              console.error('Gemini API Error:', response.status, errorText);
              throw new Error(`Error de Gemini (${response.status})`);
            }
          } catch (geminiError: any) {
            // Handle timeout specifically
            if (geminiError.name === 'AbortError') {
              console.warn('⚠️ Gemini timeout después de 15 segundos');
              lastError = new Error('Gemini timeout');
            } else {
              console.warn('⚠️ Gemini falló:', geminiError);
              lastError = geminiError;
            }
          }
        }

        // Verificar si todos los intentos fallaron
        if (!response?.ok) {
          console.error('❌ Todos los modelos de IA fallaron');
          // Log detailed error for debugging (server-side only)
          if (lastError) {
            console.error('Detalles del último error:', lastError);
          }
          // Throw generic error message without sensitive details
          throw new Error('Todos los modelos de IA fallaron');
        }

        console.log('[BriefGenerationWithTokens] ✅ Respuesta exitosa recibida');
        console.log('[BriefGenerationWithTokens] Modelo usado:', modelUsed);
        
        let content = '';

        // Extraer contenido según el modelo usado
        if (responseData.choices && responseData.choices[0]?.message?.content) {
          // OpenAI response
          content = responseData.choices[0].message.content;
        } else if (responseData.content && responseData.content[0]?.text) {
          // Claude response
          content = responseData.content[0].text;
        } else if (responseData.candidates && responseData.candidates[0]?.content?.parts?.[0]?.text) {
          // Gemini response
          content = responseData.candidates[0].content.parts[0].text;
        }

        if (!content) {
          console.error('[BriefGenerationWithTokens] Error crítico: No hay contenido');
          throw new Error('No se recibió contenido válido de ningún modelo');
        }

        // Parse and validate the content as in the original hook
        let parsed: any = null;
        try {
          console.log('[BriefGenerationWithTokens] Intentando parsear JSON...');

          // Limpiar el contenido primero
          let cleanContent = content.trim();

          // Remover markdown code blocks si existen
          cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');

          // Buscar el JSON válido
          const jsonStart = cleanContent.indexOf('{');
          const jsonEnd = cleanContent.lastIndexOf('}');

          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
          }

          parsed = JSON.parse(cleanContent);
          console.log('[BriefGenerationWithTokens] JSON parseado exitosamente:', Object.keys(parsed));

          // Validar que NO es un análisis (detectar si contiene campos de análisis)
          const analysisFields = ['overallScore', 'completenessScore', 'qualityScore', 'strengths', 'weaknesses', 'criticalIssues', 'sectionAnalysis'];
          const isAnalysis = analysisFields.some(field => parsed.hasOwnProperty(field));

          if (isAnalysis) {
            console.error('[BriefGenerationWithTokens] ❌ IA devolvió un análisis en lugar de un brief');
            throw new Error("La IA devolvió un análisis del brief en lugar de crear un brief. Reintentando...");
          }

        } catch (e: any) {
          console.error('[BriefGenerationWithTokens] Error parseando JSON:', e.message);
          
          if (!cancelled) setBrief({
            projectTitle: '⚠️ Error en generación de brief',
            briefSummary: 'Ocurrió un error al procesar la respuesta de la IA. Por favor, intenta nuevamente con una transcripción más clara.',
            businessChallenge: 'La respuesta de la IA no pudo ser procesada correctamente, posiblemente debido a un formato de respuesta inválido.',
            strategicObjectives: [
              'Revisar la transcripción de entrada',
              'Verificar la claridad del contenido',
              'Intentar nuevamente con una transcripción más específica'
            ],
            targetAudience: {
              primary: 'Usuario que experimenta dificultades técnicas con la generación del brief',
              secondary: 'Equipo de soporte técnico',
              insights: [
                'El usuario necesita una respuesta clara sobre el problema',
                'La transcripción original puede necesitar mejoras',
                'Se requiere una solución alternativa o reintento'
              ]
            },
            brandPositioning: 'Herramienta de generación de briefs confiable que busca resolver problemas técnicos de manera transparente',
            creativeStrategy: {
              bigIdea: 'Transparencia y solución proactiva de problemas técnicos',
              messageHierarchy: [
                'Ha ocurrido un error técnico que estamos manejando',
                'Te proporcionamos información clara sobre qué salió mal',
                'Puedes intentar nuevamente con mejores resultados'
              ],
              toneAndManner: 'Profesional, transparente y orientado a la solución',
              creativeMandatories: [
                'Mensaje de error claro y comprensible',
                'Instrucciones de recuperación específicas'
              ]
            },
            channelStrategy: {
              recommendedMix: [
                {
                  channel: 'Interfaz de usuario',
                  allocation: '100%',
                  rationale: 'Canal directo para comunicar el error al usuario',
                  kpis: ['Claridad del mensaje', 'Tasa de resolución exitosa']
                }
              ],
              integratedApproach: 'Comunicación directa y transparente a través de la interfaz de usuario con opciones claras de recuperación'
            },
            successMetrics: {
              primary: [
                'Usuario entiende el problema y sabe cómo proceder',
                'Reducción en frustraciones técnicas del usuario'
              ],
              secondary: [
                'Mejora en la calidad de transcripciones futuras',
                'Aumento en intentos exitosos posteriores'
              ],
              measurementFramework: 'Seguimiento de errores técnicos y tasas de resolución exitosa'
            },
            budgetConsiderations: {
              estimatedRange: 'Costo de tiempo del usuario y recursos de soporte',
              keyInvestments: [
                'Mejoras en el manejo de errores',
                'Optimización del procesamiento de IA'
              ],
              costOptimization: [
                'Prevención proactiva de errores similares',
                'Mejora en la validación de respuestas de IA'
              ]
            },
            riskAssessment: {
              risks: [
                {
                  risk: 'Frustración del usuario por errores técnicos',
                  likelihood: 'Medio',
                  impact: 'Alto',
                  mitigation: 'Proporcionar mensajes claros y opciones de recuperación'
                },
                {
                  risk: 'Pérdida de confianza en la herramienta',
                  likelihood: 'Medio',
                  impact: 'Alto',
                  mitigation: 'Transparencia total y soluciones rápidas'
                }
              ]
            },
            implementationRoadmap: {
              phases: [
                {
                  phase: 'Fase 1: Reintento inmediato',
                  duration: 'Inmediato',
                  deliverables: ['Nueva transcripción', 'Parámetros ajustados'],
                  dependencies: ['Transcripción mejorada del usuario']
                },
                {
                  phase: 'Fase 2: Análisis del problema',
                  duration: '1 día',
                  deliverables: ['Diagnóstico del error', 'Plan de mejora'],
                  dependencies: ['Logs de error detallados']
                }
              ]
            },
            nextSteps: [
              'Revisar la transcripción original y verificar su claridad',
              'Intentar nuevamente con una transcripción más específica',
              'Contactar soporte si el problema persiste'
            ],
            appendix: {
              assumptions: [
                'La transcripción original contiene información válida',
                'El error es temporal y resoluble',
                'El usuario puede proporcionar una transcripción alternativa'
              ],
              references: [
                'Logs de error del sistema',
                'Documentación de mejores prácticas para transcripciones',
                'Guía de resolución de problemas técnicos'
              ]
            }
          });
          setLoading(false);
          return;
        }

        // Si el JSON es válido, mostrar el brief generado
        console.log('[BriefGenerationWithTokens] ✅ Brief generado exitosamente');
        if (!cancelled) {
          setBrief(parsed);
        }
      } catch (e: any) {
        console.error('[BriefGenerationWithTokens] Error de red/fetch:', e);
        // Set generic error message without exposing sensitive details
        setError('Error de conexión. Intenta nuevamente.');
        setBrief({ _raw: 'Error de conexión' });
        setLoading(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    generateBrief();
    return () => { cancelled = true; };
  }, [transcript, enabled, countTokens, trackTokenUsage, calculateCost]);

  return { brief, loading, error, tokensUsed, tokensBreakdown, estimatedCost };
}