import { fail } from '@sveltejs/kit';

export const actions = {
    default: async ({ locals, request }) => {
        const session = await locals.getSession();
        if (!session) {
            return fail(401, { error: 'Unauthorized' });
        }

        const formData = await request.formData();
        const name = formData.get('name');
        const mapId = formData.get('map_id');
        const skipMapId = formData.get('skip_map_id') === 'on';

        // Update profile name
        const { error: nameError } = await locals.supabase
            .from("profiles")
            .update({ full_name: name })
            .eq("id", session.user.id);

        if (nameError) {
            return fail(500, { error: 'Failed to update name' });
        }

        // If skipping map connection, we're done
        if (skipMapId) {
            return { success: true };
        }

        // Check if the map exists
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

        // Update the user's profile with the new master_map_id and selected_operation_id
        const { error: updateError } = await locals.supabase
            .from("profiles")
            .update({
                master_map_id: mapId,
                selected_operation_id: operationData?.id || null
            })
            .eq("id", session.user.id);

        if (updateError) {
            return fail(500, { error: 'Failed to connect to map' });
        }

        return { success: true };
    }
};