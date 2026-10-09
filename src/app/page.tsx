'use client';

import { useState } from 'react';
import AnalysisForm from '@/components/AnalysisForm';

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">LekhIQ</h1>
        <p className="text-xl text-gray-600">
          Content Intelligence & Humanisation
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Paste Content</h2>
          <AnalysisForm type="paste" />
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Website URL</h2>
          <AnalysisForm type="url" />
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">How it works</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex gap-3">
            <span className="font-semibold text-secondary">1.</span>
            <span>Paste content or enter a website URL</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-secondary">2.</span>
            <span>Analyse writing quality and AI-likeness characteristics</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-secondary">3.</span>
            <span>Get detailed scores and insights</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-secondary">4.</span>
            <span>Humanise content and improve readability</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
