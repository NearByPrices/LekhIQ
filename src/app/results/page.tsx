'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { AnalysisPage } from '@/components/AnalysisPage';

interface AnalysisData {
  contentInfo: any;
  analysis: any;
  timestamp: string;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analysisJson = searchParams.get('data');
    if (!analysisJson) {
      setError('No analysis data provided');
      setLoading(false);
      return;
    }

    try {
      const data = JSON.parse(decodeURIComponent(analysisJson));
      setResults(data);
    } catch (err) {
      setError('Invalid analysis data');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return <div className="text-center py-8">Loading results...</div>;
  }

  if (error || !results) {
    return (
      <div className="card border-2 border-red-300 bg-red-50">
        <h2 className="text-lg font-semibold text-red-900 mb-2">Error</h2>
        <p className="text-red-700">{error || 'No results available'}</p>
        <button className="btn btn-primary mt-4" onClick={() => (window.location.href = '/')}>
          Back to Analyse
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button className="btn btn-outline" onClick={() => (window.location.href = '/')}>
        ← Back to Analyse
      </button>
      <AnalysisPage
        contentInfo={{
          ...results.contentInfo,
          originalText: results.contentInfo.text || results.analysis.originalText || '',
        }}
        metrics={results.analysis.metrics}
        rules={results.analysis.rules}
        qualitative={results.analysis.qualitative}
        combined={results.analysis.combined}
        scores={results.analysis.scores}
        quality={results.analysis.quality}
      />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading results...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
