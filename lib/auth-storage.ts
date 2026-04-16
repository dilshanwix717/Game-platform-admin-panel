const ACCESS_TOKEN_KEY = "pgp.admin.accessToken"
const REFRESH_TOKEN_KEY = "pgp.admin.refreshToken"

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export function saveAuthTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
  } catch {
    // Swallow storage errors (e.g., Safari private mode)
  }
}

export function clearAuthTokens(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch {
    // noop
  }
}

export function getAuthTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!accessToken || !refreshToken) return null
    return { accessToken, refreshToken }
  } catch {
    return null
  }
}


