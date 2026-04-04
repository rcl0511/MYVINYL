import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// GET /api/posts/[id]/comments
export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/posts/[id]/comments">
) {
  const { id: post_id } = await ctx.params;

  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles(id, nickname, avatar_url, avatar_color)")
    .eq("post_id", post_id)
    .order("created_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data ?? []);
}

// POST /api/posts/[id]/comments
export async function POST(
  request: Request,
  ctx: RouteContext<"/api/posts/[id]/comments">
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: post_id } = await ctx.params;
  const { content } = await request.json();

  if (!content?.trim()) {
    return Response.json({ error: "내용을 입력해주세요." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id, user_id: session.user.id, content: content.trim() })
    .select("*, profiles(id, nickname, avatar_url, avatar_color)")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  await supabase.rpc("increment_comment_count", { p_post_id: post_id });

  return Response.json(data, { status: 201 });
}
