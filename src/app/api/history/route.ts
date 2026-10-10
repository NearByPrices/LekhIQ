import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseService } from '@/lib/db/service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get('documentId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const db = getDatabaseService();

    if (documentId) {
      // Get specific document with all its analyses
      const result = await db.getDocumentWithAnalysis(documentId);
      return NextResponse.json(result, { status: 200 });
    }

    // Get recent documents
    const documents = await db.getRecentDocuments(Math.min(limit, 100));

    return NextResponse.json(
      {
        count: documents.length,
        documents: documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          sourceType: doc.source_type,
          wordCount: doc.word_count,
          characterCount: doc.character_count,
          createdAt: doc.created_at,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch history',
        code: 'HISTORY_ERROR',
        details: error instanceof Error ? { message: error.message } : {},
      },
      { status: 500 }
    );
  }
}
