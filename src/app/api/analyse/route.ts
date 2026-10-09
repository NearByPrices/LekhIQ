import { NextRequest, NextResponse } from 'next/server';
import { AnalyseRequestSchema } from '@/lib/validation/schemas';
import { normaliseContent } from '@/lib/content/normalisation';
import { evaluateAILikeness } from '@/lib/analysis/ai-likeness-rules';
import { calculateMetrics } from '@/lib/analysis/metrics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = AnalyseRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          code: 'VALIDATION_ERROR',
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { type, content, title, keywords } = validation.data;

    // Normalise content
    const normalised = normaliseContent(content);
    const wordCount = normalised.match(/\b\w+\b/g)?.length || 0;
    const characterCount = normalised.length;

    // Run analysis
    const metrics = calculateMetrics(normalised);
    const aiLikeness = evaluateAILikeness(normalised);

    // TODO: Save to database
    // TODO: Call Gemini for qualitative analysis

    return NextResponse.json(
      {
        contentInfo: {
          type,
          title: title || 'Untitled',
          wordCount,
          characterCount,
        },
        analysis: {
          metrics,
          aiLikeness,
          qualitative: null, // Will be filled by Gemini
          combined: {
            score: aiLikeness.score,
            riskLevel: aiLikeness.riskLevel,
          },
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      {
        error: 'Analysis failed',
        code: 'ANALYSIS_ERROR',
        details: error instanceof Error ? { message: error.message } : {},
      },
      { status: 500 }
    );
  }
}
