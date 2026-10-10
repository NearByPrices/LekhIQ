import { ContentMetrics } from '@/types/analysis';
import {
  getRepeatedWords,
  getRepeatedNGrams,
  getSentenceOpenings,
  getTransitionWordDensity,
  getGenericPhraseDensity,
  extractSentences,
} from './metrics';

/**
 * Calculate statistical AI-likeness score from deterministic metrics
 * Lower scores = more natural, Higher scores = more AI-like
 */
export function calculateStatisticalScore(metrics: ContentMetrics): number {
  let score = 50; // Base score (neutral)
  const adjustments: { factor: string; value: number }[] = [];

  // Sentence length uniformity (high variance = more natural)
  const sentenceVarianceSignal = Math.min(metrics.sentenceLengthVariance / 100, 1);
  const sentenceVarianceBonus = sentenceVarianceSignal * 20; // -20 to +20
  adjustments.push({
    factor: 'sentenceVariance',
    value: sentenceVarianceBonus,
  });

  // Paragraph length uniformity (high variance = more natural)
  const paragraphVarianceSignal = Math.min(metrics.paragraphLengthVariance / 100, 1);
  const paragraphVarianceBonus = paragraphVarianceSignal * 20;
  adjustments.push({
    factor: 'paragraphVariance',
    value: paragraphVarianceBonus,
  });

  // Lexical diversity (high diversity = more natural)
  const lexicalDiversityBonus = (metrics.lexicalDiversity || 0) * 20; // 0-20 points
  adjustments.push({
    factor: 'lexicalDiversity',
    value: lexicalDiversityBonus,
  });

  // Average sentence length (10-20 words is natural, extreme values are AI-like)
  const optimalSentenceLength = 15;
  const sentenceLengthDiff = Math.abs(metrics.averageSentenceLength - optimalSentenceLength);
  const sentenceLengthPenalty = -Math.min(sentenceLengthDiff * 0.5, 15); // -15 to 0
  adjustments.push({
    factor: 'sentenceLength',
    value: sentenceLengthPenalty,
  });

  // Calculate final score
  let finalScore = score;
  for (const adjustment of adjustments) {
    finalScore += adjustment.value;
  }

  // Clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(finalScore)));
}

/**
 * Calculate readability score (0-100, higher = easier to read)
 * Based on Flesch-Kincaid principles
 */
export function calculateReadabilityScore(
  text: string,
  metrics: ContentMetrics
): number {
  let score = 60; // Base readability
  const adjustments: { factor: string; value: number }[] = [];

  // Sentence length impact (shorter sentences = more readable)
  // Optimal: 10-15 words per sentence
  const sentenceLengthFactor = Math.abs(metrics.averageSentenceLength - 12.5) / 12.5;
  const sentenceLengthBonus = Math.max(0, 20 - sentenceLengthFactor * 20);
  adjustments.push({
    factor: 'sentenceLength',
    value: sentenceLengthBonus - 10,
  });

  // Word variety (high lexical diversity = more readable)
  const lexicalDiversityBonus = (metrics.lexicalDiversity || 0.3) * 30;
  adjustments.push({
    factor: 'lexicalDiversity',
    value: lexicalDiversityBonus - 10,
  });

  // Paragraph length (shorter paragraphs = more readable)
  const optimalParagraphLength = 100; // words
  const paragraphFactor = Math.abs(metrics.averageParagraphLength - optimalParagraphLength) / optimalParagraphLength;
  const paragraphBonus = Math.max(0, 15 - paragraphFactor * 15);
  adjustments.push({
    factor: 'paragraphLength',
    value: paragraphBonus - 7,
  });

  // Sentence variety (high variance = more readable, reduces monotony)
  const sentenceVarianceBonus = Math.min(metrics.sentenceLengthVariance / 200, 1) * 15;
  adjustments.push({
    factor: 'sentenceVariety',
    value: sentenceVarianceBonus,
  });

  let finalScore = score;
  for (const adjustment of adjustments) {
    finalScore += adjustment.value;
  }

  return Math.max(0, Math.min(100, Math.round(finalScore)));
}

/**
 * Calculate repetition score (0-100, lower = more repetitive)
 */
