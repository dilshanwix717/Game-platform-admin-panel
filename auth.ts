import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { API_BASE_URL } from "@/lib/api-client"

const secret = process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production"

export const authOptions: NextAuthOptions = {
  secret,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Send login request to your backend
          const res = await fetch(`${API_BASE_URL}/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          const text = await res.text()
          let data: { access_token?: string; refresh_token?: string; message?: string } = {}
          if (text) {
            try {
              data = JSON.parse(text) as typeof data
            } catch {
              console.error("Login: backend returned non-JSON response")
              return null
            }
          }

          if (!res.ok) {
            throw new Error(data.message || "Invalid credentials")
          }

          if (!data.access_token || !data.refresh_token) {
            console.error("Login: backend response missing access_token or refresh_token")
            return null
          }

          return {
            id: credentials.email,
            email: credentials.email,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
          }
        } catch (error) {
          console.error("Login error:", error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {

      if (user) {
        token.accessToken = (user as any).accessToken as string
        token.refreshToken = (user as any).refreshToken as string
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).accessToken = (token as any).accessToken;
        (session.user as any).refreshToken = (token as any).refreshToken;
      }
      return session
    },
  },
}
