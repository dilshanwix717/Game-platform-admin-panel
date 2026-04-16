// FILE: lib/api/games/schemas.ts
import { z } from "zod";

const emptyToUndefined = (val: unknown) => {
  if (typeof val === "string" && val.trim() === "") return undefined;
  return val;
};

export const gameSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  description: z.string(),
  playLink: z.string(),
  thumbnailImageUrl: z.string().optional(),
  thumbnailImage: z
    .object({
      id: z.string(),
      url: z.string(),
    })
    .nullable()
    .optional(),
  sortOrderNumber: z.number().optional(),
  isActive: z.boolean().optional(),
  // vendor object returned by GET /v1/games/:id
  vender: z
    .object({
      id: z.union([z.string(), z.number()]),
      name: z.string(),
      isActive: z.boolean().optional(),
      description: z.string().optional(),
    })
    .nullable()
    .optional(),
  // categories array returned by GET /v1/games/:id
  categories: z
    .array(
      z.object({
        id: z.union([z.string(), z.number()]),
        name: z.string(),
        isActive: z.boolean().optional(),
        description: z.string().optional(),
      })
    )
    .optional(),
  venderId: z.union([z.string(), z.number()]).nullable().optional(),
  categoryIds: z.array(z.union([z.string(), z.number()])).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const paginatedGamesSchema = z.object({
  count: z.number(),
  currentPage: z.number(),
  offset: z.number(),
  results: z.array(gameSchema),
});

export const createGameSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  description: z.string().min(1, "Description is required").trim(),
  playLink: z.string().min(1, "Play link is required").trim(),
  thumbnailImageUrl: z
    .preprocess(
      emptyToUndefined,
      z.string().url("Must be a valid URL").optional()
    )
    .optional(),
  sortOrderNumber: z.number().int().min(0).optional(),
  venderId: z.union([z.string(), z.number()]).nullable().optional(),
  categoryIds: z.array(z.union([z.string(), z.number()])).optional(),
});

export const updateGameSchema = z
  .object({
    name: z.string().min(1, "Name is required").trim().optional(),
    description: z.string().min(1, "Description is required").trim().optional(),
    playLink: z.string().min(1, "Play link is required").trim().optional(),
    thumbnailImageUrl: z
      .preprocess(
        emptyToUndefined,
        z.string().url("Must be a valid URL").optional()
      )
      .optional(),
    sortOrderNumber: z.number().int().min(0).optional(),
    venderId: z.union([z.string(), z.number()]).nullable().optional(),
    categoryIds: z.array(z.union([z.string(), z.number()])).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const gameListSchema = z.array(gameSchema);
