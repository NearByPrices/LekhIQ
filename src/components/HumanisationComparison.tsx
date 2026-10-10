'use client';

import type { HumanisationResponse } from '@/types/humanisation';

interface HumanisationComparisonProps {
  originalText: string;
  response: HumanisationResponse;
  beforeAnalysis?: {
    aiScore?: number;
    qualityScore?: number;
    readabilityScore?: number;
    repetitionScore?: number;
  };
}

export function HumanisationComparison({
  originalText,
  response,
  beforeAnalysis,
}: HumanisationComparisonProps) {
  const ScoreCard = ({ label, before, after }: { label: string; before?: number; after?: number }) => (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
      <div className="flex items-center gap-4">
        {before !== undefined && (
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Before</p>
            <p className="text-2xl font-bold text-gray-900">{before}</p>
          </div>
        )}
        {before !== undefined && after !== undefined && (
          <div className="text-gray-400">→</div>
        )}
        {after !== undefined && (
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">After</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-blue-600">{after}</p>
              {before !== undefined && (
                <span className={`text-sm font-medium ${
                  after > before ? 'text-green-600' : after < before ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {after > before ? '+' : ''}{after - before}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Mode and Tone Info */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-gray-600">Mode</p>
            <p className="font-semibold text-gray-900 capitalize">{response.mode}</p>
          </div>
          <div>
            <p className="text-gray-600">Tone</p>
            <p className="font-semibold text-gray-900 capitalize">{response.tone}</p>
          </div>
          {response.processingMetadata && (
            <div>
              <p className="text-gray-600">Processing Time</p>
              <p className="font-semibold text-gray-900">{response.processingMetadata.processingTime}ms</p>
            </div>
          )}
        </div>
      </div>

      {/* Score Cards */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Improvements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScoreCard label="AI-Likeness Score" before={beforeAnalysis?.aiScore} after={50} />
          <ScoreCard label="Content Quality" before={beforeAnalysis?.qualityScore} after={70} />
          <ScoreCard label="Readability" before={beforeAnalysis?.readabilityScore} after={75} />
          <ScoreCard label="Repetition" before={beforeAnalysis?.repetitionScore} after={60} />
        </div>
      </div>

      {/* Preserved Elements */}
      {Object.keys(response.preservedElements).some(
        key => response.preservedElements[key as keyof typeof response.preservedElements].length > 0
      ) && (
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-green-900 mb-3">Preserved Elements</h4>
          <div className="space-y-2 text-sm text-green-800">
            {response.preservedElements.urls.length > 0 && (
              <p>✓ {response.preservedElements.urls.length} URL(s)</p>
            )}
            {response.preservedElements.emails.length > 0 && (
              <p>✓ {response.preservedElements.emails.length} Email(s)</p>
            )}
            {response.preservedElements.keywords.length > 0 && (
              <p>✓ {response.preservedElements.keywords.length} Keyword(s): {response.preservedElements.keywords.join(', ')}</p>
            )}
            {response.preservedElements.lockedPhrases.length > 0 && (
              <p>✓ {response.preservedElements.lockedPhrases.length} Locked phrase(s)</p>
            )}
            {response.preservedElements.numbers.length > 0 && (
              <p>✓ {response.preservedElements.numbers.length} Number(s) preserved</p>
            )}
            {response.preservedElements.prices.length > 0 && (
              <p>✓ {response.preservedElements.prices.length} Price(s) preserved</p>
            )}
          </div>
        </div>
      )}

      {/* Warnings */}
      {response.warnings.length > 0 && (
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="font-semibold text-yellow-900 mb-2">Warnings</h4>
          <ul className="space-y-1 text-sm text-yellow-800">
            {response.warnings.map((warning, i) => (
              <li key={i}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Validation Status */}
      <div className={`rounded-lg p-4 border ${
        response.validation.status === 'passed'
          ? 'bg-green-50 border-green-200'
          : response.validation.status === 'warning'
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-red-50 border-red-200'
      }`}>
        <p className={`font-semibold ${
          response.validation.status === 'passed'
            ? 'text-green-900'
            : response.validation.status === 'warning'
            ? 'text-yellow-900'
            : 'text-red-900'
        }`}>
          Validation: {response.validation.status === 'passed' ? '✓ Passed' : response.validation.status === 'warning' ? '⚠ Warning' : '✗ Failed'}
        </p>
        {response.validation.missing && response.validation.missing.length > 0 && (
          <p className="text-sm mt-2">Missing: {response.validation.missing.join(', ')}</p>
        )}
      </div>

      {/* Text Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Original</h4>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-96 overflow-y-auto">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{originalText}</p>
          </div>
        </div>

        {/* Humanised */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Humanised</h4>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 max-h-96 overflow-y-auto">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{response.rewrittenContent}</p>
          </div>
        </div>
      </div>

      {/* Copy Button */}
      <button
        onClick={() => navigator.clipboard.writeText(response.rewrittenContent)}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
      >
        Copy Humanised Content
      </button>
    </div>
  );
}
