// FILE: lib/api/files/api.ts
// API functions for file operations

import { apiUploadFile } from "../client";
import { fileUploadResponseSchema } from "./schemas";
import type { FileUploadResponse } from "./types";

/**
 * Upload a single file to the server
 * @param file - The file to upload
 * @returns Promise with the uploaded file URLs
 */
export async function uploadFile(file: File): Promise<FileUploadResponse> {
  const response = await apiUploadFile<any>("/v1/files/upload/single", file);

  // Validate the response structure using Zod
  return fileUploadResponseSchema.parse(response);
}
