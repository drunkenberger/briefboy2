import { useEffect, useState } from 'react';
import { knowledgeBaseService } from '../services/knowledgeBaseService';

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
}

/**
 * Hook para generar un brief publicitario a partir de un transcript usando OpenAI.
 * @param transcript Texto transcrito de la reunión
 * @param enabled Si es true, inicia la generación automáticamente
 * @returns { brief, loading, error }
 */
export function useBriefGeneration(transcript: string | null, enabled: boolean = true): UseBriefGenerationResult {
  const [brief, setBrief] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    console.log('[BriefGeneration] APIs disponibles:', {
      openai: !!openaiKey,
      claude: !!claudeKey,
      gemini: !!geminiKey
    });
    const generateBrief = async () => {
      try {
        setLoading(true);
        setError(null);
        setBrief(null);
        console.log('[BriefGeneration] Enviando petición a IA:', {
          openai: !!openaiKey,
          claude: !!claudeKey,
          gemini: !!geminiKey,
          transcriptLength: transcript.length,
          transcriptPreview: transcript.substring(0, 200) + '...',
        });
        // Intentar con múltiples modelos como respaldo
        let response;
        let lastError;

        // Primer intento: OpenAI GPT-4o-mini (más rápido y barato)
        if (openaiKey) {
          try {
            console.log('🤖 Intentando generar brief con OpenAI GPT-4o-mini...');
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
          });

          if (response.ok) {
            console.log('✅ OpenAI GPT-4o-mini funcionó correctamente');
          } else {
            const errorText = await response.text();
            throw new Error(`OpenAI Error ${response.status}: ${errorText}`);
          }
          } catch (openaiError) {
            console.warn('⚠️ OpenAI falló:', openaiError);
            lastError = openaiError;
          }
        } else {
          console.log('⚠️ OpenAI API key no disponible, saltando...');
        }

        // Segundo intento: Claude (solo si no hay respuesta exitosa)
        if (!response?.ok && claudeKey) {
          try {
            console.log('🤖 Intentando generar brief con Claude...');
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
            });

            if (response.ok) {
              console.log('✅ Claude funcionó correctamente');
            } else {
              const errorText = await response.text();
              throw new Error(`Claude Error ${response.status}: ${errorText}`);
            }
          } catch (claudeError) {
            console.warn('⚠️ Claude falló:', claudeError);
            lastError = claudeError;
          }
        } else if (!claudeKey) {
          console.log('⚠️ Claude API key no disponible, saltando...');
        }

        // Tercer intento: Gemini (solo si no hay respuesta exitosa)
        if (!response?.ok && geminiKey) {
          try {
            console.log('🤖 Intentando generar brief con Gemini...');
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`, {
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
            });

            if (response.ok) {
              console.log('✅ Gemini funcionó correctamente');
            } else {
              const errorText = await response.text();
              throw new Error(`Gemini Error ${response.status}: ${errorText}`);
            }
          } catch (geminiError) {
            console.warn('⚠️ Gemini falló:', geminiError);
            lastError = geminiError;
          }
        } else if (!geminiKey) {
          console.log('⚠️ Gemini API key no disponible, saltando...');
        }

        // Verificar si todos los intentos fallaron
        if (!response?.ok) {
          console.error('❌ Todos los modelos de IA fallaron');
          throw new Error(`Todos los modelos de IA fallaron. Último error: ${lastError instanceof Error ? lastError.message : 'Error desconocido'}`);
        }

        console.log('[BriefGeneration] ✅ Respuesta exitosa recibida:', response.status);

        const data = await response.json();
        console.log('[BriefGeneration] Data recibida:', data);

        let content = '';

        // Extraer contenido según el modelo usado
        if (data.choices && data.choices[0]?.message?.content) {
          // OpenAI response
          content = data.choices[0].message.content;
        } else if (data.content && data.content[0]?.text) {
          // Claude response
          content = data.content[0].text;
        } else if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          // Gemini response
          content = data.candidates[0].content.parts[0].text;
        }

        console.log('[BriefGeneration] Content recibido (primeros 500 chars):', content?.substring(0, 500) + '...');
        console.log('[BriefGeneration] Content completo:', content);
        if (!content) {
          console.error('[BriefGeneration] Error crítico: No hay contenido');
          throw new Error('No se recibió contenido válido de ningún modelo');
        }

        if (content.trim().length === 0) {
          console.error('[BriefGeneration] Error crítico: Contenido vacío');
          throw new Error('El contenido recibido está vacío');
        }

        let parsed: any = null;
        let jsonError = '';
        try {
          console.log('[BriefGeneration] Intentando parsear JSON...');

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

          console.log('[BriefGeneration] Contenido limpio para parsear:', cleanContent.substring(0, 100) + '...');

          parsed = JSON.parse(cleanContent);
          console.log('[BriefGeneration] JSON parseado exitosamente:', Object.keys(parsed));
          console.log('[BriefGeneration] Contenido del brief generado:', {
            title: parsed.title,
            summary: parsed.summary ? parsed.summary.substring(0, 100) + '...' : 'VACÍO',
            objectives: parsed.objectives,
            targetAudience: parsed.targetAudience,
            keyMessages: parsed.keyMessages
          });

          // Validar que NO es un análisis (detectar si contiene campos de análisis)
          const analysisFields = ['overallScore', 'completenessScore', 'qualityScore', 'strengths', 'weaknesses', 'criticalIssues', 'sectionAnalysis'];
          const isAnalysis = analysisFields.some(field => parsed.hasOwnProperty(field));

          if (isAnalysis) {
            console.error('[BriefGeneration] ❌ IA devolvió un análisis en lugar de un brief');
            throw new Error("La IA devolvió un análisis del brief en lugar de crear un brief. Reintentando...");
          }

          // Validar que tiene campos mínimos del brief y que no mezcla formatos
          const oldFormatKeys = ['title', 'summary', 'objectives', 'problemStatement', 'targetAudience', 'successMetrics', 'requirements', 'keyMessages', 'timeline', 'channelsAndTactics', 'riskAnalysis', 'dependencies', 'assumptions', 'outOfScope', 'campaignPhases'];
          const newFormatKeys = ['projectTitle', 'briefSummary', 'businessChallenge', 'strategicObjectives', 'brandPositioning', 'creativeStrategy', 'channelStrategy', 'successMetrics', 'budgetConsiderations', 'riskAssessment', 'implementationRoadmap', 'nextSteps', 'appendix'];

          const hasOldFormat = oldFormatKeys.some(key => parsed.hasOwnProperty(key));
          const hasNewFormat = newFormatKeys.some(key => parsed.hasOwnProperty(key));

          // Escenario 1: Formato mixto (inválido)
          if (hasOldFormat && hasNewFormat) {
            console.error('❌ Error de validación: El brief contiene una mezcla de campos de formato antiguo y nuevo.');
            throw new Error("Error de formato: El brief no puede contener una mezcla de campos antiguos y nuevos. Se debe usar un formato de manera consistente.");
          }

          // Escenario 2: Ningún formato detectado (inválido)
          if (!hasOldFormat && !hasNewFormat) {
            console.error('❌ Error de validación: El JSON no parece ser un brief válido.');
            throw new Error("El JSON parseado no contiene campos esenciales del brief. La estructura es irreconocible.");
          }

          console.log(`✅ Formato detectado: ${hasOldFormat ? 'Antiguo' : 'Nuevo'}`);

          // Validar que los campos tienen contenido real (no están vacíos)
          const hasEmptyFields = [];
          if (!parsed.title || parsed.title.trim() === '') hasEmptyFields.push('title');
          if (!parsed.summary || parsed.summary.trim() === '') hasEmptyFields.push('summary');
          if (!parsed.objectives || parsed.objectives.length === 0) hasEmptyFields.push('objectives');
          if (!parsed.targetAudience || parsed.targetAudience.length === 0) hasEmptyFields.push('targetAudience');
          if (!parsed.keyMessages || parsed.keyMessages.length === 0) hasEmptyFields.push('keyMessages');
          if (!parsed.channels || parsed.channels.length === 0) hasEmptyFields.push('channels');
          if (!parsed.success || parsed.success.length === 0) hasEmptyFields.push('success');

          if (hasEmptyFields.length > 0) {
            console.warn('[BriefGeneration] ⚠️ Campos vacíos detectados:', hasEmptyFields);
            // No fallar, pero logear para debugging
          }

        } catch (e: any) {
          console.error('[BriefGeneration] Error parseando JSON:', e.message);
          console.error('[BriefGeneration] Contenido que falló:', content.substring(0, 300));
          jsonError = e.message;
        }

        // Si el parsing falla, mostrar un brief mínimo con el error y el contenido bruto
        if (!parsed) {
          console.error('[BriefGeneration] Falló el parsing, creando brief de error');
          if (!cancelled) setBrief({
            title: '⚠️ Error en generación de brief',
            summary: `Error parseando respuesta de IA: ${jsonError}`,
            objectives: ['Revisar transcripción', 'Verificar contenido de entrada'],
            problemStatement: 'Error técnico en la generación del brief',
            targetAudience: [],
            successMetrics: ['Contenido válido generado'],
            requirements: {
              functional: ['Revisar entrada'],
              nonFunctional: [],
              technical: [],
              security: []
            },
            keyMessages: ['Error en procesamiento'],
            timeline: 'Requiere revisión',
            channelsAndTactics: { overview: 'Error en generación', channels: [] },
            riskAnalysis: { risks: ['Error técnico'], mitigations: ['Revisar entrada'] },
            dependencies: [],
            assumptions: [],
            outOfScope: [],
            campaignPhases: [],
            _error: `Error de parsing: ${jsonError}`,
            _raw: content.substring(0, 500) + '...',
            _jsonError: jsonError,
          });
          setLoading(false);
          return;
        }

        // Si el JSON es válido, mostrar el brief generado
        console.log('[BriefGeneration] ✅ Brief generado exitosamente');
        console.log('[BriefGeneration] Campos encontrados:', Object.keys(parsed));
        console.log('[BriefGeneration] Brief completo que se va a guardar:', JSON.stringify(parsed, null, 2));
        if (!cancelled) {
          setBrief(parsed);
        }
      } catch (e: any) {
        console.error('[BriefGeneration] Error de red/fetch:', e);
        setError('Error de red o fetch: ' + (e?.message || e));
        setBrief({ _raw: String(e) });
        setLoading(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    generateBrief();
    return () => { cancelled = true; };
  }, [transcript, enabled]);

  return { brief, loading, error };
}