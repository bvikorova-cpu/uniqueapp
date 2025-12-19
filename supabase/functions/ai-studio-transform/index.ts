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
  
  // Glamour Photo styles
  "glamour-barbie": "Transform this person into a stunning Barbie-style glamour portrait. Add pink Barbie aesthetic, sparkling diamonds, luxurious pink background with sparkles and glitter, perfect makeup, dreamy pink lighting. Make it look like a real-life Barbie doll photoshoot. Keep the person's face exactly the same.",
  "glamour-paris": "Transform this person into an elegant Paris Eiffel Tower photoshoot. Place them in front of the iconic Eiffel Tower at golden hour sunset, wearing elegant French fashion, romantic Parisian atmosphere with soft warm lighting. Keep the person's face exactly the same.",
  "glamour-flowers": "Transform this person into a magical flower garden portrait. Surround them with beautiful colorful flowers, butterflies flying around, soft dreamy lighting, enchanted garden atmosphere. Keep the person's face exactly the same.",
  "glamour-biker": "Transform this person into a stylish biker girl portrait. Add cool leather jacket, vintage motorcycle in background, edgy urban setting with neon lights. Keep the person's face exactly the same.",
  "glamour-vintage": "Transform this person into a vintage mirror glamour portrait. Add ornate golden vintage mirror frame, soft nostalgic lighting, elegant vintage aesthetic. Keep the person's face exactly the same.",
  "glamour-balloons": "Transform this person into a fun red balloons photoshoot. Surround with many floating red heart balloons, playful and romantic atmosphere, soft lighting. Keep the person's face exactly the same.",
  "glamour-golden": "Transform this person into a luxurious golden glamour portrait. Add golden sparkles, gold jewelry, golden lighting, rich and opulent atmosphere. Keep the person's face exactly the same.",
  "glamour-butterfly": "Transform this person into a magical butterfly queen portrait. Add beautiful colorful butterflies surrounding them, ethereal magical atmosphere, enchanted forest background with soft lighting. Keep the person's face exactly the same.",
  "glamour-birthday": "Transform this person into a fabulous birthday celebration portrait. Add birthday crown or tiara, colorful balloons, confetti, birthday cake with candles, festive party atmosphere. Keep the person's face exactly the same.",
  "glamour-christmas-lights": "Transform this person into a magical Christmas lights portrait. Surround with beautiful twinkling fairy lights, warm cozy atmosphere, soft bokeh lighting effect. Keep the person's face exactly the same.",
  "glamour-monochrome": "Transform this person into an elegant monochrome black and white glamour portrait. Add dramatic professional studio lighting, high fashion black and white aesthetic, magazine quality. Keep the person's face exactly the same.",
  "glamour-golden-moon": "Transform this person into a mystical golden moon portrait. Add large glowing golden crescent moon, starry night sky, magical ethereal atmosphere with golden lighting. Keep the person's face exactly the same.",
  "glamour-ocean": "Transform this person into an ocean goddess portrait. Place them near beautiful ocean waves at sunset, flowing dress, mermaid-like aesthetic, magical beach atmosphere. Keep the person's face exactly the same.",
  "glamour-panther": "Transform this person into a fierce black panther portrait. Add sleek black aesthetic, powerful black panther animal beside them, dark dramatic jungle background with golden accents. Keep the person's face exactly the same.",
  "glamour-reindeer": "Transform this person into a magical winter reindeer portrait. Add beautiful reindeer with antlers beside them, snowy winter forest background, magical Christmas atmosphere with soft lighting. Keep the person's face exactly the same.",
  "glamour-christmas-family": "Transform this person into a heartwarming Christmas family portrait scene. Add cozy Christmas living room with decorated tree, warm fireplace, festive red and green colors, family celebration atmosphere. Keep the person's face exactly the same.",
  "glamour-cozy-mug": "Transform this person into a cozy Christmas portrait wearing off-shoulder knitted sweater, holding a Christmas mug, sitting on white fur blanket surrounded by Christmas decorations, gingerbread cookies, candy canes, poinsettia flowers, warm bokeh lights background. Keep the person's face exactly the same.",
  "glamour-tree-dance": "Transform this person into a joyful Christmas scene wearing white crop top and burgundy pleated skirt, dancing pose by beautifully decorated Christmas tree with golden and red ornaments, gift boxes around, confetti falling. Keep the person's face exactly the same.",
  "glamour-santa-candy": "Transform this person into a festive Santa portrait closeup wearing red Santa hat and burgundy scarf, holding candy cane near lips, red lipstick, beautiful bokeh Christmas lights background, glamorous winter makeup. Keep the person's face exactly the same.",
  "glamour-santa-mirror": "Transform this person into glamorous Santa girl looking at round makeup mirror reflection, wearing red Santa fur dress with white trim, Christmas tree bokeh lights background, elegant vanity scene. Keep the person's face exactly the same.",
  "glamour-grinch": "Transform this person into a magical Christmas scene with the Grinch character. The person in Santa costume exchanging gift with friendly Grinch, snowy Christmas trees background, magical winter wonderland atmosphere. Keep the person's face exactly the same.",
  "glamour-red-dress-gift": "Transform this person into elegant Christmas portrait wearing sparkly red sequin dress, holding green gift box with red bow, standing by decorated Christmas tree, fireplace with red candles in background. Keep the person's face exactly the same.",
  "glamour-baby-sled": "Transform this person into adorable Christmas baby portrait wearing cute red Santa dress, sitting on wooden sled in snowy scene, decorated Christmas house with lights and wreath in background, magical winter atmosphere. Keep the person's face exactly the same.",
  "glamour-gift-box": "Transform this person emerging from giant red gift box, wearing red sequin dress, Merry Christmas neon sign above, decorated Christmas trees with gold and red ornaments on sides, festive celebration portrait. Keep the person's face exactly the same.",
  "glamour-rose-wreath": "Transform this person into elegant Christmas portrait sitting with giant rose wreath frame around them, wearing red embroidered gown, golden sparkle curtain background, red gift boxes around, teddy bear, luxurious holiday portrait. Keep the person's face exactly the same.",
  "glamour-champagne-tree": "Transform this person into elegant Christmas portrait sitting on brown leather couch, wearing beautiful floral satin dress, elegantly holding champagne glass, decorated Christmas tree with red ornaments in background, Mickey Mouse Santa plush, nutcracker decoration, warm festive lighting. Keep the person's face exactly the same.",
  "glamour-gingerbread-girl": "Transform this person into cozy Christmas portrait wearing red Santa outfit with white fur trim, lying on luxurious red satin sheets, gently holding cute gingerbread plush toy against chest, Christmas tree with warm lights in background, glamorous holiday atmosphere. Keep the person's face exactly the same.",
  "glamour-santa-lollipop": "Transform this person into festive Christmas portrait wearing elegant red off-shoulder top, delicately holding Christmas lollipop near face, gold Christmas tree with ornaments in background, city lights bokeh, red lipstick, glamorous winter makeup. Keep the person's face exactly the same.",
  
  // Atlantis Mermaid styles
  "atlantis-seaflora": "Transform this person into beautiful pink mermaid underwater portrait, flowing pink hair, pink iridescent seashell top, surrounded by pink coral reef, tropical fish swimming around, magical underwater glow, ethereal fantasy atmosphere. Keep the person's face exactly the same.",
  "atlantis-sunwave": "Transform this person into majestic golden mermaid queen underwater, wearing ornate golden seashell crown with pearls, gold jewelry necklace and earrings, golden light rays streaming from above, shimmering gold tail, magical underwater palace atmosphere. Keep the person's face exactly the same.",
  "atlantis-nyxelle": "Transform this person into enchanting purple mermaid underwater, beautiful iridescent purple tail, pearl necklace, surrounded by colorful fish and coral, magical underwater light rays, serene ocean goddess pose. Keep the person's face exactly the same.",
  
  // Creative Studio styles
  "creative-sunflower": "Transform this person into bright cheerful portrait holding large beautiful bouquet of sunflowers, elegant casual outfit, soft studio lighting, simple light background, professional photography style, warm sunny atmosphere. Keep the person's face exactly the same.",
  "creative-giant": "Transform this person into surreal giant statue monument towering over city buildings, scaffolding around them, construction workers for scale, dramatic low angle perspective, impressive monument style, creative photo manipulation effect. Keep the person's face exactly the same.",
  "creative-desert": "Transform this person into Arabian desert queen portrait with majestic horse beside them, wearing elegant blue hijab and traditional embroidered dress, golden sand dunes in background, beautiful sunset, cinematic Middle Eastern atmosphere. Keep the person's face exactly the same.",
  "creative-graffiti": "Transform this person's portrait into giant colorful street art mural painted on building wall, vibrant graffiti style, urban city street with motorcycles passing below, street photography perspective, impressive mural art effect. Keep the person's face exactly the same.",
  
  // Chibi Champs styles
  "chibi-skiing": "Transform this person into adorable 3D chibi cartoon character skiing down snowy mountain, cute big eyes, purple ski suit with goggles, snowy Alps background, Disney Pixar animation style, playful dynamic skiing pose. Keep the person's facial features recognizable in chibi style.",
  "chibi-basketball": "Transform this person into adorable 3D chibi cartoon character playing basketball, cute big eyes, blue basketball jersey, holding basketball with both hands properly, basketball court with cheering crowd, Disney Pixar animation style, energetic sporty pose. Keep the person's facial features recognizable in chibi style.",
  
  // Pocket Buddies styles
  "pocket-work": "Transform this person into cute 3D mini figure doll inside purple Polly Pocket style toy case, office worker theme with tiny laptop and books around, professional outfit, pastel colors, adorable toy photography style, miniature diorama scene. Keep the person's facial features recognizable in doll style.",
  "pocket-gift": "Transform this person into cute 3D mini figure doll inside pink heart-shaped Polly Pocket style toy case, holding small gift box with both hands properly, birthday party decorations inside case, pastel pink colors, adorable toy photography style, celebration scene. Keep the person's facial features recognizable in doll style.",
  
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
  "nature-underwater": "Transform this person into an underwater paradise. Add beautiful coral reef, tropical fish, sunlight filtering through water. Serene underwater atmosphere. Keep the person's face exactly the same.",
  "nature-mountain": "Transform this person into a majestic mountain scene. Place them on mountain peak with stunning sunrise/sunset view, dramatic epic landscape. Keep the person's face exactly the same.",
  
  // Sci-Fi themes
  "scifi-cyberpunk": "Transform this person into a cyberpunk character. Add neon city background, cybernetic enhancements, futuristic LED lights, dark urban atmosphere. Keep the person's face exactly the same.",
  "scifi-space": "Transform this person into an astronaut or space explorer. Add space suit elements, galaxy/nebula background, floating in space with stars. Keep the person's face exactly the same.",
  "scifi-matrix": "Transform this person into a Matrix character. Add green digital code rain, black leather trench coat, dramatic Matrix movie atmosphere. Keep the person's face exactly the same.",
  
  // Historical themes
  "historical-ancient": "Transform this person into ancient royalty (Egyptian, Roman, or Greek). Add period-appropriate attire, golden jewelry, ancient palace or temple background. Keep the person's face exactly the same.",
  "historical-medieval": "Transform this person into medieval nobility. Add rich velvet robes, golden crown or circlet, medieval castle throne room background. Keep the person's face exactly the same.",
  "historical-renaissance": "Transform this person into a Renaissance painting style portrait. Add period clothing, oil painting texture, dramatic baroque lighting. Keep the person's face exactly the same.",
  
  // Seasonal themes
  "seasonal-autumn": "Transform this person into a beautiful autumn scene. Add fall colors, falling golden leaves, cozy sweater, warm autumn lighting. Keep the person's face exactly the same.",
  "seasonal-winter": "Transform this person into a magical winter wonderland. Add snowy landscape, winter clothing, soft snowfall, cozy winter atmosphere. Keep the person's face exactly the same.",
  "seasonal-spring": "Transform this person into a spring bloom scene. Add cherry blossoms, fresh flowers, butterflies, soft spring lighting. Keep the person's face exactly the same.",
  "seasonal-summer": "Transform this person into a tropical summer paradise. Add beach setting, palm trees, sunset, summer vibes. Keep the person's face exactly the same.",
  
  // Additional themes
  "super-heroine": "Transform this person into a powerful female superhero. Add superhero costume with cape, flying over city, powerful pose. Keep the person's face exactly the same.",
  "super-villain": "Transform this person into a dramatic supervillain. Add dark costume, lightning, powerful evil aesthetic. Keep the person's face exactly the same.",
  "super-comic": "Transform this person into a comic book superhero. Add comic art style, action pose, superhero suit. Keep the person's face recognizable.",
  "retro-70s": "Transform this person into 70s disco style. Add afro hair, disco ball, colorful lights, retro disco club. Keep the person's face exactly the same.",
  "retro-gatsby": "Transform this person into 1920s Great Gatsby style. Add art deco, flapper dress or suit, vintage party. Keep the person's face exactly the same.",
  "sports-basketball": "Transform this person into a basketball player dunking. Add NBA style uniform, stadium, sports action. Keep the person's face exactly the same.",
  "sports-yoga": "Transform this person into a yoga master in lotus pose. Add zen garden, peaceful meditation setting. Keep the person's face exactly the same.",
  "art-watercolor": "Transform this into a beautiful watercolor painting style portrait. Add soft artistic brush strokes, watercolor aesthetic. Keep the person's face recognizable.",
  "travel-newyork": "Transform this person in New York Times Square. Add city lights, urban atmosphere, NYC landmarks. Keep the person's face exactly the same.",
  "travel-maldives": "Transform this person at Maldives beach resort. Add crystal clear water, luxury resort, tropical paradise. Keep the person's face exactly the same.",
  "party-newyear": "Transform this person at New Year Eve celebration. Add champagne, fireworks, midnight celebration. Keep the person's face exactly the same.",
  "party-carnival": "Transform this person at a Venetian carnival masquerade. Add elegant mask, carnival costume, ballroom setting. Keep the person's face exactly the same.",
  "wedding-bridesmaid": "Transform this person into an elegant bridesmaid. Add pink dress, wedding flowers, romantic venue. Keep the person's face exactly the same.",
  "wedding-dance": "Transform this person into a romantic first dance at wedding. Add elegant ballroom, wedding reception, romantic lighting. Keep the person's face exactly the same.",
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

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
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

    // For image editing with OpenAI, we need to use gpt-image-1 with the edit endpoint
    // But since we're doing style transfer, we'll use the generation endpoint with a detailed prompt
    const fullPrompt = `Based on this reference photo, create a new image: ${prompt}. The result should maintain the person's likeness while applying the transformation.`;

    // Download the original image and convert to base64
    console.log("Fetching original image...");
    const imageBase64 = await fetchImageAsBase64(imageUrl);

    // Use OpenAI's image edit API
    const formData = new FormData();
    
    // Convert base64 to blob
    const binaryString = atob(imageBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const imageBlob = new Blob([bytes], { type: 'image/png' });
    formData.append('image', imageBlob, 'image.png');
    formData.append('prompt', prompt);
    formData.append('model', 'gpt-image-1');
    formData.append('size', '1024x1024');

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Failed to transform image");
    }

    const data = await response.json();
    const base64Image = data.data?.[0]?.b64_json;

    if (!base64Image) {
      throw new Error("No transformed image generated");
    }

    const transformedImageUrl = `data:image/png;base64,${base64Image}`;

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
