import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as webpush from "jsr:@negrel/webpush"

const PUBLIC_VAPID_KEY = Deno.env.get("PUBLIC_VAPID_KEY");
const PRIVATE_VAPID_KEY = Deno.env.get("PRIVATE_VAPID_KEY");

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
    const { subscription, title, body } = await req.json()
    console.log("Received request:", { subscription, title, body, PUBLIC_VAPID_KEY, PRIVATE_VAPID_KEY })
    if (!PUBLIC_VAPID_KEY || !PRIVATE_VAPID_KEY) {
      throw new Error("VAPID keys are not set in environment variables");
    }

    const vapidKeys = await webpush.importVapidKeys({
      publicKey: JSON.parse(PUBLIC_VAPID_KEY),
      privateKey: JSON.parse(PRIVATE_VAPID_KEY)
    });
    console.log("VAPID keys imported", PUBLIC_VAPID_KEY, PRIVATE_VAPID_KEY)

    const applicationServer = await webpush.ApplicationServer.new({
      contactInformation: 'mailto:lachie@skanfarming.com',
      vapidKeys: vapidKeys
    })
    console.log("ApplicationServer created")

    const pushSubscriber = applicationServer.subscribe(subscription)
    console.log("PushSubscriber created")

    const messageOptions: webpush.PushMessageOptions = {
      urgency: webpush.Urgency.Normal,
      ttl: 60,
    }

    await pushSubscriber.pushTextMessage(JSON.stringify({ title, body }), messageOptions)
    console.log("Push notification sent successfully")

    return new Response(JSON.stringify({ message: "Notification sent successfully" }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in push notification process:', error)
    let errorMessage = 'Failed to send push notification'
    let statusCode = 500

    if (error instanceof webpush.PushMessageError) {
      if (error.isGone()) {
        errorMessage = 'Push subscription is no longer valid'
        statusCode = 410
      } else {
        errorMessage = `Push service error: ${error.toString()}`
      }
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }
})
