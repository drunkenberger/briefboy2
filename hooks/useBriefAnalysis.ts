import { useState, useEffect } from 'react';
import { testOpenAIConnection, createSimpleAnalysis } from '../utils/apiTest';

export interface BriefAnalysisResult {
  overallScore: number;
  completenessScore: number;
  qualityScore: number;
  professionalismScore: number;
  readinessScore: number;
  
  strengths: string[];
  weaknesses: string[];
  criticalIssues: string[];
  recommendations: string[];
  
  sectionAnalysis: {
    [key: string]: {
      score: number;
      status: 'excellent' | 'good' | 'fair' | 'poor' | 'missing';
      issues: string[];
      suggestions: string[];
    };
  };
  
  isReadyForProduction: boolean;
  estimatedImprovementTime: string;
}

/**
 * Hook para analizar la calidad y completitud de un brief
 */
export function useBriefAnalysis(brief: any) {
  const [analysis, setAnalysis] = useState<BriefAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeBrief = async (briefToAnalyze: any) => {
    if (!briefToAnalyze) return;
    
    setLoading(true);
    setError(null);
    
    // Verificar si el brief ya ha pasado por múltiples iteraciones
    const iterations = briefToAnalyze?.improvementMetadata?.improvementIterations || 0;
    const previousScores = briefToAnalyze?.improvementMetadata?.previousScores || [];
    
    console.log('🔍 Analizando brief con', iterations, 'iteraciones previas');
    console.log('🔍 Brief metadata completo:', briefToAnalyze?.improvementMetadata);
    console.log('🔍 Brief completo para debug:', {
      hasImprovementMetadata: !!briefToAnalyze?.improvementMetadata,
      iterations: iterations,
      previousScores: previousScores,
      briefKeys: briefToAnalyze ? Object.keys(briefToAnalyze) : []
    });
    
    // REMOVIDO: Override artificial eliminado para mantener objetividad del AI
    
    try {
      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      if (!apiKey) {
        console.warn('No se encontró API key, usando análisis offline');
        const offlineAnalysis = createSimpleAnalysis(briefToAnalyze);
        setAnalysis(offlineAnalysis);
        setLoading(false);
        return;
      }
      
      console.log('Iniciando análisis para brief:', briefToAnalyze?.projectTitle || 'Sin título');
      
      // Probar conexión primero
      const connectionTest = await testOpenAIConnection();
      if (!connectionTest.success) {
        console.warn('Test de conexión falló:', connectionTest.message);
        console.warn('Usando análisis offline como fallback');
        const offlineAnalysis = createSimpleAnalysis(briefToAnalyze);
        setAnalysis(offlineAnalysis);
        setLoading(false);
        return;
      }
      
      console.log('Conexión a OpenAI exitosa, procediendo con análisis IA');

      const analysisPrompt = `Analiza este brief publicitario y proporciona una evaluación completa.

BRIEF A ANALIZAR:
${JSON.stringify(briefToAnalyze, null, 2)}

INSTRUCCIONES DE EVALUACIÓN OBJETIVA:
1. Mantén SIEMPRE estándares profesionales altos pero justos
2. Evalúa la CALIDAD REAL del contenido, no la cantidad de texto
3. Un brief "Excelente" debe tener insights profundos, métricas específicas y estrategia clara
4. Un brief "Muy Bueno" debe ser ejecutable con información suficientemente detallada
5. Sé exigente pero reconoce cuando el contenido genuinamente alcanza estándares profesionales

IMPORTANTE: Responde ÚNICAMENTE con JSON válido, sin texto adicional, comentarios o explicaciones.

Evalúa estos aspectos con scores OBJETIVOS del 0-100:
1. COMPLETITUD: ¿Están todos los campos necesarios con información útil?
2. CALIDAD: ¿Es el contenido específico, actionable y profesional?
3. CLARIDAD: ¿Un equipo creativo puede ejecutar esto sin confusión?
4. ESTRATEGIA: ¿Hay una dirección clara y coherente?
5. EJECUTABILIDAD: ¿Es práctico y realista?

CRITERIOS DE CALIFICACIÓN BALANCEADOS:
- 95-100: Excepcional - Brief de nivel Cannes/Effie con insights profundos, métricas específicas y estrategia cristalina
- 85-94: Excelente - Brief profesional completo, ejecutable inmediatamente con claridad estratégica
- 75-84: Muy bueno - Brief sólido con información suficiente, necesita refinamiento menor
- 65-74: Bueno - Brief funcional pero requiere mayor especificidad y profundidad estratégica
- 50-64: Regular - Brief básico con información general, necesita desarrollo significativo
- <50: Insuficiente - Brief incompleto o con problemas fundamentales

EVALUACIÓN DE CONTENIDO:
- Para puntaje 85+: El contenido debe ser específico, incluir métricas/datos, mostrar insights profundos
- Para puntaje 75+: El contenido debe ser claro, ejecutable y estratégicamente sólido
- Para puntaje 65+: El contenido debe estar completo aunque sea básico
- Evalúa la CALIDAD del contenido, no solo su existencia

**IMPORTANTE**: Evalúa objetivamente la CALIDAD REAL del contenido. Un brief excelente debe tener información específica, insights profundos, métricas claras y estrategia ejecutable, independientemente de cuántas veces haya sido editado.

Formato JSON requerido (copia exactamente esta estructura):
{
  "overallScore": 85,
  "completenessScore": 90,
  "qualityScore": 80,
  "professionalismScore": 85,
  "readinessScore": 75,
  "strengths": ["Fortaleza 1", "Fortaleza 2"],
  "weaknesses": ["Debilidad 1", "Debilidad 2"],
  "criticalIssues": ["Issue crítico 1", "Issue crítico 2"],
  "recommendations": ["Recomendación 1", "Recomendación 2"],
  "sectionAnalysis": {
    "projectTitle": {"score": 85, "status": "good", "issues": [], "suggestions": ["Sugerencia"]},
    "briefSummary": {"score": 80, "status": "good", "issues": [], "suggestions": ["Sugerencia"]},
    "strategicObjectives": {"score": 70, "status": "fair", "issues": ["Issue"], "suggestions": ["Sugerencia"]}
  },
  "isReadyForProduction": true/false basado en si el brief tiene TODO lo necesario para ejecutar una campaña profesional (no perfección, sino completitud funcional),
  "estimatedImprovementTime": "15-20 minutos"
}

CRITERIOS MÍNIMOS PARA "READY FOR PRODUCTION":
1. ✓ Título claro del proyecto
2. ✓ Objetivos medibles definidos
3. ✓ Audiencia target identificada
4. ✓ Estrategia creativa básica
5. ✓ Presupuesto o rango definido
6. ✓ Timeline o fases claras

Si cumple estos 6 criterios mínimos + score 85+ = isReadyForProduction: true
Si falta algún criterio esencial = isReadyForProduction: false (sin importar el score)
**IMPORTANTE: El contenido debe ser ESPECÍFICO, no genérico. Evalúa la CALIDAD del contenido, no solo su existencia.**

**REGLA DE OBJETIVIDAD**: Evalúa el brief como si fueras a ejecutar la campaña mañana. ¿Tienes toda la información necesaria con el nivel de detalle apropiado? 

- ¿El contenido incluye métricas específicas, insights profundos y dirección estratégica clara?
- ¿Un equipo creativo podría ejecutar esto sin necesidad de más información?
- ¿Los objetivos son medibles y específicos?
- ¿La audiencia está bien definida con insights de comportamiento?
- ¿La estrategia es ejecutable y diferenciadora?

Si la respuesta es SÍ a todo = Excelente (85-95+). Si falta profundidad estratégica = Muy Bueno (75-84). Si es básico pero completo = Bueno (65-74).`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Eres un experto evaluador de briefs publicitarios. CRUCIAL: Responde ÚNICAMENTE con JSON válido, sin texto adicional, sin explicaciones, sin markdown. Solo el objeto JSON. TODO EL CONTENIDO DEL JSON DEBE ESTAR EN ESPAÑOL.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          temperature: 0.1, // Más determinístico
          max_tokens: 2000,
          response_format: { type: "json_object" } // Forzar respuesta JSON
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error HTTP:', response.status, errorText);
        throw new Error(`Error HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No se recibió contenido de la API');
      }

      try {
        // Limpiar el contenido antes de parsear
        let cleanContent = content.trim();
        
        // Remover markdown code blocks si existen
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        // Remover texto adicional antes del JSON
        const jsonStart = cleanContent.indexOf('{');
        const jsonEnd = cleanContent.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
        }
        
        console.log('Contenido limpio a parsear:', cleanContent);
        
        const analysisResult = JSON.parse(cleanContent);
        
        // Validar que tenga las propiedades necesarias
        if (!analysisResult.overallScore || !analysisResult.strengths || !analysisResult.weaknesses) {
          throw new Error('Respuesta de IA incompleta');
        }
        
        setAnalysis(analysisResult);
      } catch (parseError) {
        console.error('Error parseando JSON:', parseError);
        console.error('Contenido recibido:', content);
        
        // Crear un análisis real basado en el contenido del brief
        const fallbackAnalysis = createSimpleAnalysis(briefToAnalyze);
        
        setAnalysis(fallbackAnalysis);
        console.warn('Usando análisis fallback debido a error de parsing');
      }
      
    } catch (err: any) {
      setError(err.message || 'Error al analizar el brief');
      console.error('Brief analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (brief) {
      analyzeBrief(brief);
    }
  }, [brief]);

  return {
    analysis,
    loading,
    error,
    reAnalyze: () => analyzeBrief(brief),
  };
}

/**
 * Función para obtener el color según el score
 */
export const getScoreColor = (score: number): string => {
  if (score >= 90) return '#10b981'; // Verde excelente
  if (score >= 80) return '#3b82f6'; // Azul bueno
  if (score >= 70) return '#f59e0b'; // Amarillo regular
  if (score >= 60) return '#ef4444'; // Rojo pobre
  return '#6b7280'; // Gris muy pobre
};

/**
 * Función para obtener el texto del status
 */
export const getStatusText = (status: string): string => {
  switch (status) {
    case 'excellent': return 'Excelente';
    case 'good': return 'Bueno';
    case 'fair': return 'Regular';
    case 'poor': return 'Pobre';
    case 'missing': return 'Faltante';
    default: return 'Sin evaluar';
  }
};

/**
 * Función para obtener el emoji del score
 */
export const getScoreEmoji = (score: number): string => {
  if (score >= 90) return '🌟';
  if (score >= 80) return '✅';
  if (score >= 70) return '⚠️';
  if (score >= 60) return '❌';
  return '🚨';
};