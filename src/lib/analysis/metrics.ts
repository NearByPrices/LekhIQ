import { ContentMetrics } from '@/types/analysis';

const SENTENCE_ENDINGS = /[.!?]+/g;
const PARAGRAPH_SPLIT = /\n\n+/g;
const WORD_PATTERN = /\b\w+\b/g;
const BIGRAM_PATTERN = /\b\w+\s+\w+\b/g;
const TRIGRAM_PATTERN = /\b\w+\s+\w+\s+\w+\b/g;

export function calculateMetrics(text: string): ContentMetrics {
  const cleanText = text.trim();

  if (!cleanText) {
    return {
      wordCount: 0,
      characterCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      averageSentenceLength: 0,
      sentenceLengthVariance: 0,
      averageParagraphLength: 0,
      paragraphLengthVariance: 0,
      lexicalDiversity: 0,
    };
  }

  // Basic counts
  const characterCount = cleanText.length;
  const words = cleanText.match(WORD_PATTERN) || [];
  const wordCount = words.length;
  const sentences = cleanText.match(SENTENCE_ENDINGS) || [];
  const sentenceCount = sentences.length;
  const paragraphs = cleanText.split(PARAGRAPH_SPLIT).filter((p) => p.trim());
  const paragraphCount = Math.max(1, paragraphs.length);

  // Sentence length analysis
  const sentenceLengths = extractSentences(cleanText).map((s) => {
    const matches = s.match(WORD_PATTERN) || [];
    return matches.length;
  });
  const averageSentenceLength =
    sentenceLengths.length > 0
      ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
      : 0;
  const sentenceLengthVariance = calculateVariance(sentenceLengths, averageSentenceLength);

  // Paragraph length analysis
  const paragraphLengths = paragraphs.map((p) => {
    const matches = p.match(WORD_PATTERN) || [];
    return matches.length;
  });
  const averageParagraphLength =
    paragraphLengths.length > 0
      ? paragraphLengths.reduce((a, b) => a + b, 0) / paragraphLengths.length
      : 0;
  const paragraphLengthVariance = calculateVariance(
    paragraphLengths,
    averageParagraphLength
  );

  // Lexical diversity (unique words / total words)
  const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;
  const lexicalDiversity = wordCount > 0 ? uniqueWords / wordCount : 0;

  return {
    wordCount,
    characterCount,
    sentenceCount: Math.max(1, sentenceCount),
    paragraphCount,
    averageSentenceLength,
    sentenceLengthVariance,
    averageParagraphLength,
    paragraphLengthVariance,
    lexicalDiversity,
  };
}

export function extractSentences(text: string): string[] {
  // Split by sentence endings, preserve the ending
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.filter((s) => s.trim().length > 0);
}

export function getRepeatedWords(text: string, minFrequency: number = 3): Map<string, number> {
  const words = (text.match(WORD_PATTERN) || []).map((w) => w.toLowerCase());
  const frequency = new Map<string, number>();

  for (const word of words) {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  }

  // Filter by minimum frequency
  const repeated = new Map<string, number>();
  for (const [word, count] of frequency.entries()) {
    if (count >= minFrequency) {
      repeated.set(word, count);
    }
  }

  return repeated;
}

export function getRepeatedNGrams(
  text: string,
  ngramSize: 2 | 3,
  minFrequency: number = 2
): Map<string, number> {
  const pattern = ngramSize === 2 ? BIGRAM_PATTERN : TRIGRAM_PATTERN;
  const ngrams = (text.match(pattern) || []).map((ng) => ng.toLowerCase());
  const frequency = new Map<string, number>();

  for (const ngram of ngrams) {
    frequency.set(ngram, (frequency.get(ngram) || 0) + 1);
  }

  // Filter by minimum frequency
  const repeated = new Map<string, number>();
  for (const [ngram, count] of frequency.entries()) {
    if (count >= minFrequency) {
      repeated.set(ngram, count);
    }
  }

  return repeated;
}

