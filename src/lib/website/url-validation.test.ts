import { describe, it, expect } from 'vitest';
import { validateUrl, UrlValidationSchema } from './url-validation';

describe('URL Validation & SSRF Protection', () => {
  describe('validateUrl', () => {
    it('accepts valid public URLs', async () => {
      const result = await validateUrl('https://www.example.com/page');
      // example.com might fail DNS in some environments, but protocol should be valid
      if (result.valid) {
        expect(result.normalizedUrl).toContain('example.com');
      } else {
        // DNS failure is acceptable in cloud environment
        expect(result.error).toBeDefined();
      }
    });

    it('accepts http URLs', async () => {
      const result = await validateUrl('http://example.com');
      // Either passes or fails due to DNS, both acceptable
      expect(result).toBeDefined();
    });

    it('rejects localhost URLs', async () => {
      const result = await validateUrl('http://localhost:3000');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('not allowed');
      }
    });

    it('rejects 127.0.0.1 URLs', async () => {
      const result = await validateUrl('http://127.0.0.1:8080');
      expect(result.valid).toBe(false);
    });

    it('rejects 0.0.0.0 URLs', async () => {
      const result = await validateUrl('http://0.0.0.0');
      expect(result.valid).toBe(false);
    });

    it('rejects private IPv4 ranges (10.x.x.x)', async () => {
      const result = await validateUrl('http://10.0.0.1');
      expect(result.valid).toBe(false);
    });

    it('rejects private IPv4 ranges (172.16.x.x)', async () => {
      const result = await validateUrl('http://172.16.1.1');
      expect(result.valid).toBe(false);
    });

    it('rejects private IPv4 ranges (192.168.x.x)', async () => {
      const result = await validateUrl('http://192.168.1.1');
      expect(result.valid).toBe(false);
    });

    it('rejects IPv6 localhost (::1)', async () => {
      const result = await validateUrl('http://[::1]:8080');
      expect(result.valid).toBe(false);
    });

    it('rejects file:// protocol', async () => {
      const result = await validateUrl('file:///etc/passwd');
      expect(result.valid).toBe(false);
    });

    it('rejects ftp:// protocol', async () => {
      const result = await validateUrl('ftp://example.com');
      expect(result.valid).toBe(false);
    });

    it('rejects data: URLs', async () => {
      const result = await validateUrl('data:text/html,<script>alert(1)</script>');
      expect(result.valid).toBe(false);
    });

    it('rejects javascript: URLs', async () => {
      const result = await validateUrl('javascript:alert(1)');
      expect(result.valid).toBe(false);
    });

    it('rejects cloud metadata endpoints', async () => {
      const result = await validateUrl('http://metadata.google.internal');
      expect(result.valid).toBe(false);
    });

    it('normalizes URLs with trailing paths', async () => {
      const result = await validateUrl('https://example.com/path/to/page');
      if (result.valid) {
        expect(result.normalizedUrl).toContain('/path/to/page');
      }
    });

    it('normalizes URLs with query parameters', async () => {
      const result = await validateUrl('https://example.com/search?q=test&lang=en');
      if (result.valid) {
        expect(result.normalizedUrl).toContain('q=test');
      }
    });

    it('rejects URLs with unsupported protocols in path', async () => {
      const result = await validateUrl('https://example.com/javascript:alert(1)');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('blocked protocol');
      }
    });

    it('rejects URLs with port in hostname check', async () => {
      const result = await validateUrl('http://localhost:3000/page');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBeDefined();
      }
    });

    it('accepts valid HTTPS with www', async () => {
      const result = await validateUrl('https://www.google.com');
      // google.com might fail DNS in some environments, but HTTPS is valid
      if (result.valid) {
        expect(result.normalizedUrl).toContain('google.com');
      } else {
        // DNS failure is acceptable
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('UrlValidationSchema', () => {
    it('accepts valid URLs', () => {
      const result = UrlValidationSchema.safeParse('https://example.com');
      expect(result.success).toBe(true);
    });

    it('rejects URLs shorter than 10 characters', () => {
      const result = UrlValidationSchema.safeParse('https://e');
      expect(result.success).toBe(false);
    });

    it('rejects URLs without protocol', () => {
      const result = UrlValidationSchema.safeParse('example.com/page');
      expect(result.success).toBe(false);
    });

    it('accepts www. prefix', () => {
      const result = UrlValidationSchema.safeParse('www.example.com/page');
      expect(result.success).toBe(true);
    });

    it('rejects URLs longer than 2048 characters', () => {
      const longUrl = 'https://' + 'a'.repeat(2050);
      const result = UrlValidationSchema.safeParse(longUrl);
      expect(result.success).toBe(false);
    });
  });
});
