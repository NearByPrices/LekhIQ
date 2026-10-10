'use client';

import { AILikenessResult } from '@/types/analysis';
import { QualitativeAnalysisResult } from '@/lib/ai/provider';

interface AnalysisResultsProps {
  contentInfo: {
    type: string;
    title: string;
    wordCount: number;
    characterCount: number;
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

export default function AnalysisResults({
  contentInfo,
  metrics,
  rules,
  qualitative,
  combined,
  scores,
  quality
}: AnalysisResultsProps) {
  const riskColors = {
    low: 'bg-green-100 text-green-900 border-green-300',
    moderate: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    high: 'bg-orange-100 text-orange-900 border-orange-300',
    very_high: 'bg-red-100 text-red-900 border-red-300',
  };

  const scoreColor = combined.score < 30 ? 'text-green-600' : combined.score < 60 ? 'text-yellow-600' : combined.score < 80 ? 'text-orange-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">{contentInfo.title}</h2>
            <p className="text-gray-600">
              {contentInfo.wordCount} words • {contentInfo.characterCount} characters • {metrics.sentenceCount} sentences
            </p>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-bold ${scoreColor}`}>{combined.score}</div>
            <div className="text-sm text-gray-600">AI-Likeness Score</div>
          </div>
        </div>
      </div>

      {/* Risk Level */}
      <div className={`card border-2 ${riskColors[combined.riskLevel]}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg capitalize">{combined.riskLevel} AI-Likeness Risk</h3>
            <p className="text-sm mt-1">{rules.explanation}</p>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold">Score Breakdown</div>
            <div className="text-xs mt-2 space-y-1">
              {(combined.components.statistical !== undefined) && (
                <div>
                  Statistical: <span className="font-bold">{combined.components.statistical}</span>
                </div>
              )}
              <div>
                Rules: <span className="font-bold">{combined.components.rules?.toFixed(0)}</span>
              </div>
              {combined.components.gemini && (
                <div>
                  Gemini: <span className="font-bold">{combined.components.gemini}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Key Signals */}
      {rules.signals.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">AI-Likeness Signals Detected</h3>
          <div className="space-y-2">
            {rules.signals.slice(0, 5).map((signal, idx) => (
              <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="font-medium">{signal.name}</div>
                  <div className="text-sm text-gray-600">{signal.evidence}</div>
                </div>
                <div className={`ml-4 px-3 py-1 rounded text-xs font-semibold ${
                  signal.severity === 'high' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                }`}>
                  {signal.severity}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quality Scores */}
      {quality && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Content Quality Analysis</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">Readability</div>
              <div className="text-3xl font-bold text-blue-700">{quality.readability}</div>
              <div className="text-xs text-blue-600 mt-1">higher = easier</div>
            </div>
            <div className="p-3 bg-purple-50 rounded border border-purple-200">
              <div className="text-sm text-purple-600 font-medium">Repetition</div>
              <div className="text-3xl font-bold text-purple-700">{quality.repetition}</div>
              <div className="text-xs text-purple-600 mt-1">higher = less repetitive</div>
            </div>
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <div className="text-sm text-green-600 font-medium">Info Density</div>
              <div className="text-3xl font-bold text-green-700">{quality.informationDensity}</div>
              <div className="text-xs text-green-600 mt-1">higher = more informative</div>
            </div>
            <div className="p-3 bg-orange-50 rounded border border-orange-200">
              <div className="text-sm text-orange-600 font-medium">Overall Quality</div>
              <div className="text-3xl font-bold text-orange-700">{quality.content}</div>
              <div className="text-xs text-orange-600 mt-1">composite score</div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Content Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Avg Sentence Length</div>
            <div className="text-2xl font-bold">{metrics.averageSentenceLength.toFixed(1)}</div>
            <div className="text-xs text-gray-500">words/sentence</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Lexical Diversity</div>
            <div className="text-2xl font-bold">{(metrics.lexicalDiversity * 100).toFixed(1)}%</div>
            <div className="text-xs text-gray-500">unique words</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Paragraphs</div>
            <div className="text-2xl font-bold">{metrics.paragraphCount}</div>
            <div className="text-xs text-gray-500">avg {metrics.averageParagraphLength.toFixed(1)} words</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Sentence Variance</div>
            <div className="text-2xl font-bold">{metrics.sentenceLengthVariance.toFixed(2)}</div>
            <div className="text-xs text-gray-500">length variation</div>
          </div>
        </div>
      </div>

      {/* Qualitative Analysis */}
      {qualitative && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Qualitative Analysis (Gemini)</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="text-xs text-blue-600">Naturalness</div>
                <div className="text-2xl font-bold">{qualitative.naturalness}</div>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                <div className="text-xs text-purple-600">Specificity</div>
                <div className="text-2xl font-bold">{qualitative.specificity}</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-xs text-green-600">Information Density</div>
                <div className="text-2xl font-bold">{qualitative.informationDensity}</div>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded">
                <div className="text-xs text-indigo-600">Tone Consistency</div>
                <div className="text-2xl font-bold">{qualitative.toneConsistency}</div>
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-4">{qualitative.reasoning}</p>
            {qualitative.keyObservations.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Key Observations:</div>
                <ul className="text-sm space-y-1">
                  {qualitative.keyObservations.map((obs, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="card flex gap-3">
        <button className="btn btn-primary flex-1">Humanise Content</button>
        <button className="btn btn-outline flex-1">Save Analysis</button>
        <button className="btn btn-outline flex-1">Export Report</button>
      </div>
    </div>
  );
}
