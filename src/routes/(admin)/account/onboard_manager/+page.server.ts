// src/routes/(admin)/account/onboard_manager/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
    default: async ({ request, locals }) => {
        const session = await locals.getSession();
        if (!session) {
            return fail(401, { error: 'Not authenticated' });
        }

        const formData = await request.formData();
        const name = formData.get('name') as string;
        const companyName = formData.get('company_name') as string;
        const mobile = formData.get('mobile') as string;
        const contactable = formData.get('contactable') === 'on';

        try {
            // Update the profile with the manager's details
            const { error: updateError } = await locals.supabase
                .from('profiles')
                .update({
                    full_name: name,
                    company_name: companyName,
                    mobile: mobile,
                    contactable: contactable,
                    role: 'manager'
                })
                .eq('id', session.user.id);

            if (updateError) throw updateError;

            return { success: true };
        } catch (error) {
            console.error('Error:', error);
            return fail(500, {
                error: 'Failed to update profile'
            });
        }
    }
} satisfies Actions;