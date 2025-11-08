import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { roomId, roomName, description, castleName } = await req.json();

    if (!roomId || !roomName) {
      throw new Error('Room ID and name are required');
    }

    console.log(`Generating panorama for ${roomName} in ${castleName}`);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create detailed 360° panorama prompt
    const prompt = `Create a stunning 360-degree panoramic view of ${roomName} from ${castleName}. 
${description}

This should be a complete 360° equirectangular panorama that shows:
- Rich architectural details and Disney-themed decorations
- Magical lighting and atmospheric effects  
- Vibrant colors matching the Disney aesthetic
- Immersive environment perfect for virtual tours
- Ultra high quality, photorealistic rendering
- Wide angle coverage showing all walls, ceiling and floor

Style: Disney theme park quality, magical, enchanting, child-friendly, detailed and vibrant.
Format: 360-degree equirectangular projection for VR/panorama viewers.`;

    console.log('Calling AI image generation API...');

    // Generate panorama using Nano banana (Gemini 2.5 Flash)
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI API error:', error);
      throw new Error(`Failed to generate panorama: ${error}`);
    }

    const data = await response.json();
    console.log('Image generated successfully');

    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageData) {
      throw new Error('No image data returned from AI');
    }

    // Upload to Supabase Storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract base64 data
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    const fileName = `${roomId}-${Date.now()}.png`;
    const filePath = `panoramas/${fileName}`;

    console.log(`Uploading to storage: ${filePath}`);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('castle-images')
      .upload(filePath, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('castle-images')
      .getPublicUrl(filePath);

    console.log(`Image uploaded successfully: ${publicUrl}`);

    // Update room with panorama URL
    const { error: updateError } = await supabase
      .from('disney_castle_rooms')
      .update({ panorama_url: publicUrl })
      .eq('id', roomId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error(`Failed to update room: ${updateError.message}`);
    }

    console.log(`Room ${roomId} updated with panorama URL`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        panoramaUrl: publicUrl,
        roomId 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-room-panorama function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
