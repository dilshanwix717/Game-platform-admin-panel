// FILE: lib/api/users/api.ts

import z from "zod";
import { apiGet, apiPost, apiPatch } from "../client";
import { paginatedUsersSchema, userSchema } from "./schemas";
import type {
  User,
  CreateUserInput,
  UpdateUserInput,
  PaginatedUsers,
} from "./types";

export async function getUsers(page = 1, limit = 10): Promise<PaginatedUsers> {
  const response = await apiGet<any>(
    `/v1/user-accounts?page=${page}&limit=${limit}`
  );

  console.log("Fetched users data:", response);
  return paginatedUsersSchema.parse(response);
}

// export async function createUser(input: CreateUserInput): Promise<User> {
//   const response = await apiPost<any>("/v1/user-accounts", input);

//   const idOnlySchema = z.object({ id: z.union([z.string(), z.number()]) });
//   const idParse = idOnlySchema.safeParse(response);

//   if (idParse.success) {
//     return {
//       id: idParse.data.id,
//       email: input.email,
//       username: input.username,
//       phoneNumber: input.phoneNumber,
//       role: input.role ?? "User",
//       isActive: true,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     } as User;
//   }

//   return userSchema.parse(response);
// }

// export async function updateUser(
//   id: string,
//   input: UpdateUserInput
// ): Promise<User> {
//   const response = await apiPatch<any>(`/v1/user-accounts/${id}`, input);

//   const idOnlySchema = z.object({ id: z.union([z.string(), z.number()]) });
//   const idParse = idOnlySchema.safeParse(response);

//   if (idParse.success) {
//     return {
//       id: idParse.data.id,
//       email: input.email ?? "",
//       username: input.username,
//       phoneNumber: input.phoneNumber,
//       role: input.role ?? "User",
//       isActive: true,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     } as User;
//   }

//   return userSchema.parse(response);
// }

// export async function updateUserStatus(
//   id: string,
//   isActive: boolean
// ): Promise<void> {
//   await apiPatch<any>(`/v1/user-accounts/${id}/status?isActive=${isActive}`);
// }
