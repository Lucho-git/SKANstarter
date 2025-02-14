// src/routes/(admin)/account/onboard_manager/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
    default: async ({ request, locals, fetch }) => {
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
            // Set up free subscription first, just like in operator onboarding
            const response = await fetch("/account/api?/updateUserSubscription", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "updateUserSubscription" }),
            });

            if (!response.ok) {
                return fail(500, { error: 'Failed to setup subscription' });
            }

            // Update the profile with the manager's details
            const { error: updateError } = await locals.supabase
                .from('profiles')
                .update({
                    full_name: name,
                    company_name: companyName,
                    mobile: mobile,
                    contactable: contactable,
                    role: 'manager',
                    onboarded: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', session.user.id);

            if (updateError) throw updateError;

            return { success: true };
        } catch (error) {
            console.error('Error:', error);
            return fail(500, {
                error: error instanceof Error ? error.message : 'Failed to update profile'
            });
        }
    }
} satisfies Actions;