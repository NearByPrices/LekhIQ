import { describe, it, expect } from 'vitest';
import {
  extractProtectedContent,
  validateProtectedContent,
  ProtectedContentSchema,
} from './protected-content';

describe('Protected Content Extraction', () => {
  describe('URL extraction', () => {
    it('extracts http URLs', () => {
      const text = 'Visit https://example.com for more information';
      const result = extractProtectedContent(text);
      expect(result.urls).toContainEqual(
        expect.objectContaining({ value: 'https://example.com' })
      );
    });

    it('extracts https URLs', () => {
      const text = 'Go to https://github.com/example for code';
      const result = extractProtectedContent(text);
      expect(result.urls).toContainEqual(
        expect.objectContaining({ value: 'https://github.com/example' })
      );
    });

    it('extracts www URLs', () => {
      const text = 'Check www.example.com today';
      const result = extractProtectedContent(text);
      expect(result.urls.length).toBeGreaterThan(0);
      expect(result.urls[0].value).toContain('www');
    });
  });

  describe('Email extraction', () => {
    it('extracts email addresses', () => {
      const text = 'Contact us at support@example.com';
      const result = extractProtectedContent(text);
      expect(result.emails).toContainEqual(
        expect.objectContaining({ value: 'support@example.com' })
      );
    });

    it('extracts multiple emails', () => {
      const text = 'Email sales@example.com or support@example.com';
      const result = extractProtectedContent(text);
      expect(result.emails.length).toBe(2);
    });
  });

  describe('Phone number extraction', () => {
    it('extracts phone numbers', () => {
      const text = 'Call us at +91 9876 543210';
      const result = extractProtectedContent(text);
      expect(result.phones.length).toBeGreaterThan(0);
    });
  });

  describe('Price extraction', () => {
    it('extracts rupee prices', () => {
      const text = 'The product costs ₹1,299.99';
      const result = extractProtectedContent(text);
      expect(result.prices.length).toBeGreaterThan(0);
      expect(result.prices[0].value).toContain('₹');
    });

    it('extracts dollar prices', () => {
      const text = 'Price: $99.99';
      const result = extractProtectedContent(text);
      expect(result.prices.length).toBeGreaterThan(0);
      expect(result.prices[0].value).toContain('$');
    });

    it('extracts prices with commas', () => {
      const text = 'Cost is ₹10,000 per month';
      const result = extractProtectedContent(text);
      expect(result.prices.length).toBeGreaterThan(0);
    });
  });

  describe('Percentage extraction', () => {
    it('extracts percentages', () => {
      const text = 'Success rate increased by 45%';
      const result = extractProtectedContent(text);
      expect(result.percentages).toContainEqual(
        expect.objectContaining({ value: '45%' })
      );
    });

    it('extracts decimal percentages', () => {
      const text = 'Growth of 23.5% year-over-year';
      const result = extractProtectedContent(text);
      expect(result.percentages.length).toBeGreaterThan(0);
    });
  });

  describe('Date extraction', () => {
    it('extracts dates in DD/MM/YYYY format', () => {
      const text = 'Launch date: 15/01/2024';
      const result = extractProtectedContent(text);
      expect(result.dates.length).toBeGreaterThan(0);
    });

    it('extracts dates in YYYY-MM-DD format', () => {
      const text = 'Deadline: 2024-12-31';
      const result = extractProtectedContent(text);
      expect(result.dates.length).toBeGreaterThan(0);
    });

    it('extracts written dates', () => {
      const text = 'Meeting on January 15, 2024';
      const result = extractProtectedContent(text);
      expect(result.dates.length).toBeGreaterThan(0);
    });
  });

  describe('Number extraction', () => {
    it('extracts integers', () => {
      const text = 'We have 500 customers';
      const result = extractProtectedContent(text);
      expect(result.numbers).toContainEqual(
        expect.objectContaining({ value: '500' })
      );
    });

    it('extracts numbers with commas', () => {
      const text = 'Revenue: ₹1,00,000 annually';
      const result = extractProtectedContent(text);
      expect(result.numbers.length).toBeGreaterThan(0);
    });

    it('extracts decimal numbers', () => {
      const text = 'Rating: 4.5 stars';
      const result = extractProtectedContent(text);
      expect(result.numbers).toContainEqual(
        expect.objectContaining({ value: '4.5' })
      );
    });
  });

  describe('Keyword extraction', () => {
    it('extracts provided keywords', () => {
      const text = 'Our AI solution provides machine learning capabilities';
      const result = extractProtectedContent(text, {
        keywords: ['machine learning', 'AI'],
      });
      expect(result.keywords).toContain('machine learning');
      expect(result.keywords).toContain('AI');
    });

    it('handles case-insensitive keyword matching', () => {
      const text = 'This uses Artificial Intelligence';
      const result = extractProtectedContent(text, {
        keywords: ['artificial intelligence'],
      });
      expect(result.keywords).toContain('artificial intelligence');
    });
  });

  describe('Locked phrases extraction', () => {
    it('extracts locked phrases', () => {
      const text = 'Our unique value proposition is core to everything we do';
      const result = extractProtectedContent(text, {
        lockedPhrases: ['unique value proposition'],
      });
      expect(result.lockedPhrases).toContain('unique value proposition');
    });

    it('handles multiple locked phrases', () => {
      const text = 'Enterprise solutions and best practices matter';
      const result = extractProtectedContent(text, {
        lockedPhrases: ['Enterprise solutions', 'best practices'],
      });
      expect(result.lockedPhrases).toContain('Enterprise solutions');
      expect(result.lockedPhrases).toContain('best practices');
    });
  });

  describe('Validation', () => {
    it('passes when all protected content is preserved', () => {
      const original = 'Visit https://example.com or email support@example.com';
      const rewritten = 'You can visit https://example.com or contact support@example.com';
      const protected_content = extractProtectedContent(original);

      const result = validateProtectedContent(original, rewritten, protected_content);
      expect(result.status).toBe('passed');
      expect(result.missing.length).toBe(0);
    });

    it('fails when URL is missing', () => {
      const original = 'Visit https://example.com';
      const rewritten = 'Please visit the website';
      const protected_content = extractProtectedContent(original);

      const result = validateProtectedContent(original, rewritten, protected_content);
      expect(result.status).toBe('failed');
      expect(result.missing).toContainEqual(expect.stringContaining('https://example.com'));
    });

    it('warns when keyword is missing', () => {
      const original = 'Our AI solution is powerful';
      const rewritten = 'Our solution is very powerful';
      const protected_content = extractProtectedContent(original, {
        keywords: ['AI'],
      });

      const result = validateProtectedContent(original, rewritten, protected_content);
      expect(result.status).toBe('warning');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('fails when locked phrase is missing', () => {
      const original = 'This is our unique value proposition';
      const rewritten = 'This is our key selling point';
      const protected_content = extractProtectedContent(original, {
        lockedPhrases: ['unique value proposition'],
      });

      const result = validateProtectedContent(original, rewritten, protected_content);
      expect(result.status).toBe('failed');
      expect(result.missing).toContainEqual(
        expect.stringContaining('unique value proposition')
      );
    });

    it('fails when price is missing', () => {
      const original = 'Price is ₹999';
      const rewritten = 'Cost is very affordable';
      const protected_content = extractProtectedContent(original);

      const result = validateProtectedContent(original, rewritten, protected_content);
      expect(result.status).toBe('failed');
    });

    it('fails when percentage is missing', () => {
      const original = 'Growth improved by 50%';
      const rewritten = 'Growth improved significantly';
      const protected_content = extractProtectedContent(original);

      const result = validateProtectedContent(original, rewritten, protected_content);
      expect(result.status).toBe('failed');
    });
  });

  describe('Schema validation', () => {
    it('validates correct protected content structure', () => {
      const valid = {
        entities: [],
        numbers: [],
        dates: [],
        urls: [],
        emails: [],
        phones: [],
        prices: [],
        percentages: [],
        keywords: [],
        lockedPhrases: [],
        claims: [],
      };

      expect(() => ProtectedContentSchema.parse(valid)).not.toThrow();
    });

    it('provides default empty arrays', () => {
      const result = extractProtectedContent('');
      expect(result.urls).toEqual([]);
      expect(result.emails).toEqual([]);
      expect(result.keywords).toEqual([]);
    });
  });

  describe('Complex content', () => {
    it('extracts all protected content from product description', () => {
      const text = `
        Product: SmartHub Pro v2.5
        Price: ₹2,49,999
        Email: sales@example.com
        Website: https://example.com
        Success Rate: 98.5%
        Available from January 15, 2024
        Call: +91 9876543210
      `;

      const result = extractProtectedContent(text, {
        keywords: ['SmartHub Pro'],
        lockedPhrases: ['Success Rate'],
      });

      expect(result.prices.length).toBeGreaterThan(0);
      expect(result.emails.length).toBeGreaterThan(0);
      expect(result.urls.length).toBeGreaterThan(0);
      expect(result.percentages.length).toBeGreaterThan(0);
      expect(result.dates.length).toBeGreaterThan(0);
      expect(result.keywords).toContain('SmartHub Pro');
    });
  });
});
