// Real Shadow Arena battle creator. Requires Shadow Arena subscription.
// Inserts a new shadow_battles row with an AI-themed (or random fallback) prompt.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const j = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const THEMES = [
  { theme: "Forgotten Cathedrals", prompt: "Write a horror tale set inside an abandoned cathedral where the candles refuse to die.", keywords: ["cathedral", "candles", "whisper", "stained glass"] },
  { theme: "The Drowned Carnival", prompt: "A fairground sinks into a black lake — the music keeps playing.", keywords: ["carnival", "drown", "music box", "ferris wheel"] },
  { theme: "Hospital After Midnight", prompt: "A nightshift nurse discovers patients that should not exist.", keywords: ["hospital", "nightshift", "iv drip", "linoleum"] },
  { theme: "The Mirror Pact", prompt: "Every reflection in the house has begun to lie.", keywords: ["mirror", "reflection", "pact", "house"] },
  { theme: "Static Dimension", prompt: "An old TV broadcasts events that haven't happened yet.", keywords: ["television", "static", "antenna", "broadcast"] },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return j({ error: "Unauthorized" }, 401);

    const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user } } = await anon.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) return j({ error: "Unauthorized" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // Require active shadow subscription OR shadow credits
    const { data: sub } = await admin
      .from("shadow_subscriptions")
      .select("status, expires_at")
      .eq("user_id", user.id)
      .maybeSingle();
    const subActive = sub && sub.status === "active" &&
      (!sub.expires_at || new Date(sub.expires_at) > new Date());

    if (!subActive) {
      return j({ error: "Shadow Arena subscription required to create battles." }, 402);
    }

    const t = THEMES[Math.floor(Math.random() * THEMES.length)];
    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data: battle, error } = await admin
      .from("shadow_battles")
      .insert({
        challenge_theme: t.theme,
        challenge_prompt: t.prompt,
        challenge_keywords: t.keywords,
        status: "waiting_for_participants",
        started_at: startedAt.toISOString(),
        ends_at: endsAt.toISOString(),
        total_prize_pool: 0,
      })
      .select()
      .single();

    if (error) return j({ error: error.message }, 500);
    return j({ success: true, battle });
  } catch (e: any) {
    return j({ error: e?.message ?? "Failed to create battle" }, 500);
  }
});
