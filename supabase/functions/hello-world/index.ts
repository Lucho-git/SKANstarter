import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

console.log("Hello from Functions!")

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin') || '*'

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) })
  }

  try {
    const authHeader = req.headers.get('Authorization')!
    if (!authHeader) throw new Error('Missing Authorization header')
    
    return new Response(
      JSON.stringify({ message: "Hello World!" }),
      { headers: { ...corsHeaders(origin), "Content-Type": "application/json" } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } }
    )
  }
})
