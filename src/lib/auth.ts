import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { auth } from "@/lib/firebase/admin";

export const { handlers, signIn, signOut, auth: getSession } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        idToken: {},
      },
      async authorize(credentials) {
        const idToken = credentials?.idToken;
        if (!idToken || typeof idToken !== "string") return null;

        try {
          const decoded = await auth.verifyIdToken(idToken);
          return {
            id: decoded.uid,
            email: decoded.email || "",
            name: decoded.name || decoded.email || "",
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).uid = token.uid;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
});
