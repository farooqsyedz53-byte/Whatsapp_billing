/**
 * Server-side URL shortener API route.
 * Proxies requests to is.gd / v.gd to avoid CORS issues from client-side calls.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    // Try is.gd first
    const shortened = await tryShorten('https://is.gd/create.php', url)
      || await tryShorten('https://v.gd/create.php', url);

    if (shortened) {
      return NextResponse.json({ shortUrl: shortened });
    }

    // All shorteners failed — return original URL
    return NextResponse.json({ shortUrl: url });
  } catch (error) {
    console.error('URL shortening error:', error);
    return NextResponse.json({ shortUrl: '' }, { status: 500 });
  }
}

/**
 * Attempt to shorten a URL using is.gd / v.gd compatible API.
 * Returns the short URL string on success, or null on failure.
 */
async function tryShorten(apiBase: string, longUrl: string): Promise<string | null> {
  try {
    const apiUrl = `${apiBase}?format=simple&url=${encodeURIComponent(longUrl)}`;
    const response = await fetch(apiUrl, {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (response.ok) {
      const text = await response.text();
      // Validate that it looks like a URL
      if (text.startsWith('http')) {
        return text.trim();
      }
    }
    return null;
  } catch {
    return null;
  }
}
