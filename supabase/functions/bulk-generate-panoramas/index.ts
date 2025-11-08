import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Room {
  id: string;
  room_name: string;
  description: string;
  castle_id: string;
  castle_name?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all rooms that need panoramas
    const { data: rooms, error: roomsError } = await supabase
      .from('disney_castle_rooms')
      .select(`
        id,
        room_name,
        description,
        panorama_url,
        castle_id,
        disney_castles (
          name
        )
      `)
      .is('panorama_url', null)
      .order('castle_id')
      .order('order_index');

    if (roomsError) {
      throw roomsError;
    }

    if (!rooms || rooms.length === 0) {
      return new Response(
        JSON.stringify({ message: 'All rooms already have panoramas', total: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const roomsToProcess: Room[] = rooms.map(r => ({
      id: r.id,
      room_name: r.room_name,
      description: r.description,
      castle_id: r.castle_id,
      castle_name: (r.disney_castles as any)?.name
    }));

    console.log(`Starting bulk generation for ${roomsToProcess.length} rooms`);

    // Start background task for generating all panoramas
    const backgroundTask = async () => {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        console.error('LOVABLE_API_KEY not configured');
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (const room of roomsToProcess) {
        try {
          console.log(`[${successCount + failCount + 1}/${roomsToProcess.length}] Generating: ${room.castle_name} - ${room.room_name}`);

          // Create detailed 360° panorama prompt
          const prompt = `Create a stunning 360-degree equirectangular panoramic view of "${room.room_name}" inside ${room.castle_name}. 
${room.description} 
Style: Disney theme park quality, magical atmosphere, highly detailed, photorealistic, warm lighting, immersive environment. 
The image should be suitable for VR/360° viewing with proper equirectangular projection. 
Include architectural details, magical decorations, royal furnishings, and enchanting ambiance that matches Disney castle aesthetics.
Ultra high resolution, professional theme park photography quality.`;

          // Call Lovable AI
          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash-image-preview',
              messages: [{ role: 'user', content: prompt }],
              modalities: ['image', 'text']
            })
          });

          if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            console.error(`AI error for ${room.room_name}:`, aiResponse.status, errorText);
            failCount++;
            
            // Wait 3 seconds before next attempt
            await new Promise(resolve => setTimeout(resolve, 3000));
            continue;
          }

          const data = await aiResponse.json();
          const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          
          if (!imageUrl) {
            console.error(`No image URL for ${room.room_name}`);
            failCount++;
            continue;
          }

          // Upload to storage
          const base64Data = imageUrl.split(',')[1];
          const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          
          const fileName = `${room.castle_name?.replace(/\s+/g, '-')}-${room.room_name.replace(/\s+/g, '-')}-${Date.now()}.png`;
          const filePath = `castle-panoramas/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('castle-images')
            .upload(filePath, binaryData, {
              contentType: 'image/png',
              upsert: true
            });

          if (uploadError) {
            console.error(`Upload error for ${room.room_name}:`, uploadError);
            failCount++;
            continue;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('castle-images')
            .getPublicUrl(filePath);

          // Update room with panorama URL
          const { error: updateError } = await supabase
            .from('disney_castle_rooms')
            .update({ panorama_url: publicUrl })
            .eq('id', room.id);

          if (updateError) {
            console.error(`Update error for ${room.room_name}:`, updateError);
            failCount++;
          } else {
            console.log(`✅ Success: ${room.castle_name} - ${room.room_name}`);
            successCount++;
          }

          // Wait 2 seconds between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
          console.error(`Error generating panorama for ${room.room_name}:`, error);
          failCount++;
        }
      }

      console.log(`\n🎉 Bulk generation complete!`);
      console.log(`✅ Success: ${successCount}`);
      console.log(`❌ Failed: ${failCount}`);
      console.log(`📊 Total: ${roomsToProcess.length}`);
    };

    // Start background task without waiting
    // @ts-ignore - EdgeRuntime is available in Deno Deploy
    if (typeof EdgeRuntime !== 'undefined') {
      // @ts-ignore
      EdgeRuntime.waitUntil(backgroundTask());
    } else {
      // Fallback for local development
      backgroundTask().catch(console.error);
    }

    // Return immediate response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Bulk generation started in background',
        total_rooms: roomsToProcess.length,
        estimated_time_minutes: Math.ceil(roomsToProcess.length * 30 / 60) // ~30 seconds per room
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in bulk generation:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
