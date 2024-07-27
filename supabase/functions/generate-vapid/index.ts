import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as webpush from "jsr:@negrel/webpush"

serve(async (req) => {
  const origin = req.headers.get('origin') || '*'
  const headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    const vapidKeys = await webpush.generateVapidKeys({ extractable: true });
    const exportedKeys = await webpush.exportVapidKeys(vapidKeys);

    // Convert the public key to a Uint8Array
    const publicKeyBuffer = await crypto.subtle.exportKey('raw', vapidKeys.publicKey);
    const applicationServerKey = new Uint8Array(publicKeyBuffer);

    console.log("New VAPID keys generated");

    return new Response(JSON.stringify({
      message: "New VAPID keys generated",
      applicationServerKey: Array.from(applicationServerKey), // For PushManager
      publicKey: exportedKeys.publicKey, // Original format for webpush library
      privateKey: exportedKeys.privateKey
    }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error generating VAPID keys:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }
})
