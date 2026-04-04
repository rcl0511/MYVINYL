import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      // 로그인 시 프로필 upsert (최초 1회 생성, 이후 avatar_url/nickname만 갱신)
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          nickname: user.name ?? "사용자",
          avatar_url: user.image ?? null,
        },
        { onConflict: "id", ignoreDuplicates: false }
      );
      return true;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
