import { describe, it, expect } from 'vitest';
import { validateFile, detectFileType } from './parser';

describe('File Parser', () => {
  describe('validateFile', () => {
    it('rejects null file', () => {
      const result = validateFile(null, 'txt');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('No file provided');
      }
    });

    it('rejects empty file', () => {
      const file = new File([], 'empty.txt', { type: 'text/plain' });
      const result = validateFile(file, 'txt');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('empty');
      }
    });

    it('rejects files exceeding size limit', () => {
      const largeContent = new Uint8Array(51 * 1024 * 1024); // 51MB
      const file = new File([largeContent], 'large.txt', { type: 'text/plain' });
      const result = validateFile(file, 'txt');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('exceeds limit');
      }
    });

    it('rejects TXT file with wrong extension', () => {
      const file = new File(['content'], 'file.doc', { type: 'text/plain' });
      const result = validateFile(file, 'txt');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('extension');
      }
    });

    it('rejects DOCX file with wrong extension', () => {
      const file = new File(['content'], 'file.txt', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const result = validateFile(file, 'docx');
      expect(result.valid).toBe(false);
    });

    it('rejects PDF file with wrong extension', () => {
      const file = new File(['content'], 'file.txt', { type: 'application/pdf' });
      const result = validateFile(file, 'pdf');
      expect(result.valid).toBe(false);
    });

    it('accepts valid TXT file', () => {
      const file = new File(['content'], 'document.txt', { type: 'text/plain' });
      const result = validateFile(file, 'txt');
      expect(result.valid).toBe(true);
    });

    it('accepts valid DOCX file', () => {
      const file = new File(['content'], 'document.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const result = validateFile(file, 'docx');
      expect(result.valid).toBe(true);
    });

    it('accepts valid PDF file', () => {
      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const result = validateFile(file, 'pdf');
      expect(result.valid).toBe(true);
    });
  });

  describe('detectFileType', () => {
    it('detects TXT by extension', () => {
      const file = new File(['content'], 'document.txt', { type: 'text/plain' });
      expect(detectFileType(file)).toBe('txt');
    });

    it('detects DOCX by extension', () => {
      const file = new File(['content'], 'document.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      expect(detectFileType(file)).toBe('docx');
    });

    it('detects PDF by extension', () => {
      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      expect(detectFileType(file)).toBe('pdf');
    });

    it('detects TXT by MIME type', () => {
      const file = new File(['content'], 'document', { type: 'text/plain' });
      expect(detectFileType(file)).toBe('txt');
    });

    it('detects PDF by MIME type', () => {
      const file = new File(['content'], 'document', { type: 'application/pdf' });
      expect(detectFileType(file)).toBe('pdf');
    });

    it('returns null for unknown file type', () => {
      const file = new File(['content'], 'document.xyz', { type: 'application/octet-stream' });
      expect(detectFileType(file)).toBe(null);
    });
  });
});
