// src/lib/api/server/files.ts

import type { SupabaseClient } from '@supabase/supabase-js';
import type { FileUpload } from '$lib/types';

/**
 * Fetches user files from Supabase.
 * @param supabase - The Supabase client instance.
 * @param userId - The ID of the user whose files to fetch.
 * @returns A promise that resolves to an array of FileUpload objects.
 */
export async function fetchUserFiles(supabase: SupabaseClient, userId: string): Promise<FileUpload[]> {
    const { data, error } = await supabase
        .from('user_files')
        .select(`file_id, user_id, file_name, file_path, created_at`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user files:', error);
        throw new Error('Failed to fetch user files');
    }

    // Map Supabase data to FileUpload type
    return data.map((file: any) => ({
        id: file.file_id,
        name: file.file_name,
        path: file.file_path,
        uploadedDate: file.created_at,
        status: "Processed", // **Stub:** Replace with actual status if available
        message: "File uploaded successfully", // **Stub:** Replace with actual message if available
    }));
}

/**
 * Deletes a user file from Supabase.
 * @param supabase - The Supabase client instance.
 * @param userId - The ID of the user who owns the file.
 * @param fileId - The ID of the file to delete.
 * @returns A promise that resolves when the file is deleted.
 */
export async function deleteUserFile(supabase: SupabaseClient, userId: string, fileId: string): Promise<void> {
    const { error } = await supabase
        .from('user_files')
        .delete()
        .eq('file_id', fileId)
        .eq('user_id', userId); // Ensure the user owns the file

    if (error) {
        console.error('Error deleting file:', error);
        throw new Error('Failed to delete file');
    }
}

/**
 * (Optional) Uploads a new user file to Supabase.
 * @param supabase - The Supabase client instance.
 * @param userId - The ID of the user uploading the file.
 * @param name - The name of the file.
 * @param path - The path where the file is stored.
 * @returns A promise that resolves to the newly uploaded FileUpload object.
 */
export async function uploadUserFile(supabase: SupabaseClient, userId: string, name: string, path: string): Promise<FileUpload> {
    // Generate a unique ID, e.g., using UUID
    const fileId = generateUniqueId();

    const { error } = await supabase
        .from('user_files')
        .insert([
            {
                file_id: fileId,
                user_id: userId,
                file_name: name,
                file_path: path,
                created_at: new Date().toISOString(),
            }
        ]);

    if (error) {
        console.error('Error uploading file:', error);
        throw new Error('Failed to upload file');
    }

    return {
        id: fileId,
        name,
        path,
        uploadedDate: new Date().toISOString(),
        status: "Processed", // **Stub:** Replace with actual status if available
        message: "File uploaded successfully", // **Stub:** Replace with actual message if available
    };
}

/**
 * Utility function to generate a unique ID.
 * @returns A unique string ID.
 */
function generateUniqueId(): string {
    return '_' + Math.random().toString(36).substr(2, 9);
}