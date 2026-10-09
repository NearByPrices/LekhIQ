import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'LekhIQ - Content Intelligence & Humanisation',
  description: 'Analyse, improve, and humanise your content with AI-powered insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <header className="border-b border-gray-200 bg-white">
          <nav className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-primary">LekhIQ</div>
              <div className="flex gap-6">
                <a href="/" className="text-sm font-medium hover:text-secondary">
                  Analyse
                </a>
                <a href="/history" className="text-sm font-medium hover:text-secondary">
                  History
                </a>
                <a href="/testing" className="text-sm font-medium hover:text-secondary">
                  Testing
                </a>
                <a href="/settings" className="text-sm font-medium hover:text-secondary">
                  Settings
                </a>
              </div>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
