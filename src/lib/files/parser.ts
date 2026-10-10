/**
 * File Parsing Module
 * Supports TXT, DOCX, and PDF files
 */

import { mammoth } from 'mammoth';
import pdfParse from 'pdf-parse';

export interface ParsedFile {
  filename: string;
  fileType: 'txt' | 'docx' | 'pdf';
  content: string;
  title?: string;
  metadata: {
    size: number;
    extractionMethod: string;
    pageCount?: number;
    wordCount: number;
    characterCount: number;
  };
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  txt: ['text/plain'],
  docx: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ],
  pdf: ['application/pdf'],
};

export function validateFile(
  file: File | null | undefined,
  fileType: 'txt' | 'docx' | 'pdf'
): { valid: true } | { valid: false; error: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds limit (${(file.size / 1024 / 1024).toFixed(1)}MB > 50MB)`,
    };
  }

  const expectedExtensions = {
    txt: '.txt',
    docx: '.docx',
    pdf: '.pdf',
  };

  const hasCorrectExtension = file.name.toLowerCase().endsWith(expectedExtensions[fileType]);
  if (!hasCorrectExtension) {
    return {
      valid: false,
      error: `File extension doesn't match type (expected ${expectedExtensions[fileType]})`,
    };
  }

  return { valid: true };
}

async function parseTxt(file: File): Promise<ParsedFile> {
  const content = await file.text();

  if (content.trim().length === 0) {
    throw new Error('TXT file contains no readable text');
  }

  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

  return {
    filename: file.name,
    fileType: 'txt',
    content,
    metadata: {
      size: file.size,
      extractionMethod: 'direct',
      wordCount,
      characterCount: content.length,
    },
  };
}

async function parseDocx(file: File): Promise<ParsedFile> {
  const arrayBuffer = await file.arrayBuffer();

  let result;
  try {
    result = await mammoth.extractRawText({ arrayBuffer });
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  let { value: content } = result;

  if (!content || content.trim().length === 0) {
    throw new Error('DOCX file contains no extractable text');
  }

  // Clean up content (mammoth adds extra newlines)
  content = content.replace(/\n\n+/g, '\n\n').trim();

  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

  return {
    filename: file.name,
    fileType: 'docx',
    content,
    metadata: {
      size: file.size,
      extractionMethod: 'mammoth',
      wordCount,
      characterCount: content.length,
    },
  };
}

async function parsePdf(file: File): Promise<ParsedFile> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let pdfData;
  try {
    pdfData = await pdfParse(buffer);
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  let content = pdfData.text;

  if (!content || content.trim().length === 0) {
    throw new Error('PDF contains no extractable text (scanned or image-based PDFs are not supported)');
  }

  // Clean up content
  content = content.replace(/\n\n+/g, '\n\n').trim();

  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

  return {
    filename: file.name,
    fileType: 'pdf',
    content,
    metadata: {
      size: file.size,
      extractionMethod: 'pdf-parse',
      pageCount: pdfData.numpages,
      wordCount,
      characterCount: content.length,
    },
  };
}

export async function parseFile(file: File, fileType: 'txt' | 'docx' | 'pdf'): Promise<ParsedFile> {
  const validation = validateFile(file, fileType);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  try {
    switch (fileType) {
      case 'txt':
        return await parseTxt(file);
      case 'docx':
        return await parseDocx(file);
      case 'pdf':
        return await parsePdf(file);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    throw error;
  }
}

export function detectFileType(file: File): 'txt' | 'docx' | 'pdf' | null {
  const name = file.name.toLowerCase();

  if (name.endsWith('.txt')) return 'txt';
  if (name.endsWith('.docx') || name.endsWith('.doc')) return 'docx';
  if (name.endsWith('.pdf')) return 'pdf';

  // Fallback to MIME type detection
  if (file.type === 'text/plain') return 'txt';
  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.type === 'application/msword'
  ) {
    return 'docx';
  }
  if (file.type === 'application/pdf') return 'pdf';

  return null;
}
