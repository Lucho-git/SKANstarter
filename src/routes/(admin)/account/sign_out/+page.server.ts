import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ locals: { getSession } }) => {
    const session = await getSession();

    return {
        session
    };
};

export const actions: Actions = {
    signout: async ({ locals: { supabase } }) => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return {
                success: false,
                error: error.message
            };
        }

        throw redirect(303, '/login');
    }
};