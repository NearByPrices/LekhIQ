import { NextRequest, NextResponse } from 'next/server';
import { AnalyseRequestSchema } from '@/lib/validation/schemas';
import { normaliseContent } from '@/lib/content/normalisation';
import { evaluateAILikeness } from '@/lib/analysis/ai-likeness-rules';
import { calculateMetrics } from '@/lib/analysis/metrics';
import {
  calculateStatisticalScore,
  calculateReadabilityScore,
  calculateRepetitionScore,
  calculateInformationDensityScore,
  calculateContentQualityScore,
} from '@/lib/analysis/quality-scoring';
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

    // Calculate quality and statistical scores
    const statisticalScore = calculateStatisticalScore(metrics);
    const readabilityScore = calculateReadabilityScore(normalised, metrics);
    const repetitionScore = calculateRepetitionScore(normalised);
    const informationDensityScore = calculateInformationDensityScore(normalised, metrics);
    const contentQualityScore = calculateContentQualityScore(normalised, metrics);

    // Run Gemini qualitative analysis
    let geminiAnalysis = null;
    let geminiStatus = 'success';
    try {
      const gemini = createGeminiProvider();
      geminiAnalysis = await gemini.analyseContent(normalised);
    } catch (geminiError) {
      console.warn('Gemini analysis failed, continuing without qualitative scores:', geminiError);
      geminiStatus = 'failed';
    }

    // Combine scores with proper weighting: 35% statistical, 40% rules, 25% Gemini
    const combinedScore = calculateCombinedScore(
      statisticalScore,
      rulesAnalysis.score,
      geminiAnalysis?.overallScore
    );

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
        scoringVersion: 'ai-scoring-v2',
        statisticalScore,
        ruleScore: rulesAnalysis.score,
        geminiScore: geminiAnalysis?.overallScore,
        finalAiLikenessScore: combinedScore,
        contentQualityScore,
        readabilityScore,
        repetitionScore,
        informationDensityScore,
        resultJson: {
          metrics,
          rules: rulesAnalysis,
          qualitative: geminiAnalysis,
          scores: {
            statistical: statisticalScore,
            rules: rulesAnalysis.score,
            gemini: geminiAnalysis?.overallScore || null,
            combined: combinedScore,
          },
          quality: {
            content: contentQualityScore,
            readability: readabilityScore,
            repetition: repetitionScore,
            informationDensity: informationDensityScore,
          },
          combined: {
            score: combinedScore,
            riskLevel: getRiskLevel(combinedScore),
          },
        },
        modelName: process.env.GEMINI_ANALYSIS_MODEL || 'gemini-2.0-flash',
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
          scores: {
            statistical: statisticalScore,
            rules: rulesAnalysis.score,
            gemini: geminiAnalysis?.overallScore || null,
            combined: combinedScore,
          },
          quality: {
            content: contentQualityScore,
            readability: readabilityScore,
            repetition: repetitionScore,
            informationDensity: informationDensityScore,
          },
          qualitative: geminiAnalysis,
          combined: {
            score: combinedScore,
            riskLevel: getRiskLevel(combinedScore),
            components: {
              statistical: statisticalScore,
              rules: rulesAnalysis.score,
              gemini: geminiAnalysis?.overallScore || null,
            },
          },
          geminiStatus,
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

function calculateCombinedScore(
  statisticalScore: number,
  rulesScore: number,
  geminiScore?: number
): number {
  if (geminiScore === null || geminiScore === undefined) {
    // If Gemini unavailable, use weighted average of statistical and rules only
    // Reweight to 35% statistical and 65% rules (sum to 100)
    return Math.round(statisticalScore * 0.35 + rulesScore * 0.65);
  }

  // Full weighting: 35% statistical, 40% rules, 25% Gemini
  return Math.round(
    statisticalScore * 0.35 + rulesScore * 0.4 + geminiScore * 0.25
  );
}

function getRiskLevel(score: number): 'low' | 'moderate' | 'high' | 'very_high' {
  if (score < 30) return 'low';
  if (score < 60) return 'moderate';
  if (score < 80) return 'high';
  return 'very_high';
}
