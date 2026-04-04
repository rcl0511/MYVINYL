import { createClient } from "@supabase/supabase-js";

// 서버 전용 (service role — RLS 우회, API routes에서만 사용)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
