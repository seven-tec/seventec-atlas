import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@seventec-atlas/db";
import { z } from "zod";

const devAuthEnabled = process.env.DEV_AUTH_ENABLED === "true";
const githubConfigured =
  !!process.env.AUTH_GITHUB_ID &&
  !!process.env.AUTH_GITHUB_SECRET &&
  process.env.AUTH_GITHUB_ID !== "replace-me" &&
  process.env.AUTH_GITHUB_SECRET !== "replace-me";

const devCredentialsSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(80),
});

const providers = [];

if (githubConfigured) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  );
}

if (devAuthEnabled) {
  providers.push(
    Credentials({
      id: "dev",
      name: "Development Access",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        const parsed = devCredentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.upsert({
          where: {
            email: parsed.data.email.toLowerCase(),
          },
          update: {
            name: parsed.data.name,
          },
          create: {
            email: parsed.data.email.toLowerCase(),
            name: parsed.data.name,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: devAuthEnabled ? undefined : PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  session: { strategy: devAuthEnabled ? "jwt" : "database" },
  providers,
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, user, token }) {
      if (session.user) {
        session.user.id = (user?.id ?? token?.id) as string;
      }
      return session;
    },
  },
});
