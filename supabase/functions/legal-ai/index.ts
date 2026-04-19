import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COSTS: Record<string, number> = {
  qa: 3,
  tldr: 2,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { mode = "qa", question, documentType = "terms", documentText = "" } = await req.json();
    const cost = COSTS[mode] ?? 3;

    if (!question && mode === "qa") {
      return new Response(JSON.stringify({ error: "Question is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check & deduct credits from ai_credits
    const { data: credits } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!credits || credits.credits_remaining < cost) {
      return new Response(JSON.stringify({ error: "Insufficient credits", required: cost }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = mode === "tldr"
      ? `You are a legal document simplifier for the UNIQUE Platform. Convert the provided legal text into a clear, friendly TL;DR in plain English. Use bullet points. Keep it under 150 words. Never give legal advice. Always end with: "⚠️ This is a simplified summary, not legal advice. Always read the full document."`
      : `You are the AI Legal Assistant for the UNIQUE Platform (UNITY V2.0 Protective Edition). You help users understand the platform's legal documents (Terms, Privacy, Refund, Creator Agreement, Community Guidelines).

Rules:
- Answer ONLY based on the provided document context.
- Use plain English, short paragraphs, bullet points when helpful.
- If the question is outside the document scope, politely say so.
- Never give personal legal advice. Always end with: "⚠️ Informational only — not legal advice."
- Current document type: ${documentType}.`;

    const userPrompt = mode === "tldr"
      ? `Simplify this section:\n\n${documentText}`
      : `Document context:\n${documentText.slice(0, 8000)}\n\nUser question: ${question}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "AI is busy, try again shortly" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted on platform" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const answer: string = aiJson.choices?.[0]?.message?.content ?? "No answer.";

    // Deduct credits
    await supabase
      .from("ai_credits")
      .update({ credits_remaining: credits.credits_remaining - cost, last_used_at: new Date().toISOString() })
      .eq("user_id", user.id);

    // Log chat
    await supabase.from("legal_ai_chats").insert({
      user_id: user.id,
      document_type: documentType,
      question: question || "TL;DR request",
      answer,
      mode,
      credits_used: cost,
    });

    return new Response(
      JSON.stringify({ answer, credits_remaining: credits.credits_remaining - cost, credits_used: cost }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("legal-ai error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
