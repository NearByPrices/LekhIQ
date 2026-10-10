'use client';

import { useState } from 'react';
import type { RewriteMode, Tone } from '@/types/humanisation';

interface HumanisationModalProps {
  originalText: string;
  onClose: () => void;
  onSubmit: (request: {
    originalText: string;
    rewriteMode: RewriteMode;
    tone: Tone;
    primaryKeyword?: string;
    secondaryKeywords?: string[];
    lockedPhrases?: string[];
  }) => Promise<void>;
  isLoading?: boolean;
}

export function HumanisationModal({
  originalText,
  onClose,
  onSubmit,
  isLoading = false,
}: HumanisationModalProps) {
  const [rewriteMode, setRewriteMode] = useState<RewriteMode>('natural');
  const [tone, setTone] = useState<Tone>('professional');
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [lockedPhrases, setLockedPhrases] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSubmit({
      originalText,
      rewriteMode,
      tone,
      primaryKeyword: primaryKeyword.trim() || undefined,
      secondaryKeywords: secondaryKeywords
        .split(',')
        .map(k => k.trim())
        .filter(Boolean),
      lockedPhrases: lockedPhrases
        .split('\n')
        .map(p => p.trim())
        .filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Humanise Content</h2>
          <p className="text-gray-600 mt-1">Improve naturalness and readability while preserving meaning</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rewrite Mode */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Rewrite Mode
            </label>
            <div className="space-y-2">
              {(['light', 'natural', 'deep'] as const).map(mode => (
                <label key={mode} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value={mode}
                    checked={rewriteMode === mode}
                    onChange={e => setRewriteMode(e.target.value as RewriteMode)}
                    className="h-4 w-4"
                  />
                  <span className="ml-3 font-medium text-gray-900 capitalize">{mode}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    {mode === 'light' && '- Fix grammar, reduce repetition'}
                    {mode === 'natural' && '- Improve flow and naturalness'}
                    {mode === 'deep' && '- Substantial restructuring for clarity'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Tone
            </label>
            <select
              value={tone}
              onChange={e => setTone(e.target.value as Tone)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="professional">Professional</option>
              <option value="conversational">Conversational</option>
              <option value="corporate">Corporate</option>
              <option value="educational">Educational</option>
              <option value="technical">Technical</option>
              <option value="premium">Premium</option>
              <option value="sales">Sales-focused</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>

          {/* Primary Keyword */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Primary Keyword <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={primaryKeyword}
              onChange={e => setPrimaryKeyword(e.target.value)}
              placeholder="e.g., AI technology"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Secondary Keywords */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Secondary Keywords <span className="text-gray-500 font-normal">(optional, comma-separated)</span>
            </label>
            <input
              type="text"
              value={secondaryKeywords}
              onChange={e => setSecondaryKeywords(e.target.value)}
              placeholder="e.g., machine learning, deep learning"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Locked Phrases */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Locked Phrases <span className="text-gray-500 font-normal">(optional, one per line)</span>
            </label>
            <textarea
              value={lockedPhrases}
              onChange={e => setLockedPhrases(e.target.value)}
              placeholder="Phrases that must be preserved exactly&#10;e.g., Company name&#10;Product name"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {isLoading ? 'Humanising...' : 'Humanise Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
