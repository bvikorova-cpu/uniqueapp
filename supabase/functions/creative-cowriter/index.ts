// Streaming AI Co-Writer for Creative Forge. 2 credits per assistant message.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

const CREDIT_COST = 2;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) throw new Error("Unauthorized");

    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
    const category = (body.category ?? "writing").toString().slice(0, 60);
    const currentText = (body.currentText ?? "").toString().slice(0, 6000);
    if (messages.length === 0) throw new Error("messages required");

    // Pre-flight credit check for a clean 402
    const { data: credits } = await supabase
      .from("creative_forge_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    const available = credits?.credits_remaining ?? 0;
    if (available < CREDIT_COST) {
      return new Response(
        JSON.stringify({ error: "INSUFFICIENT_CREDITS", required: CREDIT_COST, available }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const system = `You are an elite AI Co-Writer helping with ${category.replace(/_/g, " ")}.
Suggest sentences, polish prose, brainstorm ideas, fix dialogue and break writer's block.
Be concise, concrete and in the user's voice. Use markdown when helpful.${
      currentText ? `\n\nCurrent draft the user is working on:\n"""${currentText}"""` : ""
    }`;

    const chatMessages = [
      { role: "system", content: system },
      ...messages
        .filter((m: any) => m?.role === "user" || m?.role === "assistant")
        .map((m: any) => ({ role: m.role, content: String(m.content ?? "").slice(0, 8000) })),
    ];

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    const providers: Array<{ url: string; key: string; model: string; header: "lovable" | "openai" }> = [];
    if (lovableKey) providers.push({ url: "https://ai.gateway.lovable.dev/v1/chat/completions", key: lovableKey, model: "openai/gpt-5.4-mini", header: "lovable" });
    if (openaiKey) providers.push({ url: "https://api.openai.com/v1/chat/completions", key: openaiKey, model: "gpt-4o-mini", header: "openai" });
    if (providers.length === 0) throw new Error("No AI provider configured");

    let upstream: Response | null = null;
    let lastStatus = 500;
    for (const p of providers) {
      const resp = await fetch(p.url, {
        method: "POST",
        headers: p.header === "lovable"
          ? { "Lovable-API-Key": p.key, "Content-Type": "application/json" }
          : { Authorization: `Bearer ${p.key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: p.model, messages: chatMessages, stream: true }) });
      if (resp.ok && resp.body) { upstream = resp; break; }
      lastStatus = resp.status;
      console.error("cowriter provider failed", p.header, resp.status, (await resp.text()).slice(0, 300));
    }

    if (!upstream) {
      const status = lastStatus === 429 ? 429 : lastStatus === 402 ? 402 : 502;
      return new Response(
        JSON.stringify({ error: status === 429 ? "Rate limited. Please retry shortly." : "Co-writer unavailable" }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Charge only once the stream is confirmed
    const { error: dedErr } = await supabase.rpc("deduct_creative_forge_credits", {
      _user_id: user.id,
      _amount: CREDIT_COST });
    if (dedErr) {
      if (dedErr.message?.includes("INSUFFICIENT_CREDITS")) {
        return new Response(JSON.stringify({ error: "INSUFFICIENT_CREDITS" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw dedErr;
    }

    return new Response(upstream.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive" } });
  } catch (e: any) {
    console.error("creative-cowriter error", e);
    return new Response(JSON.stringify({ error: e?.message ?? "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
