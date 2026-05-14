import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// GET /api/playlists — 내 플레이리스트 목록 (트랙 수 포함)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await supabase
    .from("playlists")
    .select("*, playlist_tracks(count)")
    .eq("user_id", session.user.id)
    .order("updated_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(
    (data ?? []).map((p: { playlist_tracks?: { count: number }[] } & Record<string, unknown>) => ({
      ...p,
      track_count: p.playlist_tracks?.[0]?.count ?? 0,
      playlist_tracks: undefined,
    }))
  );
}

// POST /api/playlists — { name, color? }
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name, color } = await request.json();
  if (!name?.trim()) {
    return Response.json({ error: "이름을 입력해주세요." }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("playlists")
    .insert({ user_id: session.user.id, name: name.trim(), color: color || "#5B21B6" })
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
