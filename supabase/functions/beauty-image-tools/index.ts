import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const extractImage = (data: any): string | null => {
  const encoded = data?.data?.[0]?.b64_json;
  if (typeof encoded === "string" && encoded) return `data:image/png;base64,${encoded}`;
  const directUrl = data?.data?.[0]?.url;
  if (typeof directUrl === "string" && directUrl) return directUrl;
  const message = data?.choices?.[0]?.message;
  const messageUrl = message?.images?.[0]?.image_url?.url || message?.images?.[0]?.url;
  if (typeof messageUrl === "string" && messageUrl) return messageUrl;
  if (Array.isArray(message?.content)) {
    for (const part of message.content) {
      const url = part?.image_url?.url || part?.url;
      if (typeof url === "string" && url) return url;
      if (typeof part?.b64_json === "string" && part.b64_json) {
        return `data:image/png;base64,${part.b64_json}`;
      }
    }
  }
  const inlinePart = data?.candidates?.[0]?.content?.parts?.find((part: any) => part?.inlineData?.data);
  if (typeof inlinePart?.inlineData?.data === "string") {
    return `data:${inlinePart.inlineData.mimeType || "image/png"};base64,${inlinePart.inlineData.data}`;
  }
  return null;
};

const toDataUrl = async (source: string): Promise<string> => {
  if (source.startsWith("data:image/")) return source;
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Could not read source image (${response.status})`);
  const mime = response.headers.get("content-type") || "image/jpeg";
  if (!mime.startsWith("image/")) throw new Error("Source URL is not an image");
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > 10 * 1024 * 1024) throw new Error("Source image is too large (maximum 10 MB)");
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 8192) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  }
  return `data:${mime};base64,${btoa(binary)}`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Not authenticated" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey || !lovableKey) {
    return json({ error: "Beauty AI service is not configured" }, 500);
  }

  const authClient = createClient(supabaseUrl, anonKey);
  const token = authHeader.slice("Bearer ".length);
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user) return json({ error: "Please sign in again" }, 401);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const feature = body?.feature;
  const imageUrl = body?.imageUrl;
  const instruction = body?.instruction;
  if (feature !== "makeup" && feature !== "hair") return json({ error: "Invalid beauty feature" }, 400);
  if (typeof imageUrl !== "string" || !imageUrl.trim()) return json({ error: "Image is required" }, 400);
  if (typeof instruction !== "string" || !instruction.trim() || instruction.length > 2000) {
    return json({ error: "A valid edit instruction is required" }, 400);
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const cost = 5;
  const { data: balance } = await admin.from("ai_credits")
    .select("credits_remaining")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!balance || balance.credits_remaining < cost) {
    return json({ error: `Insufficient credits. Need ${cost} credits.` }, 402);
  }

  const { error: deductError } = await admin.rpc("deduct_ai_credits", {
    p_user_id: user.id,
    p_amount: cost,
    p_reason: `Beauty Studio ${feature}`,
    p_source: "beauty-image-tools",
  });
  if (deductError) return json({ error: "Failed to reserve credits" }, 500);

  let refunded = false;
  const refund = async () => {
    if (refunded) return;
    refunded = true;
    await admin.rpc("add_ai_credits", {
      p_user_id: user.id,
      p_amount: cost,
      p_reason: `Beauty Studio ${feature} refund`,
      p_source: "beauty-image-tools",
    });
  };

  try {
    const sourceDataUrl = await toDataUrl(imageUrl);
    const prompt = `${instruction.trim()} Preserve the person's identity and the original composition. Return only one edited photorealistic image.`;
    const models = ["google/gemini-3.1-flash-image", "google/gemini-2.5-flash-image"];
    let lastReason = "no image returned";

    for (const model of models) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
        method: "POST",
        headers: { "Lovable-API-Key": lovableKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [{
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: sourceDataUrl } },
            ],
          }],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        lastReason = `model request failed (${response.status})`;
        console.error("Beauty model error", model, response.status, errorText.slice(0, 500));
        if (response.status === 402 || response.status === 429) break;
        continue;
      }

      const responseData = await response.json().catch(() => null);
      const resultUrl = extractImage(responseData);
      if (resultUrl) {
        await admin.from("ai_usage_history").insert({
          user_id: user.id,
          usage_type: `beauty_${feature}`,
          credits_used: cost,
          description: `Beauty Studio ${feature}`,
        });
        return json({ imageUrl: resultUrl });
      }
      lastReason = responseData?.data === null ? "model generated no image" : "unsupported model response";
      console.error("Beauty model returned no image", model, JSON.stringify(responseData).slice(0, 500));
    }

    await refund();
    return json({ error: `The AI could not edit this photo (${lastReason}). Credits were refunded.` }, 502);
  } catch (error) {
    await refund();
    const message = error instanceof Error ? error.message : "Beauty image generation failed";
    console.error("Beauty image generation failed", message);
    return json({ error: `${message}. Credits were refunded.` }, 502);
  }
});