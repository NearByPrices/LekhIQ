'use client';

import { useState } from 'react';

interface AnalysisFormProps {
  type: 'paste' | 'url';
}

export default function AnalysisForm({ type }: AnalysisFormProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!input.trim()) {
        setError(
          type === 'paste'
            ? 'Please enter some content'
            : 'Please enter a URL'
        );
        return;
      }

      // TODO: Call API endpoint
      console.log('Analysing:', { type, input });
      alert('Analysis coming soon!');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {type === 'paste' ? (
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your content here..."
          className="input h-48 font-mono text-sm"
          disabled={isLoading}
        />
      ) : (
        <input
          type="url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://example.com"
          className="input"
          disabled={isLoading}
        />
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-primary w-full disabled:opacity-50"
      >
        {isLoading ? 'Analysing...' : 'Analyse Content'}
      </button>
    </form>
  );
}
