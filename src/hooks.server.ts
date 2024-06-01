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
        domain: "skanfarming.com.au", // Set the cookie domain to ".supabase.co"
        secure: true, // Set the secure flag to true since Supabase uses HTTPS
        sameSite: "lax", // Adjust the sameSite option based on your requirements
        path: "/", // Set the cookie path to "/"
      },
    })

  event.locals.supabaseServiceRole = createClient(
    PUBLIC_SUPABASE_URL,
    PRIVATE_SUPABASE_SERVICE_ROLE,
    { auth: { persistSession: false } },
  )

  /**
   * A convenience helper so we can just call await getSession() instead const { data: { session } } = await supabase.auth.getSession()
   */
  event.locals.getSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession()
    return session
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === "content-range"
    },
  })
}
