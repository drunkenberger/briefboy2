import { useEffect, useState } from 'react';

const PARSING_PROMPT = `Eres un asistente técnico que convierte transcripciones de reuniones o documentos en formato JSON estructurado. Tu ÚNICA tarea es organizar la información existente SIN mejorarla, completarla o añadir contenido.

**REGLAS ESTRICTAS:**
1. NO agregues información que no esté explícitamente mencionada en la transcripción
2. NO completes campos vacíos con sugerencias o ejemplos
3. NO mejores el contenido del usuario
4. Si un campo no tiene información en la transcripción, déjalo como string vacío "" o array vacío []
5. SOLO organiza lo que ya existe en formato estructurado
6. Mantén exactamente las palabras y frases del usuario

**OBJETIVO:** Preservar el trabajo original del usuario en formato JSON para análisis posterior.

Responde ÚNICAMENTE con un objeto JSON válido usando esta estructura. Si un campo no tiene información en la transcripción, usa "" para strings o [] para arrays:

{
  "projectTitle": "",
  "briefSummary": "",
  "businessChallenge": "",
  "strategicObjectives": [],
  "targetAudience": {
    "primary": "",
    "secondary": "",
    "insights": []
  },
  "brandPositioning": "",
  "creativeStrategy": {
    "bigIdea": "",
    "messageHierarchy": [],
    "toneAndManner": "",
    "creativeMandatories": []
  },
  "channelStrategy": {
    "recommendedMix": [],
    "integratedApproach": ""
  },
  "successMetrics": {
    "primary": [],
    "secondary": [],
    "measurementFramework": ""
  },
  "budgetConsiderations": {
    "estimatedRange": "",
    "keyInvestments": [],
    "costOptimization": []
  },
  "riskAssessment": {
    "risks": [],
    "contingencyPlans": []
  },
  "implementationRoadmap": {
    "phases": [],
    "timeline": "",
    "dependencies": ""
  },
  "nextSteps": [],
  "appendix": {
    "assumptions": [],
    "references": []
  }
}`;

interface UseContentParserResult {
  parsedBrief: any | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook que convierte transcripciones a formato JSON estructurado SIN mejoras.
 * Preserva exactamente el contenido del usuario para análisis posterior.
 */
export function useContentParser(transcription: string | null, shouldParse: boolean): UseContentParserResult {
  const [parsedBrief, setParsedBrief] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!transcription || !shouldParse) {
      return;
    }

    const parseContent = async () => {
      setLoading(true);
      setError(null);
      
      console.log('🔄 useContentParser: Iniciando parsing sin mejoras...');

      try {
        const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error('API key de OpenAI no encontrada');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: PARSING_PROMPT },
              { role: 'user', content: `Transcripción a convertir a JSON sin mejoras:\n\n${transcription}` }
            ],
            temperature: 0.1, // Muy baja para parsing consistente
            max_tokens: 2000,
            response_format: { type: "json_object" },
          }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Error de autenticación: La clave API de OpenAI no es válida.');
          }
          throw new Error(`Error de la API de OpenAI: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error('No se recibió contenido de la API');
        }

        const parsed = JSON.parse(content);
        console.log('✅ useContentParser: Contenido parseado sin mejoras:', {
          fieldsWithContent: Object.entries(parsed).filter(([_, value]) => {
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'object' && value !== null) {
              return Object.values(value).some(v => v !== '' && (Array.isArray(v) ? v.length > 0 : true));
            }
            return value !== '';
          }).length,
          totalFields: Object.keys(parsed).length
        });

        setParsedBrief(parsed);

      } catch (err: any) {
        console.error('❌ useContentParser error:', err);
        setError(err.message || 'Error al parsear contenido');
        setParsedBrief(null);
      } finally {
        setLoading(false);
      }
    };

    parseContent();
  }, [transcription, shouldParse]);

  return { parsedBrief, loading, error };
}