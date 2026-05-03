import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COST = 15;

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

    const { destination } = await req.json();
    if (!destination || typeof destination !== "string") {
      return new Response(JSON.stringify({ error: "destination is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const scenes = [
      `Stunning 360-degree panoramic view of ${destination}, golden hour, ultra wide, photorealistic`,
      `Iconic landmark of ${destination}, daytime, vibrant, photorealistic, ultra wide`,
      `Local street scene in ${destination}, atmospheric, cinematic, photorealistic`,
      `${destination} at night, neon lights, cinematic, photorealistic, ultra wide`,
    ];

    const imageUrls: string[] = [];
    for (let i = 0; i < scenes.length; i++) {
      const prompt = scenes[i];
      const aiResp = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt,
          n: 1,
          size: "1536x1024",
        }),
      });
      if (!aiResp.ok) {
        const t = await aiResp.text();
        console.error("OpenAI error:", aiResp.status, t);
        if (aiResp.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        continue;
      }
      const aiData = await aiResp.json();
      const b64 = aiData?.data?.[0]?.b64_json;
      if (!b64) continue;

      // Upload to storage
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const path = `virtual-tours/${user.id}/${Date.now()}-${i}.png`;
      const { error: upErr } = await admin.storage.from("ai-studio").upload(path, bytes, {
        contentType: "image/png",
        upsert: false,
      });
      if (upErr) {
        console.error("Upload error:", upErr);
        continue;
      }
      const { data: pub } = admin.storage.from("ai-studio").getPublicUrl(path);
      if (pub?.publicUrl) imageUrls.push(pub.publicUrl);
    }

    if (imageUrls.length === 0) {
      return new Response(JSON.stringify({ error: "Failed to generate tour images" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin
      .from("ai_credits")
      .update({
        credits_remaining: credits.credits_remaining - COST,
        last_used_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    const { data: tour, error: insertError } = await admin
      .from("virtual_tours")
      .insert({
        user_id: user.id,
        destination,
        description: `AI-generated 360° virtual tour of ${destination}`,
        image_urls: imageUrls,
        credits_used: COST,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    await admin.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: "virtual_tour",
      credits_used: COST,
      description: `Virtual tour: ${destination}`,
    });

    return new Response(JSON.stringify({ tour, image_urls: imageUrls }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-virtual-tour error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
