// FILE: lib/api/vendors/types.ts

import type { z } from "zod";
import type {
  vendorSchema,
  createVendorSchema,
  updateVendorSchema,
  paginatedVendorsSchema,
} from "./schemas";

export type Vendor = z.infer<typeof vendorSchema>;
export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
export type PaginatedVendors = z.infer<typeof paginatedVendorsSchema>;
