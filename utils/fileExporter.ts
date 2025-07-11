import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

/**
 * Comprehensive interface for the Brief object structure
 */
export interface Brief {
  // Basic Information
  projectTitle?: string;
  briefSummary?: string;
  businessChallenge?: string;
  brandPositioning?: string;
  
  // Strategic Information
  strategicObjectives?: string[];
  
  // Target Audience
  targetAudience?: {
    primary?: string;
    secondary?: string;
    insights?: string[];
  };
  
  // Creative Strategy
  creativeStrategy?: {
    bigIdea?: string;
    messageHierarchy?: string[];
    toneAndManner?: string;
    creativeMandatories?: string[];
  };
  
  // Channel Strategy
  channelStrategy?: {
    recommendedMix?: Array<{
      channel?: string;
      allocation?: string;
      rationale?: string;
      kpis?: string[];
    } | string>;
    integratedApproach?: string;
    channels?: any[];
  };
  
  // Success Metrics
  successMetrics?: {
    primary?: Array<{
      metric?: string;
      target?: string;
      description?: string;
    } | string>;
    secondary?: Array<{
      metric?: string;
      target?: string;
      description?: string;
    } | string>;
    measurementFramework?: string;
  };
  
  // Budget Considerations
  budgetConsiderations?: {
    estimatedRange?: string;
    keyInvestments?: Array<{
      category?: string;
      amount?: string;
      description?: string;
    } | string>;
    costOptimization?: string[];
  };
  
  // Risk Assessment
  riskAssessment?: {
    risks?: string[];
  };
  
  // Implementation
  implementationRoadmap?: {
    phases?: Array<{
      phase?: string;
      timeline?: string;
      deliverables?: string[];
    } | string>;
  };
  
  // Next Steps
  nextSteps?: string[];
  
  // Appendix
  appendix?: {
    assumptions?: string[];
    references?: string[];
  };
  
  // Improvement Metadata
  improvementMetadata?: {
    structuredImprovementApplied?: boolean;
    improvementDate?: string;
    originalBriefFields?: number;
    improvedBriefFields?: number;
  };
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  improvedAt?: string;
  
  // Allow for additional fields that might be added dynamically
  [key: string]: any;
}

