import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Style descriptions for the AI to understand the scene
const STYLE_DESCRIPTIONS: Record<string, string> = {
  // Glamour styles
  "glamour-barbie": "Barbie-style glamour portrait with pink aesthetic, sparkling diamonds, luxurious pink background with sparkles and glitter, perfect makeup, dreamy pink lighting, real-life Barbie doll photoshoot",
  "glamour-paris": "Elegant Paris Eiffel Tower photoshoot at golden hour sunset, elegant French fashion, romantic Parisian atmosphere with soft warm lighting",
  "glamour-flowers": "Magical flower garden portrait surrounded by beautiful colorful flowers, butterflies flying around, soft dreamy lighting, enchanted garden atmosphere",
  "glamour-biker": "Stylish biker girl portrait with cool leather jacket, vintage motorcycle in background, edgy urban setting with neon lights",
  "glamour-vintage": "Vintage mirror glamour portrait with ornate golden vintage mirror frame, soft nostalgic lighting, elegant vintage aesthetic",
  "glamour-balloons": "Fun red balloons photoshoot surrounded by many floating red heart balloons, playful and romantic atmosphere, soft lighting",
  "glamour-golden": "Luxurious golden glamour portrait with golden sparkles, gold jewelry, golden lighting, rich and opulent atmosphere",
  "glamour-butterfly": "Magical butterfly queen portrait with beautiful colorful butterflies surrounding, ethereal magical atmosphere, enchanted forest background with soft lighting",
  "glamour-birthday": "Fabulous birthday celebration portrait with birthday crown or tiara, colorful balloons, confetti, birthday cake with candles, festive party atmosphere",
  "glamour-christmas-lights": "Magical Christmas lights portrait surrounded by beautiful twinkling fairy lights, warm cozy atmosphere, soft bokeh lighting effect",
  "glamour-monochrome": "Elegant monochrome black and white glamour portrait with dramatic professional studio lighting, high fashion black and white aesthetic, magazine quality",
  "glamour-golden-moon": "Mystical golden moon portrait with large glowing golden crescent moon, starry night sky, magical ethereal atmosphere with golden lighting",
  "glamour-ocean-waves": "Ocean goddess portrait near beautiful ocean waves at sunset, flowing dress, mermaid-like aesthetic, magical beach atmosphere",
  "glamour-panther": "Fierce black panther portrait with sleek black aesthetic, powerful black panther animal beside, dark dramatic jungle background with golden accents",
  "glamour-reindeer": "Magical winter reindeer portrait with beautiful reindeer with antlers beside, snowy winter forest background, magical Christmas atmosphere with soft lighting",
  "glamour-christmas-family": "Heartwarming Christmas family portrait scene with cozy Christmas living room with decorated tree, warm fireplace, festive red and green colors",
  "glamour-cozy-mug": "Cozy Christmas portrait wearing off-shoulder knitted sweater, holding Christmas mug, sitting on white fur blanket surrounded by Christmas decorations, gingerbread cookies, candy canes, poinsettia flowers, warm bokeh lights background",
  "glamour-tree-dance": "Joyful Christmas scene wearing white crop top and burgundy pleated skirt, dancing pose by beautifully decorated Christmas tree with golden and red ornaments, gift boxes around, confetti falling",
  "glamour-santa-candy": "Festive Santa portrait closeup wearing red Santa hat and burgundy scarf, holding candy cane near lips, red lipstick, beautiful bokeh Christmas lights background, glamorous winter makeup",
  "glamour-santa-mirror": "Glamorous Santa girl looking at round makeup mirror reflection, wearing red Santa fur dress with white trim, Christmas tree bokeh lights background, elegant vanity scene",
  "glamour-grinch": "Magical Christmas scene with the Grinch character, person in Santa costume exchanging gift with friendly Grinch, snowy Christmas trees background, magical winter wonderland atmosphere",
  "glamour-red-dress-gift": "Elegant Christmas portrait wearing sparkly red sequin dress, holding green gift box with red bow, standing by decorated Christmas tree, fireplace with red candles in background",
  "glamour-baby-sled": "Adorable Christmas baby portrait wearing cute red Santa dress, sitting on wooden sled in snowy scene, decorated Christmas house with lights and wreath in background, magical winter atmosphere",
  "glamour-gift-box": "Person emerging from giant red gift box, wearing red sequin dress, Merry Christmas neon sign above, decorated Christmas trees with gold and red ornaments on sides, festive celebration portrait",
  "glamour-rose-wreath": "Elegant Christmas portrait sitting with giant rose wreath frame around, wearing red embroidered gown, golden sparkle curtain background, red gift boxes around, teddy bear, luxurious holiday portrait",
  "glamour-champagne-tree": "Elegant Christmas portrait sitting on brown leather couch, wearing beautiful floral satin dress, elegantly holding champagne glass, decorated Christmas tree with red ornaments in background, Mickey Mouse Santa plush, nutcracker decoration, warm festive lighting",
  "glamour-gingerbread-girl": "Cozy Christmas portrait wearing red Santa outfit with white fur trim, lying on luxurious red satin sheets, gently holding cute gingerbread plush toy against chest, Christmas tree with warm lights in background, glamorous holiday atmosphere",
  "glamour-santa-lollipop": "Festive Christmas portrait wearing elegant red off-shoulder top, delicately holding Christmas lollipop near face, gold Christmas tree with ornaments in background, city lights bokeh, red lipstick, glamorous winter makeup",
  
  // Atlantis Mermaid
  "atlantis-seaflora": "Beautiful pink mermaid underwater portrait, flowing pink hair, pink iridescent seashell top, surrounded by pink coral reef, tropical fish swimming around, magical underwater glow, ethereal fantasy atmosphere",
  "atlantis-sunwave": "Majestic golden mermaid queen underwater, wearing ornate golden seashell crown with pearls, gold jewelry necklace and earrings, golden light rays streaming from above, shimmering gold tail, magical underwater palace atmosphere",
  "atlantis-nyxelle": "Enchanting purple mermaid underwater, beautiful iridescent purple tail, pearl necklace, surrounded by colorful fish and coral, magical underwater light rays, serene ocean goddess pose",
  
  // Creative Studio
  "creative-sunflower": "Bright cheerful portrait holding large beautiful bouquet of sunflowers, elegant casual outfit, soft studio lighting, simple light background, professional photography style, warm sunny atmosphere",
  "creative-giant": "Surreal giant statue monument towering over city buildings, scaffolding around, construction workers for scale, dramatic low angle perspective, impressive monument style, creative photo manipulation effect",
  "creative-desert": "Arabian desert queen portrait with majestic horse beside, wearing elegant blue hijab and traditional embroidered dress, golden sand dunes in background, beautiful sunset, cinematic Middle Eastern atmosphere",
  "creative-graffiti": "Portrait as giant colorful street art mural painted on building wall, vibrant graffiti style, urban city street with motorcycles passing below, street photography perspective, impressive mural art effect",
  
  // Chibi
  "chibi-skiing": "Adorable 3D chibi cartoon character skiing down snowy mountain, cute big eyes, purple ski suit with goggles, snowy Alps background, Disney Pixar animation style, playful dynamic skiing pose",
  "chibi-basketball": "Adorable 3D chibi cartoon character playing basketball, cute big eyes, blue basketball jersey, holding basketball with both hands, basketball court with cheering crowd, Disney Pixar animation style, energetic sporty pose",
  
  // Pocket
  "pocket-work": "Cute 3D mini figure doll inside purple Polly Pocket style toy case, office worker theme with tiny laptop and books around, professional outfit, pastel colors, adorable toy photography style, miniature diorama scene",
  "pocket-gift": "Cute 3D mini figure doll inside pink heart-shaped Polly Pocket style toy case, holding small gift box with both hands, birthday party decorations inside case, pastel pink colors, adorable toy photography style, celebration scene",
  
  // Christmas
  "christmas-polar": "Magical Christmas scene wearing cozy red Santa outfit with white fur trim holding adorable white polar bear cub, snowy winter background with decorated Christmas tree, golden sparkles, warm festive lighting",
  "christmas-tree": "Elegant Christmas portrait in beautiful sparkling red dress or suit, standing next to gorgeously decorated Christmas tree with golden ornaments, cozy fireplace in background with warm festive lighting",
  "christmas-elf": "Santa's magical helper elf with pointy elf hat, festive red and green outfit, in Santa's North Pole workshop with toys and Christmas decorations, magical sparkles",
  "christmas-cozy": "Cozy Christmas scene in warm knitted sweater, holding cup of hot cocoa, snowy window background and fairy lights, warm cabin atmosphere",
  
  // Valentine
  "valentine-roses": "Romantic Valentine portrait surrounded by beautiful red roses and floating pink hearts, elegant red attire with soft dreamy pink lighting, romantic atmosphere",
  "valentine-cupid": "Beautiful Cupid angel with soft white wings and pink halo, surrounded by floating hearts, soft pink and red background, dreamy romantic lighting",
  "valentine-dinner": "Elegant romantic dinner setting in fancy pink or red gown/suit at candlelit table with champagne, heart-shaped bokeh lights in background",
  "valentine-garden": "Romantic cherry blossom garden surrounded by beautiful pink flowers, falling petals forming heart shapes, soft sunset lighting",
  
  // Easter
  "easter-bunny": "Cute Easter scene with bunny ears headband, surrounded by colorful Easter eggs and adorable white bunnies in flower meadow, soft spring sunshine",
  "easter-spring": "Beautiful spring portrait with flower crown of tulips and daffodils, surrounded by blooming spring flowers, butterflies, soft pastel colors",
  "easter-chick": "Sweet Easter portrait with cute baby chicks, spring flowers, pastel colors, soft warm lighting",
  "easter-basket": "Easter portrait holding beautiful Easter basket full of colorful eggs, surrounded by spring flowers and cute bunnies",
  
  // Halloween
  "halloween-vampire": "Elegant vampire portrait with pale skin, subtle fangs, gothic castle background with full moon and flying bats, dramatic mysterious lighting",
  "halloween-witch": "Beautiful magical witch with enchanted purple glowing hat, pumpkins, mystical forest background, magical sparkles and purple lighting",
  "halloween-zombie": "Spooky zombie portrait with dramatic makeup, dark graveyard background, misty atmosphere",
  "halloween-ghost": "Ethereal ghost portrait with flowing white attire, haunted mansion background, mystical foggy atmosphere",
  
  // Luxury
  "luxury-vip": "VIP billionaire portrait in designer clothes with gold jewelry, private jet or yacht interior, champagne, luxury watches, wealthy lifestyle elements",
  "luxury-dubai": "Elegant Dubai luxury portrait in white designer outfit, Dubai skyline with Burj Khalifa in background, golden sunset, luxurious atmosphere",
  "luxury-royal": "Royal queen or king portrait with magnificent crown with jewels, on golden throne in palace throne room, regal atmosphere with rich fabrics",
  "luxury-yacht": "Luxury yacht lifestyle portrait on beautiful yacht deck, crystal blue ocean, sunset, champagne, ultimate luxury vacation vibes",
  
  // Portrait
  "portrait-business": "Professional corporate headshot in elegant suit, modern office with city skyline view in background, professional studio lighting",
  "portrait-artistic": "Artistic editorial portrait with creative dramatic lighting, artistic makeup look, studio photography style with dramatic shadows",
  "glamour-hollywood": "Hollywood glamour portrait with professional red carpet styling, golden sparkles, elegant hair and makeup, magazine-quality aesthetics",
  "portrait-fashion": "High fashion editorial portrait with designer outfit, professional fashion photography lighting, magazine cover quality",
  
  // Star
  "star-popstar": "Famous pop star on stage with concert stage lighting, neon lights, microphone, screaming fans in background, star performer vibes",
  "star-movie": "Movie star at film premiere on red carpet, paparazzi cameras flashing, Oscar award vibe, celebrity glamour styling",
  "star-grammy": "Grammy award winner portrait holding golden grammy trophy, glamorous outfit, red carpet background, celebrity spotlight",
  "star-runway": "High fashion runway model walking the catwalk, designer outfit, dramatic lighting, fashion week atmosphere",
  
  // Fantasy
  "fairytale-princess": "Magical Disney-style princess in sparkling ball gown with tiara, in front of enchanted castle with magical lights and sparkles",
  "fantasy-elf": "Beautiful mystical elf with elegant pointed ears, ethereal elven clothing, enchanted forest background with magical glowing lights",
  "fantasy-mermaid": "Beautiful mermaid with shimmering colorful tail, underwater ocean scene with coral reef, magical underwater lighting",
  "fantasy-knight": "Noble medieval knight in shining armor with sword and shield, medieval castle in background, epic fantasy warrior atmosphere",
  
  // Superhero
  "super-hero": "Powerful superhero with superhero costume and cape, heroic pose, city skyline background, dramatic lighting",
  "super-heroine": "Powerful female superhero with superhero costume and cape, flying over city, powerful pose",
  "super-villain": "Dramatic supervillain with dark costume, lightning, powerful evil aesthetic",
  "super-comic": "Comic book superhero with comic art style, action pose, superhero suit",
  
  // Retro
  "retro-80s": "80s retro portrait with colorful neon 80s fashion, big hair, synthesizer/disco background, retro neon lights, vintage 80s vibe",
  "retro-50s": "Classic 1950s portrait with vintage 50s style clothing and hair, classic diner or vintage car background, pin-up aesthetic",
  "retro-70s": "70s disco style with afro hair, disco ball, colorful lights, retro disco club",
  "retro-gatsby": "1920s Great Gatsby style with art deco, flapper dress or suit, vintage party",
  
  // Nature
  "nature-forest": "Enchanted forest scene in flowing ethereal outfit, magical forest with sunbeams through trees, butterflies and mystical atmosphere",
  "nature-mountain": "Majestic mountain scene on mountain peak with stunning sunrise/sunset view, dramatic epic landscape",
  "summer-beach": "Beautiful summer beach portrait on tropical beach with crystal clear water, palm trees, sunset, summer vibes",
  "winter-snow": "Magical winter wonderland with snowy landscape, winter clothing, soft snowfall, cozy winter atmosphere",
  
  // Sports
  "sports-fitness": "Fitness professional portrait in athletic wear, gym setting, powerful pose, fitness lifestyle",
  "sports-champion": "Sports champion portrait holding trophy, victory celebration, stadium background",
  "sports-basketball": "Basketball player dunking with NBA style uniform, stadium, sports action",
  "sports-yoga": "Yoga master in lotus pose in zen garden, peaceful meditation setting",
  
  // Art
  "art-painting": "Beautiful oil painting style portrait with artistic brush strokes, classical art aesthetic",
  "art-popart": "Pop art style portrait with bold colors, comic book dots, Andy Warhol inspired",
  "art-anime": "Anime style portrait with big eyes, colorful hair, Japanese animation aesthetic",
  "art-watercolor": "Beautiful watercolor painting style portrait with soft artistic brush strokes, watercolor aesthetic",
  
  // Travel
  "travel-paris": "Paris travel portrait with Eiffel Tower in background, romantic Parisian atmosphere, elegant outfit",
  "travel-safari": "African safari adventure portrait with safari outfit, African savanna with elephants, sunset",
  "travel-newyork": "New York Times Square portrait with city lights, urban atmosphere, NYC landmarks",
  "travel-maldives": "Maldives beach resort portrait with crystal clear water, luxury resort, tropical paradise",
  
  // Party
  "party-birthday": "Birthday party celebration portrait with balloons, confetti, birthday cake, festive atmosphere",
  "party-club": "VIP club portrait with neon lights, DJ booth, nightclub atmosphere, party vibes",
  "party-newyear": "New Year Eve celebration with champagne, fireworks, midnight celebration",
  "party-carnival": "Venetian carnival masquerade with elegant mask, carnival costume, ballroom setting",
  
  // Wedding
  "wedding-bride": "Beautiful bride portrait in stunning white wedding dress, bridal bouquet, romantic wedding venue",
  "wedding-groom": "Elegant groom portrait in sharp tuxedo, boutonniere, classic wedding setting",
  "wedding-bridesmaid": "Elegant bridesmaid in pink dress, wedding flowers, romantic venue",
  "wedding-dance": "Romantic first dance at wedding in elegant ballroom, wedding reception, romantic lighting",
  
  // Futuristic
  "future-cyberpunk": "Cyberpunk character with neon city background, cybernetic enhancements, futuristic LED lights, dark urban atmosphere",
  "future-space": "Astronaut or space explorer with space suit elements, galaxy/nebula background, floating in space with stars",
  "future-robot": "Futuristic robot/android portrait with metallic elements, sci-fi background, advanced technology aesthetic",
  "future-matrix": "Matrix character with green digital code rain, black leather trench coat, dramatic Matrix movie atmosphere",
  
  // Music
  "music-dj": "Famous DJ portrait at DJ booth, neon lights, club atmosphere, electronic music vibes",
  "music-rockstar": "Rock star portrait with electric guitar, concert stage, dramatic lighting, rock and roll aesthetic",
  "music-country": "Country music star with cowboy hat, guitar, Nashville vibes, warm rustic background",
  "music-orchestra": "Orchestra conductor portrait with conductor baton, symphony orchestra, elegant concert hall",
  
  // Pets
  "pets-dog": "Portrait with adorable puppy, loving bond, soft natural lighting, heartwarming scene",
  "pets-cat": "Cat lover portrait with beautiful cat, cozy atmosphere, warm lighting",
  "pets-bunny": "Portrait with cute bunny rabbit, spring flowers, soft pastel colors",
  "pets-horse": "Horse riding portrait on majestic horse, countryside or stable background, equestrian elegance",
  
  // Gothic
  "gothic-dark": "Dark queen gothic portrait with dramatic dark makeup, gothic castle background, mysterious atmosphere",
  "gothic-angel": "Dark angel portrait with black wings, dramatic lighting, celestial gothic aesthetic",
  "gothic-romantic": "Romantic gothic portrait with vintage dark aesthetic, roses, Victorian elegance",
  "gothic-vampire": "Vampire lord portrait with elegant dark attire, gothic castle, mysterious night atmosphere",
  
  // Steampunk
  "steampunk-inventor": "Steampunk inventor portrait with gears, goggles, Victorian industrial aesthetic",
  "steampunk-pilot": "Airship pilot portrait with aviator gear, steampunk airship background, brass and copper elements",
  "steampunk-lady": "Victorian steampunk lady with corset, gears, elegant industrial aesthetic",
  "steampunk-explorer": "Steampunk explorer portrait with adventure gear, mechanical elements, industrial Victorian setting",
  
  // Warriors
  "viking-warrior": "Viking warrior portrait with viking helmet, fur cape, Norse background, fierce warrior aesthetic",
  "pirate-captain": "Pirate captain portrait with captain hat, ship deck, ocean background, adventurous pirate aesthetic",
  "warrior-spartan": "Spartan warrior portrait with helmet, shield, ancient Greek battlefield",
  "warrior-samurai": "Samurai warrior portrait with traditional armor, katana, Japanese aesthetic",
  
  // Western
  "western-cowboy": "Cowboy portrait with cowboy hat, desert background, Wild West aesthetic",
  "western-sheriff": "Sheriff portrait with badge, western town, classic western movie style",
  "western-rodeo": "Rodeo portrait with cowboy gear, rodeo arena, exciting western atmosphere",
  "western-saloon": "Saloon portrait in western attire, vintage saloon background, old west vibes",
  
  // Chef
  "chef-gourmet": "Gourmet chef portrait with chef outfit, professional kitchen, culinary expertise",
  "chef-pastry": "Pastry chef portrait with desserts, bakery setting, sweet creations",
  "chef-sushi": "Sushi chef portrait with Japanese chef attire, sushi preparation, Japanese restaurant aesthetic",
  "chef-bbq": "BBQ master portrait with grill, smoky atmosphere, outdoor cooking scene",
  
  // Zen
  "zen-meditation": "Meditation portrait in lotus pose, zen garden, peaceful spiritual atmosphere",
  "underwater-diver": "Deep sea diver portrait underwater, coral reef, tropical fish, beautiful ocean",
  "zen-taichi": "Tai Chi master portrait in traditional outfit, misty mountain background, peaceful martial arts scene",
  "zen-monk": "Buddhist monk portrait in traditional robes, temple background, spiritual peaceful atmosphere",
  
  // New 2026 Non-Holiday Styles
  "lifestyle-wine": "Elegant wine tasting portrait in wine cellar holding wine glass, surrounded by wine barrels and bottles, warm candlelight atmosphere, sophisticated wine connoisseur",
  "career-pilot": "Professional airline pilot portrait in cockpit, wearing captain uniform with wings badge, dramatic cockpit lighting with instruments, professional aviator",
  "dance-ballerina": "Prima ballerina in beautiful tutu performing graceful pose on stage, dramatic spotlight, professional ballet performance",
  "fun-scientist": "Mad scientist in laboratory with bubbling potions, electric sparks, crazy hair, lab coat, surrounded by test tubes and scientific equipment",
  "lifestyle-casino": "Glamorous person playing poker in casino, holding cards, chips on table, Las Vegas casino atmosphere, elegant outfit",
  "culture-geisha": "Traditional Japanese geisha portrait in beautiful kimono, traditional hairstyle with ornamental pins, cherry blossom background",
  "tech-hacker": "Neon cyberpunk hacker portrait with glowing glasses, holographic screens floating around, futuristic tech aesthetic, purple and blue neon lighting",
  "ancient-pharaoh": "Egyptian pharaoh portrait with golden headdress and jewelry, ancient Egyptian temple background with hieroglyphics, royal Egyptian aesthetic",
  "myth-goddess": "Greek goddess portrait in flowing white toga, golden laurel crown, Mount Olympus clouds background, divine heavenly lighting",
  "sports-racing": "Formula 1 racing driver portrait in racing suit, F1 car in background, pit lane atmosphere, champion racer aesthetic",
  "career-firefighter": "Professional firefighter portrait in full gear with helmet, fire station background, heroic pose, dramatic lighting with fire glow",
  "fashion-magazine": "Fashion model at magazine cover photoshoot, stunning haute couture dress, professional studio lighting, Vogue magazine aesthetic",
  "award-oscar": "Oscar ceremony portrait holding golden Oscar trophy, stunning formal gown, paparazzi cameras flashing, Hollywood award show atmosphere",
  "sports-boxer": "Powerful boxer portrait in boxing ring, wearing boxing gloves, dramatic gym lighting, championship bout atmosphere",
  "pets-puppies": "Person surrounded by cute golden retriever puppies, playful outdoor garden scene, warm soft natural lighting, heartwarming pet photography",
  "culture-bollywood": "Indian Bollywood star portrait in traditional colorful sari with gold jewelry, beautiful henna on hands, Bollywood movie scene aesthetic",
  "magic-potion": "Witch in magical potion brewing scene, cauldron with colorful magical smoke, spellbook, mystical forest background, enchanting purple magical lighting",
  "royal-renaissance": "Renaissance nobility portrait in medieval palace, royal velvet clothing with gold embroidery, oil painting style, classic European royal portrait",
  "gaming-esports": "Pro gamer portrait with RGB gaming setup, gaming headset, multiple monitors with game graphics, esports tournament atmosphere, neon gaming lighting",
  "fantasy-fairy": "Magical fairy with beautiful iridescent wings, sitting on giant mushroom, enchanted forest with fireflies, magical sparkles and glow",
  "mystic-fortune": "Mystical fortune teller with crystal ball, tarot cards on table, purple mystical smoke, velvet curtains, mysterious gypsy aesthetic",
  "sports-surfing": "Surfer catching massive wave at sunset, wetsuit, tropical beach, golden hour lighting, extreme sports action photography",
  "dance-flamenco": "Elegant flamenco dancer in red dress, dramatic dance pose, Spanish atmospheric setting with arched doorway, passionate dance moment",
  "action-spy": "Secret agent spy portrait in tuxedo, holding martini glass, casino Monte Carlo background, James Bond movie aesthetic",
  "music-kpop": "K-pop idol portrait in stylish colorful outfit, neon Korean aesthetic, professional studio lighting, popular K-pop star vibe",
  "ancient-gladiator": "Roman gladiator in arena, wearing gladiator armor and helmet, Colosseum background, epic battle pose, ancient Rome aesthetic",
  "myth-nightqueen": "Elegant queen of the night portrait with black flowing gown, stars and crescent moon crown, starry night sky background, mystical goddess",
  "music-hiphop": "Famous rapper hip hop artist portrait with gold chains, microphone, urban street graffiti background, hip hop culture aesthetic",
  "adventure-jungle": "Tropical jungle explorer with safari hat and binoculars, lush green rainforest background with exotic birds and monkeys, adventure photography",
  "warrior-dragon": "Chinese dragon warrior in ornate dragon armor, Chinese palace background, dramatic red and gold colors, legendary warrior aesthetic",
  "fantasy-unicorn": "Magical unicorn rider in enchanted fantasy forest, beautiful princess on majestic white unicorn, rainbow colors, sparkles and magical glow",
  "sports-soccer": "Professional soccer player celebrating goal on stadium field, soccer jersey and ball, cheering crowd in background, dramatic stadium lighting",
  "fantasy-icequeen": "Arctic ice queen portrait with ice crown and crystal jewelry, frozen palace background, blue icy magical glow, winter goddess aesthetic",
  "culture-diademuertos": "Traditional Mexican Día de los Muertos portrait with sugar skull face paint, colorful marigold flowers, traditional Mexican dress, vibrant cultural celebration",
  "sports-skating": "Elegant ice skating portrait on frozen lake, beautiful ice skating outfit, graceful pose with one leg extended, winter wonderland background",
  "culture-hanfu": "Beautiful Chinese traditional Hanfu portrait, elegant traditional Chinese dress with embroidery, cherry blossom garden background, ancient Chinese aesthetic",
  "lifestyle-biker": "Cool motorcycle rider portrait on custom chopper bike, leather jacket, desert highway sunset background, freedom road trip aesthetic",
  "career-doctor": "Professional surgeon portrait in hospital operating room, surgical scrubs and mask, medical equipment, dramatic hospital lighting, healthcare hero",
  "fantasy-wizard": "Mystical dark wizard with glowing staff, magical lightning, dark robe with stars, dramatic stormy background, powerful mage aesthetic",
  "retro-filmnoir": "Glamorous Hollywood golden age portrait, black and white classic, vintage 1940s hairstyle and makeup, film noir dramatic lighting, classic movie star",
  "myth-athena": "Ancient Greek warrior Athena goddess in golden armor with owl, Greek temple background, powerful divine pose, mythology goddess aesthetic",
  "lifestyle-barista": "Beautiful coffee barista portrait making latte art, cozy cafe background, warm lighting, apron, professional barista aesthetic",
  "warrior-amazon": "Powerful Amazon warrior woman in jungle setting, tribal warrior outfit with spear, fierce expression, lush tropical rainforest background",
  "glamour-masquerade": "Elegant masquerade ball portrait with ornate Venetian mask, beautiful ball gown, opulent baroque ballroom background, mysterious glamorous atmosphere",
  "sports-tennis": "Professional tennis player portrait on tennis court, holding tennis racket, athletic outfit, stadium in background, champion athlete aesthetic",
  "myth-nature": "Nature goddess portrait with flower crown and flowing green dress, surrounded by birds and butterflies, magical enchanted forest background, earth goddess",
  "art-painter": "Parisian artist portrait painting at easel in art studio, beret hat, paint palette, beautiful oil paintings on walls, bohemian artist aesthetic",
  "music-jazz": "Elegant jazz singer portrait at microphone in vintage jazz club, red dress, spotlight, smoky atmospheric jazz bar, classic jazz era aesthetic",
  "sports-snowboard": "Snowboarder catching air on snowy mountain, snowboard and winter gear, dramatic mountain backdrop, extreme winter sports action shot",
  "culture-scottish": "Traditional Scottish highland portrait in tartan kilt with bagpipes, misty Scottish highlands castle background, proud Scottish heritage aesthetic",
};

