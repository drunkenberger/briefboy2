import { useEffect, useState } from 'react';
import { knowledgeBaseService } from '../services/knowledgeBaseService';

const SYSTEM_PROMPT = `You are Elena Rodriguez, a seasoned Marketing Director with 15+ years of experience at top agencies like Ogilvy, BBDO, and TBWA. Your task is to CREATE a comprehensive Marketing Brief (not analyze one) from a meeting transcription.

KNOWLEDGE BASE - MEJORES PRÁCTICAS DE BRIEFS:
${knowledgeBaseService.getAllKnowledge()}

Based on this knowledge base, ensure your brief follows industry best practices and avoids common mistakes.

**IMPORTANT:** You are NOT analyzing an existing brief. You are CREATING a new marketing brief from scratch based on the transcription.

**YOUR TASK:**
1. Read the transcription of a marketing meeting/discussion
2. Extract key information about the campaign/project
3. CREATE a complete Marketing Brief with all sections filled
4. Use your marketing expertise to fill any gaps

**PROFESSIONAL STANDARDS:**
*   Create actionable insights and specific, measurable recommendations
*   Fill any strategic gaps with professional recommendations based on industry best practices
*   Ensure ALL fields in the JSON output are populated with detailed, specific content
*   NEVER leave fields empty - always provide comprehensive content for every field
*   If information is missing from the transcription, use your marketing expertise to create examples withrealistic content but let the user know that the information is missing.

**OUTPUT FORMAT:**
Respond with ONLY a valid JSON object in the following comprehensive structure. Do not include any additional text, explanations, or markdown formatting.

{
  "projectTitle": "Specific campaign or project name",
  "briefSummary": "2-3 sentence executive summary describing the campaign goal and strategy",
  "businessChallenge": "Detailed description of the main business challenge this campaign must solve",
  "strategicObjectives": [
    "Specific, measurable business objective 1",
    "Specific, measurable business objective 2",
    "Specific, measurable business objective 3"
  ],
  "targetAudience": {
    "primary": "Detailed description of the primary target audience including demographics, psychographics, behaviors, and needs",
    "secondary": "Description of secondary audience (if applicable)",
    "insights": [
      "Key insight about the audience 1",
      "Key insight about the audience 2",
      "Key insight about the audience 3"
    ]
  },
  "brandPositioning": "Clear statement of how the brand positions itself in the market and in the mind of consumers",
  "creativeStrategy": {
    "bigIdea": "The creative starting point that will guide the entire campaign",
    "messageHierarchy": [
      "Primary message",
      "Secondary supporting message",
      "Tertiary message/CTA"
    ],
    "toneAndManner": "Description of how the communication should sound and feel",
    "creativeMandatories": [
      "Mandatory element 1 (logo, tagline, etc.)",
      "Mandatory element 2"
    ]
  },
  "channelStrategy": {
    "recommendedMix": [
      {
        "channel": "Channel name (e.g., Instagram)",
        "allocation": "Budget % or amount",
        "rationale": "Why this channel",
        "kpis": ["KPI 1", "KPI 2"]
      }
    ],
    "integratedApproach": "How all channels will work together in an integrated way"
  },
  "successMetrics": {
    "primary": [
      "Primary KPI 1 (e.g., 20% increase in brand awareness)",
      "Primary KPI 2"
    ],
    "secondary": [
      "Secondary KPI 1",
      "Secondary KPI 2"
    ],
    "measurementFramework": "How success will be measured and tracked"
  },
  "budgetConsiderations": {
    "estimatedRange": "Total budget range (e.g., $100K-$150K)",
    "keyInvestments": [
      "Major investment area 1",
      "Major investment area 2"
    ],
    "costOptimization": [
      "Cost optimization strategy 1",
      "Cost optimization strategy 2"
    ]
  },
  "riskAssessment": {
    "risks": [
      {
        "risk": "Risk description",
        "likelihood": "High/Medium/Low",
        "impact": "High/Medium/Low",
        "mitigation": "Mitigation strategy"
      }
    ]
  },
  "implementationRoadmap": {
    "phases": [
      {
        "phase": "Phase 1: Planning",
        "duration": "2 weeks",
        "deliverables": ["Deliverable 1", "Deliverable 2"],
        "dependencies": ["Dependency 1"]
      }
    ]
  },
  "nextSteps": [
    "Immediate next step 1",
    "Next step 2",
    "Next step 3"
  ],
  "appendix": {
    "assumptions": [
      "Key assumption 1",
      "Key assumption 2"
    ],
    "references": [
      "Reference or source 1",
      "Reference or source 2"
    ]
  }
}`;

function buildUserPrompt(transcription: string) {
  return `**MARKETING BRIEF CREATION REQUEST**

Based on the following meeting transcription, CREATE a comprehensive Marketing Brief from scratch:

---
"${transcription}"
---

**INSTRUCTIONS:**
This transcription contains discussions about a marketing campaign/project. Your job is to CREATE (not analyze) a complete Marketing Brief by:

1. **Extracting key information** from the transcription about:
   - Campaign/project details
   - Business objectives and challenges
   - Target audience insights
   - Brand positioning and messaging
   - Channel preferences and budget
   - Timeline and success metrics

2. **Creating complete content** for each brief section:
   - Write detailed descriptions, not just bullet points
   - Provide specific, actionable recommendations
   - Fill gaps with your marketing expertise but let the user know that the information is missing and that you are adding examples with realistic content.
   - Make it production-ready

3. **Delivering a complete brief** that marketing teams can use immediately

**REMEMBER:** You are CREATING a new Marketing Brief, not analyzing an existing one. Generate comprehensive content for each field based on the transcription and your professional expertise.`;
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