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
"glamour-rose-wreath": "Transform this person into elegant Christmas portrait sitting with giant rose wreath frame around them, wearing red embroidered gown, golden sparkle curtain background, red gift boxes around, teddy bear, luxurious holiday portrait. Keep the person's face exactly the same. Ensure hands look natural with correct anatomy - five fingers, proper proportions.",
  "glamour-champagne-tree": "Transform this person into elegant Christmas portrait sitting on brown leather couch, wearing beautiful floral satin dress, elegantly holding champagne glass with natural hand position, decorated Christmas tree with red ornaments in background, Mickey Mouse Santa plush, nutcracker decoration, warm festive lighting. Keep the person's face exactly the same. Ensure hands look natural with correct anatomy - five fingers, proper proportions, relaxed grip on glass.",
  "glamour-gingerbread-girl": "Transform this person into cozy Christmas portrait wearing red Santa outfit with white fur trim, lying on luxurious red satin sheets, gently holding cute gingerbread plush toy against chest, Christmas tree with warm lights in background, glamorous holiday atmosphere. Keep the person's face exactly the same. Ensure hands look natural with correct anatomy - five fingers, proper proportions.",
  "glamour-santa-lollipop": "Transform this person into festive Christmas portrait wearing elegant red off-shoulder top, delicately holding Christmas lollipop near face with natural hand position, gold Christmas tree with ornaments in background, city lights bokeh, red lipstick, glamorous winter makeup. Keep the person's face exactly the same. Ensure hands look natural with correct anatomy - five fingers, proper proportions.",
  
  // Atlantis Mermaid styles
  "atlantis-seaflora": "Transform this person into beautiful pink mermaid underwater portrait, flowing pink hair, pink iridescent seashell top, surrounded by pink coral reef, tropical fish swimming around, magical underwater glow, ethereal fantasy atmosphere. Keep the person's face exactly the same. Ensure any visible hands look natural with correct anatomy.",
  "atlantis-sunwave": "Transform this person into majestic golden mermaid queen underwater, wearing ornate golden seashell crown with pearls, gold jewelry necklace and earrings, golden light rays streaming from above, shimmering gold tail, magical underwater palace atmosphere. Keep the person's face exactly the same. Ensure any visible hands look natural with correct anatomy.",
  "atlantis-nyxelle": "Transform this person into enchanting purple mermaid underwater, beautiful iridescent purple tail, pearl necklace, surrounded by colorful fish and coral, magical underwater light rays, serene ocean goddess pose. Keep the person's face exactly the same. Ensure any visible hands look natural with correct anatomy - five fingers, graceful positioning.",
  
  // Creative Studio styles
  "creative-sunflower": "Transform this person into bright cheerful portrait holding large beautiful bouquet of sunflowers, elegant casual outfit, soft studio lighting, simple light background, professional photography style, warm sunny atmosphere. Keep the person's face exactly the same. Ensure hands look natural with correct anatomy - five fingers holding flower stems properly.",
  "creative-giant": "Transform this person into surreal giant statue monument towering over city buildings, scaffolding around them, construction workers for scale, dramatic low angle perspective, impressive monument style, creative photo manipulation effect. Keep the person's face exactly the same.",
  "creative-desert": "Transform this person into Arabian desert queen portrait with majestic horse beside them, wearing elegant blue hijab and traditional embroidered dress, golden sand dunes in background, beautiful sunset, cinematic Middle Eastern atmosphere. Keep the person's face exactly the same. Ensure any visible hands look natural with correct anatomy.",
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
  "future-robot": "Transform this person into a futuristic android robot with metallic skin, glowing eyes, high-tech cybernetic elements. Keep the person's face recognizable.",
  "future-matrix": "Transform this person into a Matrix-style scene with green digital rain, holographic neon world, virtual reality aesthetic. Keep the person's face exactly the same.",
  
  // Music themes
  "music-dj": "Transform this person into a famous DJ at an EDM music festival. Add DJ equipment, headphones, neon lights, crowd in background, electronic music atmosphere. Keep the person's face exactly the same.",
  "music-rockstar": "Transform this person into a rock star on concert stage. Add electric guitar, leather jacket, dramatic stage lighting, rock band aesthetic. Keep the person's face exactly the same.",
  "music-country": "Transform this person into a country music star on stage. Add acoustic guitar, cowboy hat, Nashville stage lighting. Keep the person's face exactly the same.",
  "music-orchestra": "Transform this person into an elegant orchestra conductor. Add tuxedo, symphony hall background, conducting baton. Keep the person's face exactly the same.",
  
  // Pets themes
  "pets-dog": "Transform this person into a cute portrait holding an adorable golden retriever puppy. Add warm lighting, cozy atmosphere, pet photography style. Keep the person's face exactly the same.",
  "pets-cat": "Transform this person into a cute portrait holding a fluffy white cat. Add cozy home setting, warm lighting, pet lover aesthetic. Keep the person's face exactly the same.",
  "pets-bunny": "Transform this person holding a cute fluffy bunny rabbit. Add soft lighting, adorable pet photography style. Keep the person's face exactly the same.",
  "pets-horse": "Transform this person riding a majestic white horse. Add beautiful nature background, equestrian style. Keep the person's face exactly the same.",
  
  // Gothic themes
  "gothic-dark": "Transform this person into a gothic dark queen or king. Add dark elegant crown, ravens, dark castle background, mysterious purple and black atmosphere, dramatic lighting. Keep the person's face exactly the same.",
  "gothic-angel": "Transform this person into a gothic angel with black wings. Add dark cathedral background, mysterious atmosphere. Keep the person's face exactly the same.",
  "gothic-romantic": "Transform this person into romantic gothic style. Add velvet Victorian dress, red roses, moonlight, romantic gothic atmosphere. Keep the person's face exactly the same.",
  "gothic-vampire": "Transform this person into a vampire lord on gothic throne. Add dramatic red and black colors, castle throne room, dark elegance. Keep the person's face exactly the same.",
  
  // Steampunk themes
  "steampunk-inventor": "Transform this person into a steampunk Victorian inventor. Add brass goggles, gears and cogs, steam-powered machinery background, Victorian steampunk fashion. Keep the person's face exactly the same.",
  "steampunk-pilot": "Transform this person into a steampunk airship pilot. Add aviator goggles, leather flight gear, airship background. Keep the person's face exactly the same.",
  "steampunk-lady": "Transform this person into an elegant steampunk Victorian lady. Add clockwork accessories, Victorian dress, tea party setting. Keep the person's face exactly the same.",
  "steampunk-explorer": "Transform this person into a steampunk explorer. Add compass, maps, Victorian adventure gear, explorer aesthetic. Keep the person's face exactly the same.",
  
  // Historical warriors
  "viking-warrior": "Transform this person into a fierce Viking warrior. Add braided hair, fur cloak, battle axes, Nordic mountain landscape background, warrior aesthetic. Keep the person's face exactly the same.",
  "pirate-captain": "Transform this person into a pirate captain on ship deck. Add pirate tricorn hat, captain's coat, treasure chest, Caribbean sea and ship in background. Keep the person's face exactly the same.",
  "warrior-spartan": "Transform this person into an ancient Greek Spartan warrior. Add spartan helmet, armor, shield, epic battle background. Keep the person's face exactly the same.",
  "warrior-samurai": "Transform this person into a Japanese samurai warrior. Add traditional samurai armor, katana sword, cherry blossoms background. Keep the person's face exactly the same.",
  
  // Western themes
  "western-cowboy": "Transform this person into a Western cowboy or cowgirl. Add cowboy hat, desert sunset background with horse, wild west aesthetic, warm golden lighting. Keep the person's face exactly the same.",
  "western-sheriff": "Transform this person into a Wild West sheriff. Add sheriff badge, cowboy hat, western town background. Keep the person's face exactly the same.",
  "western-rodeo": "Transform this person into a rodeo rider. Add rodeo arena, bull riding action, western atmosphere. Keep the person's face exactly the same.",
  "western-saloon": "Transform this person into a Wild West saloon scene. Add vintage saloon interior, western costume. Keep the person's face exactly the same.",
  
  // Culinary themes
  "chef-gourmet": "Transform this person into a professional gourmet chef. Add white chef uniform with hat, elegant restaurant kitchen background, culinary excellence atmosphere. Keep the person's face exactly the same.",
  "chef-pastry": "Transform this person into a pastry chef decorating cakes. Add pastry kitchen, beautiful desserts, bakery setting. Keep the person's face exactly the same.",
  "chef-sushi": "Transform this person into a Japanese sushi chef. Add sushi bar, fresh sushi rolls, traditional Japanese restaurant. Keep the person's face exactly the same.",
  "chef-bbq": "Transform this person into a BBQ pitmaster. Add smoker grill, outdoor cooking setup, rustic BBQ atmosphere. Keep the person's face exactly the same.",
  
  // Zen & Spiritual themes
  "zen-meditation": "Transform this person into a peaceful meditation scene. Add white flowing robes, Japanese zen garden with cherry blossoms, peaceful spiritual atmosphere. Keep the person's face exactly the same.",
  "underwater-diver": "Transform this person into a deep sea diver exploring underwater ruins. Add diving suit, tropical fish, coral reef, magical underwater lighting with sun rays. Keep the person's face exactly the same.",
  "zen-taichi": "Transform this person doing tai chi in misty mountains. Add flowing white clothes, peaceful morning mist, martial arts atmosphere. Keep the person's face exactly the same.",
  "zen-monk": "Transform this person into a Buddhist monk. Add orange robes, ancient temple background, peaceful spiritual atmosphere. Keep the person's face exactly the same.",
  
  // Easter additional
  "easter-chick": "Transform this person with cute yellow Easter chick. Add Easter eggs, spring meadow, pastel colors. Keep the person's face exactly the same.",
  "easter-basket": "Transform this person with Easter basket full of colorful eggs. Add spring flowers, pastel colors, Easter celebration. Keep the person's face exactly the same.",
  
  // Halloween additional
  "halloween-zombie": "Transform this person into a scary zombie. Add torn clothes, graveyard background, fog, horror atmosphere. Keep the person's face recognizable but zombified.",
  "halloween-ghost": "Transform this person into an ethereal ghost. Add white flowing dress, haunted mansion, spooky atmosphere. Keep the person's face exactly the same.",
  
  // Additional styles
  "luxury-yacht": "Transform this person into a billionaire on a luxury yacht. Add champagne, gold jewelry, ocean background, wealthy lifestyle. Keep the person's face exactly the same.",
  "portrait-fashion": "Transform this into an elegant fashion magazine cover portrait. Add high fashion styling, professional studio lighting. Keep the person's face exactly the same.",
  "star-grammy": "Transform this person into a Grammy award winner on stage. Add microphone, award trophy, red carpet lighting. Keep the person's face exactly the same.",
  "star-runway": "Transform this person into a runway model at fashion week. Add haute couture outfit, runway catwalk, fashion show lighting. Keep the person's face exactly the same.",
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
