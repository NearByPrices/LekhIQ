import { AILikenessSignal, AILikenessResult } from '@/types/analysis';
import { ContentMetrics, getDetailedMetrics } from './metrics';

const RULES_VERSION = 'ai-scoring-v1';

interface RuleConfig {
  name: string;
  weight: number;
  description: string;
}

// Configurable rule weights
const RULE_WEIGHTS: Record<string, RuleConfig> = {
  uniform_sentence_length: {
    name: 'Uniform sentence lengths',
    weight: 8,
    description: 'Sentences are too uniform in length, suggesting templated output',
  },
  uniform_paragraph_length: {
    name: 'Uniform paragraph lengths',
    weight: 7,
    description: 'Paragraphs lack natural variation in length',
  },
  repeated_sentence_openings: {
    name: 'Repeated sentence openings',
    weight: 6,
    description: 'Same phrases used to start multiple sentences',
  },
  excessive_transitions: {
    name: 'Excessive transition words',
    weight: 6,
    description: 'Overuse of "additionally", "moreover", "furthermore"',
  },
  low_lexical_diversity: {
    name: 'Low lexical diversity',
    weight: 7,
    description: 'Limited vocabulary with many repeated words',
  },
  repeated_phrases: {
    name: 'Repeated phrases',
    weight: 5,
    description: 'Same phrases appear multiple times unnecessarily',
  },
  generic_openings: {
    name: 'Generic introduction patterns',
    weight: 5,
    description: 'Content starts with clichéd phrases like "In today\'s digital age"',
  },
  balanced_lists: {
    name: 'Excessive balanced structure',
    weight: 4,
    description: 'Lists with nearly identical item lengths',
  },
  low_information_density: {
    name: 'Low information density',
    weight: 6,
    description: 'Few concrete facts relative to total word count',
  },
  overly_polished: {
    name: 'Overly polished uniform rhythm',
    weight: 5,
    description: 'Writing flow is too perfect, lacks natural variation',
  },
};

export class AILikenessRuleEngine {
  private text: string;
  private metrics: ReturnType<typeof getDetailedMetrics>;
  private signals: AILikenessSignal[] = [];

  constructor(text: string) {
    this.text = text;
    this.metrics = getDetailedMetrics(text);
  }

  evaluate(): AILikenessResult {
    this.signals = [];

    // Don't evaluate empty or very short text
    if (this.metrics.wordCount < 10) {
      return {
        score: 0,
        riskLevel: 'low',
        signals: [],
        explanation: 'Text is too short to evaluate for AI-likeness characteristics.',
        version: RULES_VERSION,
      };
    }

    // Run all rules
    this.checkSentenceLengthUniformity();
    this.checkParagraphLengthUniformity();
    this.checkRepeatedSentenceOpenings();
    this.checkTransitionWordOveruse();
    this.checkLexicalDiversity();
    this.checkRepeatedPhrases();
    this.checkGenericPatterns();
    this.checkInformationDensity();

    // Calculate score based on weighted signals
    const rawScore = this.calculateWeightedScore();
    const score = Math.min(100, Math.max(0, rawScore));
    const riskLevel = this.getRiskLevel(score);
    const explanation = this.generateExplanation(score);

    return {
      score,
      riskLevel,
      signals: this.signals.sort((a, b) => b.weight - a.weight),
      explanation,
      version: RULES_VERSION,
    };
  }

  private checkSentenceLengthUniformity(): void {
    const variance = this.metrics.sentenceLengthVariance;
    const avgLength = this.metrics.averageSentenceLength;

    // Very low variance relative to mean suggests uniformity
    if (avgLength > 0 && variance / avgLength < 0.3) {
      const config = RULE_WEIGHTS.uniform_sentence_length;
      this.signals.push({
        name: config.name,
        severity: variance / avgLength < 0.15 ? 'high' : 'medium',
        weight: config.weight,
        evidence: `Sentence length variance is very low (${variance.toFixed(2)}), suggesting templated structure`,
      });
    }
  }

  private checkParagraphLengthUniformity(): void {
    const variance = this.metrics.paragraphLengthVariance;
    const avgLength = this.metrics.averageParagraphLength;

    if (avgLength > 0 && variance / avgLength < 0.3) {
      const config = RULE_WEIGHTS.uniform_paragraph_length;
      this.signals.push({
        name: config.name,
        severity: variance / avgLength < 0.15 ? 'high' : 'medium',
        weight: config.weight,
        evidence: `Paragraph length variance is very low (${variance.toFixed(2)})`,
      });
    }
  }

