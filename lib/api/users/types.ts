// FILE: lib/api/users/types.ts

import type { z } from "zod";
import type {
  userSchema,
  createUserSchema,
  updateUserSchema,
  paginatedUsersSchema,
} from "./schemas";

export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type PaginatedUsers = z.infer<typeof paginatedUsersSchema>;
