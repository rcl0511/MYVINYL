import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// GET /api/profiles/[username]
// 프로필 + 컬렉션(lp_likes) + 게시글 + 좋아요한 게시글, 그리고 viewer의 팔로우 상태까지 한 번에.
export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/profiles/[username]">
) {
  const { username } = await ctx.params;
  const session = await getServerSession(authOptions);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!profile) return Response.json({ error: "Not found" }, { status: 404 });

  const [collection, posts, likedPosts, isFollowing] = await Promise.all([
    supabase
      .from("lp_likes")
      .select("lp_id, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("posts")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("post_likes")
      .select("posts(*, profiles!user_id(id, username, nickname, avatar_color))")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20),
    session?.user?.id && session.user.id !== profile.id
      ? supabase
          .from("follows")
          .select("follower_id")
          .eq("follower_id", session.user.id)
          .eq("following_id", profile.id)
          .maybeSingle()
          .then(({ data }) => !!data)
      : Promise.resolve(false),
  ]);

  return Response.json({
    profile,
    collection: collection.data ?? [],
    posts: posts.data ?? [],
    likedPosts: (likedPosts.data ?? []).map((row: { posts: unknown }) => row.posts).filter(Boolean),
    isFollowing,
    isMe: session?.user?.id === profile.id,
  });
}

// PATCH /api/profiles/[username] — bio / favorite_genres 수정 (본인만)
export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/profiles/[username]">
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { username } = await ctx.params;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (!profile) return Response.json({ error: "Not found" }, { status: 404 });
  if (profile.id !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.bio === "string") update.bio = body.bio.slice(0, 120);
  if (Array.isArray(body.favorite_genres)) update.favorite_genres = body.favorite_genres;
  if (Array.isArray(body.favorite_artists)) update.favorite_artists = body.favorite_artists;
  if (typeof body.avatar_color === "string") update.avatar_color = body.avatar_color;

  const { data, error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", profile.id)
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