export function calculateRepetitionScore(text: string): number {
  let score = 75; // Base score (neutral, assume low repetition)
  const adjustments: { factor: string; value: number }[] = [];

  // Check repeated words (high frequency = repetitive)
  const repeatedWords = getRepeatedWords(text, 3);
  const totalWords = (text.match(/\b\w+\b/g) || []).length;

  if (repeatedWords.size > 0 && totalWords > 0) {
    // Count how many words are repeated
    let totalRepeatedCount = 0;
    for (const count of repeatedWords.values()) {
      totalRepeatedCount += count - 1; // Count extra occurrences
    }

    // Repetition ratio (extra occurrences / total words)
    const repetitionRatio = totalRepeatedCount / totalWords;
    const repetitionPenalty = -Math.min(repetitionRatio * 40, 25); // -25 to 0
    adjustments.push({
      factor: 'repeatedWords',
      value: repetitionPenalty,
    });
  }

  // Check repeated bigrams (phrase repetition)
  const repeatedBigrams = getRepeatedNGrams(text, 2, 2);
  if (repeatedBigrams.size > 0) {
    const repeatedBigramPenalty = -Math.min(repeatedBigrams.size * 2, 15);
    adjustments.push({
      factor: 'repeatedBigrams',
      value: repeatedBigramPenalty,
    });
  }

  // Check sentence opening repetition
  const sentenceOpenings = getSentenceOpenings(text);
  const sentences = extractSentences(text).length;

  if (sentenceOpenings.size > 0 && sentences > 0) {
    // If few openings for many sentences, high repetition
    const openingDiversity = sentenceOpenings.size / sentences;
    if (openingDiversity < 0.3) {
      const openingPenalty = -(1 - openingDiversity) * 15; // -15 to 0
      adjustments.push({
        factor: 'repeatedOpenings',
        value: openingPenalty,
      });
    }
  }

  let finalScore = score;
  for (const adjustment of adjustments) {
    finalScore += adjustment.value;
  }

  return Math.max(0, Math.min(100, Math.round(finalScore)));
}

/**
 * Calculate information density score (0-100, higher = more information-rich)
 */
export function calculateInformationDensityScore(
  text: string,
  metrics: ContentMetrics
): number {
  let score = 50; // Base score
  const adjustments: { factor: string; value: number }[] = [];

  // Content length (more words = potentially more information)
  // But diminishing returns
  const wordCountFactor = Math.min(metrics.wordCount / 500, 1);
  const lengthBonus = wordCountFactor * 25;
  adjustments.push({
    factor: 'wordCount',
    value: lengthBonus - 12,
  });

  // Lexical diversity (unique words = more varied information)
  const lexicalBonus = (metrics.lexicalDiversity || 0.3) * 30;
  adjustments.push({
    factor: 'lexicalDiversity',
    value: lexicalBonus - 15,
  });

  // Sentence length (longer sentences can pack more information)
  const optimalLength = 15;
  const lengthVariance = Math.min(Math.abs(metrics.averageSentenceLength - optimalLength) / optimalLength, 1);
  const sentenceLengthBonus = (1 - lengthVariance) * 20;
  adjustments.push({
    factor: 'sentenceLength',
    value: sentenceLengthBonus - 10,
  });

  // Paragraph length (too short = less information per paragraph)
  const minParagraphLength = 50;
  if (metrics.averageParagraphLength >= minParagraphLength) {
    const paragraphBonus = Math.min((metrics.averageParagraphLength / minParagraphLength) * 15, 15);
    adjustments.push({
      factor: 'paragraphLength',
      value: paragraphBonus,
    });
  }

  let finalScore = score;
  for (const adjustment of adjustments) {
    finalScore += adjustment.value;
  }

  return Math.max(0, Math.min(100, Math.round(finalScore)));
}

/**
 * Calculate overall content quality score (0-100)
 * Combines multiple quality dimensions
 */
export function calculateContentQualityScore(text: string, metrics: ContentMetrics): number {
  const readability = calculateReadabilityScore(text, metrics);
  const repetition = calculateRepetitionScore(text);
  const density = calculateInformationDensityScore(text, metrics);

  // Weight the components
  const quality = readability * 0.4 + repetition * 0.3 + density * 0.3;

  return Math.round(quality);
}
