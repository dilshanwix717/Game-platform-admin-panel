// FILE: lib/api/games/api.ts
import z from "zod";
import { apiGet, apiPost, apiPatch } from "../client";
import { paginatedGamesSchema, gameSchema } from "./schemas";
import type {
  Game,
  CreateGameInput,
  UpdateGameInput,
  PaginatedGames,
} from "./types";

// existing getGames/createGame/updateGame/updateGameStatus ... (unchanged)

export async function getGame(id: string): Promise<Game> {
  const response = await apiGet<any>(`/v1/games/${id}`);
  console.log("Fetched game data:", response);
  // parse with the gameSchema (which now allows vender & categories)
  return gameSchema.parse(response);
}

export async function getGames(page = 1, limit = 10): Promise<PaginatedGames> {
  const response = await apiGet<any>(`/v1/games?page=${page}&limit=${limit}`);

  console.log("Fetched games data:", response);
  return paginatedGamesSchema.parse(response);
}
export async function getGameById(id: string): Promise<Game> {
  const response = await apiGet<any>(`/v1/games/${id}`);
  // The backend should return the full game object compatible with gameSchema
  return gameSchema.parse(response);
}
export async function createGame(input: CreateGameInput): Promise<Game> {
  const response = await apiPost<any>("/v1/games", input);

  const idOnlySchema = z.object({ id: z.union([z.string(), z.number()]) });
  const idParse = idOnlySchema.safeParse(response);

  if (idParse.success) {
    return {
      id: idParse.data.id,
      name: input.name,
      description: input.description,
      playLink: input.playLink,
      thumbnailImageUrl: input.thumbnailImageUrl,
      sortOrderNumber: input.sortOrderNumber ?? 0,
      isActive: true,
      venderId: input.venderId ?? null,
      categoryIds: input.categoryIds ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Game;
  }

  return gameSchema.parse(response);
}

export async function updateGame(
  id: string,
  input: UpdateGameInput
): Promise<Game> {
  console.log("Updating game with input:", input);
  const response = await apiPatch<any>(`/v1/games/${id}`, input);

  const idOnlySchema = z.object({ id: z.union([z.string(), z.number()]) });
  const idParse = idOnlySchema.safeParse(response);

  if (idParse.success) {
    return {
      id: idParse.data.id,
      name: input.name ?? "",
      description: input.description ?? "",
      playLink: input.playLink ?? "",
      thumbnailImageUrl: input.thumbnailImageUrl,
      sortOrderNumber: input.sortOrderNumber ?? 0,
      isActive: true,
      venderId: input.venderId ?? null,
      categoryIds: input.categoryIds ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Game;
  }

  return gameSchema.parse(response);
}

export async function updateGameStatus(
  id: string,
  isActive: boolean
): Promise<void> {
  await apiPatch<any>(`/v1/games/${id}/status?isActive=${isActive}`);
}
