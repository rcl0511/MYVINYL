import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// POST /api/users/[id]/follow  — 팔로우 토글
export async function POST(
  _req: Request,
  ctx: RouteContext<"/api/users/[id]/follow">
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: following_id } = await ctx.params;
  const follower_id = session.user.id;

  if (follower_id === following_id) {
    return Response.json({ error: "자기 자신은 팔로우할 수 없습니다." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", follower_id)
    .eq("following_id", following_id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", follower_id)
      .eq("following_id", following_id);
    await supabase.rpc("decrement_follower_count", { p_user_id: following_id });
    await supabase.rpc("decrement_following_count", { p_user_id: follower_id });
    return Response.json({ following: false });
  } else {
    await supabase.from("follows").insert({ follower_id, following_id });
    await supabase.rpc("increment_follower_count", { p_user_id: following_id });
    await supabase.rpc("increment_following_count", { p_user_id: follower_id });
    return Response.json({ following: true });
  }
}
