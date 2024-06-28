import {
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
  } from "$env/static/public"
  import { PRIVATE_SUPABASE_SERVICE_ROLE } from "$env/static/private"
  import { createSupabaseServerClient } from "@supabase/auth-helpers-sveltekit"
  import { createClient } from "@supabase/supabase-js"
  import type { Handle, HandleServerError } from "@sveltejs/kit"
  import { v4 as uuidv4 } from 'uuid';
  
  async function logErrorToDatabase(supabase, errorDetails: any, errorId: string) {
    try {
      const { error } = await supabase
        .from('error_logs')
        .insert({
          id: errorId,
          error_details: errorDetails,
          timestamp: new Date().toISOString()
        });
      
      if (error) {
        console.error('Failed to log error to database:', error);
      } else {
        console.log('Error logged to database successfully:', errorId);
      }
    } catch (logError) {
      console.error('Error while logging to database:', logError);
    }
  }
  
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
  
    event.locals.supabaseServiceRole = createClient(
      PUBLIC_SUPABASE_URL,
      PRIVATE_SUPABASE_SERVICE_ROLE,
      { auth: { persistSession: false } },
    )
  
    event.locals.getSession = async () => {
      const {
        data: { session },
      } = await event.locals.supabase.auth.getSession()
      return session
    }
  
    return await resolve(event)
  }
  
  export const handleError: HandleServerError = async ({ error, event }) => {
    const errorId = uuidv4();
  
    const errorDetails = {
      id: errorId,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      status: (error as any).status,
      url: event.url.toString(),
      route: event.route?.id,
      details: error.toString(),
      timestamp: new Date().toISOString()
    }
  
    console.error("Detailed error:", errorDetails);
  
    // Log all errors to the database
    await logErrorToDatabase(event.locals.supabaseServiceRole, errorDetails, errorId);
  
    // Return an object that will be passed to the error page
    return {
      message: "An error occurred. Our team has been notified.",
      errorId: errorId
    };
  }
  