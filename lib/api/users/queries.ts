// FILE: lib/api/users/queries.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { getUsers } from "./api";
// import { getUsers, createUser, updateUser, updateUserStatus } from "./api";
// import { createUserSchema, updateUserSchema } from "./schemas";
import type { CreateUserInput, UpdateUserInput, PaginatedUsers } from "./types";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (page = 1, limit = 10) =>
    [...userKeys.lists(), { page, limit }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export function useUsers(page = 1, limit = 10): UseQueryResult<PaginatedUsers> {
  return useQuery({
    queryKey: userKeys.list(page, limit),
    queryFn: () => getUsers(page, limit),
  });
}

// export function useCreateUser() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (input: CreateUserInput) => {
//       const validated = createUserSchema.parse(input);
//       return createUser(validated);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: userKeys.lists() });
//     },
//   });
// }

// export function useUpdateUser() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) => {
//       const validated = updateUserSchema.parse(data);
//       return updateUser(id, validated);
//     },
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: userKeys.lists() });
//       queryClient.invalidateQueries({
//         queryKey: userKeys.detail(variables.id),
//       });
//     },
//     onError: (error: any) => {
//       console.error("Update user error:", error);
//     },
//   });
// }

// export function useUpdateUserStatus() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
//       updateUserStatus(id, isActive),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: userKeys.lists() });
//     },
//     onError: (error: any) => {
//       console.error("Update status error:", error);
//     },
//   });
// }
