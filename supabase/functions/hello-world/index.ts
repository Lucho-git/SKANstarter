// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import {serve} from "https://deno.land/std@0.106.0/http/server.ts";

console.log("Hello World!");

serve(async (req) => {
  const body = await req.json()
  const data = { message: `Hello  + ${name}!`,
  
  return new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json"
    }
  },)
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/hello-world' \
    --header 'Authorization: Bearer ' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

