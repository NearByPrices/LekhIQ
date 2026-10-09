import { describe, it, expect } from 'vitest';
import {
  calculateMetrics,
  getRepeatedWords,
  getRepeatedNGrams,
  getTransitionWordDensity,
  getExclamationFrequency,
  getQuestionFrequency,
  getGenericPhraseDensity,
  extractSentences,
} from './metrics';

describe('metrics', () => {
  it('should calculate basic metrics', () => {
    const text = 'This is a test. This is a test.';
    const metrics = calculateMetrics(text);

    expect(metrics.wordCount).toBe(8);
    expect(metrics.sentenceCount).toBe(2);
    expect(metrics.paragraphCount).toBe(1);
    expect(metrics.characterCount).toBe(text.length);
    expect(metrics.averageSentenceLength).toBe(4);
  });

  it('should handle empty text', () => {
    const metrics = calculateMetrics('');
    expect(metrics.wordCount).toBe(0);
    expect(metrics.sentenceCount).toBe(0);
    expect(metrics.averageSentenceLength).toBe(0);
  });

  it('should extract sentences correctly', () => {
    const text = 'First sentence. Second sentence! Third sentence?';
    const sentences = extractSentences(text);

    expect(sentences.length).toBe(3);
    expect(sentences[0]).toContain('First');
    expect(sentences[1]).toContain('Second');
    expect(sentences[2]).toContain('Third');
  });

  it('should detect repeated words', () => {
    const text = 'hello world hello hello test hello';
    const repeated = getRepeatedWords(text, 3);

    expect(repeated.has('hello')).toBe(true);
    expect(repeated.get('hello')).toBe(4);
  });

  it('should ignore repeated words below threshold', () => {
    const text = 'hello world hello test';
    const repeated = getRepeatedWords(text, 3);

    expect(repeated.has('hello')).toBe(false);
  });

  it('should detect repeated bigrams', () => {
    const text = 'hello world hello world foo bar foo bar hello world';
    const bigrams = getRepeatedNGrams(text, 2, 2);

    expect(bigrams.size).toBeGreaterThan(0);
    // At least one bigram should appear at least twice
    const hasRepeatedBigram = Array.from(bigrams.values()).some((count) => count >= 2);
    expect(hasRepeatedBigram).toBe(true);
  });

  it('should calculate transition word density', () => {
    const textWithTransitions =
      'Additionally, we can see. Furthermore, there is more. Moreover, consider this.';
    const density = getTransitionWordDensity(textWithTransitions);

    expect(density).toBeGreaterThan(0);
  });

  it('should count exclamation marks', () => {
    const text = 'This is great! This is amazing! This is good.';
    const frequency = getExclamationFrequency(text);

    expect(frequency).toBeGreaterThan(0);
  });

  it('should count question marks', () => {
    const text = 'Is this correct? Can we do this? What is this?';
    const frequency = getQuestionFrequency(text);

    expect(frequency).toBeGreaterThan(0);
  });

  it('should detect generic phrases', () => {
    const text = 'It is important to note that this is the case. In conclusion, we can say this.';
    const density = getGenericPhraseDensity(text);

    expect(density).toBeGreaterThan(0);
  });

  it('should calculate lexical diversity', () => {
    const uniqueText = 'apple banana cherry date fig grape';
    const repetitiveText = 'apple apple apple apple apple';

    const uniqueMetrics = calculateMetrics(uniqueText);
    const repetitiveMetrics = calculateMetrics(repetitiveText);

    expect(uniqueMetrics.lexicalDiversity).toBeGreaterThan(
      repetitiveMetrics.lexicalDiversity
    );
  });

  it('should calculate variance for sentence lengths', () => {
    const uniformText = 'One two. One two. One two.';
    const varyingText = 'A. This is a longer sentence with many words. B.';

    const uniformMetrics = calculateMetrics(uniformText);
    const varyingMetrics = calculateMetrics(varyingText);

    // Varying text should have higher variance
    expect(varyingMetrics.sentenceLengthVariance).toBeGreaterThan(
      uniformMetrics.sentenceLengthVariance
    );
  });
});
