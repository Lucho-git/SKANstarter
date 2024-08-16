import { redirect } from "@sveltejs/kit"
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { supabase, getSession } }) => {
    const session = await getSession()
    if (!session) {
      throw redirect(303, "/login")
    }
  
    // Step 1: Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("master_map_id")
      .eq("id", session.user.id)
      .single()
  
    if (profileError || !profile?.master_map_id) {
      console.error("Error fetching profile or no master_map_id found:", profileError)
      return { subscription: null, vehicles: [] }
    }
  
    // Step 2: Get master map data
    const { data: masterMap, error: masterMapError } = await supabase
      .from("master_maps")
      .select("master_user_id")
      .eq("id", profile.master_map_id)
      .single()
  
    if (masterMapError || !masterMap?.master_user_id) {
      console.error("Error fetching master map or no master_user_id found:", masterMapError)
      return { subscription: null, vehicles: [] }
    }
  
    // Step 3: Get subscription data
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('subscription, marker_limit, trail_limit, lingering_seats, current_seats, next_billing_date')
      .eq('user_id', masterMap.master_user_id)
      .single()
  
    if (subscriptionError) {
      console.error("Error fetching subscription data:", subscriptionError)
      return { subscription: null, vehicles: [] }
    }
  
    // Step 4: Get vehicle data
    const { data: vehicleData, error: vehicleError } = await supabase
      .from("vehicle_state")
      .select("vehicle_id, last_update, vehicle_marker")
      .eq("master_map_id", profile.master_map_id)
  
    if (vehicleError) {
      console.error("Error fetching vehicle data:", vehicleError)
      return { subscription: subscriptionData, vehicles: [] }
    }
  
    // Step 5: Get user names for vehicles
    const vehicleIds = vehicleData.map(v => v.vehicle_id)
    const { data: vehicleUsers, error: vehicleUsersError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", vehicleIds)
  
    if (vehicleUsersError) {
      console.error("Error fetching vehicle user data:", vehicleUsersError)
      return { subscription: subscriptionData, vehicles: vehicleData }
    }
  
    // Combine vehicle data with user names
    const vehicles = vehicleData.map(vehicle => {
      const user = vehicleUsers.find(u => u.id === vehicle.vehicle_id)
      return {
        full_name: user ? user.full_name : 'Unknown',
        user_id: vehicle.vehicle_id,
        last_update: vehicle.last_update,
        vehicle_marker: vehicle.vehicle_marker
      }
    })
  console.log('vehicles:', vehicles)

  const isOwner = session.user.id === masterMap.master_user_id


  return { 
    subscription: subscriptionData, 
    vehicles: vehicles,
    isOwner: isOwner
  }  }
  

export const actions = {
  signout: async ({ locals: { supabase, getSession } }) => {
    const session = await getSession()

    try {
      console.log('Attempting to sign out1...')
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error during sign-out:", error)
    } finally {
      if (typeof window !== 'undefined') {
        console.log('Clearing local storage session...')
        localStorage.removeItem('supabase.auth.token')
      }
      throw redirect(303, "/")
    }
  }
}
