// FILE: lib/api/client.ts
// This file creates a reusable API client for your app.
// It handles: base URL, headers, authentication, error handling, and HTTP methods.

import { getAuthTokens } from "../auth-storage";

// Base URL for your backend API
// IMPORTANT: Must be set via NEXT_PUBLIC_API_BASE_URL environment variable
// The NEXT_PUBLIC_ prefix makes it accessible in browser code
// Examples:
//   - Local dev (.env.local): NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
//   - Docker (compose): Build arg NEXT_PUBLIC_API_BASE_URL=http://47.237.167.215:3000
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Custom error class to provide better error information
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Builds the request headers for every API call.
 * Adds JSON content type and attaches the Authorization header
 * if a JWT access token exists.
 */
function buildHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Get stored JWT access token
  const tokens = getAuthTokens();

  // If logged in, include Authorization header
  if (tokens?.accessToken) {
    (headers as Record<string, string>)["Authorization"] =
      `Bearer ${tokens.accessToken}`;
  }

  return headers;
}

/**
 * Handles an API response:
 * - Reads the response body safely (JSON or text)
 * - Throws an ApiError if the request failed
 * - Returns the parsed data if successful
 */
async function handleResponse<T>(response: Response): Promise<T> {
  let payload: any = null;

  // Read response body as text first (safer than .json())
  const text = await response.text();

  // Try to parse JSON response
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text; // Fallback for non-JSON responses
    }
  }

  // If request failed, throw custom ApiError with useful details
  if (!response.ok) {
    const message =
      (payload && (payload.message || payload.error)) ||
      `Request failed with ${response.status}`;

    throw new ApiError(message, response.status, payload);
  }

  // Success → return parsed data
  return payload as T;
}

/**
 * GET request
 * For fetching data: apiGet("/categories")
 */
export async function apiGet<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    method: "GET",
    headers: buildHeaders(),
  });
  console.log("headers:", buildHeaders());
  console.log("API GET Response:", response);
  return handleResponse<T>(response);
}

/**
 * POST request
 * For creating data: apiPost("/categories", { name: "Test" })
 */
export async function apiPost<T>(path: string, body?: any): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    method: "POST",
    headers: buildHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  return handleResponse<T>(response);
}

/**
 * PATCH request
 * For updating data: apiPatch("/categories/1", { name: "New name" })
 */
export async function apiPatch<T>(path: string, body?: any): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  console.log("API PATCH Request URL:", url);
  console.log("API PATCH Request Body:", body);
  const response = await fetch(url, {
    method: "PATCH",
    headers: buildHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  console.log("API PATCH Response:", response);
  return handleResponse<T>(response);
}

/**
 * DELETE request
 * For deleting resources: apiDelete("/categories/123")
 */
export async function apiDelete<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: buildHeaders(),
  });

  return handleResponse<T>(response);
}

/**
 * File upload request (multipart/form-data)
 * Used for uploading images/files to the backend
 */
export async function apiUploadFile<T>(path: string, file: File): Promise<T> {
  const formData = new FormData();
  formData.append("file", file);

  // Only include Authorization header; DO NOT set Content-Type (browser handles it)
  const tokens = getAuthTokens();
  const headers: HeadersInit = {};
  if (tokens?.accessToken) {
    (headers as Record<string, string>)["Authorization"] =
      `Bearer ${tokens.accessToken}`;
  }

  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });

  return handleResponse<T>(response);
}
