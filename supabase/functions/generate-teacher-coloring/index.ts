import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { 
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } }
      }
    );

    const { data: userData } = await supabaseClient.auth.getUser();
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { prompt, collectionId } = await req.json();
    console.log("Generating teacher coloring page:", { prompt, collectionId, userId: user.id });

    // Check if user has active subscription or is admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    const isAdmin = !!roleData;

    if (!isAdmin) {
      const { data: profile } = await supabaseClient
        .from('school_profiles')
        .select('subscription_status, subscription_tier')
        .eq('user_id', user.id)
        .single();

      if (!profile || profile.subscription_status !== 'active') {
        throw new Error("Active subscription required");
      }
    }

    // Generate coloring page using OpenAI
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) throw new Error("OPENAI_API_KEY not set");

    const coloringPrompt = `Generate a simple black and white line art coloring page suitable for children. 
The image should have clear, bold outlines with no shading or colors, ready to be printed and colored.
Theme: ${prompt}
Style: Simple, child-friendly, clean lines, suitable for ages 4-10, educational`;

    console.log("Calling OpenAI with prompt:", coloringPrompt);

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: coloringPrompt
          }
        ]
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error(`Failed to generate image: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(aiData));
      throw new Error("No image generated");
    }

    console.log("Image generated successfully, uploading to storage...");

    // Convert base64 to blob and upload to Supabase storage
    const base64Data = imageUrl.split(',')[1];
    const blob = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
    const filePath = `teacher-coloring/${user.id}/${fileName}`;

    const { error: uploadError } = await supabaseClient.storage
      .from('coloring-images')
      .upload(filePath, blob, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabaseClient.storage
      .from('coloring-images')
      .getPublicUrl(filePath);

    console.log("Image uploaded successfully:", publicUrl);

    // Save to database
    const { data: pageData, error: dbError } = await supabaseClient
      .from('teacher_coloring_pages')
      .insert({
        collection_id: collectionId,
        title: prompt,
        image_url: publicUrl,
        created_by: user.id
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error(`Failed to save page: ${dbError.message}`);
    }

    // Update collection page count
    const { error: incrementError } = await supabaseClient.rpc('increment_collection_pages', {
      p_collection_id: collectionId
    });

    if (incrementError) {
      console.error("Error incrementing page count:", incrementError);
    }

    console.log("Teacher coloring page created successfully:", pageData.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        page: pageData
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error in generate-teacher-coloring:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate coloring page";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
