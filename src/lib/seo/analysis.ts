/**
 * SEO Content Analysis Engine
 * Analyzes content for SEO-critical metrics and recommendations
 */

import type { ExtractedContent } from '../website/content-extraction';

export interface SeoMetrics {
  titlePresent: boolean;
  titleLength: number;
  titleOptimal: boolean;
  metaDescriptionPresent: boolean;
  metaDescriptionLength: number;
  metaDescriptionOptimal: boolean;
  h1Count: number;
  h1Optimal: boolean;
  h2Count: number;
  h3Count: number;
  headingHierarchyValid: boolean;
  contentLength: number;
  contentLengthCategory: 'thin' | 'adequate' | 'comprehensive';
  paragraphCount: number;
  averageParagraphLength: number;
  tooLongParagraphs: number;
  internalLinkCount: number;
  externalLinkCount: number;
  totalLinks: number;
  hasStructuredHeadings: boolean;
}

export interface KeywordAnalysis {
  keyword: string;
  frequency: number;
  inTitle: boolean;
  inH1: boolean;
  inFirstParagraph: boolean;
  inHeadings: boolean;
  inMetaDescription: boolean;
  distribution: 'good' | 'uneven' | 'absent';
  stuffingRisk: 'low' | 'medium' | 'high';
}

export interface SeoRecommendation {
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  actionable: string;
}

export interface SeoAnalysisResult {
  score: number; // 0-100
  metrics: SeoMetrics;
  primaryKeywordAnalysis: KeywordAnalysis | null;
  secondaryKeywordAnalysis: KeywordAnalysis[];
  recommendations: SeoRecommendation[];
  summary: {
    strengths: string[];
    weaknesses: string[];
  };
}

function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

function countWordFrequency(text: string, word: string): number {
  const normalized = normalizeText(text);
  const wordPattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
  const matches = normalized.match(wordPattern);
  return matches ? matches.length : 0;
}

function analyzeKeyword(
  keyword: string,
  content: ExtractedContent,
  allText: string
): KeywordAnalysis {
  const frequency = countWordFrequency(allText, keyword);

  const inTitle = countWordFrequency(content.title, keyword) > 0;
  const inH1 = content.h1.some(h => normalizeText(h).includes(normalizeText(keyword)));
  const inFirstParagraph = content.paragraphs[0]
    ? countWordFrequency(content.paragraphs[0], keyword) > 0
    : false;
  const inHeadings =
    inH1 ||
    content.h2.some(h => normalizeText(h).includes(normalizeText(keyword))) ||
    content.h3.some(h => normalizeText(h).includes(normalizeText(keyword)));
  const inMetaDescription = content.metaDescription
    ? countWordFrequency(content.metaDescription, keyword) > 0
    : false;

  // Determine distribution
  let distribution: 'good' | 'uneven' | 'absent' = 'absent';
  if (frequency === 0) {
    distribution = 'absent';
  } else if (frequency > 0 && frequency < 5 && (inTitle || inH1 || inFirstParagraph)) {
    distribution = 'good';
  } else if (frequency > 0) {
    distribution = 'uneven';
  }

  // Stuffing risk
  let stuffingRisk: 'low' | 'medium' | 'high' = 'low';
  const keywordDensity = (frequency / (allText.split(/\s+/).length || 1)) * 100;
  if (keywordDensity > 5) {
    stuffingRisk = 'high';
  } else if (keywordDensity > 2.5) {
    stuffingRisk = 'medium';
  }

  return {
    keyword,
    frequency,
    inTitle,
    inH1,
    inFirstParagraph,
    inHeadings,
    inMetaDescription,
    distribution,
    stuffingRisk,
  };
}

