import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, yearsForward, includeComparison } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    console.log("Fetching original image...");
    const imageBase64 = await fetchImageAsBase64(imageUrl);

    const binaryString = atob(imageBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const imageBlob = new Blob([bytes], { type: 'image/png' });

    // Generate healthy lifestyle version
    const healthyPrompt = `Age this person by ${yearsForward} years with HEALTHY LIFESTYLE: 
    Show natural, graceful aging with glowing skin, minimal wrinkles, vibrant appearance, healthy hair with natural graying, 
    fit physique, bright eyes, and youthful energy. Keep the person recognizable.`;
    
    let healthyImageUrl = null;
    
    try {
      const formData = new FormData();
      formData.append('image', imageBlob, 'image.png');
      formData.append('prompt', healthyPrompt);
      formData.append('model', 'gpt-image-1');
      formData.append('size', '1024x1024');

      const healthyResponse = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (healthyResponse.ok) {
        const healthyData = await healthyResponse.json();
        const base64Image = healthyData.data?.[0]?.b64_json;
        if (base64Image) {
          healthyImageUrl = `data:image/png;base64,${base64Image}`;
        }
      } else {
        const errorText = await healthyResponse.text();
        console.error('Healthy image error:', healthyResponse.status, errorText);
      }
    } catch (imgError) {
      console.error('Healthy image generation error:', imgError);
    }

    // Generate unhealthy lifestyle version if comparison is requested
    let unhealthyImageUrl = null;
    
    if (includeComparison) {
      const unhealthyPrompt = `Age this person by ${yearsForward} years with UNHEALTHY LIFESTYLE: 
      Show accelerated aging with dull, sagging skin, deep wrinkles, tired appearance, thinning gray hair, 
      less toned physique, tired eyes with bags, and worn look. Keep the person recognizable.`;
      
      try {
        const formData2 = new FormData();
        formData2.append('image', imageBlob, 'image.png');
        formData2.append('prompt', unhealthyPrompt);
        formData2.append('model', 'gpt-image-1');
        formData2.append('size', '1024x1024');

        const unhealthyResponse = await fetch("https://api.openai.com/v1/images/edits", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
          },
          body: formData2,
        });

        if (unhealthyResponse.ok) {
          const unhealthyData = await unhealthyResponse.json();
          const base64Image = unhealthyData.data?.[0]?.b64_json;
          if (base64Image) {
            unhealthyImageUrl = `data:image/png;base64,${base64Image}`;
          }
        } else {
          const errorText = await unhealthyResponse.text();
          console.error('Unhealthy image error:', unhealthyResponse.status, errorText);
        }
      } catch (imgError) {
        console.error('Unhealthy image generation error:', imgError);
      }
    }

    // Generate anti-aging tips using OpenAI
    let antiAgingTips = 'Maintain a healthy lifestyle with proper nutrition, regular exercise, good sleep, and stress management.';
    
    try {
      const tipsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert in healthy aging and anti-aging strategies. Provide practical, evidence-based advice.'
            },
            {
              role: 'user',
              content: `Provide 5 key anti-aging tips to maintain youthful appearance and health over the next ${yearsForward} years. Include diet, exercise, skincare, lifestyle and mental health advice. Keep it under 200 words, actionable and motivating.`
            }
          ],
        }),
      });

      if (tipsResponse.ok) {
        const tipsData = await tipsResponse.json();
        antiAgingTips = tipsData.choices[0].message.content;
      }
    } catch (e) {
      console.error('Tips generation error:', e);
    }

    const { data: progression, error: progError } = await supabase
      .from('future_face_progressions')
      .insert({
        user_id: user.id,
        original_image_url: imageUrl,
        healthy_image_url: healthyImageUrl,
        unhealthy_image_url: unhealthyImageUrl,
        years_forward: yearsForward,
        anti_aging_tips: antiAgingTips,
        has_comparison: includeComparison
      })
      .select()
      .single();

    if (progError) throw progError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        progression: {
          ...progression,
          healthyImageUrl,
          unhealthyImageUrl,
          antiAgingTips
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
