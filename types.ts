
export type KeywordIntent = 'Transacional' | 'Informativa' | 'Comercial' | 'Navegacional';

export interface Keyword {
  keyword: string;
  intent: KeywordIntent;
  difficulty: number;
  volume: number;
}

export interface KeywordResults {
  primaryKeywords: Keyword[];
  secondaryKeywords: Keyword[];
  longTailKeywords: Keyword[];
}

export interface BusinessAnalysis {
    summary: string;
    targetAudience: string;
    toneOfVoice: string;
}

export interface ContentSuggestion {
    title: string;
    brief: string;
}

export interface ContentSuggestions {
    topOfFunnel?: ContentSuggestion[];
    middleOfFunnel?: ContentSuggestion[];
    bottomOfFunnel?: ContentSuggestion[];
}

export interface AnalysisResult {
    keywordResults: KeywordResults;
    businessAnalysis: BusinessAnalysis;
    contentSuggestions?: ContentSuggestions;
}

export interface HistoryEntry {
    id: number; // Using timestamp for simplicity and uniqueness
    url: string;
    result: AnalysisResult;
}

// --- Topic Clustering Types ---

export type AudienceType = 'B2B' | 'B2C' | 'Ambos';
export type JourneyStage = 'Aprendizado e Descoberta' | 'Reconhecimento do Problema' | 'Consideração da Solução' | 'Decisão de Compra';
export type FunnelStage = 'Topo' | 'Meio' | 'Fundo';

export interface ClusterTopic {
    topic: string;
    audienceType: AudienceType;
    journeyStage: JourneyStage;
    funnelStage: FunnelStage;
}

export interface TopicClusterResult {
    pillarTopic: string;
    clusterTopics: ClusterTopic[];
}

// --- Article Structure Types ---

export interface ArticleOutlineSection {
    level: 'H2' | 'H3';
    heading: string;
    content_brief: string;
}

export interface ArticleStructure {
    h1: string;
    introduction_brief: string;
    outline: ArticleOutlineSection[];
    conclusion_brief: string;
}
