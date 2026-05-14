import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// GET /api/lp-likes/me — 내가 좋아요한 LP id 목록
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ ids: [] });

  const { data } = await supabase
    .from("lp_likes")
    .select("lp_id")
    .eq("user_id", session.user.id);
  return Response.json({ ids: (data ?? []).map((r) => r.lp_id) });
}
