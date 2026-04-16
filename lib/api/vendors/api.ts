// FILE: lib/api/vendors/api.ts

import z from "zod";
import { apiGet, apiPost, apiPatch } from "../client";
import { paginatedVendorsSchema, vendorSchema } from "./schemas";
import type {
  Vendor,
  CreateVendorInput,
  UpdateVendorInput,
  PaginatedVendors,
} from "./types";

export async function getVendors(
  page = 1,
  limit = 10
): Promise<PaginatedVendors> {
  const response = await apiGet<any>(`/v1/venders?page=${page}&limit=${limit}`);

  console.log("Fetched vendors data:", response);
  return paginatedVendorsSchema.parse(response);
}

export async function createVendor(input: CreateVendorInput): Promise<Vendor> {
  const response = await apiPost<any>("/v1/venders", input);

  const idOnlySchema = z.object({ id: z.union([z.string(), z.number()]) });
  const idParse = idOnlySchema.safeParse(response);

  if (idParse.success) {
    return {
      id: idParse.data.id,
      name: input.name,
      description: input.description,
      venderImageUrl: input.venderImageUrl,
      sortOrderNumber: input.sortOrderNumber ?? 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Vendor;
  }

  return vendorSchema.parse(response);
}

export async function updateVendor(
  id: string,
  input: UpdateVendorInput
): Promise<Vendor> {
  const response = await apiPatch<any>(`/v1/venders/${id}`, input);

  const idOnlySchema = z.object({ id: z.union([z.string(), z.number()]) });
  const idParse = idOnlySchema.safeParse(response);

  if (idParse.success) {
    return {
      id: idParse.data.id,
      name: input.name ?? "",
      description: input.description ?? "",
      venderImageUrl: input.venderImageUrl,
      sortOrderNumber: input.sortOrderNumber ?? 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Vendor;
  }

  return vendorSchema.parse(response);
}

export async function updateVendorStatus(
  id: string,
  isActive: boolean
): Promise<void> {
  await apiPatch<any>(`/v1/venders/${id}/status?isActive=${isActive}`);
}
