/**
 * Protected Content Extraction
 * Identifies and extracts entities, numbers, URLs, and locked phrases
 * that must be preserved during humanisation
 */

import { z } from 'zod';

/**
 * Extract values from text using a regex pattern with context
 */
function extractMatches(
  text: string,
  pattern: RegExp,
  contextLength: number = 50
): Array<{ value: string; context: string }> {
  const matches: Array<{ value: string; context: string }> = [];

  // Create global version of pattern for matching all occurrences
  const globalPattern = new RegExp(pattern.source, 'g' + pattern.flags.replace(/g/g, ''));
  let match;

  while ((match = globalPattern.exec(text)) !== null) {
    const value = match[0];
    const index = match.index;
    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + value.length + contextLength);
    const context = text.substring(start, end).trim();

    matches.push({ value, context });
  }

  return matches;
}

export const ProtectedContentSchema = z.object({
  entities: z.array(z.object({
    type: z.enum(['person', 'company', 'brand', 'product', 'location']),
    value: z.string(),
    count: z.number(),
  })).default([]),
  numbers: z.array(z.object({
    value: z.string(),
    context: z.string(),
  })).default([]),
  dates: z.array(z.object({
    value: z.string(),
    context: z.string(),
  })).default([]),
  urls: z.array(z.object({
    value: z.string(),
    context: z.string(),
  })).default([]),
  emails: z.array(z.object({
    value: z.string(),
    context: z.string(),
  })).default([]),
  phones: z.array(z.object({
    value: z.string(),
    context: z.string(),
  })).default([]),
  prices: z.array(z.object({
    value: z.string(),
    context: z.string(),
  })).default([]),
  percentages: z.array(z.object({
    value: z.string(),
    context: z.string(),
  })).default([]),
  keywords: z.array(z.string()).default([]),
  lockedPhrases: z.array(z.string()).default([]),
  claims: z.array(z.object({
    text: z.string(),
    type: z.enum(['statistic', 'benefit', 'specification', 'testimonial']),
    requiresVerification: z.boolean(),
  })).default([]),
});

export type ProtectedContent = z.infer<typeof ProtectedContentSchema>;

/**
 * Main extraction function
 */
export function extractProtectedContent(
  text: string,
  options?: {
    keywords?: string[];
    lockedPhrases?: string[];
  }
): ProtectedContent {
  const protected_content: ProtectedContent = {
    entities: [],
    numbers: [],
    dates: [],
    urls: [],
    emails: [],
    phones: [],
    prices: [],
    percentages: [],
    keywords: options?.keywords ? [...options.keywords] : [],
    lockedPhrases: options?.lockedPhrases ? [...options.lockedPhrases] : [],
    claims: [],
  };

  // Extract URLs
  protected_content.urls = extractMatches(
    text,
    /https?:\/\/[^\s<>"{}|\\^`[\]]*|www\.[^\s<>"{}|\\^`[\]]*/i
  );

  // Extract emails
  protected_content.emails = extractMatches(
    text,
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  );

  // Extract phone numbers
  protected_content.phones = extractMatches(
    text,
    /(?:\+\d{1,3}[-.\s]?)?\(??\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{2,4}/
  );

  // Extract prices
  protected_content.prices = extractMatches(
    text,
    /[₹$€£¥]\s*\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:₹|$|€|£|¥)/
  );

  // Extract percentages
  protected_content.percentages = extractMatches(
    text,
    /\d+(?:\.\d{1,2})?\s*%/
  );

  // Extract dates
  protected_content.dates = extractMatches(
    text,
    /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}|(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2},? \d{4}/i
  );

  // Extract numbers
  protected_content.numbers = extractMatches(
    text,
    /\b\d+(?:,\d{3})*(?:\.\d+)?\b/
  );

  // Validate keywords exist in text (if provided)
  if (options?.keywords) {
    protected_content.keywords = options.keywords.filter(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // Validate locked phrases exist in text (if provided)
  if (options?.lockedPhrases) {
    protected_content.lockedPhrases = options.lockedPhrases.filter(phrase =>
      text.includes(phrase)
    );
  }

  // Validate schema
  return ProtectedContentSchema.parse(protected_content);
}

/**
 * Check if text contains protected content elements
 */
export function validateProtectedContent(
  original: string,
  rewritten: string,
  protected_content: ProtectedContent
): {
  status: 'passed' | 'warning' | 'failed';
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check URLs
  for (const url of protected_content.urls) {
    if (!rewritten.includes(url.value)) {
      missing.push(`URL: ${url.value}`);
    }
  }

  // Check emails
  for (const email of protected_content.emails) {
    if (!rewritten.includes(email.value)) {
      missing.push(`Email: ${email.value}`);
    }
  }

  // Check phones
  for (const phone of protected_content.phones) {
    if (!rewritten.includes(phone.value)) {
      missing.push(`Phone: ${phone.value}`);
    }
  }

  // Check prices
  for (const price of protected_content.prices) {
    if (!rewritten.includes(price.value)) {
      missing.push(`Price: ${price.value}`);
    }
  }

  // Check percentages
  for (const percentage of protected_content.percentages) {
    if (!rewritten.includes(percentage.value)) {
      missing.push(`Percentage: ${percentage.value}`);
    }
  }

  // Check dates
  for (const date of protected_content.dates) {
    if (!rewritten.includes(date.value)) {
      missing.push(`Date: ${date.value}`);
    }
  }

  // Check keywords
  for (const keyword of protected_content.keywords) {
    if (!rewritten.toLowerCase().includes(keyword.toLowerCase())) {
      warnings.push(`Primary keyword missing: ${keyword}`);
    }
  }

  // Check locked phrases
  for (const phrase of protected_content.lockedPhrases) {
    if (!rewritten.includes(phrase)) {
      missing.push(`Locked phrase: ${phrase}`);
    }
  }

  const status = missing.length > 0 ? 'failed' : warnings.length > 0 ? 'warning' : 'passed';
  return { status, missing, warnings };
}
