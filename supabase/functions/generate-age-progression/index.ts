import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COST = 5;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageUrl, yearsForward } = await req.json();
    if (!imageUrl || typeof imageUrl !== "string") {
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const years = Math.max(1, Math.min(80, parseInt(String(yearsForward ?? 20), 10) || 20));

    const { data: credits } = await admin
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .single();

    if (!credits || credits.credits_remaining < COST) {
      return new Response(
        JSON.stringify({ error: `Insufficient credits. Need ${COST} credits.` }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const prompt = `Create a realistic age-progressed portrait showing how this person would look ${years} years from now. Maintain identity, facial structure and ethnicity. Add age-appropriate wrinkles, hair changes, and skin texture. Photorealistic, natural lighting.`;

    // Fetch source image as bytes for OpenAI image edit
    const srcResp = await fetch(imageUrl);
    if (!srcResp.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch source image" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const srcBytes = new Uint8Array(await srcResp.arrayBuffer());
    const srcType = srcResp.headers.get("content-type") || "image/png";

    const form = new FormData();
    form.append("model", "gpt-image-1");
    form.append("prompt", prompt);
    form.append("n", "1");
    form.append("size", "1024x1024");
    form.append("image", new Blob([srcBytes], { type: srcType }), "source.png");

    const aiResp = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` },
      body: form,
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("OpenAI error:", aiResp.status, t);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI generation failed");
    }

    const aiData = await aiResp.json();
    const b64 = aiData?.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image returned");

    // Upload result to storage
    const outBytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const path = `age-progressions/${user.id}/${Date.now()}.png`;
    const { error: upErr } = await admin.storage.from("ai-studio").upload(path, outBytes, {
      contentType: "image/png",
      upsert: false,
    });
    if (upErr) throw upErr;
    const { data: pub } = admin.storage.from("ai-studio").getPublicUrl(path);
    const agedUrl = pub.publicUrl;

    await admin
      .from("ai_credits")
      .update({
        credits_remaining: credits.credits_remaining - COST,
        last_used_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    const { data: progression, error: insertError } = await admin
      .from("age_progressions")
      .insert({
        user_id: user.id,
        original_image_url: imageUrl,
        aged_image_url: agedUrl,
        years_forward: years,
        description: `Age progression +${years} years`,
        credits_used: COST,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    await admin.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: "age_progression",
      credits_used: COST,
      description: `Age progression +${years} years`,
    });

    return new Response(JSON.stringify({ progression, aged_image_url: agedUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-age-progression error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
