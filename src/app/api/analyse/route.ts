import { NextRequest, NextResponse } from 'next/server';
import { AnalyseRequestSchema } from '@/lib/validation/schemas';
import { normaliseContent } from '@/lib/content/normalisation';
import { evaluateAILikeness } from '@/lib/analysis/ai-likeness-rules';
import { calculateMetrics } from '@/lib/analysis/metrics';
import { createGeminiProvider } from '@/lib/ai/providers/gemini';
import { getDatabaseService } from '@/lib/db/service';

export async function POST(request: NextRequest) {
  let contentDocumentId: string | null = null;

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

    // Save to database
    try {
      const db = getDatabaseService();

      // Save content document
      contentDocumentId = await db.saveContentDocument({
        sourceType: type,
        sourceUrl: type === 'url' ? content : undefined,
        title: title || 'Untitled',
        rawText: content,
        cleanText: normalised,
        wordCount,
        characterCount,
        metadata: {
          keywords,
          analysisDate: new Date().toISOString(),
        },
      });

      // Save analysis results
      const analysisRunId = await db.saveAnalysisResult({
        contentDocumentId,
        scoringVersion: 'ai-scoring-v1',
        statisticalScore: metrics.averageSentenceLength, // Placeholder
        ruleScore: rulesAnalysis.score,
        geminiScore: geminiAnalysis?.overallScore,
        finalAiLikenessScore: combinedScore,
        contentQualityScore: 50, // TODO: Implement quality scoring
        readabilityScore: 50, // TODO: Implement readability scoring
        repetitionScore: 50, // TODO: Implement repetition scoring
        informationDensityScore: 50, // TODO: Calculate from metrics
        resultJson: {
          metrics,
          rules: rulesAnalysis,
          qualitative: geminiAnalysis,
          combined: {
            score: combinedScore,
            riskLevel: getRiskLevel(combinedScore),
          },
        },
        modelName: 'gemini-pro',
        promptVersion: 'analysis-v1',
      });

      console.log(`✓ Analysis saved: ${analysisRunId}`);
    } catch (dbError) {
      console.warn('Database save failed, returning analysis without persistence:', dbError);
      // Don't fail the API call - still return analysis even if DB save fails
    }

    return NextResponse.json(
      {
        id: contentDocumentId,
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
        saved: !!contentDocumentId,
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
        saved: false,
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
