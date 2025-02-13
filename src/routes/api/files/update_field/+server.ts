// src/routes/api/files/update_field/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ locals, request }) => {
  try {
    const session = await locals.getSession();
    if (!session) {
      console.error('No session found');
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { fieldId, name } = await request.json();

    if (!fieldId || !name) {
      return json({ error: 'Field ID and name are required' }, { status: 400 });
    }

    // First, check if the field belongs to the user's master map
    console.log('Fetching profile data to update field');
    const { data: profileData, error: profileError } = await locals.supabase
      .from('profiles')
      .select('master_map_id')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Supabase error fetching profile:', profileError);
      throw profileError;
    }

    const masterMapId = profileData.master_map_id;
    if (!masterMapId) {
      return json({ error: 'No master map associated with user' }, { status: 400 });
    }

    // Update the field name
    const { data: updateData, error: updateError } = await locals.supabase
      .from('fields')
      .update({ name })
      .eq('field_id', fieldId)
      .eq('map_id', masterMapId)
      .select();

    if (updateError) {
      console.error('Supabase error updating field:', updateError);
      throw updateError;
    }

    // Log successful update
    console.log('Successfully updated field with ID:', fieldId);
    console.log('Updated field data:', updateData);

    return json({
      success: true,
      message: 'Field name updated successfully',
      data: updateData
    });
  } catch (error) {
    console.error('Error updating field:', error);
    return json({ error: 'An error occurred while updating the field name' }, { status: 500 });
  }
};
