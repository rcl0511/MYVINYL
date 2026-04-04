import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// DELETE /api/posts/[id]
export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/posts/[id]">
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  // 본인 글인지 확인
  const { data: post } = await supabase
    .from("posts")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!post) return Response.json({ error: "Not found" }, { status: 404 });
  if (post.user_id !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return new Response(null, { status: 204 });
}
