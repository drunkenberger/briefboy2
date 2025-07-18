// Este archivo contendrá el contenido de la knowledge base pre-cargado
// Ya que React Native no puede leer archivos del sistema de archivos directamente

export interface KnowledgeBaseContent {
  [fileName: string]: string;
}

// Por ahora, vamos a crear un placeholder
// En producción, necesitarías un script de build que lea los archivos y genere este contenido
export const KNOWLEDGE_BASE_CONTENT: KnowledgeBaseContent = {
  // Este objeto será poblado con el contenido de los archivos
  // Por ahora está vacío hasta que implementemos la carga
};

// Lista de archivos disponibles
export const KNOWLEDGE_BASE_FILES = [
  '239377472-ZAG-Workshop-The-Briefing-final.txt',
  '24712081-23241518-Impact-BBDO-Creative-Brief.txt',
  '388605021-TBWA-Disruption-Handbook.txt',
  '582784703-Como-hacer-un-brief.txt',
  '586196322-The-Best-Way-for-a-Client-to-Brief-an-Agency.txt',
  '658211149-TBWA-Disruption-Strategy.txt',
  '658211201-OGILVY-Fusion.txt',
  '707090392-Creative-brief.txt'
];