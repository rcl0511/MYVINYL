import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// GET /api/lps/[id]/comments
export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/lps/[id]/comments">
) {
  const { id: lp_id } = await ctx.params;
  const { data, error } = await supabase
    .from("lp_comments")
    .select("*, profiles!user_id(id, username, nickname, avatar_url, avatar_color)")
    .eq("lp_id", lp_id)
    .order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data ?? []);
}

// POST /api/lps/[id]/comments
export async function POST(
  request: Request,
  ctx: RouteContext<"/api/lps/[id]/comments">
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: lp_id } = await ctx.params;
  const { content } = await request.json();
  if (!content?.trim()) {
    return Response.json({ error: "내용을 입력해주세요." }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("lp_comments")
    .insert({ lp_id, user_id: session.user.id, content: content.trim() })
    .select("*, profiles!user_id(id, username, nickname, avatar_url, avatar_color)")
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
