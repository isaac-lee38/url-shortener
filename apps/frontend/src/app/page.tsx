// app/page.tsx or pages/index.tsx (for Next.js with Tailwind)
'use client';

import { useState } from 'react';

export default function Home() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleShorten = async () => {
    setError('');
    setIsLoading(true);

    // if (!longUrl || !longUrl.startsWith('http')) {
    //     setError('Please enter a valid URL (e.g., https://...)');
    //     setIsLoading(false);
    //     return;
    // }

    try {
    // Example placeholder, replace with your FastAPI endpoint
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const response = await fetch(`${apiUrl}/shorten/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        { 
          long_url: longUrl
        }
      ),
    });

    if (!response.ok) {
        throw new Error('Failed to shorten URL. Please try again.');
      }

    const data = await response.json();

    const userFacingUrl = `${window.location.origin}/${data.short_code}`;
      setShortUrl(userFacingUrl);

    } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
        setShortUrl(''); // Clear previous short URL on error
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          🔗 URL Shortener
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm font-semibold mb-1">
              Enter your long URL
            </label>
            <input
              type="url"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="https://example.com/very/long/url"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-black transition"
            />
          </div>

          <button
            onClick={handleShorten}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
          >
            🔧 Shorten URL
          </button>

          {shortUrl && (
            <div className="mt-4">
              <label className="block text-gray-600 text-sm font-semibold mb-1">
                Shortened URL
              </label>
              <input
                type="text"
                value={shortUrl}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-green-600 bg-black-50 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}