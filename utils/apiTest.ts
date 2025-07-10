/**
 * Utilidad para probar la conexión con la API de OpenAI
 */

export const testOpenAIConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        message: 'No se encontró la API key de OpenAI en las variables de entorno'
      };
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
          {
            role: 'system',
            content: 'Responde únicamente con JSON válido'
          },
          {
            role: 'user',
            content: 'Responde con: {"test": "success", "status": "working"}'
          }
        ],
        temperature: 0.1,
        max_tokens: 100,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `Error HTTP ${response.status}: ${errorText}`
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return {
        success: false,
        message: 'No se recibió contenido de la API'
      };
    }

    try {
      const parsed = JSON.parse(content);
      if (parsed.test === 'success') {
        return {
          success: true,
          message: 'Conexión exitosa con OpenAI API'
        };
      } else {
        return {
          success: false,
          message: 'Respuesta inesperada de la API'
        };
      }
    } catch (parseError) {
      return {
        success: false,
        message: `Error parseando respuesta: ${content}`
      };
    }

  } catch (error: any) {
    return {
      success: false,
      message: `Error de conexión: ${error.message}`
    };
  }
};

export const createSimpleAnalysis = (brief: any) => {
  return {
    overallScore: 75,
    completenessScore: 80,
    qualityScore: 70,
    professionalismScore: 75,
    readinessScore: 70,
    strengths: [
      'El brief tiene información básica estructurada',
      'Incluye elementos esenciales para una campaña'
    ],
    weaknesses: [
      'Falta especificidad en los objetivos',
      'Necesita más detalles sobre la audiencia objetivo'
    ],
    criticalIssues: [
      'No se especifica presupuesto disponible',
      'Timeline muy general'
    ],
    recommendations: [
      'Definir objetivos SMART (específicos, medibles, alcanzables)',
      'Desarrollar personas más detalladas de la audiencia',
      'Establecer métricas de éxito claras',
      'Definir presupuesto y cronograma específicos'
    ],
    sectionAnalysis: {
      projectTitle: {
        score: brief?.projectTitle ? 80 : 40,
        status: brief?.projectTitle ? 'good' as const : 'poor' as const,
        issues: brief?.projectTitle ? [] : ['Título faltante o muy genérico'],
        suggestions: ['Hacer el título más específico y descriptivo']
      },
      briefSummary: {
        score: brief?.briefSummary ? 75 : 30,
        status: brief?.briefSummary ? 'good' as const : 'poor' as const,
        issues: brief?.briefSummary ? [] : ['Resumen ejecutivo faltante'],
        suggestions: ['Expandir el resumen con más contexto estratégico']
      },
      strategicObjectives: {
        score: brief?.strategicObjectives?.length > 0 ? 70 : 20,
        status: brief?.strategicObjectives?.length > 0 ? 'fair' as const : 'poor' as const,
        issues: ['Objetivos muy genéricos'],
        suggestions: ['Agregar KPIs específicos y plazos medibles']
      },
      targetAudience: {
        score: brief?.targetAudience?.length > 0 ? 65 : 25,
        status: brief?.targetAudience?.length > 0 ? 'fair' as const : 'poor' as const,
        issues: ['Definición de audiencia superficial'],
        suggestions: ['Desarrollar personas detalladas con datos demográficos y psicográficos']
      }
    },
    isReadyForProduction: false,
    estimatedImprovementTime: '20-30 minutos'
  };
};