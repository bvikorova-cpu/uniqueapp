// Phobia Trading — real router. Replaces the broken proxy aliases that routed
// detect-phobia / get-user-phobias / trade-phobia / generate-phobia-cure into
// unrelated generic routers (which always returned an edge error).
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";
import { askAIJSON } from "../_shared/unifiedAI.ts";
import { spendAiCredits } from "../_shared/spendCredits.ts";

const Body = z.object({
  action: z.enum([
    "detect",
    "list",
    "generate_cure",
    "list_for_trade",
    "get_marketplace",
    "buy",
    "delete",
  ]),
  description: z.string().min(3).max(4000).optional(),
  phobiaId: z.string().uuid().optional(),
  tradeId: z.string().uuid().optional(),
  price: z.number().positive().max(100000).optional(),
});

const COST_DETECT = 3;
const COST_CURE = 3;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);
    const userId = userData.user.id;

    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: "Invalid request", details: parsed.error.flatten() }, 400);
    const b = parsed.data;

    const admin = createClient(supabaseUrl, serviceKey);

    switch (b.action) {
      // ─────────── AI phobia detection (3 credits) ───────────
      case "detect": {
        if (!b.description) return json({ error: "description is required" }, 400);

        const spend = await spendAiCredits(admin, userId, COST_DETECT, "phobia_detect", "phobia-router");
        if (!spend.ok) return json({ error: spend.error ?? "Insufficient credits", requiresPayment: true }, 402);

        let ai: any;
        try {
          ai = await askAIJSON(
            "You are a clinical psychologist specialising in anxiety disorders. Analyse the described fear and return STRICT JSON with keys: phobia_name (string, medical name), phobia_type (string, short category), severity (integer 1-10), analysis (string, 3-5 sentences), triggers (array of 3-6 short strings), coping_strategies (array of 3-6 short strings). Always recommend professional help inside analysis. No markdown.",
            b.description,
            { max_tokens: 1200 },
          );
        } catch (_e) {
          // Refund on provider failure so the user is never charged for nothing.
          await admin.rpc("add_ai_credits", { p_user_id: userId, p_amount: COST_DETECT } as any).catch(() => {});
          return json({ error: "AI is busy right now. Please try again in a moment." }, 503);
        }

        const severity = Math.min(10, Math.max(1, Math.round(Number(ai?.severity) || 5)));
        const { data: row, error } = await admin
          .from("user_phobias")
          .insert({
            user_id: userId,
            phobia_name: String(ai?.phobia_name ?? "Unspecified phobia").slice(0, 120),
            phobia_type: String(ai?.phobia_type ?? "general").slice(0, 80),
            description: b.description,
            severity,
            source: "ai_detection",
            status: "active",
            ai_analysis: {
              analysis: ai?.analysis ?? "",
              triggers: Array.isArray(ai?.triggers) ? ai.triggers : [],
              coping_strategies: Array.isArray(ai?.coping_strategies) ? ai.coping_strategies : [],
            },
          })
          .select()
          .single();
        if (error) return json({ error: error.message }, 500);

        return json({
          phobia: {
            ...row,
            analysis: ai?.analysis ?? "",
            triggers: Array.isArray(ai?.triggers) ? ai.triggers : [],
            coping_strategies: Array.isArray(ai?.coping_strategies) ? ai.coping_strategies : [],
          },
          credits_remaining: spend.remaining,
        });
      }

      // ─────────── My phobias + treatments ───────────
      case "list": {
        const [{ data: phobias, error: pErr }, { data: treatments, error: tErr }] = await Promise.all([
          admin.from("user_phobias").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
          admin.from("phobia_treatments").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        ]);
        if (pErr) return json({ error: pErr.message }, 500);
        if (tErr) return json({ error: tErr.message }, 500);

        const enriched = (phobias ?? []).map((p: any) => ({
          ...p,
          analysis: p?.ai_analysis?.analysis ?? "",
          triggers: p?.ai_analysis?.triggers ?? [],
          coping_strategies: p?.ai_analysis?.coping_strategies ?? [],
        }));
        return json({ phobias: enriched, treatments: treatments ?? [] });
      }

      // ─────────── AI cure plan (3 credits) ───────────
      case "generate_cure": {
        if (!b.phobiaId) return json({ error: "phobiaId is required" }, 400);

        const { data: phobia, error: pErr } = await admin
          .from("user_phobias")
          .select("*")
          .eq("id", b.phobiaId)
          .eq("user_id", userId)
          .maybeSingle();
        if (pErr) return json({ error: pErr.message }, 500);
        if (!phobia) return json({ error: "Phobia not found" }, 404);

        const spend = await spendAiCredits(admin, userId, COST_CURE, "phobia_cure_plan", "phobia-router");
        if (!spend.ok) return json({ error: spend.error ?? "Insufficient credits", requiresPayment: true }, 402);

        let plan: any;
        try {
          plan = await askAIJSON(
            "You are an exposure-therapy guide. Design a gradual, science-backed treatment plan. Return STRICT JSON: { summary: string, total_sessions: integer 6-12, sessions: [{ number: integer, title: string, goal: string, exercise: string, duration_minutes: integer, relaxation_tip: string }], warning_signs: string[], professional_help: string }. No markdown.",
            `Phobia: ${phobia.phobia_name} (${phobia.phobia_type}). Severity ${phobia.severity}/10. User description: ${phobia.description ?? "n/a"}`,
            { max_tokens: 3000 },
          );
        } catch (_e) {
          await admin.rpc("add_ai_credits", { p_user_id: userId, p_amount: COST_CURE } as any).catch(() => {});
          return json({ error: "AI is busy right now. Please try again in a moment." }, 503);
        }

        const total = Math.min(12, Math.max(6, Math.round(Number(plan?.total_sessions) || (Array.isArray(plan?.sessions) ? plan.sessions.length : 8))));
        const { data: treatment, error } = await admin
          .from("phobia_treatments")
          .insert({
            user_id: userId,
            phobia_id: phobia.id,
            treatment_plan: plan,
            total_sessions: total,
            sessions_completed: 0,
            status: "active",
          })
          .select()
          .single();
        if (error) return json({ error: error.message }, 500);

        return json({ treatment, plan, credits_remaining: spend.remaining });
      }

      // ─────────── List own phobia for trade ───────────
      case "list_for_trade": {
        if (!b.phobiaId || !b.price) return json({ error: "phobiaId and price are required" }, 400);

        const { data: phobia } = await admin
          .from("user_phobias")
          .select("id")
          .eq("id", b.phobiaId)
          .eq("user_id", userId)
          .maybeSingle();
        if (!phobia) return json({ error: "Phobia not found" }, 404);

        const { data: existing } = await admin
          .from("phobia_trades")
          .select("id")
          .eq("phobia_id", b.phobiaId)
          .eq("status", "listed")
          .maybeSingle();
        if (existing) return json({ error: "This phobia is already listed" }, 409);

        const { data: trade, error } = await admin
          .from("phobia_trades")
          .insert({ seller_id: userId, phobia_id: b.phobiaId, price: b.price, status: "listed" })
          .select()
          .single();
        if (error) return json({ error: error.message }, 500);
        return json({ trade });
      }

      // ─────────── Marketplace (others' active listings) ───────────
      case "get_marketplace": {
        const { data, error } = await admin
          .from("phobia_trades")
          .select("id, price, status, created_at, seller_id, phobia_id, user_phobias!phobia_trades_phobia_id_fkey(phobia_name, phobia_type, description, severity)")
          .eq("status", "listed")
          .neq("seller_id", userId)
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) return json({ error: error.message }, 500);
        return json({ trades: data ?? [] });
      }

      // ─────────── Buy a listed phobia ───────────
      case "buy": {
        if (!b.tradeId) return json({ error: "tradeId is required" }, 400);

        const { data: trade, error: tErr } = await admin
          .from("phobia_trades")
          .select("*")
          .eq("id", b.tradeId)
          .maybeSingle();
        if (tErr) return json({ error: tErr.message }, 500);
        if (!trade || trade.status !== "listed") return json({ error: "Listing is no longer available" }, 409);
        if (trade.seller_id === userId) return json({ error: "You cannot buy your own listing" }, 400);

        const { data: claimed, error: claimErr } = await admin
          .from("phobia_trades")
          .update({
            status: "sold",
            buyer_id: userId,
            transaction_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", trade.id)
          .eq("status", "listed")
          .select()
          .maybeSingle();
        if (claimErr) return json({ error: claimErr.message }, 500);
        if (!claimed) return json({ error: "Listing was just sold to someone else" }, 409);

        const { data: source } = await admin
          .from("user_phobias")
          .select("*")
          .eq("id", trade.phobia_id)
          .maybeSingle();

        if (source) {
          await admin.from("user_phobias").insert({
            user_id: userId,
            phobia_name: source.phobia_name,
            phobia_type: source.phobia_type,
            description: source.description,
            severity: source.severity,
            ai_analysis: source.ai_analysis,
            source: "marketplace",
            status: "active",
          });
          await admin.from("user_phobias").update({ status: "traded" }).eq("id", source.id);
        }

        return json({ ok: true, trade: claimed });
      }

      // ─────────── Delete own phobia ───────────
      case "delete": {
        if (!b.phobiaId) return json({ error: "phobiaId is required" }, 400);
        const { error } = await admin
          .from("user_phobias")
          .delete()
          .eq("id", b.phobiaId)
          .eq("user_id", userId);
        if (error) return json({ error: error.message }, 500);
        return json({ ok: true });
      }
    }

    return json({ error: "Unsupported action" }, 400);
  } catch (e) {
    return json({ error: (e as Error).message ?? "Unexpected error" }, 500);
  }
});
