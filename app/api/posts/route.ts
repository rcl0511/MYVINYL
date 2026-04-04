import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// GET /api/posts?tag=LP+추천
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag");
  const session = await getServerSession(authOptions);

  let query = supabase
    .from("posts")
    .select("*, profiles(id, nickname, avatar_url, avatar_color)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (tag && tag !== "전체") {
    query = query.eq("tag", tag);
  }

  const { data: posts, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  // 내가 좋아요 한 post_id 목록 조회
  let likedIds = new Set<string>();
  if (session?.user?.id) {
    const { data: likes } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", session.user.id);
    likedIds = new Set((likes ?? []).map((l) => l.post_id));
  }

  const result = (posts ?? []).map((p) => ({
    ...p,
    liked: likedIds.has(p.id),
  }));

  return Response.json(result);
}

// POST /api/posts
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content, tag } = await request.json();
  if (!title?.trim() || !content?.trim()) {
    return Response.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: session.user.id,
      title: title.trim(),
      content: content.trim(),
      tag: tag ?? "음악 이야기",
    })
    .select("*, profiles(id, nickname, avatar_url, avatar_color)")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ...data, liked: false }, { status: 201 });
}
