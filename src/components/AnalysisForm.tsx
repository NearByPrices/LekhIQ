'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AnalysisFormProps {
  type: 'paste' | 'url';
}

export default function AnalysisForm({ type }: AnalysisFormProps) {
  const router = useRouter();
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
            ? 'Please enter some content (minimum 50 words)'
            : 'Please enter a URL'
        );
        setIsLoading(false);
        return;
      }

      // Call API endpoint
      const response = await fetch('/api/analyse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          content: input,
          title: type === 'url' ? input : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const results = await response.json();

      // Redirect to results page with data
      const encodedData = encodeURIComponent(JSON.stringify(results));
      router.push(`/results?data=${encodedData}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred'
      );
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {type === 'paste' ? (
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your content here (minimum 50 words)..."
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
