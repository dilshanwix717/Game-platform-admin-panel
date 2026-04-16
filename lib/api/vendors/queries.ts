// FILE: lib/api/vendors/queries.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  getVendors,
  createVendor,
  updateVendor,
  updateVendorStatus,
} from "./api";
import { createVendorSchema, updateVendorSchema } from "./schemas";
import type {
  CreateVendorInput,
  UpdateVendorInput,
  PaginatedVendors,
} from "./types";

export const vendorKeys = {
  all: ["vendors"] as const,
  lists: () => [...vendorKeys.all, "list"] as const,
  list: (page = 1, limit = 10) =>
    [...vendorKeys.lists(), { page, limit }] as const,
  details: () => [...vendorKeys.all, "detail"] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
};

export function useVendors(
  page = 1,
  limit = 10
): UseQueryResult<PaginatedVendors> {
  return useQuery({
    queryKey: vendorKeys.list(page, limit),
    queryFn: () => getVendors(page, limit),
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateVendorInput) => {
      const validated = createVendorSchema.parse(input);
      return createVendor(validated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVendorInput }) => {
      const validated = updateVendorSchema.parse(data);
      return updateVendor(id, validated);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: vendorKeys.detail(variables.id),
      });
    },
    onError: (error: any) => {
      console.error("Update vendor error:", error);
    },
  });
}

export function useUpdateVendorStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateVendorStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
    },
    onError: (error: any) => {
      console.error("Update status error:", error);
    },
  });
}
