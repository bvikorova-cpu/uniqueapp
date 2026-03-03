import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

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

    console.log('Calling OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1536x1024',
        quality: 'high',
        output_format: 'png',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to generate panorama: ${error}`);
    }

    const data = await response.json();
    console.log('Image generated successfully');

    const base64Image = data.data?.[0]?.b64_json;
    if (!base64Image) {
      throw new Error('No image data returned from AI');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const imageBuffer = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));

    const sanitize = (str: string) => str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();

    const fileName = `${sanitize(roomId)}-${Date.now()}.png`;
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

    const { data: { publicUrl } } = supabase.storage
      .from('castle-images')
      .getPublicUrl(filePath);

    console.log(`Image uploaded successfully: ${publicUrl}`);

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
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
