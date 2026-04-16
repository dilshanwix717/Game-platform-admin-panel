// FILE: lib/api/vendors/schemas.ts

import { z } from "zod";

const emptyToUndefined = (val: unknown) => {
  if (typeof val === "string" && val.trim() === "") return undefined;
  return val;
};

export const vendorSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  description: z.string(),
  venderImageUrl: z.string().optional(),
  venderImage: z
    .object({
      id: z.string(),
      url: z.string(),
    })
    .nullable()
    .optional(),
  sortOrderNumber: z.number().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const paginatedVendorsSchema = z.object({
  count: z.number(),
  currentPage: z.number(),
  offset: z.number(),
  results: z.array(vendorSchema),
});

export const createVendorSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  description: z.string().min(1, "Description is required").trim(),
  venderImageUrl: z
    .preprocess(
      emptyToUndefined,
      z.string().url("Must be a valid URL").optional()
    )
    .optional(),
  sortOrderNumber: z.number().int().min(0).optional(),
});

export const updateVendorSchema = z
  .object({
    name: z.string().min(1, "Name is required").trim().optional(),
    description: z.string().min(1, "Description is required").trim().optional(),
    venderImageUrl: z
      .preprocess(
        emptyToUndefined,
        z.string().url("Must be a valid URL").optional()
      )
      .optional(),
    sortOrderNumber: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const vendorListSchema = z.array(vendorSchema);
