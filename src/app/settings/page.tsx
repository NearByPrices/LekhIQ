'use client';

import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [config, setConfig] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    setConfig({
      'Supabase URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
      'Gemini Model (Analysis)': process.env.NEXT_PUBLIC_GEMINI_ANALYSIS_MODEL,
      'Gemini Model (Rewrite)': process.env.NEXT_PUBLIC_GEMINI_REWRITE_MODEL,
    });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Development Settings</h1>
      <div className="card">
        <h2 className="mb-4 font-semibold">Configuration</h2>
        <div className="space-y-3">
          {Object.entries(config).map(([key, value]) => (
            <div key={key} className="border-t pt-3 first:border-0 first:pt-0">
              <div className="text-sm font-medium text-gray-600">{key}</div>
              <div className="mt-1 font-mono text-sm text-gray-900">
                {value ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : '(not set)'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
