// src/hooks.server.ts
import {
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
  } from "$env/static/public"
  import { PRIVATE_SUPABASE_SERVICE_ROLE } from "$env/static/private"
  import { createSupabaseServerClient } from "@supabase/auth-helpers-sveltekit"
  import { createClient } from "@supabase/supabase-js"
  import type { Handle } from "@sveltejs/kit"
  
  export const handle: Handle = async ({ event, resolve }) => {
  
    event.locals.supabase = createSupabaseServerClient({
      supabaseUrl: PUBLIC_SUPABASE_URL,
      supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
      event,
      cookieOptions: {
        domain: "skanfarming.com.au",
        secure: true,
        sameSite: "lax",
        path: "/",
      },
    })
  
    // console.log("Supabase client created")
  
    event.locals.supabaseServiceRole = createClient(
      PUBLIC_SUPABASE_URL,
      PRIVATE_SUPABASE_SERVICE_ROLE,
      { auth: { persistSession: false } },
    )
  
    // console.log("Supabase service role client created")
  
    event.locals.getSession = async () => {
    //   console.log("getSession function called")
      const {
        data: { session },
      } = await event.locals.supabase.auth.getSession()
    //   console.log("Session retrieved:", session)
      return session
    }
  
  
    const resolveResult = await resolve(event, {
      filterSerializedResponseHeaders(name) {
        console.log("filterSerializedResponseHeaders called")
        console.log("Resolving event:", event)
        console.log("Header name:", name)
        return name === "content-range"
      },
    })
  
  
    return resolveResult
  }