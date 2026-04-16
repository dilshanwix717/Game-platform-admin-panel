import { getAuthTokens } from "./auth-storage";

export const API_BASE_URL =
  process.env.API_BASE_URL ?? "http://47.237.167.215:3000";

export type CreateCategoryRequest = {
  name: string;
  description: string;
  categoryImageUrl: string;
  sortOrderNumber: number;
};

export type CategoryResponse = {
  id: number | string;
  name: string;
  description: string;
  categoryImageUrl?: string;
  sortOrderNumber?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function buildHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const tokens = getAuthTokens();
  if (tokens?.accessToken) {
    (headers as Record<string, string>)[
      "Authorization"
    ] = `Bearer ${tokens.accessToken}`;
  }

  return headers;
}

async function requestJson<TResponse>(
  path: string,
  options: RequestInit
): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...buildHeaders(),
      ...(options.headers ?? {}),
    },
  });

  let payload: any = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      // keep raw text if not JSON
      payload = text;
    }
  }

  if (!res.ok) {
    const message =
      (payload && (payload.message || payload.error)) ||
      `Request failed with ${res.status}`;
    throw new Error(message);
  }

  return payload as TResponse;
}

export async function postJson<TBody extends object, TResponse>(
  path: string,
  body: TBody
): Promise<TResponse> {
  return requestJson<TResponse>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function createCategory(
  payload: CreateCategoryRequest
): Promise<CategoryResponse> {
  return postJson<CreateCategoryRequest, CategoryResponse>(
    "/v1/categories",
    payload
  );
}

export async function getJson<TResponse>(path: string): Promise<TResponse> {
  return requestJson<TResponse>(path, { method: "GET" });
}

export async function listCategories(): Promise<CategoryResponse[]> {
  const resp: any = await getJson<any>("/v1/categories");
  if (Array.isArray(resp)) return resp as CategoryResponse[];
  if (resp && Array.isArray(resp.items))
    return resp.items as CategoryResponse[];
  if (resp && Array.isArray(resp.data)) return resp.data as CategoryResponse[];
  if (resp && Array.isArray(resp.results))
    return resp.results as CategoryResponse[];
  return [];
}

export type UpdateCategoryRequest = {
  name?: string;
  description?: string;
  categoryImageUrl?: string;
  sortOrderNumber?: number;
};

export async function patchJson<TBody extends object, TResponse>(
  path: string,
  body: TBody
): Promise<TResponse> {
  return requestJson<TResponse>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function updateCategory(
  id: string,
  payload: UpdateCategoryRequest
): Promise<CategoryResponse> {
  return patchJson<UpdateCategoryRequest, CategoryResponse>(
    `/v1/categories/${id}`,
    payload
  );
}

export async function updateCategoryStatus(
  id: string,
  isActive: boolean
): Promise<CategoryResponse | undefined> {
  return requestJson<CategoryResponse | undefined>(
    `/v1/categories/${id}/status?isActive=${isActive}`,
    {
      method: "PATCH",
    }
  );
}

export type FileUploadResponse = {
  url: string;
  directUrl: string;
};

export async function uploadFile(file: File): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const tokens = getAuthTokens();
  const headers: HeadersInit = {};
  if (tokens?.accessToken) {
    (headers as Record<string, string>)[
      "Authorization"
    ] = `Bearer ${tokens.accessToken}`;
  }

  const url = `${API_BASE_URL}/v1/files/upload/single`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });

  let payload: any = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!res.ok) {
    const message =
      (payload && (payload.message || payload.error)) ||
      `Request failed with ${res.status}`;
    throw new Error(message);
  }

  return payload as FileUploadResponse;
}

export type CreateVendorRequest = {
  name: string;
  description: string;
  venderImageUrl: string;
  sortOrderNumber: number;
};

export type VendorResponse = {
  id: string;
  name?: string;
  description?: string;
  venderImageUrl?: string;
  venderImage?: {
    id: string;
    url: string;
  };
  sortOrderNumber?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type VendorListResponse = {
  count: number;
  currentPage: number;
  offset: number;
  results: VendorResponse[];
};

export async function createVendor(
  payload: CreateVendorRequest
): Promise<VendorResponse> {
  return postJson<CreateVendorRequest, VendorResponse>("/v1/venders", payload);
}

export async function listVendors(): Promise<VendorResponse[]> {
  const resp: VendorListResponse = await getJson<VendorListResponse>(
    "/v1/venders"
  );
  if (resp && Array.isArray(resp.results))
    return resp.results as VendorResponse[];
  return [];
}

export type UpdateVendorRequest = {
  name?: string;
  description?: string;
  venderImageUrl?: string;
  sortOrderNumber?: number;
};

export async function updateVendor(
  id: string,
  payload: UpdateVendorRequest
): Promise<VendorResponse> {
  return patchJson<UpdateVendorRequest, VendorResponse>(
    `/v1/venders/${id}`,
    payload
  );
}

export async function updateVendorStatus(
  id: string,
  isActive: boolean
): Promise<VendorResponse | undefined> {
  return requestJson<VendorResponse | undefined>(
    `/v1/venders/${id}/status?isActive=${isActive}`,
    {
      method: "PATCH",
    }
  );
}

export type CreateGameRequest = {
  name: string;
  description: string;
  thumbnailImageUrl: string;
  playLink: string;
  sortOrderNumber: number;
  venderId?: string;
  categoryIds: string[];
};

export type GameResponse = {
  id: string;
  name?: string;
  description?: string;
  thumbnailImageUrl?: string;
  thumbnailImage?: {
    id: string;
    url: string;
  };
  playLink?: string;
  sortOrderNumber?: number;
  venderId?: string;
  categoryIds?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type GameListResponse = {
  count: number;
  currentPage: number;
  offset: number;
  results: GameResponse[];
};

export async function createGame(
  payload: CreateGameRequest
): Promise<GameResponse> {
  return postJson<CreateGameRequest, GameResponse>("/v1/games", payload);
}

export async function listGames(): Promise<GameResponse[]> {
  const resp: GameListResponse = await getJson<GameListResponse>("/v1/games");
  if (resp && Array.isArray(resp.results))
    return resp.results as GameResponse[];
  return [];
}

export async function updateGameStatus(
  id: string,
  isActive: boolean
): Promise<GameResponse | undefined> {
  return requestJson<GameResponse | undefined>(
    `/v1/games/${id}/status?isActive=${isActive}`,
    {
      method: "PATCH",
    }
  );
}

export type UpdateGameRequest = {
  name?: string;
  description?: string;
  thumbnailImageUrl?: string;
  playLink?: string;
  sortOrderNumber?: number;
  venderId?: string;
  categoryIds?: string[];
};

export async function updateGame(
  id: string,
  payload: UpdateGameRequest
): Promise<GameResponse> {
  return patchJson<UpdateGameRequest, GameResponse>(`/v1/games/${id}`, payload);
}

export type UserResponse = {
  id: string;
  email?: string;
  phoneNumber?: string;
  profileImage?: {
    id: string;
    url: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type UserListResponse = {
  count: number;
  currentPage: number;
  offset: number;
  results: UserResponse[];
};

export async function listUsers(): Promise<UserResponse[]> {
  const resp: UserListResponse = await getJson<UserListResponse>("/v1/user-accounts");
  if (resp && Array.isArray(resp.results))
    return resp.results as UserResponse[];
  return [];
}
