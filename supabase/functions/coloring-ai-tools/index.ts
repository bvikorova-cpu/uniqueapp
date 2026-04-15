import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Invalid token");

    const { action, ...params } = await req.json();

    // Check AI credits
    const checkCredits = async (cost: number) => {
      const { data: credits } = await supabase
        .from("coloring_credits")
        .select("credits_remaining, tier")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!credits) throw new Error("No credits found. Please purchase a plan.");
      if (credits.tier !== "premium" && credits.credits_remaining < cost) {
        throw new Error(`Insufficient credits. Need ${cost}, have ${credits.credits_remaining}`);
      }

      if (credits.tier !== "premium") {
        await supabase
          .from("coloring_credits")
          .update({ credits_remaining: credits.credits_remaining - cost })
          .eq("user_id", user.id);
      }
    };

    const callAI = async (systemPrompt: string, userPrompt: string) => {
      if (!LOVABLE_API_KEY) throw new Error("AI not configured");
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });
      if (res.status === 429) throw new Error("Rate limited. Please try again later.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add funds.");
      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "";
    };

    const callAIWithImage = async (prompt: string) => {
      if (!LOVABLE_API_KEY) throw new Error("AI not configured");
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        }),
      });
      if (res.status === 429) throw new Error("Rate limited. Please try again later.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add funds.");
      if (!res.ok) throw new Error("AI image generation failed");
      const data = await res.json();
      const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (!imageData) throw new Error("No image generated");

      // Upload to storage
      const base64 = imageData.replace(/^data:image\/\w+;base64,/, "");
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const fileName = `${user.id}/${Date.now()}_${action}.png`;
      const { error: uploadErr } = await supabase.storage
        .from("coloring-images")
        .upload(fileName, bytes, { contentType: "image/png", upsert: true });
      if (uploadErr) throw new Error("Failed to upload generated image");
      const { data: { publicUrl } } = supabase.storage.from("coloring-images").getPublicUrl(fileName);
      return publicUrl;
    };

    const callAIStructured = async (systemPrompt: string, userPrompt: string, toolDef: any) => {
      if (!LOVABLE_API_KEY) throw new Error("AI not configured");
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [{ type: "function", function: toolDef }],
          tool_choice: { type: "function", function: { name: toolDef.name } },
        }),
      });
      if (!res.ok) throw new Error("AI structured request failed");
      const data = await res.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("No structured response");
      return JSON.parse(toolCall.function.arguments);
    };

    let result: any;

    switch (action) {
      case "style-transfer": {
        // AI Style Transfer: generate coloring page in a specific art style
        await checkCredits(2);
        const { description, style } = params;
        const styleMap: Record<string, string> = {
          "van-gogh": "Van Gogh's Starry Night swirling post-impressionist style with bold brushstroke outlines",
          "manga": "Japanese manga anime style with clean precise lines and expressive details",
          "pop-art": "Roy Lichtenstein pop art style with bold outlines, Ben-Day dots pattern areas",
          "art-nouveau": "Alphonse Mucha art nouveau style with flowing organic curves and decorative borders",
          "pixel-art": "retro pixel art style with blocky geometric shapes on a grid",
          "watercolor": "loose watercolor sketch style with soft flowing outlines and splashy edges",
        };
        const styleDesc = styleMap[style] || style;
        const prompt = `Create a black and white coloring page in ${styleDesc}. Subject: ${description}. 
Line art only, no shading, no filled areas, clear outlines suitable for coloring. High detail, professional quality.`;
        const imageUrl = await callAIWithImage(prompt);
        result = { imageUrl, style, description };
        break;
      }

      case "color-suggestions": {
        // AI Color Suggestions for a coloring page
        await checkCredits(1);
        const { pageDescription, mood } = params;
        const suggestions = await callAIStructured(
          "You are an expert color theory artist. Generate beautiful, harmonious color palettes for coloring pages.",
          `Suggest 3 different color palettes for a coloring page with this description: "${pageDescription}". Mood: ${mood || "vibrant"}. 
Each palette should have 6-8 colors with hex codes and names. Include a palette name and brief description of why these colors work together.`,
          {
            name: "suggest_palettes",
            description: "Return color palette suggestions",
            parameters: {
              type: "object",
              properties: {
                palettes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      colors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            hex: { type: "string" },
                            name: { type: "string" },
                          },
                          required: ["hex", "name"],
                        },
                      },
                    },
                    required: ["name", "description", "colors"],
                  },
                },
              },
              required: ["palettes"],
            },
          }
        );

        // Save to DB
        await supabase.from("coloring_color_suggestions").insert({
          user_id: user.id,
          page_image_url: pageDescription,
          palette: suggestions.palettes,
          style: mood || "vibrant",
          ai_description: suggestions.palettes.map((p: any) => p.description).join("; "),
        });

        result = suggestions;
        break;
      }

      case "generate-daily-challenge": {
        // Generate today's daily challenge (called by cron or admin)
        const themes = [
          "Enchanted Forest", "Underwater Kingdom", "Space Adventure", "Fairy Tale Castle",
          "Dinosaur World", "Robot City", "Magical Garden", "Pirate Treasure",
          "Dragon's Lair", "Winter Wonderland", "Safari Animals", "Candy Land",
          "Haunted House", "Superhero City", "Ancient Egypt", "Tropical Paradise",
        ];
        const theme = themes[Math.floor(Math.random() * themes.length)];
        const difficulties = ["easy", "medium", "hard"];
        const diff = difficulties[Math.floor(Math.random() * difficulties.length)];

        const challengePrompt = `Create a ${diff} difficulty black and white coloring page: ${theme}. Line art only, no shading, clear outlines.`;
        const sampleUrl = await callAIWithImage(challengePrompt);

        const { data: challenge, error: chalErr } = await supabase
          .from("coloring_daily_challenges")
          .insert({
            theme,
            description: `Today's challenge: Create your best ${theme} coloring masterpiece!`,
            difficulty: diff,
            prompt: challengePrompt,
            sample_image_url: sampleUrl,
            xp_reward: diff === "easy" ? 30 : diff === "medium" ? 50 : 80,
          })
          .select()
          .single();

        if (chalErr) throw chalErr;
        result = challenge;
        break;
      }

      case "submit-challenge": {
        // Submit to daily challenge
        const { challengeId, imageUrl: submissionUrl } = params;
        const { data: sub, error: subErr } = await supabase
          .from("coloring_challenge_submissions")
          .insert({
            user_id: user.id,
            challenge_id: challengeId,
            image_url: submissionUrl,
            xp_earned: params.xpReward || 50,
          })
          .select()
          .single();
        if (subErr) throw subErr;

        // Increment participant count
        await supabase.rpc("increment_challenge_participants", { challenge_id: challengeId }).catch(() => {});

        result = sub;
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("coloring-ai-tools error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
