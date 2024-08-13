import { json, error, fail } from "@sveltejs/kit";
import type { RequestHandler } from './$types';

import { supabase } from '$lib/supabaseClient';

export const POST: RequestHandler = async ({ request, locals: { getSession } }) => {
    console.log('Received POST request');
    console.log('Content-Type:', request.headers.get('content-type'));

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
    if (action === 'deleteFile') {
        const { fileName } = rest;
        if (!fileName) {
          throw error(400, { message: 'No file name provided' });
        }
      
        const filePath = `user_${session.user.id}/${fileName}`;

        // Check if the file exists in the storage bucket
        const { data: fileData, error: fileError } = await supabase.storage
            .from('user_files_bucket')
            .list(`user_${session.user.id}`, {
            limit: 1,
            offset: 0,
            search: fileName,
            });

        if (fileError) {
            console.error('Error checking file existence:', fileError);
            throw error(500, { message: 'Error checking file existence. If this persists please contact us.' });
        }

        if (!fileData || fileData.length === 0) {
            console.log('File does not exist in storage:', filePath);
            throw error(404, { message: 'File not found in storage.' });
        }

        console.log('File exists in storage:', filePath);
        // Log the user ID and file name before deletion
        console.log('Deleting file:', fileName);
        console.log('User ID:', session.user.id);

        //Delete bucket data
        const { data: deleteData, error: deleteError } = await supabase.storage
        .from('user_files_bucket')
        .remove([`user_${session.user.id}/${fileName}`]);

        if (deleteError) {
            console.error('Error deleting file from storage:', deleteError);
            throw error(500, { message: 'Error deleting file from storage. If this persists please contact us.' });
        }


        // Delete the file metadata from the user_files table
        const { error: dbError } = await supabase
          .from('user_files')
          .delete()
          .match({ file_name: fileName, user_id: session.user.id });
      
        if (dbError) {
          console.error('Error deleting file metadata from database:', dbError);
          throw error(500, { message: 'Error deleting file metadata from database. If this persists please contact us.' });
        }
      
        console.log('File metadata deleted from database:', fileName);
      
        return json({ message: 'File deleted successfully' });
      }

    // updating profile with survey response info
    if (action === 'updateProfile') {
        console.log('Updating profile in server.ts file');
        const { fullName, companyName, website, surveyCompleted } = rest;
    
        const profileData: any = {
            id: session?.user.id,
            updated_at: new Date(),
        };
    
        if (fullName !== undefined) profileData.full_name = fullName;
        if (companyName !== undefined) profileData.company_name = companyName;
        if (website !== undefined) profileData.website = website;
        if (surveyCompleted !== undefined) profileData.survey_completed = surveyCompleted;
    
        console.log("Profile data to update:", profileData);
    
        const { error } = await supabase.from("profiles").upsert(profileData);
    
        if (error) {
            console.error("Supabase error:", error);
    
            if (error.code === '42501') {
                return json({
                    success: false,
                    message: "Unauthorized: You don't have permission to update this profile.",
                    error: error,
                    profileData: profileData,
                    session: {
                        userId: session?.user.id,
                        userEmail: session?.user.email,
                    },
                }, { status: 403 });
            }
    
            return json({
                success: false,
                message: "Unknown error 001 Server. If this persists please contact us.",
            }, { status: 500 });
        }
    
        // Update user metadata
        const metadataToUpdate = {};
        if (fullName !== undefined) metadataToUpdate.name = fullName;
        if (companyName !== undefined) metadataToUpdate.company = companyName;
        if (website !== undefined) metadataToUpdate.website = website;
    
        if (Object.keys(metadataToUpdate).length > 0) {
            const { error: metadataError } = await supabase.auth.updateUser({
                data: metadataToUpdate
            });
    
            if (metadataError) {
                console.error("Error updating user metadata:", metadataError);
            }
        }
    
        return json({ 
            success: true,
            updatedFields: Object.keys(profileData).filter(key => key !== 'id' && key !== 'updated_at')
        });
    }
    


    if (action === 'updateUserSubscription') {
        console.log('Updating user subscription in server.ts');
  
        const subscriptionData = {
          user_id: session.user.id,
          subscription: rest.subscription || 'FREE',
          current_seats: rest.current_seats || 1,
          future_seats: rest.future_seats || null,
          marker_limit: rest.marker_limit || 100,
          trail_limit: rest.trail_limit || 100000,
          founder: rest.founder || false,
          updated_at: new Date(),
        };
  
        console.log("Subscription data:", subscriptionData);
  
        const { error: subscriptionError } = await supabase.from("user_subscriptions").upsert(subscriptionData);
  
        if (subscriptionError) {
          console.error("Supabase subscription error:", subscriptionError);
          return json({ 
            success: false, 
            message: "Unknown error. If this persists please contact us." 
          }, { status: 500 });
        }
  
        return json({ 
          success: true, 
          ...subscriptionData 
        });
      }

  }



  // I'm unsure how specifically this is getting called, I think it's when none of the action parameters match it default to the file upload behaviour which might be problematic
  const form = await request.formData();
  const file = form.get('file') as File;

  if (!file) {
    throw error(400, { message: 'No file selected' });
  }





  //Upload User Files to bucket
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('user_files_bucket')
    .upload(`user_${session.user.id}/${file.name}`, file);

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    const errorMessage = uploadError.message || 'Unknown error';
    const errorCode = uploadError.statusCode || 'UNKNOWN_CODE';
    throw error(500, {
      message: `${errorCode} Error uploading file: ${errorMessage}`
    });
  }

  //Make a copy of all user data, allow inserts so we have no duplication issues
  const { data: uploadData2, error: uploadError2 } = await supabase.storage
    .from('user_files_bucket_copy')
    .upload(`user_${session.user.id}/${file.name}`, file);

  if (uploadError2) {
    if (!(uploadError2.statusCode == '409')){
    console.error('SHOULD NEVER REACH HERE :)', (uploadError2.statusCode == '409'))
    console.error('Error uploading file:', uploadError2);
    const errorMessage = uploadError2.message || 'Unknown error';
    const errorCode = uploadError2.statusCode || 'UNKNOWN_CODE';
    throw error(500, {
      message: `${errorCode} Error uploading file to copybucket: ${errorMessage}`
    });
}
  }


  //Upload User Files Metadata to Table
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