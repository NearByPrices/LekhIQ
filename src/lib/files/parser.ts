/**
 * File Parsing Module
 * Supports TXT, DOCX (via Mammoth), and PDF (via pdf-parse)
 */

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

  const wordCount = content.split(/\s+/).filter((w: string) => w.length > 0).length;

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
  try {
    // @ts-ignore - mammoth typing
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (!result.value || result.value.trim().length === 0) {
      throw new Error('DOCX file contains no readable text');
    }

    const content = result.value.trim();
    const wordCount = content.split(/\s+/).filter((w: string) => w.length > 0).length;

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
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse DOCX: ${msg}`);
  }
}

async function parsePdf(file: File): Promise<ParsedFile> {
  try {
    // @ts-ignore - pdf-parse typing
    const pdfParseModule = await import('pdf-parse');
    // @ts-ignore - default export handling
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let result;
    try {
      result = await pdfParse(buffer);
    } catch (parseError) {
      const msg = parseError instanceof Error ? parseError.message : String(parseError);
      if (msg.includes('Encrypted') || msg.includes('encrypted')) {
        throw new Error('PDF is encrypted or password-protected. Please decrypt it first.');
      }
      throw parseError;
    }

    const content = result.text || '';

    if (!content.trim()) {
      throw new Error('PDF appears to be scanned or image-based. Text could not be extracted. Scanned or image-based PDFs are not currently supported.');
    }

    const wordCount = content.split(/\s+/).filter((w: string) => w.length > 0).length;

    return {
      filename: file.name,
      fileType: 'pdf',
      content: content.trim(),
      metadata: {
        size: file.size,
        extractionMethod: 'pdf-parse',
        pageCount: result.numpages || undefined,
        wordCount,
        characterCount: content.length,
      },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('scanned') || msg.includes('image-based')) {
      throw error;
    }
    throw new Error(`Failed to parse PDF: ${msg}`);
  }
}

export async function parseFile(file: File, fileType: 'txt' | 'docx' | 'pdf'): Promise<ParsedFile> {
  const validation = validateFile(file, fileType);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

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
