import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const extractImage = (payload: any): string | undefined => {
  const base64 = payload?.data?.[0]?.b64_json;
  if (base64) return `data:image/png;base64,${base64}`;
  if (payload?.data?.[0]?.url) return payload.data[0].url;

  const message = payload?.choices?.[0]?.message;
  return message?.images?.[0]?.image_url?.url ||
    (Array.isArray(message?.content)
      ? message.content.find((part: any) => part?.type === "image_url")?.image_url?.url
      : undefined);
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const cost = 5;
  let userId: string | undefined;
  let charged = false;
  let admin: ReturnType<typeof createClient> | undefined;

  const refund = async () => {
    if (!charged || !userId || !admin) return;
    const { error } = await admin.rpc("add_ai_credits", {
      p_user_id: userId,
      p_amount: cost,
      p_reason: "stock_content_generation_refund",
      p_source: "ai-stock-content-generator",
    });
    if (error) console.error("Credit refund failed:", error.message);
    charged = false;
  };

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!supabaseUrl || !serviceKey || !lovableKey) return json({ error: "AI service is not configured" }, 500);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Please sign in to generate content" }, 401);

    admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: { user }, error: authError } = await admin.auth.getUser(authHeader.slice(7));
    if (authError || !user) return json({ error: "Please sign in to generate content" }, 401);
    userId = user.id;

    const body = await req.json().catch(() => ({}));
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const style = typeof body?.style === "string" ? body.style.trim() : "Photorealistic";
    const category = typeof body?.category === "string" ? body.category.trim() : "General";
    if (prompt.length < 3) return json({ error: "Please enter a longer description" }, 400);

    const { data: spendResult, error: spendError } = await admin.rpc("spend_unified_ai_credits_for_user", {
      p_user_id: user.id,
      p_amount: cost,
      p_reason: "stock_content_generation",
      p_source: "ai-stock-content-generator",
    });
    if (spendError) {
      if (/INSUFFICIENT_CREDITS|insufficient/i.test(spendError.message)) {
        return json({ error: `Insufficient credits. You need ${cost} credits.` }, 402);
      }
      console.error("Credit deduction failed:", spendError.message);
      return json({ error: "Credit check failed. Please try again." }, 500);
    }
    const spendRow = Array.isArray(spendResult) ? spendResult[0] : spendResult;
    if (spendResult === false || spendRow === false) return json({ error: `Insufficient credits. You need ${cost} credits.` }, 402);
    charged = true;

    const finalPrompt = `Create an original, commercially usable stock image. Subject: ${prompt}. Visual style: ${style}. Category: ${category}. Professional composition, clean detail, no logos, no watermark, no written text.`;
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: {
        "Lovable-API-Key": lovableKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image",
        messages: [{ role: "user", content: finalPrompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const details = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, details.slice(0, 500));
      await refund();
      if (aiResponse.status === 429) return json({ error: "AI is busy. Credits were refunded; please try again shortly." }, 429);
      if (aiResponse.status === 402) return json({ error: "AI service credits are temporarily unavailable. Your credits were refunded." }, 402);
      return json({ error: "Image generation failed. Your credits were refunded." }, 502);
    }

    const aiPayload = await aiResponse.json();
    const imageUrl = extractImage(aiPayload);
    if (!imageUrl) {
      console.error("No image returned:", JSON.stringify(aiPayload).slice(0, 800));
      await refund();
      return json({ error: "The AI returned no image. Your credits were refunded." }, 502);
    }

    return json({ imageUrl, creditsUsed: cost });
  } catch (error) {
    console.error("ai-stock-content-generator error:", error);
    await refund();
    return json({ error: "Generation failed. Any reserved credits were refunded." }, 500);
  }
});