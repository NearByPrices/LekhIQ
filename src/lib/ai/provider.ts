export interface QualitativeAnalysisResult {
  structuralRepetition: number; // 0-100
  lexicalPredictability: number; // 0-100
  genericWording: number; // 0-100
  sentenceUniformity: number; // 0-100
  transitionOveruse: number; // 0-100
  semanticRedundancy: number; // 0-100
  informationDensity: number; // 0-100
  specificity: number; // 0-100
  naturalness: number; // 0-100
  contextualDepth: number; // 0-100
  toneConsistency: number; // 0-100
  overallScore: number; // 0-100
  reasoning: string;
  keyObservations: string[];
}

export interface HumanisationResult {
  rewrittenText: string;
  changesApplied: string[];
  preservedElements: {
    names: string[];
    numbers: string[];
    urls: string[];
    keywords: string[];
  };
  estimatedQualityImprovement: number; // 0-100
  estimatedAILikenessReduction: number; // 0-100
}

export interface ValidationResult {
  isValid: boolean;
  preservationScore: number; // 0-100 (how well facts preserved)
  readabilityImprovement: number; // 0-100
  issuesFound: string[];
}

export interface AIProvider {
  // Returns null if analysis fails - do NOT return fake scores
  analyseContent(text: string): Promise<QualitativeAnalysisResult | null>;
  humaniseContent(
    text: string,
    mode: 'light' | 'natural' | 'deep',
    tone: string,
    protectedEntities?: string[],
    protectedPhrases?: string[]
  ): Promise<HumanisationResult>;
  validateRewrite(original: string, rewritten: string): Promise<ValidationResult>;
}
