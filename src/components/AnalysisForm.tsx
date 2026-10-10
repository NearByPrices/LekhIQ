'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { detectFileType } from '@/lib/files/parser';

type InputMode = 'text' | 'url' | 'file';

interface AnalysisFormProps {
  type?: 'paste' | 'url';
}

export default function AnalysisForm({ type: initialType }: AnalysisFormProps) {
  const router = useRouter();
  const [inputMode, setInputMode] = useState<InputMode>((initialType as InputMode) || 'text');
  const [textContent, setTextContent] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (inputMode) {
      case 'text':
        if (!textContent.trim() || textContent.trim().length < 10) {
          newErrors.text = 'Content must be at least 10 characters';
        }
        if (textContent.trim().length > 50000) {
          newErrors.text = 'Content must be less than 50,000 characters';
        }
        break;

      case 'url':
        if (!urlInput.trim()) {
          newErrors.url = 'URL is required';
        }
        break;

      case 'file':
        if (!selectedFile) {
          newErrors.file = 'Please select a file';
        } else {
          const fileType = detectFileType(selectedFile);
          if (!fileType) {
            newErrors.file = 'Unsupported file type (supported: TXT, DOCX, PDF)';
          }
          if (selectedFile.size > 50 * 1024 * 1024) {
            newErrors.file = 'File size must be less than 50MB';
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let response;

      if (inputMode === 'url') {
        // Use extract-url endpoint
        response = await fetch('/api/extract-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: urlInput.trim(),
            primaryKeyword: primaryKeyword.trim() || undefined,
            secondaryKeywords: secondaryKeywords
              .split(',')
              .map(k => k.trim())
              .filter(k => k.length > 0) || undefined,
          }),
        });
      } else if (inputMode === 'file') {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append('file', selectedFile!);
        formData.append('primaryKeyword', primaryKeyword.trim());
        if (secondaryKeywords) {
          formData.append('secondaryKeywords', secondaryKeywords);
        }

        response = await fetch('/api/analyse', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Use analyse endpoint for text
        response = await fetch('/api/analyse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'paste',
            content: textContent.trim(),
            primaryKeyword: primaryKeyword.trim() || undefined,
            secondaryKeywords: secondaryKeywords
              .split(',')
              .map(k => k.trim())
              .filter(k => k.length > 0) || undefined,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.error || 'Analysis failed');
      }

      const results = await response.json();

      // Redirect to results page with data
      const encodedData = encodeURIComponent(JSON.stringify(results.data || results));
      router.push(`/results?data=${encodedData}`);
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'An error occurred',
      });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Input Mode Tabs */}
      <div className="flex gap-2 border-b border-gray-300 bg-white">
        {(['text', 'url', 'file'] as const).map(mode => (
          <button
            key={mode}
            type="button"
            onClick={() => {
              setInputMode(mode);
              setErrors({});
            }}
            className={`px-4 py-3 font-medium transition border-b-2 ${
              inputMode === mode
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {mode === 'text' && '📝 Paste Text'}
            {mode === 'url' && '🔗 Website URL'}
            {mode === 'file' && '📄 Upload File'}
          </button>
        ))}
      </div>

      {/* Input Content Area */}
      <div>
        {inputMode === 'text' && (
          <div className="space-y-2">
            <textarea
              value={textContent}
              onChange={e => setTextContent(e.target.value)}
              placeholder="Paste your content here..."
              className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              {textContent.length} / 50,000 characters
            </p>
          </div>
        )}

        {inputMode === 'url' && (
          <input
            type="text"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        )}

        {inputMode === 'file' && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition">
            <input
              type="file"
              onChange={e => {
                setSelectedFile(e.target.files?.[0] || null);
                setErrors({});
              }}
              accept=".txt,.docx,.pdf"
              className="hidden"
              id="file-input"
              disabled={isLoading}
            />
            <label htmlFor="file-input" className="cursor-pointer space-y-2">
              {selectedFile ? (
                <>
                  <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(1)}MB
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-700">Drop file or click to select</p>
                  <p className="text-sm text-gray-500">Supported: TXT, DOCX, PDF (max 50MB)</p>
                </>
              )}
            </label>
          </div>
        )}
      </div>

      {/* Errors */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          {Object.entries(errors).map(([key, error]) => (
            <p key={key} className="text-sm text-red-700 mb-1">
              • {error}
            </p>
          ))}
        </div>
      )}

      {/* Advanced Options */}
      <details className="group">
        <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
          ✨ Advanced Options
        </summary>
        <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
          <input
            type="text"
            value={primaryKeyword}
            onChange={e => setPrimaryKeyword(e.target.value)}
            placeholder="Primary keyword (e.g., 'web development')"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <input
            type="text"
            value={secondaryKeywords}
            onChange={e => setSecondaryKeywords(e.target.value)}
            placeholder="Secondary keywords (comma-separated)"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
      </details>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 font-semibold rounded-lg text-white transition ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        {isLoading ? '⏳ Analysing...' : '🚀 Analyse Content'}
      </button>
    </form>
  );
}
