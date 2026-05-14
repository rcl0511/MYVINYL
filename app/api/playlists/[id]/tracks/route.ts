import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

async function assertOwner(id: string, userId: string) {
  const { data } = await supabase.from("playlists").select("user_id").eq("id", id).maybeSingle();
  return data?.user_id === userId;
}

// POST /api/playlists/[id]/tracks  — { track_id, lp_id }
export async function POST(request: Request, ctx: RouteContext<"/api/playlists/[id]/tracks">) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: playlist_id } = await ctx.params;
  if (!(await assertOwner(playlist_id, session.user.id))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const { track_id, lp_id } = await request.json();
  if (!track_id || !lp_id) {
    return Response.json({ error: "track_id and lp_id required" }, { status: 400 });
  }
  const { count } = await supabase
    .from("playlist_tracks")
    .select("track_id", { count: "exact", head: true })
    .eq("playlist_id", playlist_id);
  const { error } = await supabase
    .from("playlist_tracks")
    .insert({ playlist_id, track_id, lp_id, position: count ?? 0 });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  await supabase.from("playlists").update({ updated_at: new Date().toISOString() }).eq("id", playlist_id);
  return new Response(null, { status: 201 });
}

// DELETE /api/playlists/[id]/tracks?track_id=...
export async function DELETE(request: Request, ctx: RouteContext<"/api/playlists/[id]/tracks">) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: playlist_id } = await ctx.params;
  if (!(await assertOwner(playlist_id, session.user.id))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const url = new URL(request.url);
  const track_id = url.searchParams.get("track_id");
  if (!track_id) return Response.json({ error: "track_id required" }, { status: 400 });
  await supabase.from("playlist_tracks").delete().eq("playlist_id", playlist_id).eq("track_id", track_id);
  return new Response(null, { status: 204 });
}
