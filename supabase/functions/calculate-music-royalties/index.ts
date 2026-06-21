import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Calculates music royalties from streams since last run.
// 80% to creator, 20% platform. Rate: 0.004 EUR per stream (configurable).
const PER_STREAM_EUR = 0.004;
const CREATOR_SHARE = 0.8;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    // Aggregate unprocessed streams per track
    const { data: streams, error: sErr } = await supabase
      .from("music_streams")
      .select("track_id")
      .is("royalty_id", null);
    if (sErr) throw sErr;

    const counts = new Map<string, number>();
    for (const s of streams ?? []) {
      counts.set(s.track_id, (counts.get(s.track_id) ?? 0) + 1);
    }

    let processed = 0;
    for (const [trackId, count] of counts) {
      const { data: track } = await supabase
        .from("music_tracks")
        .select("creator_id")
        .eq("id", trackId)
        .maybeSingle();
      if (!track?.creator_id) continue;

      const gross = count * PER_STREAM_EUR;
      const creatorAmount = +(gross * CREATOR_SHARE).toFixed(4);
      const platformAmount = +(gross - creatorAmount).toFixed(4);

      const { data: royalty, error: rErr } = await supabase
        .from("music_royalties")
        .insert({
          track_id: trackId,
          creator_id: track.creator_id,
          stream_count: count,
          gross_eur: gross,
          creator_amount_eur: creatorAmount,
          platform_amount_eur: platformAmount,
          period_start: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          period_end: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (rErr) throw rErr;

      await supabase
        .from("music_streams")
        .update({ royalty_id: royalty.id })
        .eq("track_id", trackId)
        .is("royalty_id", null);

      processed += count;
    }

    return new Response(JSON.stringify({ ok: true, processed, tracks: counts.size }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
