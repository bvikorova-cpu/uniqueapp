// Body Language Video Scan — GPT-4o vision analyzes uploaded video frames for micro-expressions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const COST = 25;
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { frames_base64, mime, context } = await req.json();
    if (!Array.isArray(frames_base64) || frames_base64.length < 2) return json({ error: "frames_base64 array (min 2 keyframes) required" }, 400);
    if (frames_base64.length > 8) return json({ error: "max 8 keyframes" }, 400);

    const { data: cr } = await supabase.from("lie_detector_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (!cr || (cr.credits_remaining ?? 0) < COST) return json({ error: "Insufficient credits", required: COST, have: cr?.credits_remaining ?? 0 }, 402);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY not configured" }, 500);

    const imageMessages = frames_base64.map((b64: string, i: number) => ({
      type: "image_url",
      image_url: { url: `data:${mime || "image/jpeg"};base64,${b64}`, detail: "low" },
    }));
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a body-language and micro-expression analyst. Inspect the frames for facial tension, blink anomalies, gaze aversion, lip compression, asymmetric expressions, posture shifts. Be careful and never claim certainty." },
          { role: "user", content: [
            { type: "text", text: `Analyze ${frames_base64.length} frames. Context: ${context || "none"}.\n\nReturn JSON: { micro_expressions: [{frame:number, expression:string, indicates:string}], blink_rate: "low"|"normal"|"elevated", gaze_pattern: string, deception_indicators: string[], congruence_notes: string, overall_score: number, summary: string }` },
            ...imageMessages,
          ]},
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) return json({ error: "AI failed", details: await resp.text() }, 500);
    const aj = await resp.json();
    const results = JSON.parse(aj.choices[0].message.content);

    await supabase.from("lie_body_language_scans").insert({
      user_id: user.id,
      micro_expressions: results.micro_expressions || [],
      blink_rate: results.blink_rate === "elevated" ? 25 : results.blink_rate === "low" ? 8 : 17,
      gaze_pattern: results.gaze_pattern, deception_indicators: results.deception_indicators || [],
      overall_score: results.overall_score, credits_used: COST,
    });
    await supabase.from("lie_detector_credits").update({ credits_remaining: (cr.credits_remaining ?? 0) - COST }).eq("user_id", user.id);
    return json({ ...results, credits_charged: COST });
  } catch (e) { return json({ error: e instanceof Error ? e.message : "Unknown" }, 500); }
});
function json(b: any, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
