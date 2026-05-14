import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "@/lib/supabase";
import { generateUniqueUsername } from "@/lib/username";

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
      // 최초 1회: username 생성. 이후 호출은 nickname/avatar만 갱신.
      const { data: existing } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("id", user.id)
        .maybeSingle();

      if (!existing) {
        const seed = (user.name || user.email?.split("@")[0]) ?? "user";
        const username = await generateUniqueUsername(seed);
        await supabase.from("profiles").insert({
          id: user.id,
          username,
          nickname: user.name ?? "사용자",
          avatar_url: user.image ?? null,
        });
      } else {
        await supabase
          .from("profiles")
          .update({
            nickname: user.name ?? "사용자",
            avatar_url: user.image ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }
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
