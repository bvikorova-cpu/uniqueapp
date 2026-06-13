// AI-generated lottery number suggestions. Free (no credit cost) — entertainment only.
// Disclaimer: results are random; no guarantee of winning. Compliance note: 16+.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOTTERY_CONFIGS: Record<string, { count: number; max: number; bonus?: { count: number; max: number } }> = {
  euromillions: { count: 5, max: 50, bonus: { count: 2, max: 12 } },
  eurojackpot:  { count: 5, max: 50, bonus: { count: 2, max: 10 } },
  powerball:    { count: 5, max: 69, bonus: { count: 1, max: 26 } },
  megamillions: { count: 5, max: 70, bonus: { count: 1, max: 25 } },
  loto:         { count: 6, max: 49 },
  default:      { count: 6, max: 49 },
};

function pickUnique(count: number, max: number): number[] {
  const set = new Set<number>();
  while (set.size < count) set.add(1 + Math.floor(Math.random() * max));
  return Array.from(set).sort((a, b) => a - b);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const lotteryType = String(body?.lotteryType || "default").toLowerCase();
    const cfg = LOTTERY_CONFIGS[lotteryType] || LOTTERY_CONFIGS.default;

    const numbers = pickUnique(cfg.count, cfg.max);
    const bonus = cfg.bonus ? pickUnique(cfg.bonus.count, cfg.bonus.max) : [];

    return new Response(
      JSON.stringify({
        lotteryType,
        numbers,
        bonus,
        generated_at: new Date().toISOString(),
        disclaimer: "For entertainment only. Numbers are random; no winning guarantee.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
