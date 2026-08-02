import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const COSTS: Record<string, number> = { beauty_makeup: 5, beauty_hair: 5 };

const LOVABLE_IMAGE_URL = "https://ai.gateway.lovable.dev/v1/images/generations";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization header" }, 401);
    const token = authHeader.replace("Bearer ", "");

    const authClient = createClient(supabaseUrl, anonKey);
    const { data: { user } } = await authClient.auth.getUser(token);
    if (!user) return json({ error: "Not authenticated" }, 401);

    const supabase = createClient(supabaseUrl, serviceKey || anonKey);

    const body = await req.json().catch(() => ({}));
    const action = typeof body?.action === "string" ? body.action : "";
    const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl : "";
    const style = typeof body?.style === "string" && body.style.trim() ? body.style.trim() : "natural";

    if (!action) return json({ error: "Missing action" }, 400);
    if (!(action in COSTS)) return json({ error: `Unknown action: ${action}` }, 400);
    if (!imageUrl) return json({ error: "Image is required" }, 400);

    const cost = COSTS[action];
    const { data: credits } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!credits || credits.credits_remaining < cost) {
      return json({ error: `Insufficient credits. Need ${cost} credits.` }, 402);
    }
    const { error: deductErr } = await supabase.rpc("deduct_ai_credits", {
      p_user_id: user.id,
      p_amount: cost,
      p_reason: `Beauty ${action}`,
      p_source: "beauty-image-tools",
    });
    if (deductErr) return json({ error: "Failed to reserve credits" }, 500);

    const refund = () =>
      supabase.rpc("add_ai_credits", {
        p_user_id: user.id,
        p_amount: cost,
        p_reason: `Beauty ${action} refund`,
        p_source: "beauty-image-tools",
      });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      await refund();
      return json({ error: "AI service is not configured" }, 500);
    }

    const instruction = action === "beauty_makeup"
      ? `Apply a polished ${style} makeup look to the person. Preserve their exact identity, facial features, hairstyle, clothing, pose, lighting, background and composition. Photorealistic, professionally blended.`
      : `Change only the person's hair to ${style}. Preserve their exact identity, facial features, makeup, clothing, pose, lighting, background and composition. Photorealistic hair with natural strands, edges, shadows and highlights.`;

    try {
      const res = await fetch(LOVABLE_IMAGE_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3.1-flash-image",
          messages: [{
            role: "user",
            content: [
              { type: "text", text: `Edit this image: ${instruction} Return only the edited image.` },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          }],
          modalities: ["image", "text"],
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Lovable image edit error:", res.status, text);
        await refund();
        if (res.status === 429) return json({ error: "Rate limit reached, please try again shortly" }, 429);
        if (res.status === 402) return json({ error: "AI credits exhausted" }, 402);
        return json({ error: `Image editing failed (${res.status})` }, 500);
      }

      const data = await res.json();
      const b64 = data?.data?.[0]?.b64_json;
      if (!b64) {
        await refund();
        return json({ error: "No edited image returned by AI" }, 500);
      }

      return json({ imageUrl: `data:image/png;base64,${b64}`, creditsUsed: cost });
    } catch (err) {
      console.error("beauty-image-tools error:", err);
      await refund();
      return json({ error: err instanceof Error ? err.message : "Unexpected error" }, 500);
    }
  } catch (err) {
    console.error("beauty-image-tools fatal:", err);
    return json({ error: err instanceof Error ? err.message : "Unexpected error" }, 500);
  }
});