export function analyzeSeoContent(
  content: ExtractedContent,
  primaryKeyword?: string,
  secondaryKeywords?: string[]
): SeoAnalysisResult {
  const allText = `${content.title} ${content.metaDescription || ''} ${content.h1.join(' ')} ${content.h2.join(' ')} ${content.h3.join(' ')} ${content.paragraphs.join(' ')}`;

  // Metrics
  const titleLength = content.metaTitle?.length || 0;
  const metaDescriptionLength = content.metaDescription?.length || 0;
  const contentLength = content.wordCount;

  const metrics: SeoMetrics = {
    titlePresent: !!content.metaTitle,
    titleLength,
    titleOptimal: titleLength > 30 && titleLength < 60,
    metaDescriptionPresent: !!content.metaDescription,
    metaDescriptionLength,
    metaDescriptionOptimal: metaDescriptionLength > 120 && metaDescriptionLength < 160,
    h1Count: content.h1.length,
    h1Optimal: content.h1.length === 1,
    h2Count: content.h2.length,
    h3Count: content.h3.length,
    headingHierarchyValid: isHeadingHierarchyValid(content),
    contentLength,
    contentLengthCategory: categorizeContentLength(contentLength),
    paragraphCount: content.paragraphs.length,
    averageParagraphLength: content.paragraphs.length > 0
      ? Math.round(content.paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / content.paragraphs.length)
      : 0,
    tooLongParagraphs: content.paragraphs.filter(p => p.split(/\s+/).length > 100).length,
    internalLinkCount: content.links.internal.length,
    externalLinkCount: content.links.external.length,
    totalLinks: content.links.internal.length + content.links.external.length,
    hasStructuredHeadings: content.h2.length > 0,
  };

  // Keyword analysis
  const primaryKeywordAnalysis = primaryKeyword ? analyzeKeyword(primaryKeyword, content, allText) : null;
  const secondaryKeywordAnalysis = (secondaryKeywords || []).map(kw => analyzeKeyword(kw, content, allText));

  // Recommendations
  const recommendations: SeoRecommendation[] = [];

  // Title recommendations
  if (!metrics.titlePresent) {
    recommendations.push({
      issue: 'Missing title tag',
      severity: 'critical',
      actionable: 'Add a descriptive title tag (30-60 characters)',
    });
  } else if (!metrics.titleOptimal) {
    recommendations.push({
      issue: `Title length is ${titleLength} characters`,
      severity: 'high',
      actionable: 'Keep title between 30-60 characters for optimal display',
    });
  }

  // Meta description recommendations
  if (!metrics.metaDescriptionPresent) {
    recommendations.push({
      issue: 'Missing meta description',
      severity: 'high',
      actionable: 'Add a meta description (120-160 characters)',
    });
  } else if (!metrics.metaDescriptionOptimal) {
    recommendations.push({
      issue: `Meta description is ${metaDescriptionLength} characters`,
      severity: 'medium',
      actionable: 'Keep meta description between 120-160 characters',
    });
  }

  // H1 recommendations
  if (metrics.h1Count === 0) {
    recommendations.push({
      issue: 'Missing H1 heading',
      severity: 'critical',
      actionable: 'Add one clear H1 heading that describes the page topic',
    });
  } else if (metrics.h1Count > 1) {
    recommendations.push({
      issue: `Page has ${metrics.h1Count} H1 headings`,
      severity: 'high',
      actionable: 'Use only one H1 per page; convert others to H2',
    });
  }

  // Heading hierarchy
  if (!metrics.headingHierarchyValid) {
    recommendations.push({
      issue: 'Heading hierarchy is broken',
      severity: 'medium',
      actionable: 'Fix heading structure (H1 → H2 → H3, no skips)',
    });
  }

  // Content length
  if (metrics.contentLengthCategory === 'thin') {
    recommendations.push({
      issue: `Content is only ${contentLength} words`,
      severity: 'high',
      actionable: 'Expand content to at least 300 words for better SEO performance',
    });
  }

  // Paragraph length
  if (metrics.tooLongParagraphs > 0) {
    recommendations.push({
      issue: `${metrics.tooLongParagraphs} paragraph(s) exceed 100 words`,
      severity: 'medium',
      actionable: 'Break up long paragraphs for better readability',
    });
  }

  // Links
  if (metrics.totalLinks === 0) {
    recommendations.push({
      issue: 'No internal or external links',
      severity: 'medium',
      actionable: 'Add relevant internal and external links',
    });
  }

  // Keyword recommendations
  if (primaryKeywordAnalysis) {
    if (primaryKeywordAnalysis.frequency === 0) {
      recommendations.push({
        issue: `Primary keyword "${primaryKeyword}" is not present`,
        severity: 'high',
        actionable: `Include "${primaryKeyword}" naturally in title, H1, and opening paragraph`,
      });
    } else if (primaryKeywordAnalysis.stuffingRisk === 'high') {
      recommendations.push({
        issue: `Keyword "${primaryKeyword}" appears too frequently`,
        severity: 'high',
        actionable: 'Reduce keyword frequency to avoid stuffing (target 1-2%)',
      });
    }
  }

  // Calculate score (0-100)
  let score = 100;

  // Deductions
  if (!metrics.titlePresent) score -= 15;
  else if (!metrics.titleOptimal) score -= 5;

  if (!metrics.metaDescriptionPresent) score -= 10;
  else if (!metrics.metaDescriptionOptimal) score -= 3;

  if (metrics.h1Count === 0) score -= 15;
  else if (metrics.h1Count > 1) score -= 5;

  if (!metrics.headingHierarchyValid) score -= 5;

  if (metrics.contentLengthCategory === 'thin') score -= 20;
  else if (metrics.contentLengthCategory === 'adequate') score -= 5;

  if (metrics.tooLongParagraphs > 2) score -= 5;

  if (metrics.totalLinks === 0) score -= 10;
  else if (metrics.totalLinks < 3) score -= 3;

  if (primaryKeywordAnalysis && primaryKeywordAnalysis.frequency === 0) score -= 15;
  else if (primaryKeywordAnalysis && primaryKeywordAnalysis.stuffingRisk === 'high') score -= 10;

  score = Math.max(0, Math.min(100, score));

  // Summary
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (metrics.titleOptimal) strengths.push('Well-optimized title');
  if (metrics.metaDescriptionOptimal) strengths.push('Good meta description');
  if (metrics.h1Optimal) strengths.push('Proper H1 structure');
  if (metrics.contentLengthCategory === 'comprehensive') strengths.push('Comprehensive content length');
  if (metrics.totalLinks > 5) strengths.push('Good link distribution');

  if (!metrics.titlePresent) weaknesses.push('Missing title tag');
  if (!metrics.metaDescriptionPresent) weaknesses.push('Missing meta description');
  if (metrics.h1Count === 0) weaknesses.push('No H1 heading');
  if (metrics.contentLengthCategory === 'thin') weaknesses.push('Thin content');
  if (metrics.totalLinks === 0) weaknesses.push('No internal/external links');

  return {
    score,
    metrics,
    primaryKeywordAnalysis,
    secondaryKeywordAnalysis,
    recommendations,
    summary: { strengths, weaknesses },
  };
}

function isHeadingHierarchyValid(content: ExtractedContent): boolean {
  if (content.h1.length === 0) return false;

  // Check for excessive gaps (e.g., H2 to H4 without H3)
  // This is a simplified check
  return true;
}

function categorizeContentLength(wordCount: number): 'thin' | 'adequate' | 'comprehensive' {
  if (wordCount < 300) return 'thin';
  if (wordCount < 1000) return 'adequate';
  return 'comprehensive';
}
