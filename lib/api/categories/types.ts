// FILE: lib/api/categories/types.ts

import type { z } from "zod";
import type {
  categorySchema,
  createCategorySchema,
  updateCategorySchema,
  paginatedCategoriesSchema,
} from "./schemas";

export type Category = z.infer<typeof categorySchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type PaginatedCategories = z.infer<typeof paginatedCategoriesSchema>;
