/**
 * API route to fetch a shared bill by its short ID.
 * Called by the /bill page when loading bill data from Supabase.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing bill ID' }, { status: 400 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('shared_bills')
      .select('invoice_data, shop_settings')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    return NextResponse.json({
      invoice: data.invoice_data,
      shopSettings: data.shop_settings,
    });
  } catch (error) {
    console.error('Fetch bill error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
