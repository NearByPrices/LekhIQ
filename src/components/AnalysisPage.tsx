'use client';

import { useState } from 'react';
import AnalysisResults from './AnalysisResults';
import { HumanisationModal } from './HumanisationModal';
import { HumanisationComparison } from './HumanisationComparison';
import type { HumanisationResponse } from '@/types/humanisation';
import type { AILikenessResult } from '@/types/analysis';
import type { QualitativeAnalysisResult } from '@/lib/ai/provider';

interface AnalysisPageProps {
  contentInfo: {
    type: string;
    title: string;
    wordCount: number;
    characterCount: number;
    originalText: string;
  };
  metrics: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    averageSentenceLength: number;
    sentenceLengthVariance: number;
    averageParagraphLength: number;
    paragraphLengthVariance: number;
    lexicalDiversity: number;
  };
  rules: AILikenessResult;
  qualitative: QualitativeAnalysisResult | null;
  combined: {
    score: number;
    riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
    components: {
      statistical?: number;
      rules: number;
      gemini: number | null;
    };
  };
  scores?: {
    statistical: number;
    rules: number;
    gemini: number | null;
    combined: number;
  };
  quality?: {
    content: number;
    readability: number;
    repetition: number;
    informationDensity: number;
  };
}

export function AnalysisPage(props: AnalysisPageProps) {
  const [showHumanisationModal, setShowHumanisationModal] = useState(false);
  const [humanisationResult, setHumanisationResult] = useState<HumanisationResponse | null>(null);
  const [isHumanising, setIsHumanising] = useState(false);
  const [humanisationError, setHumanisationError] = useState<string | null>(null);

  const handleHumanise = async (request: {
    originalText: string;
    rewriteMode: 'light' | 'natural' | 'deep';
    tone: string;
    primaryKeyword?: string;
    secondaryKeywords?: string[];
    lockedPhrases?: string[];
  }) => {
    setIsHumanising(true);
    setHumanisationError(null);

    try {
      const response = await fetch('/api/humanise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setHumanisationResult(data.data);
      setShowHumanisationModal(false);
    } catch (error) {
      setHumanisationError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    } finally {
      setIsHumanising(false);
    }
  };

  if (humanisationResult) {
    return (
      <div className="space-y-6">
        <div className="flex gap-3">
          <button
            onClick={() => setHumanisationResult(null)}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Analysis
          </button>
          <button
            onClick={() => {
              setHumanisationResult(null);
              setShowHumanisationModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Humanise Again
          </button>
        </div>
        <HumanisationComparison
          originalText={props.contentInfo.originalText}
          response={humanisationResult}
          beforeAnalysis={{
            aiScore: props.combined.score,
            qualityScore: props.quality?.content,
            readabilityScore: props.quality?.readability,
            repetitionScore: props.quality?.repetition,
          }}
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Analysis Results</h1>
          <button
            onClick={() => setShowHumanisationModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            ✨ Humanise Content
          </button>
        </div>

        <AnalysisResults {...props} />
      </div>

      {showHumanisationModal && (
        <HumanisationModal
          originalText={props.contentInfo.originalText}
          onClose={() => setShowHumanisationModal(false)}
          onSubmit={handleHumanise}
          isLoading={isHumanising}
        />
      )}

      {humanisationError && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <p className="text-red-900 font-semibold">Error</p>
          <p className="text-red-700 text-sm mt-1">{humanisationError}</p>
        </div>
      )}
    </>
  );
}
