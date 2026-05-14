import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

async function assertOwner(id: string, userId: string) {
  const { data } = await supabase.from("playlists").select("user_id").eq("id", id).maybeSingle();
  return data?.user_id === userId;
}

// GET /api/playlists/[id] — 트랙 포함 상세
export async function GET(_req: Request, ctx: RouteContext<"/api/playlists/[id]">) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const { data: pl, error } = await supabase
    .from("playlists")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!pl) return Response.json({ error: "Not found" }, { status: 404 });
  if (pl.user_id !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: tracks } = await supabase
    .from("playlist_tracks")
    .select("*")
    .eq("playlist_id", id)
    .order("position", { ascending: true });
  return Response.json({ ...pl, tracks: tracks ?? [] });
}

// PATCH /api/playlists/[id] — name/color
export async function PATCH(request: Request, ctx: RouteContext<"/api/playlists/[id]">) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!(await assertOwner(id, session.user.id))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.name === "string" && body.name.trim()) update.name = body.name.trim();
  if (typeof body.color === "string") update.color = body.color;
  const { data, error } = await supabase
    .from("playlists")
    .update(update)
    .eq("id", id)
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

// DELETE /api/playlists/[id]
export async function DELETE(_req: Request, ctx: RouteContext<"/api/playlists/[id]">) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!(await assertOwner(id, session.user.id))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const { error } = await supabase.from("playlists").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return new Response(null, { status: 204 });
}
