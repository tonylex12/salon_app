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
      phone?: string;
      role: "ADMIN" | "STAFF" | "CLIENT";
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: "ADMIN" | "STAFF" | "CLIENT";
  }
}

export const config = {
  secret:
    process.env.NEXTAUTH_SECRET ||
    (() => {
      throw new Error(
        "❌ NEXTAUTH_SECRET es requerido en producción. Configura la variable de entorno.",
      );
    })(),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (
            !credentials?.email ||
            !credentials?.password ||
            typeof credentials.email !== "string" ||
            typeof credentials.password !== "string"
          ) {
            return null;
          }

          // Dynamic import to avoid circular dependencies
          const { prisma } = await import("./prisma");

          if (!prisma) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            return null;
          }

          if (!user.password) {
            return null;
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password,
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || "",
            phone: user.phone || undefined,
            role: user.role as "ADMIN" | "STAFF" | "CLIENT",
            image: user.avatarUrl,
          };
        } catch (error) {
          // Log errors only for debugging. Don't expose details in production
          if (process.env.NODE_ENV === "development") {
            console.error("[Auth] Authorization error:", error);
          }
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
        phone?: string;
        role: "ADMIN" | "STAFF" | "CLIENT";
      };
    }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "STAFF" | "CLIENT";
        session.user.phone = token.phone as string | undefined;
      }
      return session;
    },
  },
};

const handler = NextAuth(config);

export { handler as GET, handler as POST };

// For server-side usage
export const auth = () => getServerSession(config);
