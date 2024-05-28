// // src/routes/api/saveMapState.ts
// import { json, error } from "@sveltejs/kit"
// import type { RequestHandler } from "./$types"
// import { supabase } from "$lib/supabaseClient"

// export const POST: RequestHandler = async ({ request, locals: { getSession } }) => {
//   const session = await getSession()
//   if (!session) {
//     throw error(401, { message: "Unauthorized" })
//   }

//   const { markerInserts } = await request.json()

//   try {
//     const { data, error: insertError } = await supabase
//       .from("map_markers")
//       .insert(markerInserts)

//     if (insertError) {
//       console.error("Error saving map markers to database:", insertError)
//       throw error(500, { message: "Error saving map markers to database" })
//     }

//     return json({ success: true, data })
//   } catch (err) {
//     console.error("Error in saveMapState:", err)
//     throw error(500, { message: "Internal Server Error" })
//   }
// }
