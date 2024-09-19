// src/routes/admin/fieldview/+page.server.ts
import { redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ locals }) => {
    const { supabase, getSession } = locals

    // Retrieve the current user session
    const session = await getSession()

    // If there's no session, redirect to the login page
    if (!session) {
        throw redirect(303, "/login")
    }

    const userId = session.user.id

    // Fetch user_files from Supabase for the current user
    const { data, error } = await supabase
        .from('user_files')
        .select(`file_id, user_id, file_name, file_path, created_at`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching user files:', error)
        // Return an empty array as a fallback
        return {
            files: []
        }
    }

    // Map Supabase data to FileUpload type
    const files = data.map(file => ({
        id: file.file_id,
        name: file.file_name,
        path: file.file_path,
        uploadedDate: file.created_at,
        status: "Processed" as const, // **Stub:** Replace with actual status if available
        message: "File uploaded successfully", // **Stub:** Replace with actual message if available
    }))

    return {
        files
    }
}