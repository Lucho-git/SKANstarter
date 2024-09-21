// src/lib/types.ts

export type FileUpload = {
    id: string;
    name: string;
    path: string;
    uploadedDate: string; // ISO string
    status: "Pending" | "Processed" | "Failed";
    message: string;
};