async function fetchImageAsBase64(url: string): Promise<string> {
  console.log("Fetching image from URL:", url.substring(0, 100) + "...");
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
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
    const { imageUrl, transformationType, stylePreviewUrl } = await req.json();
    
    console.log("Received request:", { transformationType, hasImageUrl: !!imageUrl, hasStylePreviewUrl: !!stylePreviewUrl });
    
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

    // Get the style description
    const styleDescription = STYLE_DESCRIPTIONS[transformationType] || "Beautiful artistic portrait with enhanced lighting and magical atmosphere";
    console.log(`Transforming with style: ${transformationType}`);
    console.log(`Style description: ${styleDescription}`);

    // Fetch user image as base64
    console.log("Fetching user image...");
    const userImageBase64 = await fetchImageAsBase64(imageUrl);
    const userImageDataUrl = `data:image/jpeg;base64,${userImageBase64}`;

    // Build the prompt for face swap / style transfer
    let prompt: string;
    let messageContent: any[];

    if (stylePreviewUrl) {
      // If we have a style preview URL, fetch it and use both images
      console.log("Fetching style preview image...");
      const styleImageBase64 = await fetchImageAsBase64(stylePreviewUrl);
      const styleImageDataUrl = `data:image/jpeg;base64,${styleImageBase64}`;
      
      prompt = `You are an expert at creating photorealistic face swap images. 

I'm providing you with two images:
1. FIRST IMAGE (User's Photo): This is the source face that you need to preserve exactly - all facial features, skin tone, expressions, and likeness.
2. SECOND IMAGE (Style Reference): This is the target scene/style that you need to recreate exactly - the pose, clothing, setting, lighting, and atmosphere.

Your task: Generate a NEW image that looks EXACTLY like the Style Reference image (same scene, pose, outfit, background, lighting) but with the FACE from the User's Photo perfectly integrated. The result should look like a real photograph of the person from image 1 in the exact scene/outfit/pose from image 2.

CRITICAL REQUIREMENTS:
- The FACE must be a perfect match to the User's Photo - same eyes, nose, mouth, facial structure, skin tone
- The SCENE must be a perfect match to the Style Reference - same outfit, pose, background, props, lighting
- The integration must be seamless and photorealistic - no visible artifacts or mismatches
- Maintain natural skin tones and realistic lighting on the face to match the scene

Generate this as a high-quality, photorealistic image.`;

      messageContent = [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: userImageDataUrl } },
        { type: "image_url", image_url: { url: styleImageDataUrl } }
      ];
    } else {
      // Fallback to text-based style description
      prompt = `You are an expert at creating photorealistic portrait transformations.

I'm providing you with a photo of a person. Your task is to create a NEW image that:
1. Preserves the EXACT facial features, likeness, skin tone, and identity of the person in the photo
2. Places them in this specific scene/style: ${styleDescription}

CRITICAL REQUIREMENTS:
- The FACE must remain a perfect match to the original photo - same eyes, nose, mouth, facial structure
- Create the scene/outfit/background as described in the style
- Make it look like a real professional photograph
- Natural lighting that matches the scene while preserving the person's skin tone
- Seamless integration - should look completely real

Generate this as a high-quality, photorealistic image.`;

      messageContent = [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: userImageDataUrl } }
      ];
    }

    console.log("Calling OpenAI gpt-image-1 for image generation...");
    
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Build the prompt text including style description
    let imageEditPrompt: string;
    if (stylePreviewUrl) {
      imageEditPrompt = `Create a photorealistic portrait transformation. Take the face from the provided image and place it in this exact scene/style: ${styleDescription}. 
The face must remain a perfect match to the original - same eyes, nose, mouth, facial structure, skin tone. 
Create the scene/outfit/background exactly as described. Make it look like a real professional photograph with seamless integration and natural lighting.`;
    } else {
      imageEditPrompt = `Create a photorealistic portrait transformation. Take the face from the provided image and place it in this scene: ${styleDescription}. 
The face must remain a perfect match to the original - same eyes, nose, mouth, facial structure, skin tone. 
Make it look like a real professional photograph with seamless integration and natural lighting.`;
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: imageEditPrompt,
        n: 1,
        size: "1024x1024",
        quality: "high",
        response_format: "b64_json"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402 || response.status === 401) {
        return new Response(
          JSON.stringify({ error: "OpenAI API authentication failed. Please check API key." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("OpenAI API response received");
    
    // Extract the generated image (base64)
    const generatedImageBase64 = data.data?.[0]?.b64_json;
    
    if (!generatedImageBase64) {
      console.error("No image in response:", JSON.stringify(data).substring(0, 500));
      throw new Error("No image generated. Please try again.");
    }
    
    const generatedImage = `data:image/png;base64,${generatedImageBase64}`;

    const transformedImageUrl = generatedImage;

    // Deduct credit
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

    // Save transformation record
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