  private checkRepeatedSentenceOpenings(): void {
    const openings = this.metrics.sentenceOpenings;
    const totalSentences = this.metrics.sentenceCount;

    let maxRepeated = 0;
    let repeatedCount = 0;

    for (const count of Object.values(openings)) {
      if (count > 1) {
        maxRepeated = Math.max(maxRepeated, count);
        repeatedCount++;
      }
    }

    // More than 10% of sentences start with repeated phrases
    if (maxRepeated > 1 && maxRepeated / totalSentences > 0.1) {
      const config = RULE_WEIGHTS.repeated_sentence_openings;
      this.signals.push({
        name: config.name,
        severity: maxRepeated / totalSentences > 0.2 ? 'high' : 'medium',
        weight: config.weight,
        evidence: `${repeatedCount} sentence openings appear multiple times, max ${maxRepeated} times`,
      });
    }
  }

  private checkTransitionWordOveruse(): void {
    const density = this.metrics.transitionDensity;

    // High transition word density (>10% of words are transitions)
    if (density > 0.1) {
      const config = RULE_WEIGHTS.excessive_transitions;
      this.signals.push({
        name: config.name,
        severity: density > 0.15 ? 'high' : 'medium',
        weight: config.weight,
        evidence: `${(density * 100).toFixed(1)}% of words are transition words`,
      });
    }
  }

  private checkLexicalDiversity(): void {
    const diversity = this.metrics.lexicalDiversity;

    // Low diversity (<0.5 suggests repetitive vocabulary)
    if (diversity < 0.50) {
      const config = RULE_WEIGHTS.low_lexical_diversity;
      this.signals.push({
        name: config.name,
        severity: diversity < 0.35 ? 'high' : 'medium',
        weight: config.weight,
        evidence: `Lexical diversity is low (${(diversity * 100).toFixed(1)}%), indicating vocabulary repetition`,
      });
    }
  }

  private checkRepeatedPhrases(): void {
    const bigrams = Object.values(this.metrics.repeatedBigrams).filter((c) => c > 2);
    const trigrams = Object.values(this.metrics.repeatedTrigrams).filter((c) => c > 1);

    if (bigrams.length > 0 || trigrams.length > 0) {
      const config = RULE_WEIGHTS.repeated_phrases;
      this.signals.push({
        name: config.name,
        severity: trigrams.length > 0 ? 'high' : 'medium',
        weight: config.weight,
        evidence: `Found ${bigrams.length} repeated bigrams and ${trigrams.length} repeated trigrams`,
      });
    }
  }

  private checkGenericPatterns(): void {
    const genericDensity = this.metrics.genericPhraseDensity;

    // More than 3% of text contains generic phrases
    if (genericDensity > 0.03) {
      const config = RULE_WEIGHTS.generic_openings;
      this.signals.push({
        name: config.name,
        severity: genericDensity > 0.06 ? 'high' : 'medium',
        weight: config.weight,
        evidence: `${(genericDensity * 100).toFixed(2)}% of text contains generic phrases`,
      });
    }
  }

  private checkInformationDensity(): void {
    const wordCount = this.metrics.wordCount;
    const uniqueWords = Math.round(wordCount * this.metrics.lexicalDiversity);

    // Very low information relative to word count
    if (uniqueWords < wordCount * 0.4) {
      const config = RULE_WEIGHTS.low_information_density;
      this.signals.push({
        name: config.name,
        severity: uniqueWords < wordCount * 0.3 ? 'high' : 'medium',
        weight: config.weight,
        evidence: `Low information density: ${uniqueWords} unique words in ${wordCount} total`,
      });
    }
  }

  private calculateWeightedScore(): number {
    if (this.signals.length === 0) {
      return 0;
    }

    let totalWeight = 0;
    let weightedSum = 0;

    for (const signal of this.signals) {
      const severityMultiplier = signal.severity === 'high' ? 2 : 1;
      const adjustedWeight = signal.weight * severityMultiplier;
      weightedSum += adjustedWeight;
      totalWeight += adjustedWeight;
    }

    // Normalize to 0-100 scale
    // Each signal detected increases score, with max of ~80 from rules alone
    const baseScore = Math.min(80, (weightedSum / 60) * 100);

    // Bonus for multiple signals detected (compound effect)
    const signalBonus = Math.min(20, this.signals.length * 2);

    return Math.min(100, baseScore + signalBonus);
  }

  private getRiskLevel(score: number): 'low' | 'moderate' | 'high' | 'very_high' {
    if (score < 30) return 'low';
    if (score < 60) return 'moderate';
    if (score < 80) return 'high';
    return 'very_high';
  }

  private generateExplanation(score: number): string {
    if (this.signals.length === 0) {
      return 'No significant AI-likeness characteristics detected. Writing appears natural.';
    }

    const topSignals = this.signals.slice(0, 3);
    const signalDescriptions = topSignals.map((s) => `${s.name.toLowerCase()}`).join(', ');

    const baseExplanation = `Content shows ${this.getRiskLevel(score)} risk of AI-like characteristics.`;
    const detailsExplanation = `Main patterns detected: ${signalDescriptions}.`;

    return `${baseExplanation} ${detailsExplanation}`;
  }
}

export function evaluateAILikeness(text: string): AILikenessResult {
  const engine = new AILikenessRuleEngine(text);
  return engine.evaluate();
}
