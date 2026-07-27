import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";

const corsHeaders = { 'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version' };

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Resolve userId from JWT so rate limit is per-user (not shared across IPs).
    let userId: string | undefined;
    const authHeader = req.headers.get("Authorization");
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    if (authHeader) {
      try {
        const supa = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        );
        const { data } = await supa.auth.getUser(authHeader.replace("Bearer ", ""));
        userId = data.user?.id;
      } catch (_e) { /* fall back to IP-based limit */ }
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Per-user (or per-IP) rate limit: 50 messages / 5 min.
    const rateLimitResponse = await withRateLimit(
      req,
      RATE_LIMITS.ai_chat,
      corsHeaders,
      userId,
    );
    if (rateLimitResponse) return rateLimitResponse;

    const { message, history = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Defensive payload caps to keep prompt size predictable.
    const safeMessage = typeof message === "string" ? message.slice(0, 4000) : "";
    if (!safeMessage.trim()) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    const safeHistory = Array.isArray(history) ? history.slice(-20) : [];

    // Charge 2 AI credits (unified ai_credits pool) before calling the model.
    const COST = 2;
    const { data: credRow } = await admin
      .from("ai_credits").select("credits_remaining").eq("user_id", userId).maybeSingle();
    const balance = credRow?.credits_remaining ?? 0;
    if (balance < COST) {
      return new Response(
        JSON.stringify({ error: "insufficient_credits", credits_remaining: balance, cost: COST }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    const messages = [
      {
        role: "system",
        content: "You are an experienced online teacher and tutor. ALWAYS respond in English, never in any other language. You explain concepts clearly with examples and patience. You help students understand material, solve problems step by step, and motivate them in learning. You are friendly and supportive. IMPORTANT: All your responses must be in English only."
      },
      ...safeHistory,
      { role: "user", content: safeMessage }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Lovable-API-Key': LOVABLE_API_KEY,
        'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'openai/gpt-5.4-mini',
        messages: messages }) });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      throw new Error(response.status === 402 ? 'ai_gateway_credits_exhausted' : 'AI gateway error');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    const { error: deductErr } = await admin.rpc("deduct_ai_credits", {
      p_user_id: userId, p_amount: COST, p_reason: "education_tutor_chat", p_source: "tutoring-chat",
    });
    if (deductErr) {
      const msg = String(deductErr.message || "").toLowerCase();
      const status = msg.includes("insufficient") ? 402 : 500;
      return new Response(
        JSON.stringify({ error: msg.includes("insufficient") ? "insufficient_credits" : (deductErr.message || "deduct_failed") }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in tutoring-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
