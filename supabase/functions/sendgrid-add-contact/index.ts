import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const sendgridApiKey = Deno.env.get('PRIVATE_SENDGRID_API_KEY')

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
    const { email, fullName, subscriptionStatus } = await req.json()
    console.log(`Received request for email: ${email}, fullName: ${fullName}, subscriptionStatus: ${subscriptionStatus}`)

    const data = {
      contacts: [
        {
          email,
          first_name: fullName ? fullName.split(' ')[0] : '',
          last_name: fullName ? fullName.split(' ').slice(1).join(' ') : ''
        }
      ]
    }
    console.log(`Prepared data for SendGrid: ${JSON.stringify(data)}`)

    try {
      const response = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const responseBody = await response.text()
      console.log(`SendGrid API response: ${response.status} ${response.statusText} - ${responseBody}`)

      if (!response.ok) {
        throw new Error(`SendGrid API error: ${response.status} ${response.statusText} - ${responseBody}`)
      }

      const parsedResponse = JSON.parse(responseBody)
      return new Response(JSON.stringify({ success: true, message: 'Contact added to SendGrid', data: parsedResponse }), {
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
