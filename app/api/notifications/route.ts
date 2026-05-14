import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// GET /api/notifications
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await supabase
    .from("notifications")
    .select("*, actor:profiles!notifications_actor_id_fkey(id, username, nickname, avatar_url, avatar_color)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data ?? []);
}

// PATCH /api/notifications  — { read_all: true } 또는 { ids: [...] }
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const q = supabase.from("notifications").update({ read: true }).eq("user_id", session.user.id);
  if (body.read_all) {
    await q.eq("read", false);
  } else if (Array.isArray(body.ids) && body.ids.length) {
    await q.in("id", body.ids);
  }
  return new Response(null, { status: 204 });
}
