import {
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
  } from "$env/static/public"
  import { PRIVATE_SUPABASE_SERVICE_ROLE } from "$env/static/private"
  import { createSupabaseServerClient } from "@supabase/auth-helpers-sveltekit"
  import { createClient } from "@supabase/supabase-js"
  import type { Handle, HandleServerError } from "@sveltejs/kit"
  import { v4 as uuidv4 } from 'uuid';
  
  async function getUserFullName(supabase, userId: string) {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();
  
    if (error) {
      console.error('Error fetching user full name:', error);
      return null;
    }
  
    return data?.full_name;
  }
  
  async function logErrorToDatabase(supabase, errorDetails: any, errorId: string) {
    try {
      const { error } = await supabase
        .from('error_logs')
        .insert({
          id: errorId,
          user_id: errorDetails.userId,
          full_name: errorDetails.userFullName,
          url: errorDetails.url,
          status: errorDetails.status,
          timestamp: errorDetails.timestamp,
          error_details: {
            method: errorDetails.method,
            headers: errorDetails.headers,
            userAgent: errorDetails.userAgent,
            referer: errorDetails.referer,
            route: errorDetails.route,
            message: errorDetails.message,
            stack: errorDetails.stack,
            details: errorDetails.details
          }
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
  
    try {
      const response = await resolve(event);
      
      if (response.status === 404) {
        const session = await event.locals.getSession();
        const errorId = uuidv4();
        const userId = session?.user?.id;
        const userFullName = await getUserFullName(event.locals.supabaseServiceRole, userId);
        
        const errorDetails = {
          id: errorId,
          status: 404,
          url: event.url.toString(),
          method: event.request.method,
          headers: Object.fromEntries(event.request.headers),
          userAgent: event.request.headers.get('user-agent'),
          referer: event.request.headers.get('referer'),
          userId: userId,
          userFullName: userFullName,
          timestamp: new Date().toISOString(),
          route: event.route?.id
        };
        
        console.error('404 Error:', errorDetails);
        await logErrorToDatabase(event.locals.supabaseServiceRole, errorDetails, errorId);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  export const handleError: HandleServerError = async ({ error, event }) => {
    const errorId = uuidv4();
    const session = await event.locals.getSession();
    const userId = session?.user?.id;
    const userFullName = await getUserFullName(event.locals.supabaseServiceRole, userId);
  
    const errorDetails = {
      id: errorId,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      status: (error as any).status || 500,
      url: event.url.toString(),
      route: event.route?.id,
      details: error.toString(),
      method: event.request.method,
      headers: Object.fromEntries(event.request.headers),
      userAgent: event.request.headers.get('user-agent'),
      referer: event.request.headers.get('referer'),
      userId: userId,
      userFullName: userFullName,
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
  