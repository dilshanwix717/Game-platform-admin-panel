// FILE: lib/api/categories/api.ts

import z from "zod";
import { apiGet, apiPost, apiPatch } from "../client";
import { paginatedCategoriesSchema, categorySchema } from "./schemas";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  PaginatedCategories,
} from "./types";

export async function getCategories(
  page = 1,
  limit = 10
): Promise<PaginatedCategories> {
  const response = await apiGet<any>(
    `/v1/categories?page=${page}&limit=${limit}`
  );

  console.log("Fetched categories data:", response);
  // Validate with Zod to ensure downstream code receives the expected type
  return paginatedCategoriesSchema.parse(response);
}

// createCategory: send a POST to create a category.
// Different backends may return either:
//  - a full Category object, or
//  - a minimal response such as { id: '...' }
// We handle both cases so the caller always gets back a value compatible with
// the Category type. When only an id is returned, we construct a minimal
// Category object from the input — React Query will normally refetch the
// real object after creation, so this is only a temporary convenience.
export async function createCategory(
  input: CreateCategoryInput
): Promise<Category> {
  const response = await apiPost<any>("/v1/categories", input);

  // If backend returns only an id { id: '...' }, compose a Category using input
  const idOnlySchema = z.object({ id: z.union([z.string(), z.number()]) });
  const idParse = idOnlySchema.safeParse(response);

  if (idParse.success) {
    // Create a minimal Category object from the provided input so callers
    // can immediately access something useful. Note: timestamps and isActive
    // are guessed — the real values should be fetched from the server later.
    return {
      id: idParse.data.id,
      name: input.name,
      description: input.description,
      categoryImageUrl: input.categoryImageUrl,
      sortOrderNumber: input.sortOrderNumber ?? 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Category;
  }

  // Otherwise try to parse the full category object (server returned full object)
  return categorySchema.parse(response);
}

// updateCategory: send a PATCH to update a category by id.
// Often the server returns either the updated object or a small success payload
// (like { id: '...' }). When only an id is returned we return a minimal
// Category object — React Query's invalidation will usually cause a refetch
// to obtain the fresh full object.
export async function updateCategory(
  id: string,
  input: UpdateCategoryInput
): Promise<Category> {
  const response = await apiPatch<any>(`/v1/categories/${id}`, input);

  // Backend returns only { id: '...' } on success
  const idOnlySchema = z.object({ id: z.union([z.string(), z.number()]) });
  const idParse = idOnlySchema.safeParse(response);

  if (idParse.success) {
    // Return a minimal Category object - React Query will refetch the full data
    return {
      id: idParse.data.id,
      name: input.name ?? "",
      description: input.description ?? "",
      categoryImageUrl: input.categoryImageUrl,
      sortOrderNumber: input.sortOrderNumber ?? 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Category;
  }

  // If the response is a full category object, parse it
  return categorySchema.parse(response);
}

// updateCategoryStatus: toggle the category's active status on the server.
// We don't attempt to parse the server response here — the hook that calls this
// function will invalidate the list cache and trigger a refetch to get the
// correct state.
export async function updateCategoryStatus(
  id: string,
  isActive: boolean
): Promise<void> {
  // Call the endpoint. We append the isActive as a query param here,
  // but you could also send it in the request body depending on your API.
  await apiPatch<any>(`/v1/categories/${id}/status?isActive=${isActive}`);
}
