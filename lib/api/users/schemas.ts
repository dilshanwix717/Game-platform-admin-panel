// FILE: lib/api/users/schemas.ts

import { z } from "zod";

const emptyToUndefined = (val: unknown) => {
  if (typeof val === "string" && val.trim() === "") return undefined;
  return val;
};

export const userSchema = z.object({
  id: z.union([z.number(), z.string()]),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  profileImage: z
    .object({
      id: z.string(),
      url: z.string(),
    })
    .nullable()
    .optional(),
  profileImageUrl: z.string().optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const paginatedUsersSchema = z.object({
  count: z.number(),
  currentPage: z.number(),
  offset: z.number(),
  results: z.array(userSchema),
});

export const createUserSchema = z.object({
  email: z.string().email("Email is required").trim(),
  phoneNumber: z.string().trim().optional(),
  role: z.string().optional(),
});

export const updateUserSchema = z
  .object({
    email: z.string().email("Email must be valid").trim().optional(),
    phoneNumber: z.string().trim().optional(),
    role: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const userListSchema = z.array(userSchema);
