'use client';

import AnalysisForm from '@/components/AnalysisForm';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          LekhIQ
        </h1>
        <p className="text-xl text-gray-600">
          Content Intelligence & Professional Humanisation
        </p>
        <p className="text-sm text-gray-500">
          Analyse AI-likeness, improve content quality, and transform writing into natural, engaging prose.
        </p>
      </div>

      {/* Main Analysis Form */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <AnalysisForm />
      </div>

      {/* Features Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p className="text-2xl mb-2">🔍</p>
          <h3 className="font-semibold text-gray-900 mb-1">AI-Likeness Score</h3>
          <p className="text-xs text-gray-600">Detect AI-writing characteristics</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <p className="text-2xl mb-2">📊</p>
          <h3 className="font-semibold text-gray-900 mb-1">Content Quality</h3>
          <p className="text-xs text-gray-600">Analyse readability & structure</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <p className="text-2xl mb-2">🌐</p>
          <h3 className="font-semibold text-gray-900 mb-1">SEO Analysis</h3>
          <p className="text-xs text-gray-600">Check SEO content quality</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
          <p className="text-2xl mb-2">✨</p>
          <h3 className="font-semibold text-gray-900 mb-1">Humanise</h3>
          <p className="text-xs text-gray-600">Rewrite with natural tone</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6 text-gray-900">How It Works</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-semibold text-gray-900">Input Content</h3>
            <p className="text-sm text-gray-600">
              Paste text, provide a URL, or upload TXT/DOCX/PDF files
            </p>
          </div>
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-semibold text-gray-900">Analyse</h3>
            <p className="text-sm text-gray-600">
              Get AI-likeness score, content quality, and SEO metrics
            </p>
          </div>
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-semibold text-gray-900">Review</h3>
            <p className="text-sm text-gray-600">
              See detailed metrics and actionable recommendations
            </p>
          </div>
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="font-semibold text-gray-900">Humanise</h3>
            <p className="text-sm text-gray-600">
              Transform content into natural, professional prose
            </p>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-gray-100">
        <h2 className="text-xl font-semibold mb-6 text-gray-900">Complete Analysis Toolkit</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Input Formats</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ Paste text directly</li>
              <li>✓ Analyse websites from URLs</li>
              <li>✓ Upload TXT, DOCX, PDF files</li>
              <li>✓ Set primary & secondary keywords</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Analysis Features</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ AI-likeness detection engine</li>
              <li>✓ Content quality scoring</li>
              <li>✓ Readability analysis</li>
              <li>✓ Professional humanisation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
