import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// POST /api/posts/[id]/like  — 좋아요 토글
export async function POST(
  _req: Request,
  ctx: RouteContext<"/api/posts/[id]/like">
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: post_id } = await ctx.params;
  const user_id = session.user.id;

  // 이미 좋아요 했는지 확인
  const { data: existing } = await supabase
    .from("post_likes")
    .select("user_id")
    .eq("user_id", user_id)
    .eq("post_id", post_id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("post_likes")
      .delete()
      .eq("user_id", user_id)
      .eq("post_id", post_id);
    await supabase.rpc("decrement_post_like", { p_post_id: post_id });
    return Response.json({ liked: false });
  } else {
    await supabase.from("post_likes").insert({ user_id, post_id });
    await supabase.rpc("increment_post_like", { p_post_id: post_id });

    // 알림: 게시글 작성자에게 (본인 글이면 스킵)
    const { data: post } = await supabase.from("posts").select("user_id, title").eq("id", post_id).maybeSingle();
    if (post && post.user_id !== user_id) {
      await supabase.from("notifications").insert({
        user_id: post.user_id,
        actor_id: user_id,
        type: "like_post",
        target_type: "post",
        target_id: post_id,
        content: `회원님의 글 "${post.title?.slice(0, 30) ?? ""}"에 좋아요를 눌렀습니다.`,
      });
    }
    return Response.json({ liked: true });
  }
}
