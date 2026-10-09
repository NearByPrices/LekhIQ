export interface ContentMetrics {
  wordCount: number;
  characterCount: number;
  sentenceCount: number;
  paragraphCount: number;
  averageSentenceLength: number;
  sentenceLengthVariance: number;
  averageParagraphLength: number;
  paragraphLengthVariance: number;
  lexicalDiversity: number;
}

export interface AILikenessSignal {
  name: string;
  severity: 'low' | 'medium' | 'high';
  weight: number;
  evidence: string;
}

export interface AILikenessResult {
  score: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
  signals: AILikenessSignal[];
  explanation: string;
  version: string;
}

export interface ContentQualityResult {
  clarity: number;
  specificity: number;
  readability: number;
  repetition: number;
  informationDensity: number;
  logicalFlow: number;
  structure: number;
  usefulness: number;
  naturalness: number;
  toneConsistency: number;
  overallScore: number;
}

export interface AnalysisResult {
  contentMetrics: ContentMetrics;
  aiLikeness: AILikenessResult;
  contentQuality: ContentQualityResult;
  readabilityScore: number;
  completedAt: string;
}

export interface HumanisationRequest {
  contentId: string;
  mode: 'light' | 'natural' | 'deep';
  tone: 'professional' | 'conversational' | 'corporate' | 'educational' | 'technical' | 'premium' | 'sales' | 'neutral';
  keywordLock?: string[];
  phraseLock?: string[];
}

export interface HumanisationResult {
  originalText: string;
  rewrittenText: string;
  beforeScore: AILikenessResult;
  afterScore: AILikenessResult;
  preservedEntities: {
    names: string[];
    numbers: string[];
    urls: string[];
    keywords: string[];
  };
  changes: string[];
  validationStatus: 'valid' | 'failed' | 'needs_review';
  completedAt: string;
}
