import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// GET /api/lps/[id]/like — 내가 좋아요 했는지 확인
export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/lps/[id]/like">
) {
  const session = await getServerSession(authOptions);
  const { id: lp_id } = await ctx.params;
  if (!session?.user?.id) return Response.json({ liked: false });

  const { data } = await supabase
    .from("lp_likes")
    .select("lp_id")
    .eq("user_id", session.user.id)
    .eq("lp_id", lp_id)
    .maybeSingle();
  return Response.json({ liked: !!data });
}

// POST /api/lps/[id]/like — 토글
export async function POST(
  _req: Request,
  ctx: RouteContext<"/api/lps/[id]/like">
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: lp_id } = await ctx.params;
  const user_id = session.user.id;

  const { data: existing } = await supabase
    .from("lp_likes")
    .select("lp_id")
    .eq("user_id", user_id)
    .eq("lp_id", lp_id)
    .maybeSingle();

  if (existing) {
    await supabase.from("lp_likes").delete().eq("user_id", user_id).eq("lp_id", lp_id);
    return Response.json({ liked: false });
  } else {
    await supabase.from("lp_likes").insert({ user_id, lp_id });
    return Response.json({ liked: true });
  }
}
