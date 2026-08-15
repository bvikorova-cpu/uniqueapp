import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth + rate limit only — the scene image is included in the room unlock,
    // so no extra credits are charged here.
    const auth = await requireAiCredits(req, corsHeaders, {
      credits: 0,
      usageType: "escape_room_scene",
      rateLimit: { max: 30, windowSec: 60, bucket: "ai.escape_room_scene" },
    });
    if (auth.errorResponse) return auth.errorResponse;

    const { roomName, theme, description } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const prompt = `Ultra-wide cinematic first-person view of an escape room scene: "${roomName}".
Theme: ${theme}. Scene story: ${description || roomName}.

Requirements:
- The image MUST clearly depict the described location (${roomName}) — no unrelated subjects, no plants, no people, no text.
- Wide angle interior/environment shot as if the player is standing inside the room and looking around.
- Rich searchable detail: furniture, doors, drawers, locks, safes, notes, keys, props and dark corners where objects could be hidden.
- Moody atmospheric lighting matching the ${theme} theme, photorealistic, highly detailed, no watermark, no UI overlay.`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: "gpt-image-1", prompt, n: 1, size: "1536x1024" }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image API error:', response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`Failed to generate scene: ${errorText}`);
    }

    const data = await response.json();
    const b64 = data?.data?.[0]?.b64_json;
    const imageUrl = b64 ? `data:image/png;base64,${b64}` : (data?.data?.[0]?.url ?? null);

    if (!imageUrl) {
      console.error('No image in response');
      throw new Error('No image generated');
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating escape room scene:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate scene' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
