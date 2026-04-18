// Screenshot/DM forensics — uses GPT-4o vision to OCR + analyze
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COST = 8;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: auth } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { image_base64, mime } = await req.json();
    if (!image_base64) return json({ error: "image_base64 required" }, 400);

    const { data: cr } = await supabase
      .from("lie_detector_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!cr || (cr.credits_remaining ?? 0) < COST) {
      return json({ error: "Insufficient credits", required: COST, have: cr?.credits_remaining ?? 0 }, 402);
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY not configured" }, 500);

    // upload image to storage
    const bin = Uint8Array.from(atob(image_base64), (c) => c.charCodeAt(0));
    const ext = (mime || "image/png").split("/")[1].split(";")[0];
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    await supabase.storage.from("lie-detector-evidence").upload(path, new Blob([bin], { type: mime || "image/png" }), {
      contentType: mime || "image/png",
    });

    const dataUrl = `data:${mime || "image/png"};base64,${image_base64}`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a forensic chat analyst. The image is a screenshot of a text/DM conversation. Extract the verbatim conversation text, then run lie/deception detection on the most recent suspicious messages. Output strict JSON.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract text and analyze. Return JSON with: extracted_text (full conversation), key_speakers (string[]), truthfulness_score (0-100), red_flags (string[]), manipulation_tactics (string[]), suggested_response (string, polite but assertive), summary (string)." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      return json({ error: "OpenAI vision failed", details: t }, 500);
    }
    const aj = await resp.json();
    const results = JSON.parse(aj.choices[0].message.content);

    await supabase
      .from("lie_detector_credits")
      .update({ credits_remaining: (cr.credits_remaining ?? 0) - COST })
      .eq("user_id", user.id);

    const { data: saved } = await supabase
      .from("lie_detector_screenshot_analyses")
      .insert({
        user_id: user.id,
        image_url: path,
        extracted_text: results.extracted_text,
        truthfulness_score: results.truthfulness_score,
        suggested_response: results.suggested_response,
        results,
        credits_used: COST,
      })
      .select()
      .single();

    return json({ analysis: saved, results });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
