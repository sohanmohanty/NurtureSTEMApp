import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Hit daily by Vercel Cron (see vercel.json) so the free-tier Supabase
// project registers activity and is not auto-paused after 7 idle days.
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const { error } = await supabase.rpc("get_public_impact_stats");
  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true });
}
