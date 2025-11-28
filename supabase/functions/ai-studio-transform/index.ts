import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TRANSFORMATION_PROMPTS: Record<string, string> = {
  // Christmas themes
  "christmas-polar": "Transform this person into a magical Christmas scene where they are wearing a cozy red Santa outfit with white fur trim and holding an adorable white polar bear cub. Add snowy winter background with a decorated Christmas tree, golden sparkles, and warm festive lighting. Keep the person's face exactly the same.",
  "christmas-tree": "Transform this person into an elegant Christmas portrait. Dress them in a beautiful sparkling red dress or suit, standing next to a gorgeously decorated Christmas tree with golden ornaments. Add cozy fireplace in background with warm festive lighting. Keep the person's face exactly the same.",
  "christmas-elf": "Transform this person into Santa's magical helper elf. Add pointy elf hat, festive red and green outfit, and place them in Santa's North Pole workshop with toys and Christmas decorations. Add magical sparkles. Keep the person's face exactly the same.",
  "christmas-cozy": "Transform this person into a cozy Christmas scene. Dress them in warm knitted sweater, holding a cup of hot cocoa, with snowy window background and fairy lights. Add warm cabin atmosphere. Keep the person's face exactly the same.",
  
  // Valentine themes
  "valentine-roses": "Transform this person into a romantic Valentine portrait surrounded by beautiful red roses and floating pink hearts. Dress them in elegant red attire with soft dreamy pink lighting. Add romantic atmosphere. Keep the person's face exactly the same.",
  "valentine-cupid": "Transform this person into a beautiful Cupid angel with soft white wings and a pink halo. Surround with floating hearts, soft pink and red background. Add dreamy romantic lighting. Keep the person's face exactly the same.",
  "valentine-dinner": "Transform this person into an elegant romantic dinner setting. Dress them in fancy pink or red gown/suit at a candlelit table with champagne, heart-shaped bokeh lights in background. Keep the person's face exactly the same.",
  "valentine-garden": "Transform this person into a romantic cherry blossom garden. Surround with beautiful pink flowers, falling petals forming heart shapes, soft sunset lighting. Keep the person's face exactly the same.",
  
  // Easter themes
  "easter-bunny": "Transform this person into a cute Easter scene with bunny ears headband, surrounded by colorful Easter eggs and adorable white bunnies in a flower meadow. Add soft spring sunshine. Keep the person's face exactly the same.",
  "easter-spring": "Transform this person into a beautiful spring portrait with a flower crown of tulips and daffodils. Surround with blooming spring flowers, butterflies, and soft pastel colors. Keep the person's face exactly the same.",
  
  // Halloween themes
  "halloween-vampire": "Transform this person into an elegant vampire portrait. Add pale skin, subtle fangs, gothic castle background with full moon and flying bats. Add dramatic mysterious lighting. Keep the person's face recognizable but vampiric.",
  "halloween-witch": "Transform this person into a beautiful magical witch with an enchanted purple glowing hat. Add pumpkins, mystical forest background, magical sparkles and purple lighting. Keep the person's face exactly the same.",
  
  // Luxury themes
  "luxury-vip": "Transform this person into a VIP billionaire portrait. Dress them in designer clothes with gold jewelry, place them in a private jet or yacht interior. Add champagne, luxury watches, wealthy lifestyle elements. Keep the person's face exactly the same.",
  "luxury-dubai": "Transform this person into an elegant Dubai luxury portrait. Dress in white designer outfit, Dubai skyline with Burj Khalifa in background, golden sunset. Add luxurious atmosphere. Keep the person's face exactly the same.",
  "luxury-royal": "Transform this person into a royal queen or king portrait. Add a magnificent crown with jewels, place them on a golden throne in a palace throne room. Add regal atmosphere with rich fabrics. Keep the person's face exactly the same.",
  
  // Portrait themes
  "portrait-business": "Transform this into a professional corporate headshot. Dress person in elegant suit, modern office with city skyline view in background. Add professional studio lighting. Keep the person's face exactly the same.",
  "portrait-artistic": "Transform this into an artistic editorial portrait. Add creative dramatic lighting, artistic makeup look, studio photography style with dramatic shadows. Keep the person's face exactly the same.",
  "glamour-hollywood": "Transform this into a Hollywood glamour portrait. Add professional red carpet styling, golden sparkles, elegant hair and makeup, magazine-quality aesthetics. Keep the person's face exactly the same.",
  
  // Star themes
  "star-popstar": "Transform this person into a famous pop star on stage. Add concert stage lighting, neon lights, microphone, screaming fans in background. Give them star performer vibes. Keep the person's face exactly the same.",
  "star-movie": "Transform this person into a movie star at a film premiere. Red carpet, paparazzi cameras flashing, Oscar award vibe, celebrity glamour styling. Keep the person's face exactly the same.",
  
  // Fantasy themes
  "fairytale-princess": "Transform this person into a magical Disney-style princess. Dress them in a sparkling ball gown, add a tiara, place in front of enchanted castle with magical lights and sparkles. Keep the person's face exactly the same.",
  "fantasy-elf": "Transform this person into a beautiful mystical elf. Add elegant pointed ears, ethereal elven clothing, enchanted forest background with magical glowing lights. Keep the person's face recognizable.",
  "fantasy-mermaid": "Transform this person into a beautiful mermaid. Add shimmering colorful tail, underwater ocean scene with coral reef, magical underwater lighting. Keep the person's face exactly the same.",
  "fantasy-knight": "Transform this person into a noble medieval knight. Add shining armor, sword and shield, medieval castle in background. Epic fantasy warrior atmosphere. Keep the person's face exactly the same.",
  
  // Superhero themes
  "super-hero": "Transform this person into a powerful superhero. Add superhero costume with cape, heroic pose, city skyline background, dramatic lighting. Make them look like they could save the world. Keep the person's face exactly the same.",
  
  // Retro themes
  "retro-80s": "Transform this person into an 80s retro portrait. Add colorful neon 80s fashion, big hair, synthesizer/disco background, retro neon lights. Vintage 80s vibe. Keep the person's face exactly the same.",
  "retro-50s": "Transform this person into a classic 1950s portrait. Add vintage 50s style clothing and hair, classic diner or vintage car background, pin-up aesthetic. Keep the person's face exactly the same.",
  
  // Nature themes
  "nature-forest": "Transform this person into an enchanted forest scene. Dress in flowing ethereal outfit, magical forest with sunbeams through trees, butterflies and mystical atmosphere. Keep the person's face exactly the same.",
  "nature-mountain": "Transform this person into an epic mountain peak scene. Place them at summit with epic landscape view, dramatic sunset clouds, adventurer outdoor atmosphere. Keep the person's face exactly the same.",
  "summer-beach": "Transform this into a tropical beach paradise scene. Add golden sunset, palm trees, ocean waves, summer vacation vibes, warm golden lighting. Keep the person's face exactly the same.",
  "winter-snow": "Transform this into an elegant winter wonderland portrait. Dress in luxurious white fur coat, surrounded by falling snowflakes, frozen trees, magical icy blue lighting. Keep the person's face exactly the same.",
  
  // Sports themes
  "sports-fitness": "Transform this person into a fitness athlete in a modern gym. Add athletic sportswear, powerful pose, professional gym background, motivational fitness atmosphere. Keep the person's face exactly the same.",
  "sports-champion": "Transform this person into a sports champion. Add football/soccer uniform, holding golden trophy, stadium full of cheering fans, champion celebration confetti. Keep the person's face exactly the same.",
  
  // Art themes
  "art-painting": "Transform this into a classical Renaissance oil painting style portrait. Add ornate golden frame, museum quality masterpiece look, classic artistic style. Keep the person's face recognizable.",
  "art-popart": "Transform this into an Andy Warhol style pop art portrait. Bold vibrant colors, comic book dots pattern, graphic art style. Keep the person's face recognizable.",
  "art-anime": "Transform this person into a beautiful anime character. Japanese animation style, colorful manga aesthetic, anime eyes and styling. Keep basic features recognizable.",
  
  // Travel themes
  "travel-paris": "Transform this person into a romantic Paris scene. Place at Eiffel Tower with romantic sunset, elegant French style outfit, dreamy Parisian atmosphere. Keep the person's face exactly the same.",
  "travel-safari": "Transform this person into an African safari adventure. Add safari hat, African savanna background with elephants and giraffes, golden sunset, adventure explorer vibes. Keep the person's face exactly the same.",
  
  // Party themes
  "party-birthday": "Transform this person into a fun birthday party scene. Add colorful party hat, balloons, confetti, birthday cake with candles, celebration atmosphere. Keep the person's face exactly the same.",
  "party-club": "Transform this person into a VIP nightclub party scene. Add glamorous outfit, neon club lights, champagne, exclusive party atmosphere. Keep the person's face exactly the same.",
  
  // Wedding themes
  "wedding-bride": "Transform this person into a beautiful bride. Add stunning white wedding dress with veil and tiara, romantic flower garden background, dreamy wedding day lighting. Keep the person's face exactly the same.",
  "wedding-groom": "Transform this person into an elegant groom. Add black tuxedo with bow tie, romantic venue with candles, sophisticated wedding atmosphere. Keep the person's face exactly the same.",
  
  // Futuristic themes
  "future-cyberpunk": "Transform this person into a cyberpunk character. Add neon cyberpunk style, holographic elements, futuristic city background, sci-fi atmosphere. Keep the person's face exactly the same.",
  "future-space": "Transform this person into an astronaut in space. Add astronaut suit, space station background, Earth visible through window, cosmic atmosphere. Keep the person's face exactly the same.",
  
  // Music themes
  "music-dj": "Transform this person into a famous DJ at an EDM music festival. Add DJ equipment, headphones, neon lights, crowd in background, electronic music atmosphere. Keep the person's face exactly the same.",
  "music-rockstar": "Transform this person into a rock star on concert stage. Add electric guitar, leather jacket, dramatic stage lighting, rock band aesthetic. Keep the person's face exactly the same.",
  
  // Pets themes
  "pets-dog": "Transform this person into a cute portrait holding an adorable golden retriever puppy. Add warm lighting, cozy atmosphere, pet photography style. Keep the person's face exactly the same.",
  "pets-cat": "Transform this person into a cute portrait holding a fluffy white cat. Add cozy home setting, warm lighting, pet lover aesthetic. Keep the person's face exactly the same.",
  
  // Gothic theme
  "gothic-dark": "Transform this person into a gothic dark queen or king. Add dark elegant crown, ravens, dark castle background, mysterious purple and black atmosphere, dramatic lighting. Keep the person's face exactly the same.",
  
  // Steampunk theme
  "steampunk-inventor": "Transform this person into a steampunk Victorian inventor. Add brass goggles, gears and cogs, steam-powered machinery background, Victorian steampunk fashion. Keep the person's face exactly the same.",
  
  // Historical warriors
  "viking-warrior": "Transform this person into a fierce Viking warrior. Add braided hair, fur cloak, battle axes, Nordic mountain landscape background, warrior aesthetic. Keep the person's face exactly the same.",
  "pirate-captain": "Transform this person into a pirate captain on ship deck. Add pirate tricorn hat, captain's coat, treasure chest, Caribbean sea and ship in background. Keep the person's face exactly the same.",
  
  // Western theme
  "western-cowboy": "Transform this person into a Western cowboy or cowgirl. Add cowboy hat, desert sunset background with horse, wild west aesthetic, warm golden lighting. Keep the person's face exactly the same.",
  
  // Culinary theme
  "chef-gourmet": "Transform this person into a professional gourmet chef. Add white chef uniform with hat, elegant restaurant kitchen background, culinary excellence atmosphere. Keep the person's face exactly the same.",
  
  // Zen & Spiritual themes
  "zen-meditation": "Transform this person into a peaceful meditation scene. Add white flowing robes, Japanese zen garden with cherry blossoms, peaceful spiritual atmosphere. Keep the person's face exactly the same.",
  "underwater-diver": "Transform this person into a deep sea diver exploring underwater ruins. Add diving suit, tropical fish, coral reef, magical underwater lighting with sun rays. Keep the person's face exactly the same.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, transformationType } = await req.json();
    
    if (!imageUrl || !transformationType) {
      return new Response(
        JSON.stringify({ error: "Image URL and transformation type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;

    const { data: credits, error: creditsError } = await supabaseClient
      .from("ai_studio_credits")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (creditsError) {
      console.error("Credits error:", creditsError);
      throw new Error("Failed to check credits");
    }

    if (!credits || credits.credits_remaining < 1) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits. Please purchase more credits." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = TRANSFORMATION_PROMPTS[transformationType] || "Transform this photo into a beautiful artistic portrait with enhanced lighting and magical atmosphere. Keep the person exactly the same.";
    console.log(`Transforming image with type: ${transformationType}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service unavailable. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Failed to transform image");
    }

    const data = await response.json();
    const transformedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!transformedImageUrl) {
      throw new Error("No transformed image generated");
    }

    const { error: updateError } = await supabaseClient
      .from("ai_studio_credits")
      .update({ 
        credits_remaining: credits.credits_remaining - 1,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Failed to deduct credit:", updateError);
    }

    await supabaseClient
      .from("ai_studio_transformations")
      .insert({
        user_id: userId,
        original_image_url: imageUrl,
        transformed_image_url: transformedImageUrl,
        transformation_type: transformationType,
        status: "completed",
        credits_used: 1
      });

    console.log(`Transformation completed for user ${userId}`);

    return new Response(
      JSON.stringify({ 
        transformedImageUrl,
        creditsRemaining: credits.credits_remaining - 1
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-studio-transform:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
