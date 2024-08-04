import { redirect } from "@sveltejs/kit"

export const actions = {
    signout: async ({ locals: { supabase, getSession } }) => {
        const session = await getSession()
        try {
          await supabase.auth.signOut()
        } catch (error) {
          console.error("Error during sign-out:", error)
        } finally {
          // Clear any local storage items related to the session
          if (typeof window !== 'undefined') {
            console.log('Clearing local storage session...')
            localStorage.removeItem('supabase.auth.token')
            // Add any other items that need to be cleared
          }
          throw redirect(303, "/")
        }
      }
      
}
