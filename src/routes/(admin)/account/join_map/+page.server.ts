import { fail, redirect } from '@sveltejs/kit';

export const actions = {
    default: async ({ locals, request, fetch }) => {
        const session = await locals.getSession();
        if (!session) {
            return fail(401, { error: 'Unauthorized' });
        }

        const formData = await request.formData();
        const name = formData.get('name');
        const mapId = formData.get('map_id');
        const skipMapId = formData.get('skip_map_id') === 'on';

        try {
            // Set up free subscription using existing endpoint
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

            if (skipMapId) {
                // Update profile without map connection
                const { error: updateError } = await locals.supabase
                    .from("profiles")
                    .update({
                        full_name: name,
                        role: 'operator',
                        onboarded: true,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", session.user.id);

                if (updateError) {
                    return fail(500, { error: 'Failed to update profile' });
                }
            } else {
                // If not skipping map connection, proceed with map validation
                const { data: mapData, error: mapError } = await locals.supabase
                    .from("master_maps")
                    .select("id")
                    .eq("id", mapId)
                    .single();

                if (mapError || !mapData) {
                    return fail(404, { error: 'Map not found' });
                }

                // Get the first operation for this master map
                const { data: operationData, error: operationError } = await locals.supabase
                    .from("operations")
                    .select("id")
                    .eq("master_map_id", mapId)
                    .limit(1)
                    .single();

                if (operationError) {
                    return fail(500, { error: 'Failed to fetch operation data' });
                }

                // Single update with all profile changes
                const { error: updateError } = await locals.supabase
                    .from("profiles")
                    .update({
                        full_name: name,
                        role: 'operator',
                        onboarded: true,
                        updated_at: new Date().toISOString(),
                        master_map_id: mapId,
                        selected_operation_id: operationData?.id || null
                    })
                    .eq("id", session.user.id);

                if (updateError) {
                    return fail(500, { error: 'Failed to update profile' });
                }
            }

            throw redirect(303, '/account');

        } catch (error) {
            if (error instanceof Response) throw error;

            if (error instanceof Error) {
                return fail(500, { error: error.message });
            }
            throw error;
        }
    }
};