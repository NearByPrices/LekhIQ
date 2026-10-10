import { describe, it, expect } from 'vitest';
import {
  calculateStatisticalScore,
  calculateReadabilityScore,
  calculateRepetitionScore,
  calculateInformationDensityScore,
  calculateContentQualityScore,
} from './quality-scoring';
import { calculateMetrics } from './metrics';

describe('Quality Scoring', () => {
  describe('Statistical Score', () => {
    it('should return value between 0 and 100 for empty text', () => {
      const metrics = calculateMetrics('');
      const score = calculateStatisticalScore(metrics);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should reward high lexical diversity', () => {
      const text = 'The quick brown fox jumps over the lazy dog. The rapid crimson vulpine leaps above the sluggish canine.';
      const metrics = calculateMetrics(text);
      const score = calculateStatisticalScore(metrics);
      expect(score).toBeGreaterThan(45);
    });

    it('should detect uniform sentence length (AI-like)', () => {
      const text = 'This is short. This is short. This is short. This is short.';
      const metrics = calculateMetrics(text);
      const score = calculateStatisticalScore(metrics);
      // Low variance = AI-like = lower statistical score (more AI-like)
      expect(score).toBeLessThan(55);
    });

    it('should return value between 0 and 100', () => {
      const text = 'The quick brown fox jumps over the lazy dog.';
      const metrics = calculateMetrics(text);
      const score = calculateStatisticalScore(metrics);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('Readability Score', () => {
    it('should return value between 0 and 100', () => {
      const text = 'This is a test sentence.';
      const metrics = calculateMetrics(text);
      const score = calculateReadabilityScore(text, metrics);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should favor moderate sentence length', () => {
      const shortText = 'Short. Short. Short. Short. Short.';
      const longText = 'This is a very long and complex sentence that contains multiple clauses and ideas all combined together into one extremely lengthy statement that is difficult to read and understand.';

      const shortMetrics = calculateMetrics(shortText);
      const longMetrics = calculateMetrics(longText);

      const shortScore = calculateReadabilityScore(shortText, shortMetrics);
      const longScore = calculateReadabilityScore(longText, longMetrics);

      // Both extremes should be penalized
      expect(Math.abs(shortScore - 60)).toBeLessThan(20);
      expect(Math.abs(longScore - 60)).toBeLessThan(20);
    });

    it('should reward high lexical diversity', () => {
      const diverseText = 'The quick brown fox jumps over the lazy dog. The rapid crimson vulpine leaps above the sluggish canine. Agile tawny predators sprint past indolent creatures.';
      const repetitiveText = 'The test test test test test test test test test test test test test test test test test test test test.';

      const diverseMetrics = calculateMetrics(diverseText);
      const repetitiveMetrics = calculateMetrics(repetitiveText);

      const diverseScore = calculateReadabilityScore(diverseText, diverseMetrics);
      const repetitiveScore = calculateReadabilityScore(repetitiveText, repetitiveMetrics);

      expect(diverseScore).toBeGreaterThan(repetitiveScore);
    });
  });

  describe('Repetition Score', () => {
    it('should return value between 0 and 100', () => {
      const text = 'This is a test sentence.';
      const score = calculateRepetitionScore(text);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should penalize repeated words', () => {
      const uniqueText = 'The quick brown fox jumps over the lazy dog.';
      const repeatedText = 'test test test test test test test test test test test test';

      const uniqueScore = calculateRepetitionScore(uniqueText);
      const repeatedScore = calculateRepetitionScore(repeatedText);

      expect(uniqueScore).toBeGreaterThan(repeatedScore);
    });

    it('should penalize repeated sentence openings', () => {
      const varyingText = 'The fox jumped. A dog ran. The cat sat. A bird flew.';
      const repetitiveText = 'The fox jumped. The dog ran. The cat sat. The bird flew.';

      const varyingScore = calculateRepetitionScore(varyingText);
      const repetitiveScore = calculateRepetitionScore(repetitiveText);

      expect(varyingScore).toBeGreaterThan(repetitiveScore);
    });

    it('should detect high repetition with high confidence', () => {
      const highRepetition = 'hello hello hello hello hello hello hello hello';
      const score = calculateRepetitionScore(highRepetition);
      expect(score).toBeLessThan(50);
    });
  });

  describe('Information Density Score', () => {
    it('should return value between 0 and 100', () => {
      const text = 'This is a test sentence.';
      const metrics = calculateMetrics(text);
      const score = calculateInformationDensityScore(text, metrics);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should reward longer content with diverse vocabulary', () => {
      const shortText = 'This is short.';
      const longText = 'The rapid advancement of artificial intelligence, machine learning algorithms, and neural networks has revolutionized data analysis, pattern recognition, computational efficiency, and automated decision-making systems. These sophisticated technologies enable organizations to extract valuable insights, optimize complex operations, and drive strategic innovation across multiple industries and sectors.';

      const shortMetrics = calculateMetrics(shortText);
      const longMetrics = calculateMetrics(longText);

      const shortScore = calculateInformationDensityScore(shortText, shortMetrics);
      const longScore = calculateInformationDensityScore(longText, longMetrics);

      expect(longScore).toBeGreaterThan(shortScore);
    });

    it('should reward varied sentence length', () => {
      const uniformText = 'One. Two. Three. Four. Five. Six. Seven. Eight.';
      const variedText = 'This is one. The second sentence is slightly longer. The third sentence contains much more information and complexity than the previous ones.';

      const uniformMetrics = calculateMetrics(uniformText);
      const variedMetrics = calculateMetrics(variedText);

      const uniformScore = calculateInformationDensityScore(uniformText, uniformMetrics);
      const variedScore = calculateInformationDensityScore(variedText, variedMetrics);

      expect(variedScore).toBeGreaterThan(uniformScore);
    });
  });

  describe('Content Quality Score', () => {
    it('should return value between 0 and 100', () => {
      const text = 'This is a test sentence with some content in it.';
      const metrics = calculateMetrics(text);
      const score = calculateContentQualityScore(text, metrics);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should favor well-structured content', () => {
      const poorText = 'test test test test test test';
      const goodText = 'The quick brown fox jumps over the lazy dog. This demonstrates good sentence variety and natural language patterns.';

      const poorMetrics = calculateMetrics(poorText);
      const goodMetrics = calculateMetrics(goodText);

      const poorScore = calculateContentQualityScore(poorText, poorMetrics);
      const goodScore = calculateContentQualityScore(goodText, goodMetrics);

      expect(goodScore).toBeGreaterThan(poorScore);
    });

    it('should combine readability, repetition, and density', () => {
      const text = 'High quality content has good readability, low repetition, and high information density.';
      const metrics = calculateMetrics(text);
      const score = calculateContentQualityScore(text, metrics);

      // Should be a reasonable score (not at extremes)
      expect(score).toBeGreaterThan(30);
      expect(score).toBeLessThan(90);
    });
  });
});
