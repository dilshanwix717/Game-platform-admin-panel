// FILE: lib/api/files/queries.ts
// React Query hooks for file operations

import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { uploadFile } from "./api";
import type { FileUploadResponse } from "./types";

/**
 * Hook for uploading files
 * Returns a mutation that handles file upload with loading/error states
 */
export function useUploadFile(): UseMutationResult<
  FileUploadResponse,
  Error,
  File
> {
  return useMutation({
    mutationFn: (file: File) => uploadFile(file),
    onError: (error: any) => {
      console.error("File upload error:", error);
    },
  });
}
