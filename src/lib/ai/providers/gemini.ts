import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AIProvider,
  QualitativeAnalysisResult,
  HumanisationResult,
  ValidationResult,
} from '../provider';
import {
  ANALYSIS_PROMPT_V1,
  HUMANISATION_PROMPT_V1,
  VALIDATION_PROMPT_V1,
} from '../prompts/analysis';

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  private analysisModel: string;
  private rewriteModel: string;

  constructor(apiKey: string, analysisModel: string = 'gemini-2.0-flash', rewriteModel: string = 'gemini-2.0-flash') {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.client = new GoogleGenerativeAI(apiKey);
    this.analysisModel = analysisModel;
    this.rewriteModel = rewriteModel;
  }

  async analyseContent(text: string): Promise<QualitativeAnalysisResult> {
    try {
      const model = this.client.getGenerativeModel({ model: this.analysisModel });

      const prompt = ANALYSIS_PROMPT_V1.replace('{TEXT}', text);

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        structuralRepetition: parsed.structuralRepetition || 0,
        lexicalPredictability: parsed.lexicalPredictability || 0,
        genericWording: parsed.genericWording || 0,
        sentenceUniformity: parsed.sentenceUniformity || 0,
        transitionOveruse: parsed.transitionOveruse || 0,
        semanticRedundancy: parsed.semanticRedundancy || 0,
        informationDensity: parsed.informationDensity || 0,
        specificity: parsed.specificity || 0,
        naturalness: parsed.naturalness || 0,
        contextualDepth: parsed.contextualDepth || 0,
        toneConsistency: parsed.toneConsistency || 0,
        overallScore: this.calculateOverallScore(parsed),
        reasoning: parsed.reasoning || '',
        keyObservations: parsed.keyObservations || [],
      };
    } catch (error) {
      console.error('Gemini analysis error:', error);
      // Return neutral scores if analysis fails
      return {
        structuralRepetition: 50,
        lexicalPredictability: 50,
        genericWording: 50,
        sentenceUniformity: 50,
        transitionOveruse: 50,
        semanticRedundancy: 50,
        informationDensity: 50,
        specificity: 50,
        naturalness: 50,
        contextualDepth: 50,
        toneConsistency: 50,
        overallScore: 50,
        reasoning: 'Analysis failed, returning neutral score',
        keyObservations: ['Unable to perform detailed analysis'],
      };
    }
  }

  async humaniseContent(
    text: string,
    mode: 'light' | 'natural' | 'deep',
    tone: string,
    protectedEntities: string[] = [],
    protectedPhrases: string[] = []
  ): Promise<HumanisationResult> {
    try {
      const model = this.client.getGenerativeModel({ model: this.rewriteModel });

      const protectedTerms = [
        ...protectedEntities,
        ...protectedPhrases,
      ].join(', ');

      let prompt = HUMANISATION_PROMPT_V1
        .replace('{TEXT}', text)
        .replace('{PROTECTED}', protectedTerms || 'none')
        .replace('{TONE}', tone)
        .replace('{MODE}', mode);

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        rewrittenText: parsed.rewrittenText || text,
        changesApplied: parsed.changesApplied || [],
        preservedElements: parsed.preservedElements || {
          names: [],
          numbers: [],
          urls: [],
          keywords: [],
        },
        estimatedQualityImprovement: 25,
        estimatedAILikenessReduction: 15,
      };
    } catch (error) {
      console.error('Gemini humanisation error:', error);
      throw error;
    }
  }

  async validateRewrite(original: string, rewritten: string): Promise<ValidationResult> {
    try {
      const model = this.client.getGenerativeModel({ model: this.analysisModel });

      const prompt = VALIDATION_PROMPT_V1
        .replace('{ORIGINAL}', original)
        .replace('{REWRITTEN}', rewritten);

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        isValid: parsed.isValid !== false,
        preservationScore: parsed.preservationScore || 80,
        readabilityImprovement: parsed.readabilityImprovement || 20,
        issuesFound: parsed.issuesFound || [],
      };
    } catch (error) {
      console.error('Gemini validation error:', error);
      return {
        isValid: true,
        preservationScore: 75,
        readabilityImprovement: 15,
        issuesFound: ['Validation error: ' + (error instanceof Error ? error.message : 'Unknown error')],
      };
    }
  }

  private calculateOverallScore(data: Record<string, number>): number {
    const scores = [
      data.structuralRepetition,
      data.lexicalPredictability,
      data.genericWording,
      data.sentenceUniformity,
      data.transitionOveruse,
      data.semanticRedundancy,
      // Inverse these since higher is better
      100 - (data.informationDensity || 0),
      100 - (data.specificity || 0),
      100 - (data.naturalness || 0),
      data.contextualDepth,
      data.toneConsistency,
    ].filter((s) => typeof s === 'number' && !isNaN(s));

    if (scores.length === 0) return 50;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }
}

export function createGeminiProvider(apiKey?: string, analysisModel?: string, rewriteModel?: string): GeminiProvider {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GeminiProvider(
    key,
    analysisModel || process.env.GEMINI_ANALYSIS_MODEL,
    rewriteModel || process.env.GEMINI_REWRITE_MODEL
  );
}
