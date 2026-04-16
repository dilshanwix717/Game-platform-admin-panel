// FILE: lib/api/games/types.ts

import type { z } from "zod";
import type {
  gameSchema,
  createGameSchema,
  updateGameSchema,
  paginatedGamesSchema,
} from "./schemas";

export type Game = z.infer<typeof gameSchema>;
export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameSchema>;
export type PaginatedGames = z.infer<typeof paginatedGamesSchema>;
