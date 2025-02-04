// src/routes/(admin)/account/select_role/+page.server.ts
import { redirect, type Actions } from '@sveltejs/kit';

export const actions = {
    default: async ({ request, locals }) => {
        const data = await request.formData();
        const role = data.get('role');

        if (!role) {
            return {
                error: 'Please select a role'
            };
        }

        try {
            const session = await locals.getSession();
            if (!session) {
                return {
                    error: 'Not authenticated'
                };
            }

            // Update the role field in profiles table
            const { error } = await locals.supabase
                .from('profiles')
                .update({ role: role })
                .eq('id', session.user.id);

            if (error) throw error;

            // Instead of throwing redirect, return it
            if (role === 'operator') {
                return { status: 303, redirect: '/account/join_map' };
            } else if (role === 'manager') {
                return { status: 303, redirect: '/account/onboard_manager' };
            }
        } catch (error) {
            console.error('Error:', error);
            return {
                error: 'Failed to update role'
            };
        }

        return {
            error: 'Invalid role selected'
        };
    }
} satisfies Actions;