import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const SINGLE_COST = 40;
const ALL_COST = 60;
const LANGUAGES = ["English", "Slovak", "Hungarian", "German", "Spanish", "French"];
const LEGACY_TYPES = ["kids_posters_encyclopedia", "kids_encyclopedia_translate", "kids_ebook_unlock"];
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);
    const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { data: authData } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = authData.user;
    if (!user) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const action = body.action === "purchase_single" || body.action === "purchase_all" ? body.action : "check";
    const language = typeof body.language === "string" && LANGUAGES.includes(body.language) ? body.language : "English";

    const { data: history, error: historyError } = await admin
      .from("ai_usage_history")
      .select("usage_type, description")
      .eq("user_id", user.id)
      .in("usage_type", [...LEGACY_TYPES, "kids_encyclopedia_single", "kids_encyclopedia_all"]);
    if (historyError) return json({ error: historyError.message }, 500);

    const legacyOwned = (history ?? []).some((row) => LEGACY_TYPES.includes(row.usage_type));
    const allLanguages = legacyOwned || (history ?? []).some((row) => row.usage_type === "kids_encyclopedia_all");
    const ownedLanguages = allLanguages
      ? LANGUAGES
      : LANGUAGES.filter((lang) => (history ?? []).some((row) => row.usage_type === "kids_encyclopedia_single" && row.description === `Learning Encyclopedia PDF + e-book: ${lang}`));

    if (action === "check" || allLanguages || (action === "purchase_single" && ownedLanguages.includes(language))) {
      return json({ allLanguages, ownedLanguages, singleCost: SINGLE_COST, allCost: ALL_COST });
    }

    const cost = action === "purchase_all" ? ALL_COST : SINGLE_COST;
    const { data: creditRow, error: creditError } = await admin.from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (creditError) return json({ error: creditError.message }, 500);
    const balance = creditRow?.credits_remaining ?? 0;
    if (balance < cost) return json({ error: "Insufficient credits", creditsRemaining: balance, cost }, 402);

    const usageType = action === "purchase_all" ? "kids_encyclopedia_all" : "kids_encyclopedia_single";
    const description = action === "purchase_all"
      ? "Learning Encyclopedia PDF + e-book: all 6 languages"
      : `Learning Encyclopedia PDF + e-book: ${language}`;
    const { error: deductError } = await admin.rpc("deduct_ai_credits", {
      p_user_id: user.id,
      p_amount: cost,
      p_reason: usageType,
      p_source: "kids_learning_posters",
    });
    if (deductError) return json({ error: deductError.message }, /insufficient/i.test(deductError.message) ? 402 : 500);

    await admin.from("ai_usage_history").insert({ user_id: user.id, usage_type: usageType, credits_used: cost, description });
    return json({
      allLanguages: action === "purchase_all",
      ownedLanguages: action === "purchase_all" ? LANGUAGES : [...ownedLanguages, language],
      creditsRemaining: balance - cost,
      singleCost: SINGLE_COST,
      allCost: ALL_COST,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
