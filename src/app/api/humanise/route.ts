import { NextRequest, NextResponse } from 'next/server';
import { HumanisationRequestSchema } from '@/types/humanisation';
import { humaniseContent } from '@/lib/humanisation/service';
import { createSupabaseServiceClient } from '@/lib/db/supabase';
import type { HumanisationRun } from '@/types/humanisation';

/**
 * POST /api/humanise
 * Humanise content using Gemini
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json();
    const parsedRequest = HumanisationRequestSchema.parse(body);

    // Perform humanisation
    const result = await humaniseContent({
      ...parsedRequest,
      originalText: parsedRequest.originalText,
    });

    // Try to save to database (graceful fallback if fails)
    let savedRunId: string | null = null;
    try {
      const supabase = createSupabaseServiceClient();

      const humanisationRun: Omit<HumanisationRun, 'id' | 'createdAt'> = {
        contentDocumentId: parsedRequest.contentDocumentId || `temp_${Date.now()}`,
        analysisRunId: parsedRequest.analysisRunId,
        mode: parsedRequest.rewriteMode,
        tone: parsedRequest.tone,
        originalText: parsedRequest.originalText,
        rewrittenText: result.rewrittenContent,
        protectedContentJson: {
          urls: result.preservedElements.urls,
          emails: result.preservedElements.emails,
          phones: result.preservedElements.phones,
          keywords: result.preservedElements.keywords,
          lockedPhrases: result.preservedElements.lockedPhrases,
        },
        validationJson: result.validation,
        changesJson: result.changes,
        modelName: result.processingMetadata.modelName,
        promptVersion: result.processingMetadata.promptVersion,
        processingMetadata: {
          originalLength: result.processingMetadata.originalLength,
          rewrittenLength: result.processingMetadata.rewrittenLength,
          processingTime: result.processingMetadata.processingTime,
        },
      };

      const { data, error } = await supabase
        .from('humanisation_runs')
        .insert([humanisationRun])
        .select('id')
        .single();

      if (error) {
        console.warn('Failed to save humanisation run:', error.message);
      } else if (data) {
        savedRunId = data.id;
      }
    } catch (dbError) {
      console.warn(
        'Database save failed:',
        dbError instanceof Error ? dbError.message : String(dbError)
      );
      // Continue without persistence - humanisation still succeeds
    }

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        ...result,
        savedRunId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Humanisation error:', message);

    // Determine error status
    let status = 500;
    if (message.includes('validation')) {
      status = 400;
    }

    return NextResponse.json(
      {
        error: 'Humanisation failed',
        message,
        code: 'HUMANISATION_ERROR',
      },
      { status }
    );
  }
}

/**
 * GET /api/humanise/:id
 * Retrieve a specific humanisation run
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('id');

    if (!runId) {
      return NextResponse.json(
        { error: 'Missing humanisation run ID', code: 'MISSING_ID' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase
      .from('humanisation_runs')
      .select('*')
      .eq('id', runId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Humanisation run not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Retrieval error:', message);

    return NextResponse.json(
      {
        error: 'Failed to retrieve humanisation run',
        message,
        code: 'RETRIEVAL_ERROR',
      },
      { status: 500 }
    );
  }
}
