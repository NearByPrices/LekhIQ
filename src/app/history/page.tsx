'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface HistoryDocument {
  id: string;
  title: string;
  sourceType: 'paste' | 'url' | 'file';
  wordCount: number;
  characterCount: number;
  createdAt: string;
}

interface HistoryResponse {
  count: number;
  documents: HistoryDocument[];
  error?: string;
}

export default function HistoryPage() {
  const [documents, setDocuments] = useState<HistoryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/history?limit=${limit}`);
        const data: HistoryResponse = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setDocuments(data.documents || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [limit]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const sourceTypeLabel = {
    paste: '📝 Pasted',
    url: '🔗 URL',
    file: '📄 File',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analysis History</h1>
        <p className="text-gray-600">
          View and manage your previous content analyses
        </p>
      </div>

      {error && (
        <div className="card border-2 border-red-300 bg-red-50">
          <h3 className="text-lg font-semibold text-red-900 mb-1">Error Loading History</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="card text-center py-12">
          <div className="text-gray-500">Loading history...</div>
        </div>
      ) : documents.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-gray-500 mb-4">No analyses yet</div>
          <p className="text-sm text-gray-400 mb-6">Start by analyzing some content to build your history</p>
          <Link href="/" className="btn btn-primary">
            Analyse Content
          </Link>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {documents.length} of {documents.length} analyses
              </div>
              {documents.length < 50 && (
                <button
                  onClick={() => setLimit(Math.min(limit + 10, 100))}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Load More
                </button>
              )}
            </div>

            <div className="space-y-3">
              {documents.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/api/history?documentId=${doc.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600">
                        {doc.title || 'Untitled Analysis'}
                      </h3>
                      <div className="flex gap-3 text-sm text-gray-600 mt-1">
                        <span className="inline-flex items-center gap-1">
                          {sourceTypeLabel[doc.sourceType]}
                        </span>
                        <span>•</span>
                        <span>{doc.wordCount} words</span>
                        <span>•</span>
                        <span>{doc.characterCount} characters</span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {formatDate(doc.createdAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex gap-4">
          <div className="text-2xl">💡</div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Tip: Track Your Progress</h3>
            <p className="text-sm text-blue-700">
              Each analysis is automatically saved. Click on any item to view detailed metrics and scores for that analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
