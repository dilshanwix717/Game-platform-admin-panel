// FILE: lib/api/games/queries.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  getGames,
  getGame,
  createGame,
  updateGame,
  updateGameStatus,
} from "./api";
import { createGameSchema, updateGameSchema } from "./schemas";
import type { CreateGameInput, UpdateGameInput, PaginatedGames } from "./types";

export const gameKeys = {
  all: ["games"] as const,
  lists: () => [...gameKeys.all, "list"] as const,
  list: (page = 1, limit = 10) =>
    [...gameKeys.lists(), { page, limit }] as const,
  details: () => [...gameKeys.all, "detail"] as const,
  detail: (id: string | undefined | null) =>
    [...gameKeys.details(), id] as const,
};

export function useGames(page = 1, limit = 10): UseQueryResult<PaginatedGames> {
  return useQuery({
    queryKey: gameKeys.list(page, limit),
    queryFn: () => getGames(page, limit),
  });
}

export function useGame(id?: string | null) {
  return useQuery({
    queryKey: gameKeys.detail(id),
    enabled: !!id,
    queryFn: () => getGame(String(id)),
  });
}

export function useCreateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGameInput) => {
      const validated = createGameSchema.parse(input);
      return createGame(validated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
    },
  });
}

export function useUpdateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGameInput }) => {
      const validated = updateGameSchema.parse(data);
      return updateGame(id, validated);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: gameKeys.detail(variables.id),
      });
    },
    onError: (error: any) => {
      console.error("Update game error:", error);
    },
  });
}

export function useUpdateGameStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateGameStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
    },
    onError: (error: any) => {
      console.error("Update status error:", error);
    },
  });
}
