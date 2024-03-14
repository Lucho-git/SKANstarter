import { json, error, fail } from "@sveltejs/kit";
import type { RequestHandler } from './$types';

import { supabase } from '$lib/supabaseClient';

export const POST: RequestHandler = async ({ request, locals: { getSession } }) => {
  const session = await getSession();
  if (!session) {
    throw error(401, { message: 'Unauthorized' });
  }

  
  const contentType = request.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    const { action, ...rest } = await request.json();

    if (action === 'fetchUploadedFiles') {
      const { data, error: err } = await supabase
        .from('user_files')
        .select('file_name')
        .eq('user_id', session.user.id);

      if (err) {
        console.error("Error fetching uploaded files:", err);
        return fail(500, {
          message: "Error fetching uploaded files. If this persists please contact us.",
        });
      }

      return json({ files: data.map((file) => file.file_name) });
    }
  }


  const form = await request.formData();
  const file = form.get('file') as File;

  if (!file) {
    throw error(400, { message: 'No file selected' });
  }

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('user_files_bucket')
    .upload(`user_${session.user.id}/${file.name}`, file);

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    throw error(500, { message: 'Error uploading file. If this persists please contact us.' });
  }

  const { data: insertData, error: insertError } = await supabase
    .from('user_files')
    .insert({
      file_name: file.name,
      file_path: uploadData.path,
      user_id: session.user.id,
    })
    .select('*');

  if (insertError) {
    console.error('Error inserting file data:', insertError);
    console.error('User ID:', session.user.id);
    console.error('File name:', file.name);
    console.error('Inserted row data:', insertData);

    throw error(500, { message: 'Error storing file data. If this persists please contact us.' });
  }

  return json({ message: 'File uploaded successfully', data: insertData });
};