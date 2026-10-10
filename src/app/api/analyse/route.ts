import { NextRequest, NextResponse } from 'next/server';
import { AnalyseRequestSchema } from '@/lib/validation/schemas';
import { normaliseContent } from '@/lib/content/normalisation';
import { evaluateAILikeness } from '@/lib/analysis/ai-likeness-rules';
import { calculateMetrics } from '@/lib/analysis/metrics';
import { createGeminiProvider } from '@/lib/ai/providers/gemini';

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

    // Run deterministic analysis
    const metrics = calculateMetrics(normalised);
    const rulesAnalysis = evaluateAILikeness(normalised);

    // Run Gemini qualitative analysis
    let geminiAnalysis = null;
    try {
      const gemini = createGeminiProvider();
      geminiAnalysis = await gemini.analyseContent(normalised);
    } catch (geminiError) {
      console.warn('Gemini analysis failed, continuing without qualitative scores:', geminiError);
    }

    // Combine scores
    const combinedScore = calculateCombinedScore(rulesAnalysis.score, geminiAnalysis?.overallScore);

    return NextResponse.json(
      {
        contentInfo: {
          type,
          title: title || 'Untitled',
          wordCount,
          characterCount,
          keywords: keywords || [],
        },
        analysis: {
          metrics,
          rules: rulesAnalysis,
          qualitative: geminiAnalysis,
          combined: {
            score: combinedScore,
            riskLevel: getRiskLevel(combinedScore),
            components: {
              rules: rulesAnalysis.score,
              gemini: geminiAnalysis?.overallScore || null,
            },
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

function calculateCombinedScore(rulesScore: number, geminiScore?: number): number {
  if (geminiScore === null || geminiScore === undefined) {
    return rulesScore; // Use rules score if Gemini unavailable
  }

  // Weighted average: 40% rules, 60% Gemini
  return Math.round(rulesScore * 0.4 + geminiScore * 0.6);
}

function getRiskLevel(score: number): 'low' | 'moderate' | 'high' | 'very_high' {
  if (score < 30) return 'low';
  if (score < 60) return 'moderate';
  if (score < 80) return 'high';
  return 'very_high';
}
