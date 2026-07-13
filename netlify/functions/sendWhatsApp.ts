/**
 * sendWhatsApp — Netlify Function placeholder for WhatsApp Cloud API.
 *
 * This is a placeholder that returns a success response.
 * In production, replace with actual WhatsApp Cloud API calls using:
 *   - Environment variable: WHATSAPP_TOKEN
 *   - Environment variable: PHONE_NUMBER_ID
 *
 * WhatsApp Cloud API endpoint:
 *   POST https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages
 *
 * See: https://developers.facebook.com/docs/whatsapp/cloud-api/
 */

import type { Context } from '@netlify/functions';

export default async (req: Request, _context: Context) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();

    // Validate required fields
    if (!body.invoiceNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invoice data is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── Future WhatsApp Cloud API Integration ──────────────────────────
    //
    // const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
    // const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
    //
    // if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    //   return new Response(
    //     JSON.stringify({ success: false, error: 'WhatsApp not configured' }),
    //     { status: 500, headers: { 'Content-Type': 'application/json' } }
    //   );
    // }
    //
    // const response = await fetch(
    //   `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       messaging_product: 'whatsapp',
    //       to: body.customer?.phone,
    //       type: 'text',
    //       text: { body: `Invoice ${body.invoiceNumber} - Total: ₹${body.grandTotal}` },
    //     }),
    //   }
    // );
    //
    // const result = await response.json();
    // ───────────────────────────────────────────────────────────────────

    // Placeholder response
    return new Response(
      JSON.stringify({
        success: true,
        message:
          'WhatsApp integration is ready for configuration. Set WHATSAPP_TOKEN and PHONE_NUMBER_ID environment variables to enable Cloud API messaging.',
        invoiceNumber: body.invoiceNumber,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