export class FileExporter {
  /**
   * Descarga un archivo en el navegador web
   */
  private static downloadFileInBrowser(filename: string, content: string, mimeType: string = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Formatea el brief como texto profesional
   */
  static formatBriefAsText(brief: Brief): string {
    if (!brief || typeof brief !== 'object') {
      throw new Error('Brief inválido o no proporcionado');
    }
    
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let text = `════════════════════════════════════════════════════════════════\n`;
    text += `                        BRIEF PUBLICITARIO\n`;
    text += `════════════════════════════════════════════════════════════════\n\n`;

    text += `📋 PROYECTO: ${brief.projectTitle || 'Brief Publicitario'}\n`;
    text += `📅 FECHA: ${currentDate}\n`;

    if (brief.improvementMetadata?.structuredImprovementApplied) {
      text += `✨ ESTATUS: Brief Mejorado con IA Estructurada\n`;
      if (brief.improvementMetadata.improvementDate) {
        try {
          const improvementDate = new Date(brief.improvementMetadata.improvementDate).toLocaleDateString('es-ES');
          text += `🔄 FECHA DE MEJORA: ${improvementDate}\n`;
        } catch (error) {
          console.warn('Error formatting improvement date:', error);
          text += `🔄 FECHA DE MEJORA: No disponible\n`;
        }
      }
    }

    text += `\n${'='.repeat(64)}\n\n`;

    // Resumen Ejecutivo
    if (brief.briefSummary) {
      text += `📊 RESUMEN EJECUTIVO\n`;
      text += `${'-'.repeat(20)}\n`;
      text += `${brief.briefSummary}\n\n`;
    }

    // Desafío de Negocio
    if (brief.businessChallenge) {
      text += `🎯 DESAFÍO DE NEGOCIO\n`;
      text += `${'-'.repeat(20)}\n`;
      text += `${brief.businessChallenge}\n\n`;
    }

    // Objetivos Estratégicos
    if (brief.strategicObjectives && Array.isArray(brief.strategicObjectives)) {
      text += `🚀 OBJETIVOS ESTRATÉGICOS\n`;
      text += `${'-'.repeat(25)}\n`;
      brief.strategicObjectives.forEach((obj: string, index: number) => {
        text += `${index + 1}. ${obj}\n`;
      });
      text += '\n';
    }

    // Audiencia Objetivo
    if (brief.targetAudience?.primary) {
      text += `👥 AUDIENCIA OBJETIVO\n`;
      text += `${'-'.repeat(20)}\n`;
      text += `▶ AUDIENCIA PRIMARIA:\n${brief.targetAudience.primary}\n\n`;

      if (brief.targetAudience.secondary) {
        text += `▶ AUDIENCIA SECUNDARIA:\n${brief.targetAudience.secondary}\n\n`;
      }

      if (brief.targetAudience.insights && Array.isArray(brief.targetAudience.insights)) {
        text += `▶ INSIGHTS DE AUDIENCIA:\n`;
        brief.targetAudience.insights.forEach((insight: string) => {
          text += `  • ${insight}\n`;
        });
        text += '\n';
      }
    }

    // Posicionamiento de Marca
    if (brief.brandPositioning) {
      text += `🏆 POSICIONAMIENTO DE MARCA\n`;
      text += `${'-'.repeat(28)}\n`;
      text += `${brief.brandPositioning}\n\n`;
    }

    // Estrategia Creativa
    if (brief.creativeStrategy?.bigIdea) {
      text += `💡 ESTRATEGIA CREATIVA\n`;
      text += `${'-'.repeat(22)}\n`;
      text += `▶ GRAN IDEA:\n${brief.creativeStrategy.bigIdea}\n\n`;

      if (brief.creativeStrategy.toneAndManner) {
        text += `▶ TONO Y MANERA:\n${brief.creativeStrategy.toneAndManner}\n\n`;
      }

      if (brief.creativeStrategy.messageHierarchy && Array.isArray(brief.creativeStrategy.messageHierarchy)) {
        text += `▶ JERARQUÍA DE MENSAJES:\n`;
        brief.creativeStrategy.messageHierarchy.forEach((msg: string, index: number) => {
          text += `  ${index + 1}. ${msg}\n`;
        });
        text += '\n';
      }
    }

    // Mix de Canales
    if (brief.channelStrategy?.recommendedMix && Array.isArray(brief.channelStrategy.recommendedMix)) {
      text += `📺 MIX DE CANALES RECOMENDADO\n`;
      text += `${'-'.repeat(30)}\n`;
      brief.channelStrategy.recommendedMix.forEach((channel, index: number) => {
        if (typeof channel === 'object' && channel !== null && 'channel' in channel) {
          text += `${index + 1}. ${channel.channel?.toUpperCase() || 'Canal'}`;
          if (channel.allocation) {
            text += ` (${channel.allocation})`;
          }
          text += '\n';
          if (channel.rationale) {
            text += `   📝 ${channel.rationale}\n`;
          }
          if (channel.kpis && Array.isArray(channel.kpis)) {
            text += `   📊 KPIs: ${channel.kpis.join(', ')}\n`;
          }
        } else {
          text += `${index + 1}. ${channel}\n`;
        }
        text += '\n';
      });
    }

    // Métricas de Éxito
    if (brief.successMetrics?.primary && Array.isArray(brief.successMetrics.primary)) {
      text += `📈 MÉTRICAS DE ÉXITO\n`;
      text += `${'-'.repeat(20)}\n`;
      text += `▶ KPIs PRIMARIOS:\n`;
      brief.successMetrics.primary.forEach((metric) => {
        if (typeof metric === 'object' && metric !== null && 'metric' in metric) {
          text += `  • ${metric.metric}: ${metric.target || 'N/A'}\n`;
        } else {
          text += `  • ${metric}\n`;
        }
      });
      text += '\n';
    }

    // Presupuesto
    if (brief.budgetConsiderations?.estimatedRange) {
      text += `💰 CONSIDERACIONES PRESUPUESTARIAS\n`;
      text += `${'-'.repeat(35)}\n`;
      text += `▶ RANGO ESTIMADO: ${brief.budgetConsiderations.estimatedRange}\n\n`;
    }

    // Próximos Pasos
    if (brief.nextSteps && Array.isArray(brief.nextSteps)) {
      text += `📋 PRÓXIMOS PASOS\n`;
      text += `${'-'.repeat(16)}\n`;
      brief.nextSteps.forEach((step: string, index: number) => {
        text += `${index + 1}. ${step}\n`;
      });
      text += '\n';
    }

    // Footer
    text += `\n${'='.repeat(64)}\n`;
    text += `             BRIEF GENERADO POR BRIEFBOY\n`;
    text += `                 briefboy.ai - 2024\n`;
    if (brief.improvementMetadata?.structuredImprovementApplied) {
      text += `           ✨ Mejorado con IA Estructurada\n`;
    }
    text += `${'='.repeat(64)}\n`;

    return text;
  }

  /**
   * Genera un nombre de archivo único
   */
  static generateFileName(brief: Brief, extension: string): string {
    const projectTitle = brief?.projectTitle || 'Brief';
    const date = new Date().toISOString().split('T')[0];
    const cleanTitle = projectTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    return `${cleanTitle}_${date}.${extension}`;
  }

  /**
   * Descarga el brief como archivo de texto
   */
  static async downloadAsText(brief: Brief): Promise<void> {
    console.log('📝 FileExporter.downloadAsText called');
    
    if (!brief) {
      throw new Error('No se proporcionó un brief válido');
    }
    
    try {
      const content = this.formatBriefAsText(brief);
      const fileName = this.generateFileName(brief, 'txt');
      
      // Verificar si estamos en web
      if (Platform.OS === 'web') {
        // Descargar automáticamente en el navegador
        this.downloadFileInBrowser(fileName, content, 'text/plain');
        Alert.alert(
          '✅ Descarga Exitosa',
          `El archivo ${fileName} se ha descargado en tu carpeta de descargas`,
          [{ text: 'OK' }]
        );
      } else {
        // Móvil: usar expo-file-system
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, content, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        // Verificar si el sharing está disponible
        const isAvailable = await Sharing.isAvailableAsync();

        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/plain',
            dialogTitle: 'Exportar Brief'
          });
        } else {
          Alert.alert(
            '⚠️ Archivo Creado',
            `Brief guardado como: ${fileName}\n\nLa función de compartir no está disponible en esta plataforma.`,
            [{ text: 'OK' }]
          );
        }
      }

    } catch (error) {
      console.error('❌ Error downloading text file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert(
        '❌ Error',
        `No se pudo generar el archivo de texto: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Formatea el brief como Markdown
   */
  static formatBriefAsMarkdown(brief: Brief): string {
    if (!brief || typeof brief !== 'object') {
      throw new Error('Brief inválido o no proporcionado');
    }
    
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let md = `# 📋 BRIEF PUBLICITARIO\n\n`;
    
    md += `**📋 Proyecto:** ${brief.projectTitle || 'Brief Publicitario'}\n`;
    md += `**📅 Fecha:** ${currentDate}\n`;
    
    if (brief.improvementMetadata?.structuredImprovementApplied) {
      md += `**✨ Estatus:** Brief Mejorado con IA Estructurada\n`;
      if (brief.improvementMetadata.improvementDate) {
        try {
          const improvementDate = new Date(brief.improvementMetadata.improvementDate).toLocaleDateString('es-ES');
          md += `**🔄 Fecha de Mejora:** ${improvementDate}\n`;
        } catch (error) {
          console.warn('Error formatting improvement date:', error);
          md += `**🔄 Fecha de Mejora:** No disponible\n`;
        }
      }
    }
    
    md += `\n---\n\n`;
    
    // Resumen Ejecutivo
    if (brief.briefSummary) {
      md += `## 📊 Resumen Ejecutivo\n\n`;
      md += `${brief.briefSummary}\n\n`;
    }
    
    // Desafío de Negocio
    if (brief.businessChallenge) {
      md += `## 🎯 Desafío de Negocio\n\n`;
      md += `${brief.businessChallenge}\n\n`;
    }
    
    // Objetivos Estratégicos
    if (brief.strategicObjectives && Array.isArray(brief.strategicObjectives)) {
      md += `## 🚀 Objetivos Estratégicos\n\n`;
      brief.strategicObjectives.forEach((obj: string, index: number) => {
        md += `${index + 1}. ${obj}\n`;
      });
      md += `\n`;
    }
    
    // Audiencia Objetivo
    if (brief.targetAudience?.primary) {
      md += `## 👥 Audiencia Objetivo\n\n`;
      md += `### ▶ Audiencia Primaria\n\n${brief.targetAudience.primary}\n\n`;
      
      if (brief.targetAudience.secondary) {
        md += `### ▶ Audiencia Secundaria\n\n${brief.targetAudience.secondary}\n\n`;
      }
      
      if (brief.targetAudience.insights && Array.isArray(brief.targetAudience.insights)) {
        md += `### ▶ Insights de Audiencia\n\n`;
        brief.targetAudience.insights.forEach((insight: string) => {
          md += `- ${insight}\n`;
        });
        md += `\n`;
      }
    }
    
    // Posicionamiento de Marca
    if (brief.brandPositioning) {
      md += `## 🏆 Posicionamiento de Marca\n\n`;
      md += `${brief.brandPositioning}\n\n`;
    }
    
    // Estrategia Creativa
    if (brief.creativeStrategy?.bigIdea) {
      md += `## 💡 Estrategia Creativa\n\n`;
      md += `### ▶ Gran Idea\n\n${brief.creativeStrategy.bigIdea}\n\n`;
      
      if (brief.creativeStrategy.toneAndManner) {
        md += `### ▶ Tono y Manera\n\n${brief.creativeStrategy.toneAndManner}\n\n`;
      }
      
      if (brief.creativeStrategy.messageHierarchy && Array.isArray(brief.creativeStrategy.messageHierarchy)) {
        md += `### ▶ Jerarquía de Mensajes\n\n`;
        brief.creativeStrategy.messageHierarchy.forEach((msg: string, index: number) => {
          md += `${index + 1}. ${msg}\n`;
        });
        md += `\n`;
      }
    }
    
    // Mix de Canales
    if (brief.channelStrategy?.recommendedMix && Array.isArray(brief.channelStrategy.recommendedMix)) {
      md += `## 📺 Mix de Canales Recomendado\n\n`;
      brief.channelStrategy.recommendedMix.forEach((channel, index: number) => {
        if (typeof channel === 'object' && channel !== null && 'channel' in channel) {
          md += `${index + 1}. **${channel.channel?.toUpperCase() || 'Canal'}**`;
          if (channel.allocation) {
            md += ` (${channel.allocation})`;
          }
          md += `\n`;
          if (channel.rationale) {
            md += `   - ${channel.rationale}\n`;
          }
          if (channel.kpis && Array.isArray(channel.kpis)) {
            md += `   - **KPIs:** ${channel.kpis.join(', ')}\n`;
          }
        } else {
          md += `${index + 1}. ${channel}\n`;
        }
        md += `\n`;
      });
    }
    
    // Métricas de Éxito
    if (brief.successMetrics?.primary && Array.isArray(brief.successMetrics.primary)) {
      md += `## 📈 Métricas de Éxito\n\n`;
      md += `### ▶ KPIs Primarios\n\n`;
      brief.successMetrics.primary.forEach((metric) => {
        if (typeof metric === 'object' && metric !== null && 'metric' in metric) {
          md += `- **${metric.metric}:** ${metric.target || 'N/A'}\n`;
        } else {
          md += `- ${metric}\n`;
        }
      });
      md += `\n`;
    }
    
    // Presupuesto
    if (brief.budgetConsiderations?.estimatedRange) {
      md += `## 💰 Consideraciones Presupuestarias\n\n`;
      md += `**Rango Estimado:** ${brief.budgetConsiderations.estimatedRange}\n\n`;
    }
    
    // Próximos Pasos
    if (brief.nextSteps && Array.isArray(brief.nextSteps)) {
      md += `## 📋 Próximos Pasos\n\n`;
      brief.nextSteps.forEach((step: string, index: number) => {
        md += `${index + 1}. ${step}\n`;
      });
      md += `\n`;
    }
    
    // Footer
    md += `\n---\n\n`;
    md += `**Brief generado por BriefBoy** | briefboy.ai - 2024`;
    if (brief.improvementMetadata?.structuredImprovementApplied) {
      md += ` | ✨ Mejorado con IA Estructurada`;
    }
    md += `\n`;
    
    return md;
  }

  /**
   * Genera el brief como HTML para PDF
   */
  static formatBriefAsHTML(brief: Brief): string {
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Brief Publicitario</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #007acc;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #007acc;
          font-size: 2.5em;
          margin: 0;
          font-weight: 700;
        }
        .project-info {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          border-left: 4px solid #007acc;
        }
        .project-info h2 {
          margin-top: 0;
          color: #333;
        }
        .section {
          margin-bottom: 30px;
          padding: 20px;
          border-radius: 8px;
          background-color: #fff;
          border: 1px solid #e9ecef;
        }
        .section h3 {
          color: #007acc;
          font-size: 1.3em;
          margin-top: 0;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
        }
        .section h3::before {
          margin-right: 10px;
          font-size: 1.2em;
        }
        .objectives h3::before { content: "🚀"; }
        .audience h3::before { content: "👥"; }
        .strategy h3::before { content: "💡"; }
        .channels h3::before { content: "📺"; }
        .metrics h3::before { content: "📈"; }
        .budget h3::before { content: "💰"; }
        .steps h3::before { content: "📋"; }
        .list {
          list-style: none;
          padding: 0;
        }
        .list li {
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .list li:last-child {
          border-bottom: none;
        }
        .list li::before {
          content: "•";
          color: #007acc;
          font-weight: bold;
          margin-right: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #007acc;
          color: #666;
        }
        .improvement-badge {
          background-color: #28a745;
          color: white;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 0.8em;
          font-weight: 600;
        }
        .subsection {
          margin-left: 20px;
          margin-top: 10px;
        }
        .subsection h4 {
          color: #495057;
          font-size: 1.1em;
          margin-bottom: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>BRIEF PUBLICITARIO</h1>
        </div>

        <div class="project-info">
          <h2>📋 ${brief.projectTitle || 'Brief Publicitario'}</h2>
          <p><strong>📅 Fecha:</strong> ${currentDate}</p>
          ${brief.improvementMetadata?.structuredImprovementApplied ? `
            <p><span class="improvement-badge">✨ Mejorado con IA Estructurada</span></p>
            ${brief.improvementMetadata.improvementDate ? `
              <p><strong>🔄 Fecha de Mejora:</strong> ${(() => {
                try {
                  return new Date(brief.improvementMetadata.improvementDate).toLocaleDateString('es-ES');
                } catch (error) {
                  console.warn('Error formatting improvement date in HTML:', error);
                  return 'No disponible';
                }
              })()}</p>
            ` : ''}
          ` : ''}
        </div>
    `;

    // Resumen Ejecutivo
    if (brief.briefSummary) {
      html += `
        <div class="section">
          <h3>📊 RESUMEN EJECUTIVO</h3>
          <p>${brief.briefSummary}</p>
        </div>
      `;
    }

    // Desafío de Negocio
    if (brief.businessChallenge) {
      html += `
        <div class="section">
          <h3>🎯 DESAFÍO DE NEGOCIO</h3>
          <p>${brief.businessChallenge}</p>
        </div>
      `;
    }

    // Objetivos Estratégicos
    if (brief.strategicObjectives && Array.isArray(brief.strategicObjectives)) {
      html += `
        <div class="section objectives">
          <h3>OBJETIVOS ESTRATÉGICOS</h3>
          <ul class="list">
            ${brief.strategicObjectives.map((obj: string) => `<li>${obj}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // Audiencia Objetivo
    if (brief.targetAudience?.primary) {
      html += `
        <div class="section audience">
          <h3>AUDIENCIA OBJETIVO</h3>
          <div class="subsection">
            <h4>▶ Audiencia Primaria:</h4>
            <p>${brief.targetAudience.primary}</p>
          </div>
          ${brief.targetAudience.secondary ? `
            <div class="subsection">
              <h4>▶ Audiencia Secundaria:</h4>
              <p>${brief.targetAudience.secondary}</p>
            </div>
          ` : ''}
        </div>
      `;
    }

    // Estrategia Creativa
    if (brief.creativeStrategy?.bigIdea) {
      html += `
        <div class="section strategy">
          <h3>ESTRATEGIA CREATIVA</h3>
          <div class="subsection">
            <h4>▶ Gran Idea:</h4>
            <p>${brief.creativeStrategy.bigIdea}</p>
          </div>
          ${brief.creativeStrategy.toneAndManner ? `
            <div class="subsection">
              <h4>▶ Tono y Manera:</h4>
              <p>${brief.creativeStrategy.toneAndManner}</p>
            </div>
          ` : ''}
        </div>
      `;
    }

    // Mix de Canales
    if (brief.channelStrategy?.recommendedMix && Array.isArray(brief.channelStrategy.recommendedMix)) {
      html += `
        <div class="section channels">
          <h3>MIX DE CANALES RECOMENDADO</h3>
          <ul class="list">
            ${brief.channelStrategy.recommendedMix.map((channel) => {
              if (typeof channel === 'object' && channel !== null && 'channel' in channel) {
                return `<li><strong>${channel.channel?.toUpperCase() || 'Canal'}</strong> ${channel.allocation ? `(${channel.allocation})` : ''}<br>
                        ${channel.rationale ? `<em>${channel.rationale}</em>` : ''}
                        </li>`;
              } else {
                return `<li>${channel}</li>`;
              }
            }).join('')}
          </ul>
        </div>
      `;
    }

    // Métricas de Éxito
    if (brief.successMetrics?.primary && Array.isArray(brief.successMetrics.primary)) {
      html += `
        <div class="section metrics">
          <h3>MÉTRICAS DE ÉXITO</h3>
          <div class="subsection">
            <h4>▶ KPIs Primarios:</h4>
            <ul class="list">
              ${brief.successMetrics.primary.map((metric) => {
                if (typeof metric === 'object' && metric !== null && 'metric' in metric) {
                  return `<li><strong>${metric.metric}:</strong> ${metric.target || 'N/A'}</li>`;
                } else {
                  return `<li>${metric}</li>`;
                }
              }).join('')}
            </ul>
          </div>
        </div>
      `;
    }

    // Próximos Pasos
    if (brief.nextSteps && Array.isArray(brief.nextSteps)) {
      html += `
        <div class="section steps">
          <h3>PRÓXIMOS PASOS</h3>
          <ul class="list">
            ${brief.nextSteps.map((step: string) => `<li>${step}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    html += `
        <div class="footer">
          <p><strong>Brief generado por BriefBoy</strong></p>
          <p>briefboy.ai - 2024</p>
          ${brief.improvementMetadata?.structuredImprovementApplied ? `
            <p>✨ Mejorado con IA Estructurada</p>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
    `;

    return html;
  }

  /**
   * Descarga el brief como archivo HTML
   */
  static async downloadAsHTML(brief: Brief): Promise<void> {
    console.log('🌐 FileExporter.downloadAsHTML called');
    try {
      const content = this.formatBriefAsHTML(brief);
      const fileName = this.generateFileName(brief, 'html');
      
      if (Platform.OS === 'web') {
        // Descargar automáticamente en el navegador
        this.downloadFileInBrowser(fileName, content, 'text/html');
        Alert.alert(
          '✅ Descarga Exitosa',
          `El archivo ${fileName} se ha descargado en tu carpeta de descargas`,
          [{ text: 'OK' }]
        );
      } else {
        // Móvil: usar expo-file-system
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, content, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/html',
            dialogTitle: 'Exportar Brief HTML'
          });
        } else {
          Alert.alert(
            '⚠️ Archivo HTML Creado',
            `Brief guardado como: ${fileName}\n\nLa función de compartir no está disponible en esta plataforma.`,
            [{ text: 'OK' }]
          );
        }
      }

    } catch (error) {
      console.error('❌ Error downloading HTML file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert(
        '❌ Error',
        `No se pudo generar el archivo HTML: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Descarga el brief como archivo JSON
   */
  static async downloadAsJSON(brief: Brief): Promise<void> {
    console.log('📊 FileExporter.downloadAsJSON called');
    try {
      const content = JSON.stringify(brief, null, 2);
      const fileName = this.generateFileName(brief, 'json');
      
      if (Platform.OS === 'web') {
        // Descargar automáticamente en el navegador
        this.downloadFileInBrowser(fileName, content, 'application/json');
        Alert.alert(
          '✅ Descarga Exitosa',
          `El archivo ${fileName} se ha descargado en tu carpeta de descargas`,
          [{ text: 'OK' }]
        );
      } else {
        // Móvil: usar expo-file-system
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, content, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: 'Exportar Brief JSON'
          });
        } else {
          Alert.alert(
            '⚠️ Archivo JSON Creado',
            `Brief guardado como: ${fileName}\n\nLa función de compartir no está disponible en esta plataforma.`,
            [{ text: 'OK' }]
          );
        }
      }

    } catch (error) {
      console.error('❌ Error downloading JSON file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert(
        '❌ Error',
        `No se pudo generar el archivo JSON: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Descarga el brief como archivo Markdown
   */
  static async downloadAsMarkdown(brief: Brief): Promise<void> {
    console.log('📝 FileExporter.downloadAsMarkdown called');
    
    if (!brief) {
      throw new Error('No se proporcionó un brief válido');
    }
    
    try {
      const content = this.formatBriefAsMarkdown(brief);
      const fileName = this.generateFileName(brief, 'md');
      
      if (Platform.OS === 'web') {
        // Descargar automáticamente en el navegador
        this.downloadFileInBrowser(fileName, content, 'text/markdown');
        Alert.alert(
          '✅ Descarga Exitosa',
          `El archivo ${fileName} se ha descargado en tu carpeta de descargas`,
          [{ text: 'OK' }]
        );
      } else {
        // Móvil: usar expo-file-system
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, content, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/markdown',
            dialogTitle: 'Exportar Brief Markdown'
          });
        } else {
          Alert.alert(
            '⚠️ Archivo Markdown Creado',
            `Brief guardado como: ${fileName}\n\nLa función de compartir no está disponible en esta plataforma.`,
            [{ text: 'OK' }]
          );
        }
      }

    } catch (error) {
      console.error('❌ Error downloading Markdown file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert(
        '❌ Error',
        `No se pudo generar el archivo Markdown: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Descarga el brief en todos los formatos disponibles
   */
  static async downloadAllFormats(brief: Brief): Promise<void> {
    console.log('📦 FileExporter.downloadAllFormats called');
    
    if (!brief) {
      throw new Error('No se proporcionó un brief válido');
    }
    
    try {
      const formats = [
        { method: 'downloadAsText', name: 'TXT' },
        { method: 'downloadAsMarkdown', name: 'Markdown' },
        { method: 'downloadAsHTML', name: 'HTML' },
        { method: 'downloadAsJSON', name: 'JSON' }
      ];
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const format of formats) {
        try {
          switch (format.method) {
            case 'downloadAsText':
              await this.downloadAsText(brief);
              break;
            case 'downloadAsMarkdown':
              await this.downloadAsMarkdown(brief);
              break;
            case 'downloadAsHTML':
              await this.downloadAsHTML(brief);
              break;
            case 'downloadAsJSON':
              await this.downloadAsJSON(brief);
              break;
          }
          successCount++;
          // Pequeña pausa entre descargas para evitar problemas
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error descargando ${format.name}:`, error);
          errorCount++;
        }
      }
      
      Alert.alert(
        '🎉 Descarga Completa',
        `Se descargaron ${successCount} archivos con éxito.${errorCount > 0 ? ` ${errorCount} archivos fallaron.` : ''}`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('❌ Error downloading all formats:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert(
        '❌ Error',
        `No se pudieron descargar todos los formatos: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    }
  }
}