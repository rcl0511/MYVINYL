import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// DELETE /api/lp-comments/[id]
export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/lp-comments/[id]">
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const { data: c } = await supabase
    .from("lp_comments")
    .select("user_id")
    .eq("id", id)
    .single();
  if (!c) return Response.json({ error: "Not found" }, { status: 404 });
  if (c.user_id !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const { error } = await supabase.from("lp_comments").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return new Response(null, { status: 204 });
}

// POST /api/lp-comments/[id]  — 좋아요 토글
export async function POST(
  _req: Request,
  ctx: RouteContext<"/api/lp-comments/[id]">
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: comment_id } = await ctx.params;
  const user_id = session.user.id;
  const { data: existing } = await supabase
    .from("lp_comment_likes")
    .select("user_id")
    .eq("user_id", user_id)
    .eq("comment_id", comment_id)
    .maybeSingle();
  if (existing) {
    await supabase.from("lp_comment_likes").delete().eq("user_id", user_id).eq("comment_id", comment_id);
    await supabase.rpc("decrement_lp_comment_like", { p_comment_id: comment_id });
    return Response.json({ liked: false });
  } else {
    await supabase.from("lp_comment_likes").insert({ user_id, comment_id });
    await supabase.rpc("increment_lp_comment_like", { p_comment_id: comment_id });
    return Response.json({ liked: true });
  }
}
