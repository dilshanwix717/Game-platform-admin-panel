// FILE: lib/api/files/schemas.ts
// Zod schemas for file upload validation

import { z } from "zod";

export const fileUploadResponseSchema = z.object({
  url: z.string().url(),
  directUrl: z.string().url(),
});
