// src/routes/auth/callback/+server.js
import { redirect } from "@sveltejs/kit"
import { isAuthApiError } from "@supabase/supabase-js"

export const GET = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get("code")
  
  if (code) {
    try {
      const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (authError) throw authError

      if (session) {
        // Try to create profile for new user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || null,
            updated_at: new Date().toISOString(),
            onboarded: false
          })
          .select()
          .single()

        // If error is not a duplicate key violation, log it
        if (profileError && profileError.code !== '23505') {
          console.error('Error creating profile:', profileError)
        }

        // Also create a free subscription entry
        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: session.user.id,
            subscription: 'FREE',
            marker_limit: 100,
            trail_limit: 100000,
            current_seats: 1,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (subscriptionError && subscriptionError.code !== '23505') {
          console.error('Error creating subscription:', subscriptionError)
        }
      }
    } catch (error) {
      // If you open in another browser, need to redirect to login.
      // Should not display error
      if (isAuthApiError(error)) {
        throw redirect(303, "/login")
      } else {
        throw error
      }
    }
  }

  const next = url.searchParams.get("next")
  if (next) {
    throw redirect(303, next)
  }

  throw redirect(303, "/account")
}