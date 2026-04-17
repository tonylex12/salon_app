import { compare } from "bcryptjs";
import type { Session } from "next-auth";
import NextAuth, { getServerSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "ADMIN" | "STAFF" | "CLIENT";
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: "ADMIN" | "STAFF" | "CLIENT";
  }
}

const config = {
  secret:
    process.env.NEXTAUTH_SECRET || "fallback-secret-key-change-in-production",
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("[Auth] authorize() called with credentials:", {
            email: credentials?.email,
            hasPassword: !!credentials?.password,
          });

          if (
            !credentials?.email ||
            !credentials?.password ||
            typeof credentials.email !== "string" ||
            typeof credentials.password !== "string"
          ) {
            console.warn("[Auth] ❌ Missing or invalid credentials");
            return null;
          }

          console.log("[Auth] ✅ Credentials validated, checking database...");

          // Dynamic import to avoid circular dependencies
          const { prisma } = await import("./prisma");

          if (!prisma) {
            console.error(
              "[Auth] ❌ Prisma client not available - cannot access database",
            );
            return null;
          }

          console.log("[Auth] 🔍 Looking up user:", credentials.email);

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.warn("[Auth] ❌ User not found:", credentials.email);
            return null;
          }

          if (!user.password) {
            console.warn("[Auth] ❌ User has no password hash");
            return null;
          }

          console.log("[Auth] 🔐 Comparing passwords...");

          const isPasswordValid = await compare(
            credentials.password,
            user.password,
          );

          if (!isPasswordValid) {
            console.warn("[Auth] ❌ Password mismatch");
            return null;
          }

          console.log("[Auth] ✅ Password valid! Returning user object");

          return {
            id: user.id,
            email: user.email,
            name: user.name || "",
            role: user.role as "ADMIN" | "STAFF" | "CLIENT",
            image: user.avatarUrl,
          };
        } catch (error) {
          console.error("[Auth] ❌ Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: {
        id: string;
        email: string;
        name: string;
        role: "ADMIN" | "STAFF" | "CLIENT";
      };
    }) {
      if (user) {
        console.log("[Auth JWT] ✅ User authenticated, updating token");
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      console.log("[Auth Session] 🔄 Session callback triggered");
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "STAFF" | "CLIENT";
      }
      return session;
    },
  },
};

const handler = NextAuth(config);

export { handler as GET, handler as POST };

// For server-side usage
export const auth = () => getServerSession(config);
