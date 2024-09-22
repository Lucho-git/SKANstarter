// src/routes/api/files/download/+server.ts

import { error } from '@sveltejs/kit'
import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public"
import { PRIVATE_SUPABASE_SERVICE_ROLE } from "$env/static/private"

// Use the service role key for server-side operations
const supabase = createClient(PUBLIC_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_ROLE)

export async function GET({ url, locals }) {
    const fileName = url.searchParams.get('fileName')

    if (!fileName) {
        throw error(400, 'File name is required')
    }

    // Get the user from the session
    const session = await locals.getSession()
    if (!session || !session.user) {
        throw error(401, 'Unauthorized')
    }

    const userId = session.user.id

    try {
        // Construct the full path including the user-specific folder
        const filePath = `user_${userId}/${fileName}`

        const { data, error: supabaseError } = await supabase
            .storage
            .from('user_files_bucket')
            .download(filePath)

        if (supabaseError) {
            console.error('Supabase error:', supabaseError)
            throw error(500, supabaseError.message)
        }

        if (!data) {
            throw error(404, 'File not found')
        }

        // Set appropriate headers for file download
        const headers = new Headers()
        headers.append('Content-Disposition', `attachment; filename="${fileName}"`)
        headers.append('Content-Type', 'application/octet-stream')

        return new Response(data, { headers })
    } catch (err) {
        console.error('Error downloading file:', err)
        throw error(500, 'An error occurred while downloading the file')
    }
}