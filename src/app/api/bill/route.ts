/**
 * API route to store a shared bill in Supabase.
 * Generates a short 8-char ID and stores the invoice + shop details.
 * Used by the WhatsApp sharing flow to create short bill URLs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/** Generate a short, URL-friendly random ID (8 chars) */
function generateShortId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const { invoice, shopSettings } = await request.json();

    if (!invoice || !shopSettings) {
      return NextResponse.json({ error: 'Missing invoice or shopSettings' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const shortId = generateShortId();

    const { error } = await supabase
      .from('shared_bills')
      .insert({
        id: shortId,
        invoice_data: invoice,
        shop_settings: shopSettings,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to store shared bill:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ id: shortId });
  } catch (error) {
    console.error('Share bill error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
