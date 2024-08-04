import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const resendApiKey = Deno.env.get('PRIVATE_RESEND_API_KEY')
const audienceId = Deno.env.get('PUBLIC_RESEND_AUDIENCE_ID')

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin') || '*'

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(origin) })
  }

  if (req.method === 'POST') {
    const { email, fullName } = await req.json()
    console.log(`Received request for email: ${email}, fullName: ${fullName}`)

    const firstName = fullName ? fullName.split(' ')[0] : ''
    const lastName = fullName ? fullName.split(' ').slice(1).join(' ') : ''

    const data = {
      email,
      first_name: firstName,
      last_name: lastName,
      unsubscribed: false
    }

    console.log(`Prepared data for Resend: ${JSON.stringify(data)}`)

    try {
      const response = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const responseBody = await response.text()
      console.log(`Resend API response: ${response.status} ${response.statusText} - ${responseBody}`)

      if (!response.ok) {
        throw new Error(`Resend API error: ${response.status} ${response.statusText} - ${responseBody}`)
      }

      const parsedResponse = JSON.parse(responseBody)
      return new Response(JSON.stringify({ success: true, message: 'Contact added to Resend', data: parsedResponse }), {
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error(`Error processing request: ${error.message}`)
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 400,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      })
    }
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders(origin) })
})
