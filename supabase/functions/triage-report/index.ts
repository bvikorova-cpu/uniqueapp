// AI moderation triage via Lovable AI Gateway
// Categorizes a report and updates moderation_queue with severity + categories
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { content_type, content_id, reason } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");

    // Pull content snippet (best-effort)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let snippet = reason || "";
    if (content_type === "post") {
      const { data } = await supabase.from("posts").select("content").eq("id", content_id).maybeSingle();
      snippet = `${snippet}\n\nPOST: ${data?.content ?? ""}`.slice(0, 2000);
    } else if (content_type === "comment") {
      const { data } = await supabase.from("comments").select("content").eq("id", content_id).maybeSingle();
      snippet = `${snippet}\n\nCOMMENT: ${data?.content ?? ""}`.slice(0, 2000);
    }

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a content moderation triage AI. Return STRICT JSON: { severity: 'low'|'medium'|'high'|'critical', categories: string[], summary: string }. Categories from: spam, harassment, hate, sexual, violence, self_harm, misinformation, illegal, other.",
          },
          { role: "user", content: snippet },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) throw new Error(`AI ${aiRes.status}: ${await aiRes.text()}`);
    const aiData = await aiRes.json();
    const parsed = JSON.parse(aiData.choices?.[0]?.message?.content ?? "{}");

    await supabase
      .from("moderation_queue")
      .update({
        ai_severity: parsed.severity,
        ai_categories: parsed.categories,
        ai_summary: parsed.summary,
      })
      .eq("content_type", content_type)
      .eq("content_id", content_id)
      .eq("status", "pending");

    return new Response(JSON.stringify({ ok: true, ...parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("triage-report error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
