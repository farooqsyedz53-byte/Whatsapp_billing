/**
 * Hello — Health check Netlify Function.
 * Returns a simple greeting to verify the API is working.
 */

import type { Context } from '@netlify/functions';

export default async (req: Request, _context: Context) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      message: 'Hello from StyleBill API! 👋',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
