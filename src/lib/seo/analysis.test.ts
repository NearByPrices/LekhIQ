import { describe, it, expect } from 'vitest';
import { analyzeSeoContent, type SeoAnalysisResult } from './analysis';
import type { ExtractedContent } from '../website/content-extraction';

describe('SEO Content Analysis', () => {
  const mockContent: ExtractedContent = {
    title: 'Best Guide to Web Development',
    metaTitle: 'Best Guide to Web Development 2024',
    metaDescription: 'Comprehensive guide to modern web development with React, TypeScript, and Node.js',
    canonicalUrl: 'https://example.com/web-development-guide',
    h1: ['The Complete Guide to Web Development'],
    h2: ['Getting Started', 'Advanced Patterns', 'Best Practices'],
    h3: ['Setup Process', 'Configuration', 'Debugging Tips'],
    paragraphs: [
      'Web development has evolved significantly in the past decade. This guide covers the essential skills and knowledge needed to become a modern web developer.',
      'Before diving into code, understand the fundamentals of HTML, CSS, and JavaScript. These form the foundation of all web applications.',
      'React has become one of the most popular libraries for building user interfaces. It provides a component-based approach to building interactive applications.',
      'TypeScript adds type safety to JavaScript, helping catch errors during development rather than at runtime.',
      'Node.js allows developers to use JavaScript on the backend, creating full-stack applications with a single language.',
    ],
    lists: ['HTML basics', 'CSS layouts', 'JavaScript fundamentals', 'React components', 'TypeScript types'],
    mainText: 'Web development guide content',
    wordCount: 450,
    characterCount: 2500,
    extractionMethod: 'static',
    extractionQuality: 'high',
    links: {
      internal: [
        { text: 'React Guide', href: 'https://example.com/react' },
        { text: 'TypeScript Tutorial', href: 'https://example.com/typescript' },
        { text: 'Node.js Basics', href: 'https://example.com/nodejs' },
      ],
      external: [
        { text: 'React Docs', href: 'https://react.dev' },
        { text: 'TypeScript Handbook', href: 'https://www.typescriptlang.org/docs/' },
      ],
    },
    metadata: {
      author: 'John Doe',
      publishedDate: '2024-01-01',
    },
  };

  describe('analyzeSeoContent', () => {
    it('returns a valid SEO analysis result', () => {
      const result = analyzeSeoContent(mockContent);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.metrics).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('detects proper title optimization', () => {
      const result = analyzeSeoContent(mockContent);

      expect(result.metrics.titlePresent).toBe(true);
      expect(result.metrics.titleOptimal).toBe(true);
    });

    it('detects proper meta description optimization', () => {
      const result = analyzeSeoContent(mockContent);

      expect(result.metrics.metaDescriptionPresent).toBe(true);
      // Meta description length check
      expect(result.metrics.metaDescriptionLength).toBeGreaterThan(0);
      expect(result.metrics.metaDescriptionLength).toBeLessThan(200);
    });

    it('detects proper H1 structure', () => {
      const result = analyzeSeoContent(mockContent);

      expect(result.metrics.h1Count).toBe(1);
      expect(result.metrics.h1Optimal).toBe(true);
    });

    it('recommends adding title when missing', () => {
      const contentWithoutTitle = { ...mockContent, metaTitle: null };
      const result = analyzeSeoContent(contentWithoutTitle);

      const titleRecommendation = result.recommendations.find(r => r.issue.includes('title'));
      expect(titleRecommendation).toBeDefined();
      expect(titleRecommendation?.severity).toBe('critical');
    });

    it('recommends adding meta description when missing', () => {
      const contentWithoutDesc = { ...mockContent, metaDescription: null };
      const result = analyzeSeoContent(contentWithoutDesc);

      const descRecommendation = result.recommendations.find(r => r.issue.includes('meta description'));
      expect(descRecommendation).toBeDefined();
      expect(descRecommendation?.severity).toBe('high');
    });

    it('recommends adding H1 when missing', () => {
      const contentWithoutH1 = { ...mockContent, h1: [] };
      const result = analyzeSeoContent(contentWithoutH1);

      const h1Recommendation = result.recommendations.find(r => r.issue.includes('H1'));
      expect(h1Recommendation).toBeDefined();
      expect(h1Recommendation?.severity).toBe('critical');
    });

    it('detects multiple H1 headings as issue', () => {
      const contentWithMultipleH1 = {
        ...mockContent,
        h1: ['Heading 1', 'Heading 2'],
      };
      const result = analyzeSeoContent(contentWithMultipleH1);

      expect(result.metrics.h1Count).toBe(2);
      expect(result.metrics.h1Optimal).toBe(false);

      const h1Recommendation = result.recommendations.find(r => r.issue.includes('H1'));
      expect(h1Recommendation).toBeDefined();
    });

    it('categorizes content length correctly', () => {
      const shortContent = { ...mockContent, wordCount: 200 };
      const result = analyzeSeoContent(shortContent);

      expect(result.metrics.contentLengthCategory).toBe('thin');

      const thinContentRecommendation = result.recommendations.find(r => r.issue.includes('words'));
      expect(thinContentRecommendation).toBeDefined();
      expect(thinContentRecommendation?.severity).toBe('high');
    });

    it('analyzes primary keyword when provided', () => {
      const result = analyzeSeoContent(mockContent, 'web development');

      expect(result.primaryKeywordAnalysis).toBeDefined();
      expect(result.primaryKeywordAnalysis?.keyword).toBe('web development');
      expect(result.primaryKeywordAnalysis?.frequency).toBeGreaterThan(0);
    });

    it('detects keyword in H1', () => {
      const result = analyzeSeoContent(mockContent, 'web development');

      expect(result.primaryKeywordAnalysis?.inH1).toBe(true);
    });

    it('detects keyword in title', () => {
      const result = analyzeSeoContent(mockContent, 'web development');

      expect(result.primaryKeywordAnalysis?.inTitle).toBe(true);
    });

    it('recommends adding keyword when absent', () => {
      const result = analyzeSeoContent(mockContent, 'machine learning');

      expect(result.primaryKeywordAnalysis?.frequency).toBe(0);

      const keywordRecommendation = result.recommendations.find(r =>
        r.issue.includes('machine learning') && r.issue.includes('not present')
      );
      expect(keywordRecommendation).toBeDefined();
    });

    it('analyzes secondary keywords', () => {
      const result = analyzeSeoContent(mockContent, 'web development', ['React', 'TypeScript']);

      expect(result.secondaryKeywordAnalysis.length).toBe(2);
      expect(result.secondaryKeywordAnalysis[0].keyword).toBe('React');
      expect(result.secondaryKeywordAnalysis[1].keyword).toBe('TypeScript');
    });

    it('counts links correctly', () => {
      const result = analyzeSeoContent(mockContent);

      expect(result.metrics.internalLinkCount).toBe(3);
      expect(result.metrics.externalLinkCount).toBe(2);
      expect(result.metrics.totalLinks).toBe(5);
    });

    it('detects proper heading structure', () => {
      const result = analyzeSeoContent(mockContent);

      expect(result.metrics.h2Count).toBe(3);
      expect(result.metrics.h3Count).toBe(3);
      expect(result.metrics.hasStructuredHeadings).toBe(true);
    });

    it('includes strengths in summary', () => {
      const result = analyzeSeoContent(mockContent);

      expect(result.summary.strengths.length).toBeGreaterThan(0);
      expect(result.summary.strengths.some(s => s.includes('title'))).toBe(true);
    });

    it('includes weaknesses when applicable', () => {
      const poorContent = {
        ...mockContent,
        metaTitle: null,
        h1: [],
        wordCount: 100,
      };
      const result = analyzeSeoContent(poorContent);

      expect(result.summary.weaknesses.length).toBeGreaterThan(0);
    });

    it('returns high score for well-optimized content', () => {
      const result = analyzeSeoContent(mockContent);

      expect(result.score).toBeGreaterThan(70);
    });

    it('returns low score for poorly optimized content', () => {
      const poorContent = {
        ...mockContent,
        metaTitle: null,
        metaDescription: null,
        h1: [],
        wordCount: 100,
        links: { internal: [], external: [] },
      };
      const result = analyzeSeoContent(poorContent);

      expect(result.score).toBeLessThan(50);
    });
  });
});
