import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COST = 3;

const BG_PROMPTS: Record<string, string> = {
  transparent:
    "Remove the background completely. Output the foreground subject perfectly cut out on a fully transparent background. Preserve all original detail, edges, and hair. Do not add any new background or color.",
  white: "Remove the background and replace it with a clean solid white background. Keep subject sharp.",
  black: "Remove the background and replace it with a clean solid black background. Keep subject sharp.",
  "gradient-blue":
    "Remove the background and replace it with a smooth blue gradient (deep navy to bright cyan). Keep subject sharp.",
  "gradient-purple":
    "Remove the background and replace it with a smooth purple gradient (deep violet to magenta). Keep subject sharp.",
  blur: "Keep the original background but apply a strong cinematic blur (depth-of-field). Keep subject sharp.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageUrl, bgColor = "transparent" } = await req.json();
    if (!imageUrl) throw new Error("imageUrl is required");

    // Credit check & deduction
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
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

    // Fetch the source image and pass as data URL to the AI gateway
    const srcRes = await fetch(imageUrl);
    if (!srcRes.ok) throw new Error("Could not fetch source image");
    const srcContentType = srcRes.headers.get("content-type") ?? "image/png";
    const srcBuf = new Uint8Array(await srcRes.arrayBuffer());
    let binary = "";
    for (let i = 0; i < srcBuf.length; i++) binary += String.fromCharCode(srcBuf[i]);
    const srcBase64 = btoa(binary);
    const srcDataUrl = `data:${srcContentType};base64,${srcBase64}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = BG_PROMPTS[bgColor] ?? BG_PROMPTS.transparent;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: srcDataUrl } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      console.error("AI gateway error", aiRes.status, txt);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add funds in Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      throw new Error(`AI gateway error ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    const message = aiData?.choices?.[0]?.message;
    const images = message?.images as Array<{ image_url?: { url?: string } }> | undefined;
    const dataUrl = images?.[0]?.image_url?.url;
    if (!dataUrl || !dataUrl.startsWith("data:")) {
      console.error("AI response missing image", JSON.stringify(aiData).slice(0, 500));
      throw new Error("AI did not return an image");
    }

    // Decode base64 and upload as PNG
    const commaIdx = dataUrl.indexOf(",");
    const b64 = dataUrl.slice(commaIdx + 1);
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);

    const filePath = `bg-removed/${user.id}/${Date.now()}.png`;
    const { error: upErr } = await admin.storage
      .from("stock-content")
      .upload(filePath, out, { contentType: "image/png", upsert: false });
    if (upErr) throw upErr;

    const { data: urlData } = admin.storage.from("stock-content").getPublicUrl(filePath);

    // Deduct credit + log
    await admin
      .from("ai_credits")
      .update({
        credits_remaining: credits.credits_remaining - COST,
        last_used_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);
    await admin.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: "image_remove_background",
      credits_used: COST,
      description: `Background removal (${bgColor})`,
    });

    return new Response(
      JSON.stringify({ resultUrl: urlData.publicUrl, filePath, bgColor }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("remove-background error", err);
    return new Response(JSON.stringify({ error: err?.message ?? "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