export function getSentenceOpenings(text: string): Map<string, number> {
  const sentences = extractSentences(text);
  const openings = new Map<string, number>();

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length === 0) continue;

    // Get first 2 words as opening (more useful for detecting patterns)
    const words = (trimmed.match(WORD_PATTERN) || []).slice(0, 2);
    if (words.length > 0) {
      const opening = words.join(' ').toLowerCase();
      openings.set(opening, (openings.get(opening) || 0) + 1);
    }
  }

  return openings;
}

export function getTransitionWordDensity(text: string): number {
  const transitionWords = [
    'additionally',
    'also',
    'furthermore',
    'moreover',
    'in addition',
    'instead',
    'however',
    'therefore',
    'consequently',
    'as a result',
    'meanwhile',
    'ultimately',
    'specifically',
    'certainly',
  ];

  const words = text.toLowerCase().match(WORD_PATTERN) || [];
  if (words.length === 0) return 0;

  let transitionCount = 0;
  for (const word of words) {
    if (transitionWords.includes(word)) {
      transitionCount++;
    }
  }

  // Also count multi-word transitions
  const lowerText = text.toLowerCase();
  for (const phrase of ['in addition', 'as a result', 'in conclusion']) {
    const matches = lowerText.match(new RegExp(phrase, 'g'));
    if (matches) {
      transitionCount += matches.length;
    }
  }

  return transitionCount / words.length;
}

export function getExclamationFrequency(text: string): number {
  const exclamations = (text.match(/!/g) || []).length;
  const sentences = extractSentences(text).length;
  return sentences > 0 ? exclamations / sentences : 0;
}

export function getQuestionFrequency(text: string): number {
  const questions = (text.match(/\?/g) || []).length;
  const sentences = extractSentences(text).length;
  return sentences > 0 ? questions / sentences : 0;
}

export function getPunctuationDistribution(text: string): {
  periods: number;
  commas: number;
  semicolons: number;
  colons: number;
} {
  return {
    periods: (text.match(/\./g) || []).length,
    commas: (text.match(/,/g) || []).length,
    semicolons: (text.match(/;/g) || []).length,
    colons: (text.match(/:/g) || []).length,
  };
}

export function getGenericPhraseDensity(text: string): number {
  const genericPhrases = [
    "it is important to note",
    "by implementing these strategies",
    "in today's",
    "in the digital age",
    "in conclusion",
    "furthermore",
    "additionally",
    "in this article",
  ];

  const lowerText = text.toLowerCase();
  let phraseCount = 0;

  for (const phrase of genericPhrases) {
    const matches = lowerText.match(new RegExp(phrase, 'g'));
    if (matches) {
      phraseCount += matches.length;
    }
  }

  const words = (text.match(WORD_PATTERN) || []).length;
  return words > 0 ? phraseCount / words : 0;
}

function calculateVariance(values: number[], mean: number): number {
  if (values.length === 0) return 0;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

export function getDetailedMetrics(text: string) {
  const basic = calculateMetrics(text);
  const repeatedWords = getRepeatedWords(text);
  const repeatedBigrams = getRepeatedNGrams(text, 2);
  const repeatedTrigrams = getRepeatedNGrams(text, 3);
  const sentenceOpenings = getSentenceOpenings(text);
  const transitionDensity = getTransitionWordDensity(text);
  const exclamationFrequency = getExclamationFrequency(text);
  const questionFrequency = getQuestionFrequency(text);
  const punctuation = getPunctuationDistribution(text);
  const genericPhraseDensity = getGenericPhraseDensity(text);

  return {
    ...basic,
    repeatedWords: Object.fromEntries(repeatedWords),
    repeatedBigrams: Object.fromEntries(repeatedBigrams),
    repeatedTrigrams: Object.fromEntries(repeatedTrigrams),
    sentenceOpenings: Object.fromEntries(sentenceOpenings),
    transitionDensity,
    exclamationFrequency,
    questionFrequency,
    punctuation,
    genericPhraseDensity,
  };
}
