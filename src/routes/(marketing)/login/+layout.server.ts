import { redirect } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({
    url,
    locals: { getSession },
    cookies
}) => {
    const session = await getSession()

    // Check for map_id in URL parameters
    const mapId = url.searchParams.get('map_id')
    if (mapId) {
        // Set or update the cookie
        cookies.set('pending_map_id', mapId, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 // 24 hours
        })
    }

    // if the user is already logged in return them to the account page
    if (session) {
        throw redirect(303, "/account")
    }

    return {
        session: session,
        url: url.origin,
    }
}