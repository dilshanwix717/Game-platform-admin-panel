// FILE: lib/api/categories/queries.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  getCategories,
  createCategory,
  updateCategory,
  updateCategoryStatus,
} from "./api";
import { createCategorySchema, updateCategorySchema } from "./schemas";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  PaginatedCategories,
} from "./types";

// Query keys factory
// We use a centralized object that builds query keys for React Query.
// Keeping keys in one place helps avoid typos and makes cache invalidation predictable.
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (page = 1, limit = 10) =>
    [...categoryKeys.lists(), { page, limit }] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  // detail(id) returns a key specific to a single category id
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

export function useCategories(
  page = 1,
  limit = 10
): UseQueryResult<PaginatedCategories> {
  return useQuery({
    queryKey: categoryKeys.list(page, limit),
    // queryFn should return a promise that resolves with the data
    queryFn: () => getCategories(page, limit),
  });
}

// useCreateCategory: a mutation hook for creating a category
// - Validates the input using Zod before sending to the API
// - When the mutation succeeds, it invalidates the categories list cache so
//   the UI shows the latest data.
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => {
      // Validate input before sending. This prevents simple mistakes on the client.
      const validated = createCategorySchema.parse(input);
      return createCategory(validated);
    },
    onSuccess: () => {
      // After successfully creating a category, tell React Query to refetch
      // anything that uses categoryKeys.lists() so the UI updates.
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

// useUpdateCategory: mutation hook for updating a category
// - Validates the update payload
// - Invalidates both list and detail cache entries so both list and single
//   category views will get fresh data.
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) => {
      // Validate the fields that will be sent to the server
      const validated = updateCategorySchema.parse(data);
      return updateCategory(id, validated);
    },
    onSuccess: (_, variables) => {
      // Invalidate data so React Query refetches it from server or cache
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(variables.id),
      });
    },
    onError: (error: any) => {
      // Simple error logging — you can replace this with better UI feedback
      console.error("Update category error:", error);
    },
  });
}

// useUpdateCategoryStatus: mutation for toggling active/inactive state
// We call a specific status endpoint and then invalidate the list so the UI
// receives the new status value.
export function useUpdateCategoryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateCategoryStatus(id, isActive),
    onSuccess: () => {
      // Refresh the categories list after changing status
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
    onError: (error: any) => {
      console.error("Update status error:", error);
    },
  });
}
