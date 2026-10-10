/**
 * Humanisation Service
 * Orchestrates the humanisation pipeline
 */

import { createGeminiProvider } from '@/lib/ai/providers/gemini';
import { extractProtectedContent, validateProtectedContent } from './protected-content';
import { createHumanisationPromptV1, HUMANISATION_PROMPT_VERSION } from '@/lib/ai/prompts/humanisation';
import type { HumanisationRequest, HumanisationResponse, HumanisationChange } from '@/types/humanisation';

interface HumanisationOptions extends HumanisationRequest {
  beforeAnalysis?: {
    aiScore?: number;
    qualityScore?: number;
    readabilityScore?: number;
    repetitionScore?: number;
  };
}

/**
 * Main humanisation function
 */
export async function humaniseContent(
  options: HumanisationOptions
): Promise<HumanisationResponse> {
  const startTime = Date.now();

  // Step 1: Extract protected content
  const protectedContent = extractProtectedContent(options.originalText, {
    keywords: options.primaryKeyword ? [options.primaryKeyword] : undefined,
    lockedPhrases: options.lockedPhrases,
  });

  // Step 2: Build humanisation prompt
  const prompt = createHumanisationPromptV1(
    options.originalText,
    options.rewriteMode,
    options.tone,
    {
      primaryKeyword: options.primaryKeyword,
      secondaryKeywords: options.secondaryKeywords,
      protectedElements: {
        urls: protectedContent.urls.map(u => u.value),
        emails: protectedContent.emails.map(e => e.value),
        phones: protectedContent.phones.map(p => p.value),
        prices: protectedContent.prices.map(p => p.value),
        percentages: protectedContent.percentages.map(p => p.value),
        keywords: protectedContent.keywords,
        lockedPhrases: protectedContent.lockedPhrases,
      },
    }
  );

  // Step 3: Call Gemini for rewriting
  let rewrittenContent: string;
  try {
    const gemini = createGeminiProvider() as any;
    const response = await gemini.rewriteContent(prompt);
    rewrittenContent = response.trim();
  } catch (error) {
    throw new Error(
      `Gemini rewriting failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // Step 4: Validate rewritten content
  const validation = validateProtectedContent(
    options.originalText,
    rewrittenContent,
    protectedContent
  );

  // Step 5: Corrective retry if validation failed (max 1 retry)
  let attemptCount = 1;
  if (validation.status === 'failed' && attemptCount < 2) {
    attemptCount++;
    const retryPrompt = createCorrectiveRetryPrompt(
      options.originalText,
      rewrittenContent,
      validation.missing,
      options.rewriteMode,
      options.tone
    );

    try {
      const gemini = createGeminiProvider() as any;
      const retryResponse = await gemini.rewriteContent(retryPrompt);
      const retryContent = retryResponse.trim();

      const retryValidation = validateProtectedContent(
        options.originalText,
        retryContent,
        protectedContent
      );

      if (retryValidation.status !== 'failed') {
        rewrittenContent = retryContent;
      }
    } catch (error) {
      // Fail silently - use original rewrite
      console.warn('Corrective retry failed, using original rewrite');
    }
  }

  // Re-validate after potential retry
  const validationResult = validateProtectedContent(
    options.originalText,
    rewrittenContent,
    protectedContent
  );

  const finalValidation = {
    ...validationResult,
    factsPreserved: validationResult.status !== 'failed',
    numbersPreserved: !validationResult.missing.some(m => m.includes('Number')),
    entitiesPreserved: !validationResult.missing.some(m => m.includes('Email') || m.includes('Phone')),
    keywordsPreserved: validationResult.warnings.length === 0,
    urlsPreserved: !validationResult.missing.some(m => m.includes('URL')),
    missingElements: validationResult.missing,
    addedClaims: [],
  };

  // Step 6: Build changes list (simplified - Gemini doesn't always provide this)
  const changes: HumanisationChange[] = identifyChanges(
    options.originalText,
    rewrittenContent
  );

  // Step 7: Calculate preserved elements
  const preservedElements = {
    urls: protectedContent.urls.map(u => u.value).filter(url => rewrittenContent.includes(url)),
    emails: protectedContent.emails.map(e => e.value).filter(e => rewrittenContent.includes(e)),
    phones: protectedContent.phones.map(p => p.value).filter(p => rewrittenContent.includes(p)),
    keywords: protectedContent.keywords.filter(k => rewrittenContent.toLowerCase().includes(k.toLowerCase())),
    lockedPhrases: protectedContent.lockedPhrases.filter(p => rewrittenContent.includes(p)),
    numbers: protectedContent.numbers
      .map(n => n.value)
      .filter(n => rewrittenContent.includes(n)),
    prices: protectedContent.prices.map(p => p.value).filter(p => rewrittenContent.includes(p)),
  };

  const processingTime = Date.now() - startTime;

  return {
    rewrittenContent,
    mode: options.rewriteMode,
    tone: options.tone,
    changes,
    validation: finalValidation,
    preservedElements,
    warnings: finalValidation.warnings,
    processingMetadata: {
      originalLength: options.originalText.length,
      rewrittenLength: rewrittenContent.length,
      modelName: 'gemini-3.8-flash',
      promptVersion: HUMANISATION_PROMPT_VERSION,
      processingTime,
    },
  };
}

/**
 * Create a corrective retry prompt when validation fails
 */
function createCorrectiveRetryPrompt(
  original: string,
  rewritten: string,
  missingElements: string[],
  mode: string,
  tone: string
): string {
  return `You previously rewrote content. However, the rewrite is missing these critical elements:
${missingElements.join('\n')}

Please provide a corrected version that includes all missing elements while maintaining the improved writing quality.

IMPORTANT: Do NOT change the tone or overall improvements - just fix the missing elements.

ORIGINAL:
${original}

PREVIOUS REWRITE:
${rewritten}

CORRECTED REWRITE (with all missing elements restored):`;
}

/**
 * Identify what changed between original and rewrite
 * Simple heuristic-based approach
 */
function identifyChanges(original: string, rewritten: string): HumanisationChange[] {
  const changes: HumanisationChange[] = [];

  // Check for length reduction (removed filler)
  if (rewritten.length < original.length * 0.95) {
    changes.push({
      type: 'length_optimized',
      description: `Content reduced from ${original.length} to ${rewritten.length} characters by removing filler`,
    });
  }

  // Check for improved flow (sentence count changed)
  const originalSentences = (original.match(/[.!?]+/g) || []).length;
  const rewrittenSentences = (rewritten.match(/[.!?]+/g) || []).length;

  if (Math.abs(rewrittenSentences - originalSentences) > 2) {
    changes.push({
      type: 'flow_improved',
      description: `Improved sentence structure and paragraph flow`,
    });
  }

  // Check for reduced repetition (word frequency)
  const originalWords = original.toLowerCase().split(/\s+/);
  const rewrittenWords = rewritten.toLowerCase().split(/\s+/);

  const originalRepetition = countRepetitiveWords(originalWords);
  const rewrittenRepetition = countRepetitiveWords(rewrittenWords);

  if (rewrittenRepetition < originalRepetition) {
    changes.push({
      type: 'repetition_reduced',
      description: `Reduced repetitive phrasing and word patterns`,
    });
  }

  if (changes.length === 0) {
    changes.push({
      type: 'clarity_improved',
      description: `Improved overall clarity and readability`,
    });
  }

  return changes;
}

/**
 * Count repetitive words (words appearing more than 3 times)
 */
function countRepetitiveWords(words: string[]): number {
  const frequency = new Map<string, number>();
  for (const word of words) {
    if (word.length > 3) {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    }
  }

  let count = 0;
  for (const freq of frequency.values()) {
    if (freq > 3) count++;
  }
  return count;
}
