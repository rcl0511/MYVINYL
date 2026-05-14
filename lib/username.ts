import { supabase } from "@/lib/supabase";

function slugify(input: string): string {
  return (input || "user")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 20) || "user";
}

export async function generateUniqueUsername(seed: string): Promise<string> {
  const base = slugify(seed);
  for (let i = 0; i < 8; i++) {
    const candidate = i === 0 ? base : `${base}_${Math.floor(1000 + Math.random() * 9000)}`;
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${base}_${Date.now().toString(36)}`;
}
