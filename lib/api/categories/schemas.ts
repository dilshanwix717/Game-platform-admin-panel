// FILE: lib/api/categories/schemas.ts

import { z } from "zod";

// Helper: convert an empty string to undefined so optional URL checks don't fail
const emptyToUndefined = (val: unknown) => {
  // If the incoming value is an empty string, treat it as undefined.
  // This is useful for optional URL fields where the UI might provide "".
  if (typeof val === "string" && val.trim() === "") return undefined;
  return val;
};

// categorySchema describes the shape of a full Category object returned from the API
export const categorySchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  description: z.string(),
  // categoryImageUrl is optional and should be a string when present
  categoryImageUrl: z.string().optional(),
  // categoryImage represents an uploaded image object; it can be null/undefined
  categoryImage: z
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

export const paginatedCategoriesSchema = z.object({
  count: z.number(),
  currentPage: z.number(),
  offset: z.number(),
  results: z.array(categorySchema),
});

// Schema for creating a category. We validate required fields and make
// the image URL optional but ensure it's a valid URL when provided.
export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  description: z.string().min(1, "Description is required").trim(),
  // preprocess empty string -> undefined, then validate as optional URL
  categoryImageUrl: z
    .preprocess(
      emptyToUndefined,
      z.string().url("Must be a valid URL").optional()
    )
    .optional(), // .optional() here makes it explicitly optional
  sortOrderNumber: z.number().int().min(0).optional(),
});

// Schema for updating a category. All fields are optional because updates
// may only change a subset of fields. We also add a refine() to ensure
// the client sends at least one field to update.
export const updateCategorySchema = z
  .object({
    name: z.string().min(1, "Name is required").trim().optional(),
    description: z.string().min(1, "Description is required").trim().optional(),
    categoryImageUrl: z
      .preprocess(
        emptyToUndefined,
        z.string().url("Must be a valid URL").optional()
      )
      .optional(),
    sortOrderNumber: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    // This ensures callers can't send an empty object when they mean to update
    message: "At least one field must be provided",
  });

export const categoryListSchema = z.array(categorySchema);
