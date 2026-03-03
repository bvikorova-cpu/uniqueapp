import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

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
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: subscription } = await supabaseClient
      .from('decor_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!subscription) {
      await supabaseClient
        .from('decor_subscriptions')
        .insert({
          user_id: user.id,
          tier: 'free',
          designs_limit: 2,
          designs_used: 0,
          status: 'active'
        })
    } else if (subscription.designs_used >= subscription.designs_limit) {
      return new Response(
        JSON.stringify({ 
          error: 'Design limit reached', 
          message: `You've used ${subscription.designs_used}/${subscription.designs_limit} designs this month. Upgrade to Pro for 50 designs!` 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { originalImageUrl, roomType, stylePreference, customPrompt } = await req.json()

    if (!originalImageUrl || !roomType || !stylePreference) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Generating room design with OpenAI...')

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    const designPrompt = `Create a beautiful ${stylePreference} style ${roomType.replace('-', ' ')} interior design. 
    ${customPrompt ? `Additional requirements: ${customPrompt}` : ''}
    Professional interior design with furniture, proper lighting, elegant decor. Ultra high resolution.`

    console.log("Fetching original image...");
    const imageBase64 = await fetchImageAsBase64(originalImageUrl);

    const binaryString = atob(imageBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const imageBlob = new Blob([bytes], { type: 'image/png' });
    
    const formData = new FormData();
    formData.append('image', imageBlob, 'image.png');
    formData.append('prompt', designPrompt);
    formData.append('model', 'gpt-image-1');
    formData.append('size', '1024x1024');

    const aiResponse = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OpenAI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      throw new Error('AI generation failed')
    }

    const aiData = await aiResponse.json()
    const base64Image = aiData.data?.[0]?.b64_json;
    
    if (!base64Image) {
      throw new Error('No image generated');
    }

    const generatedImageUrl = `data:image/png;base64,${base64Image}`;
    
    const designData = {
      description: `Beautiful ${stylePreference} ${roomType} design`,
      colorPalette: [],
      furnitureSuggestions: [],
      lightingSuggestions: '',
      products: [
        { name: 'Modern Sofa', category: 'Furniture', price: '€599' },
        { name: 'Designer Lamp', category: 'Lighting', price: '€149' },
        { name: 'Decorative Cushions', category: 'Accessories', price: '€39' }
      ]
    }

    const { data: design, error: designError } = await supabaseClient
      .from('ai_room_designs')
      .insert({
        user_id: user.id,
        room_image_url: originalImageUrl,
        ai_design_url: generatedImageUrl,
        style: stylePreference,
        suggested_products: designData.products.map(p => p.name),
        is_saved: true
      })
      .select()
      .single()

    if (designError) throw designError

    await supabaseClient
      .from('decor_subscriptions')
      .update({ 
        designs_used: (subscription?.designs_used || 0) + 1 
      })
      .eq('user_id', user.id)

    const remainingDesigns = (subscription?.designs_limit || 2) - ((subscription?.designs_used || 0) + 1)

    return new Response(
      JSON.stringify({ 
        design,
        designData,
        remainingDesigns
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
