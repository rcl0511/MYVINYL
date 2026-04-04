import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// DELETE /api/comments/[id]
export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/comments/[id]">
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const { data: comment } = await supabase
    .from("comments")
    .select("user_id, post_id")
    .eq("id", id)
    .single();

  if (!comment) return Response.json({ error: "Not found" }, { status: 404 });
  if (comment.user_id !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await supabase.from("comments").delete().eq("id", id);
  await supabase.rpc("decrement_comment_count", { p_post_id: comment.post_id });

  return new Response(null, { status: 204 });
}
