import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateUrl } from '@/lib/website/url-validation';
import { extractWebsiteContent } from '@/lib/website/content-extraction';
import { analyzeSeoContent } from '@/lib/seo/analysis';

const ExtractUrlRequestSchema = z.object({
  url: z.string().min(10).max(2048),
  primaryKeyword: z.string().optional(),
  secondaryKeywords: z.array(z.string()).optional(),
  timeout: z.number().optional(),
});

type ExtractUrlRequest = z.infer<typeof ExtractUrlRequestSchema>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validationResult = ExtractUrlRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request format',
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { url, primaryKeyword, secondaryKeywords, timeout } = validationResult.data as ExtractUrlRequest;

    // 1. Validate URL for SSRF
    const urlValidation = await validateUrl(url);
    if (!urlValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: urlValidation.error,
          },
        },
        { status: 400 }
      );
    }

    // 2. Extract website content
    const extractionResult = await extractWebsiteContent(urlValidation.normalizedUrl, { timeout });
    if (!extractionResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EXTRACTION_FAILED',
            message: extractionResult.error,
          },
        },
        { status: 500 }
      );
    }

    const { content, finalUrl } = extractionResult;

    // 3. Perform SEO analysis
    const seoAnalysis = analyzeSeoContent(content, primaryKeyword, secondaryKeywords);

    return NextResponse.json(
      {
        success: true,
        data: {
          url: finalUrl,
          content,
          seo: seoAnalysis,
          extractedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[extract-url] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to extract website content',
        },
      },
      { status: 500 }
    );
  }
}
