import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { tryVertexImage } from "../_shared/vertexDirect.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

/** Style presets — keep in sync with src/data/photoStyles.ts */
const STYLE_PROMPTS: Record<string, string> = {
  pencil: "a detailed hand-drawn graphite pencil sketch, visible cross-hatching, soft shading, white paper texture",
  charcoal: "a dramatic charcoal drawing, deep blacks, smudged shadows, rough textured paper",
  ink: "a fine black ink line drawing with stippling and hatching, minimal clean linework",
  cartoon: "a bold modern cartoon illustration, clean thick outlines, flat vivid colors, expressive simplified features",
  anime: "a Japanese anime illustration, large expressive eyes, cel shading, clean lineart, soft gradient background",
  comic: "a retro comic-book panel, halftone dot shading, bold ink outlines, saturated primary colors",
  animated3d: "a friendly animated 3D character render, soft global illumination, smooth stylized features, big expressive eyes",
  watercolor: "a delicate watercolor painting, soft translucent washes, bleeding pigments, visible paper grain",
  oil: "a classical oil painting, thick impasto brush strokes, rich warm palette, gallery lighting",
  gouache: "a gouache illustration, matte opaque paint, painterly edges, muted designer palette",
  pastel: "a soft chalk pastel portrait, powdery texture, gentle blended colors on toned paper",
  popart: "a pop-art screen print, bold flat color blocks, halftone dots, high contrast outlines",
  hippy: "a 1970s psychedelic hippie poster, swirling flower-power patterns, warm rainbow gradients, groovy retro typography shapes",
  vaporwave: "an 80s vaporwave aesthetic, magenta and cyan neon gradients, grid horizon, chrome highlights, VHS grain",
  cyberpunk: "a neon cyberpunk portrait, rain-slick reflections, teal and magenta rim light, futuristic city bokeh",
  synth80s: "a retro 1980s airbrush poster look, sunset gradient, chrome shine, soft glow",
  fantasy: "an epic fantasy character painting, ornate costume details, magical rim light, painterly digital brushwork",
  fairytale: "a warm storybook illustration, gentle line work, soft pastel palette, whimsical hand-painted detail",
  gothic: "a dark gothic romantic painting, moody candlelight, deep shadows, ornate victorian detail",
  steampunk: "a steampunk portrait, brass gears and goggles, sepia industrial palette, victorian textures",
  claymation: "a stop-motion clay figure, visible fingerprint texture in the clay, soft studio lighting, tabletop set",
  papercut: "a layered paper-cut collage, stacked colored paper shapes with soft drop shadows",
  pixel: "a 16-bit pixel-art portrait, limited retro palette, crisp square pixels, subtle dithering",
  lowpoly: "a low-poly geometric render, faceted triangles, flat gradient shading, minimal palette",
  mosaic: "a byzantine glass mosaic, small colored tesserae tiles with visible grout lines, golden background",
  stainedglass: "a stained-glass window, black lead outlines, luminous jewel-tone glass panels, backlit glow",
  woodcut: "a vintage woodcut engraving, bold carved lines, two-tone ink on aged paper",
  sketchnote: "a friendly marker-pen doodle portrait, quick confident strokes, light highlighter accents",
  noir: "a black-and-white film-noir portrait, hard directional light, deep contrast, cinematic grain",
  vintage: "a faded 1950s photograph, warm sepia tones, soft grain, gentle vignette and light leaks",
  renaissance: "a renaissance oil portrait, chiaroscuro lighting, dark background, period clothing and craquelure",
  ukiyoe: "a Japanese ukiyo-e woodblock print, flat color areas, elegant outlines, washi paper texture",
  graffiti: "a spray-paint street-art mural on concrete, bold stencil shapes, drips and overspray",
  neonline: "a glowing neon-tube line portrait on a dark wall, vivid magenta and cyan light, soft bloom",
  minimal: "a minimalist single-line vector portrait, two flat accent colors, generous negative space",
  superhero: "an original comic superhero look, dynamic dramatic lighting, bold heroic costume design (no existing franchise characters)",
  cosmic: "a cosmic double-exposure portrait blended with nebulas and stars, deep indigo and violet glow",
  underwater: "an ethereal underwater portrait, caustic light rays, floating bubbles, teal water tones",

  colorpencil: "a colored-pencil drawing, layered hatching in vivid pencil strokes, visible paper tooth",
  scratchboard: "a scratchboard engraving, white scratched lines revealed on solid black ink, fine crosshatch texture",
  caricature: "a friendly hand-drawn caricature, playfully exaggerated proportions, lively ink and watercolor finish",
  chibi: "a cute chibi illustration, small rounded body proportions, big head, soft cel shading, kawaii palette",
  manga: "a black-and-white manga panel, screentone dot shading, sharp inked lines, speed-line background",
  sticker: "a die-cut vinyl sticker illustration, thick white border, bold flat colors, glossy highlights",
  impressionist: "an impressionist painting, short broken brush strokes, dappled natural light, luminous soft palette",
  postimpressionist: "a post-impressionist painting with thick swirling expressive brush strokes and vivid complementary colors",
  acrylic: "an acrylic palette-knife painting, thick textured color slabs, bold edges, canvas weave visible",
  surreal: "a surrealist dreamlike painting, soft impossible elements, muted otherworldly palette, smooth rendering",
  disco70s: "a 1970s disco poster, warm amber and magenta glow, mirror-ball sparkle, grainy retro print",
  retro90s: "a 1990s retro anime cel look, hand-painted cels, slight film grain, nostalgic muted colors",
  glitch: "a digital glitch-art portrait, RGB channel shift, scanlines, datamosh fragments on dark background",
  mythicgod: "a mythological deity painting, golden laurel and drapery, divine radiance, marble temple backdrop",
  icequeen: "a frost-and-ice portrait, crystalline frozen accents, pale blue glow, snow particles in the air",
  emberfire: "a fire-and-ember portrait, glowing sparks, warm orange rim light, smoky dark background",
  forestspirit: "an enchanted forest-spirit portrait, mossy glowing flora, fireflies, soft emerald light",
  origami: "a folded paper origami sculpture look, crisp geometric folds, soft studio light, paper fiber texture",
  feltwool: "a needle-felted wool craft figure, fuzzy fiber texture, soft handmade look, cozy studio lighting",
  toybrick: "a figure built from plastic toy building bricks, glossy studs, blocky shapes, tabletop studio light (generic, no branded toys)",
  marble: "a classical white marble statue, carved stone texture, subtle veining, museum lighting",
  bronze: "a patinated bronze sculpture bust, metallic sheen, greenish patina, gallery spotlight",
  artnouveau: "an art-nouveau poster, ornate flowing linework, decorative floral border, muted gold and sage palette",
  cubism: "a cubist painting, fragmented geometric planes, multiple viewpoints, bold angular color fields",
  polaroid: "an instant polaroid snapshot, soft focus, slight overexposure, warm colour cast and white frame feel",
  blueprint: "a technical blueprint drawing, white line work on deep cyan paper, measurement annotations",
  duotone: "a high-contrast duotone print, two bold colors only, posterized tonal separation",
  silhouette: "a graphic silhouette portrait, solid dark shape against a bright gradient backdrop, crisp edges",
  holofoil: "a holographic foil print effect, iridescent rainbow sheen, metallic reflections, dark glossy base",
  brickfigure: "the person, their hair, clothing and the whole background rebuilt out of plastic construction bricks, glossy studs, blocky stud-built scenery, tabletop studio light (generic bricks, no brand logos)",
  dollplastic: "a glossy plastic fashion-doll look, perfectly smooth symmetric skin, flawless molded hair, doll-styled outfit, bright pink packaging-box backdrop (generic doll, no brand)",
  vinylfigure: "a collectible vinyl figurine, oversized square head, large solid black eyes without pupils, small simplified body, matte vinyl finish, studio product lighting (generic figurine, no brand)",
  steampunkworld: "a steam-powered victorian world, leather garments, brass gears and fittings, welding goggles, smoking 19th-century factories in the background, warm sepia industrial palette",
  y2k: "an early-2000s Y2K aesthetic, silver metallic materials, baggy futuristic clothing, digital noise, chromatic aberration with blurred neon edges and VHS tape artifacts",
  viking: "a rugged norse viking look, braided hair, war paint on the face, fur cloak and an axe in hand, snowy northern landscape, cold desaturated palette",
  uvglow: "a UV blacklight body-paint portrait, dark background with only neon blue, green and pink fluorescent details glowing on the face and clothing",
  doubleexposure: "an artistic double-exposure portrait, the face silhouette acting as a window onto a forest, city skyline or mountains, soft blended edges",
  glassmorph: "the figure appearing carved from clear coloured or frosted glass, refracting light, glossy highlights and beautiful caustic reflections",
  techwear: "modern dark urban techwear, black waterproof shell jacket, tactical vest, face mask, harness straps and futuristic sneakers in a neon Tokyo street",
  trippy: "a psychedelic trippy explosion of colour, warped shapes, liquid melting textures and hypnotic 1960s-70s patterns in the background",
  knitted: "the entire scene, figure and background knitted and crocheted out of yarn, soft woolly fiber texture, cozy handmade toy-like look",
  porcelain: "an extremely smooth white porcelain-doll finish, delicate ceramic sheen, softly painted make-up, fragile artistic expression",
  biophilia: "the face and body formed out of leaves, moss, tree roots and blooming flowers, a living forest-being look, soft natural light",
  elemental: "the figure formed purely from flowing water, burning flames or carved translucent blue ice with cold mist rising",
  opticalillusion: "an optical-illusion landscape portrait where trees, hills, a river and small houses form the shapes and shadows of the face when viewed from a distance",
  kintsugi: "the face and body coated in glossy liquid metal, chrome or gold, or a kintsugi look of matte black surface with beautiful golden cracks",
  smokeart: "the silhouette and facial features emerging softly from dissolving coloured smoke on a dark background",
  sincity: "a stark black-and-white high-contrast noir comic look with a single vivid colour accent (red lips, red dress or glowing yellow eyes) in a rainy night city",
  voxel: "the photo rebuilt from three-dimensional cubes and voxels, retro-modern blocky 3D world, flat cube shading",
  magickingdom: "a 3D animated fairy-tale prince or princess look, placed in front of a magical castle on a blooming meadow with friendly animals, bright storybook lighting",
  enchantedforest: "a soft ethereal fairy look with the background replaced by a deep enchanted forest, glowing mushrooms, fireflies, giant flowers and magical mist",
  candyland: "an extremely colourful candy-land scene, lollipop trees, chocolate rivers, cotton-candy clouds and gingerbread houses around the person",
  spaceexplorer: "an astronaut spacesuit and the background replaced with deep space, nebulas, alien planets or a high-tech spaceship interior",
  cyberpunkcity: "a rainy futuristic night city street, glowing holographic billboards, flying cars and neon reflections on the face",
  atlantis: "an underwater ocean scene with coral reefs, sunken ships and swimming fish, the person given aquatic or mermaid-like features",
  vikingwild: "a rugged nordic wilderness scene, snowy mountain top, smoking campfire in a northern forest or the deck of a viking longship in a storm",
  executiveoffice: "a luxury tailored suit and a modern glass top-floor corporate office background with a blurred big-city skyline, crisp professional lighting",
  keynote: "standing on a conference stage at a microphone, huge LED screen behind and a blurred audience, dramatic event lighting",
  neonoir: "an elegant trench coat and hat, background replaced with a rainy night alley, lonely street lamp, fog and chromatic reflections in puddles",
  postapoc: "a gritty tactical post-apocalyptic look, leather jacket and harnesses, ruined abandoned city with smoking debris in the background",
  darkthrone: "seated on a massive stone or iron throne in a dark castle hall, light through tall gothic windows, lit candles and heavy drapes",
  metgala: "a bold couture evening gown or luxury tuxedo on a gala red carpet, sponsor wall backdrop and flashing press cameras",
  voguestudio: "a minimal high-fashion editorial shoot, Parisian industrial loft with exposed brick or a clean designer studio with dramatic shadows, tasteful elegant styling",
  romeancient: "ancient roman attire of a senator, gladiator or classical deity, background replaced with ancient Rome, marble columns and burning torches",
  worldtravel: "the background replaced with a photorealistic dream destination — a tropical beach, an African safari or a rooftop overlooking a famous European city — with matching natural light",
  pyramidsgiza: "light linen desert clothing and a stylish sun hat, background replaced with the Pyramids of Giza and the Great Sphinx, harsh golden-hour desert sunlight",
  saharadune: "adventurous desert outfit with a scarf, standing on the crest of a huge Sahara sand dune at sunset, camel caravan and blowing sand dust in the background, deep orange and red sky",
  archaeologist: "a rugged explorer outfit in earthy khaki and brown tones with a leather jacket and backpack, background replaced with an ancient excavation site or a carved rock city like Petra",
  maldivesresort: "light summer resort clothing, standing on an iconic wooden pier over crystal-clear turquoise ocean with overwater straw bungalows in the background",
  tropicalbeach: "relaxed beach clothing on a white sand tropical beach, tall palm trees, wild rocks rising from the water and big ocean waves behind",
  yachtsunset: "an elegant old-money summer outfit aboard a luxury yacht, open sea and a setting sun creating golden reflections on the water",
  grandcanyon: "adventurous western hiking clothing with a denim jacket, standing on the edge of the monumental red Grand Canyon in Arizona, dry semi-desert nature",
  auroraborealis: "a warm winter parka with a fur hood, standing in a snowy Iceland or Norway landscape at night with a magical green aurora borealis glowing overhead and softly lighting the face",
  tokyoshibuya: "standing on the famous Shibuya crossing in Tokyo at night, Japanese signage, giant glowing screens and city traffic with strong bokeh light blur",
  newyorktaxi: "a stylish city coat on a busy Manhattan street, iconic skyscrapers, yellow taxis and steam rising from the street vents, classic cinematic framing",
  parisromance: "seated on a classic Parisian café terrace with a croissant and coffee, Haussmann architecture and the Eiffel Tower behind, soft warm cinematic filter",
  alpsski: "a luxury ski suit and mirrored ski goggles reflecting snowy peaks, snowy slope, alpine chalet and sunlit mountains in the background",
  canadacamp: "hiking clothing seated by a smoking campfire on the shore of a crystal turquoise lake, giant pine forests and rocky mountains reflected in the water, Banff national park look",
  mayantemple: "adventure clothing standing in dense green tropical jungle in Yucatan or Guatemala, an ancient stepped Mayan pyramid emerging from the vegetation behind",
  tuscanyvineyard: "a light summer outfit holding a glass of wine among endless rolling Tuscan vineyards lined with cypress trees at golden sunset",
  santorini: "bright white or blue flowing clothing on a terrace overlooking iconic white houses with blue domes and the deep Aegean sea",
  moroccanriad: "exotic city-luxury styling in a traditional Moroccan riad courtyard with a pool, richly ornamented oriental mosaic tiles, palms and clay walls in Marrakesh",
  memoji: "a clean 3D avatar-sticker version of the person, smooth rounded shapes, simple glossy shading, flat background, messaging-sticker look",
  pixelemoji: "a retro 16-bit pixel-art emoji portrait, chunky pixels, limited palette, crisp pixel edges",
  emote: "a bold streaming chat emote, simplified exaggerated cartoon face, thick outlines, punchy expression, transparent-style flat background",
  shonen: "a classic shonen anime portrait, large glossy eyes, sharp facial lines, detailed spiky hair, vivid saturated cel colors",
  ghiblisoft: "a nostalgic hand-painted animation-film look, soft watercolor tones, gentle natural light, painterly backgrounds",
  kawaii: "a cute kawaii chibi character, oversized head, tiny body, soft pastel colors, big sparkly eyes",
  pixar3d: "a polished 3D animated-movie character render, rounded features, luminous eyes, detailed skin and hair texture, cinematic soft lighting",
  webtoon: "a 2D webtoon comic panel style, bold clean outlines, cel shading, flat colors, halftone dot shading",
  vectorgame: "a sharp vector illustration in the style of video-game cover art, bold outlines, crisp gradient shading, poster composition",
  renaissanceportrait: "a classical renaissance oil portrait, period lace and pearls, heavy velvet fabrics, dark aristocratic background, chiaroscuro lighting",
  victorian: "a regency-era portrait, pastel corseted gown, elaborate floral updo hairstyle, gloves, English garden or marble hall setting",
  medievalqueen: "a cinematic medieval fantasy royal portrait, metal crown, embroidered cloak, fur mantle, dramatic torchlight in a stone castle",
  redcarpet: "a modern red-carpet gala portrait, sparkling evening gown, diamond jewellery, flawless glam makeup, camera flashes in the background",
  masquerade: "an opulent masquerade ball portrait, ornate venetian mask with feathers and gold filigree, candlelit ballroom, mysterious mood",
  elfprincess: "an ethereal elven portrait, delicate tiara, luminous skin, flowing gown, magical enchanted forest light",
  darkroyalty: "a gothic dark-royalty portrait, black lace gown, dark lipstick, crown of black crystals, moody mystical atmosphere",
  headshot: "a polished corporate headshot, subject wearing a tailored blazer or suit, soft studio key light, clean modern office or neutral gray backdrop, sharp professional retouching",
  success: "a luxury entrepreneur success portrait, confident pose, sharp designer suit, New York skyscraper or premium office or private jet stair background, golden cinematic light",
  cyborg: "a cyborg cyber-enhanced portrait, half human half machine, glowing blue and red LED lines under the skin, brushed metal plating, high-tech visor, dark sci-fi lighting",
  astronaut: "a realistic astronaut portrait in a detailed white space suit with helmet reflections, aboard a space station or with planet Earth in the background",
  neonpunk: "an extreme-contrast neon night portrait, pink purple and turquoise neon glow, wet reflective street background, Blade Runner cinematic mood",
  splatter: "a realistic face combined with expressive paint splatter and watercolor bleeds, dynamic ink splashes running off the edges, gallery art poster look",
  glowlines: "a portrait built entirely from glowing neon light lines on a pure black background, luminous outlines, soft bloom",
  zombie: "a post-apocalyptic survivor or zombie transformation, torn dirty clothing, grime and dramatic scars on the face, decayed skin tone, desaturated ruined city background",
  vampire: "a gothic vampire portrait, pale porcelain skin, dark shadows around the eyes, deep red lips with subtle fangs, Victorian gothic clothing, candlelit dark atmosphere",
  mummy: "an ancient Egyptian mummy transformation, aged linen bandages wrapped around the body and part of the face, dusty golden tomb with hieroglyphs and torchlight",
  werewolf: "a werewolf transformation, subtle fur texture on the face, amber glowing eyes, sharp fangs, moonlit misty forest background, cinematic horror lighting",
  witch: "a gothic witch or warlock portrait, wide-brimmed hat, dark flowing cloak, glowing green magic sparks, cauldron smoke and candles in a dark cottage",
  ghost: "a translucent ghost apparition, pale desaturated skin, ethereal glow, semi-transparent edges dissolving into mist, haunted mansion corridor background",
  skullday: "a Day of the Dead calavera portrait, ornate painted sugar-skull face makeup with flowers and patterns, marigolds and candles, festive night background",
  frankenstein: "a classic movie-monster reanimation portrait, greenish grey skin tone, stitches and neck bolts, dim laboratory with electric arcs, black-and-white horror film mood",
  demon: "a dark demon portrait, glowing red eyes, subtle horns, cracked ember skin texture, hellish smoke and firelight background",
  alienhybrid: "a sci-fi alien hybrid portrait, subtly elongated features, iridescent skin sheen, large dark reflective eyes, UFO interior with cold blue light",
  eerieclown: "a creepy carnival clown portrait, cracked white face paint, exaggerated smile makeup, tattered ruffled costume, dark abandoned circus tent background",

  santaclaus: "a classic Santa Claus transformation, red velvet coat with white fur trim, wide black belt, red hat and a fluffy white beard, sack of gifts, snowy village night with warm lantern light",
  santafemale: "a female Santa (Mrs. Santa) transformation, red velvet dress or coat with white fur trim, wide black belt, red Santa hat, elegant festive makeup, sack of gifts, snowy village night with warm lantern light",
  mikulas: "a traditional Saint Nicholas look, long ornate bishop robe with gold embroidery, mitre and crozier, holding a basket of sweets, snowy old-town square in the evening",
  christmaself: "a cheerful Christmas elf, green and red striped costume with pointed hat and curled shoes, Santa's toy workshop with wrapped presents in the background",
  christmastree: "an elegant Christmas evening portrait, festive knitwear or a sparkling holiday dress, decorated Christmas tree with warm bokeh lights and presents behind",
  christmasmarket: "a winter coat, scarf and gloves holding mulled wine at a European Christmas market at night, wooden stalls, string lights and gentle snowfall",
  cozysweater: "a cozy oversized knitted winter sweater, warm cabin interior with a fireplace, blankets and hot cocoa, soft golden light",
  nutcracker: "a theatrical nutcracker ballet look, ornate military-style jacket with gold braiding or a tulle ballet costume, snowy stage set with soft spotlights",
  gingerbread: "a gingerbread-house winter wonderland scene, candy canes, icing decorations and pastel sweets, festive baker outfit",
  newyearparty: "a glamorous New Year's Eve party look, sequin dress or sharp tuxedo, champagne glass, confetti in the air and golden balloons",
  fireworksnight: "standing on a rooftop or balcony at midnight in elegant party clothing, huge colourful fireworks exploding over a city skyline",
  goldglitter: "a luxurious gold-glitter gala portrait, shimmering metallic outfit, sparkling bokeh and falling golden confetti on a dark backdrop",
  riocarnival: "a vibrant Rio carnival costume with a huge feathered headdress and sequins, samba parade street with colourful floats and dancers (tasteful, fully covered costume)",
  venicecarnival: "an opulent Venetian carnival look, ornate baroque mask, cloak and tricorn hat, misty canals and stone bridges of Venice at dusk",
  easterspring: "a pastel spring outfit in a blooming meadow with painted Easter eggs, daffodils, baskets and soft morning light",
  easterbunny: "a playful Easter bunny costume with soft ears, pastel colours, basket of decorated eggs, sunny garden background",
  eastertradition: "a traditional folk Easter look, embroidered folk costume, willow branches and hand-painted eggs, rustic village courtyard in spring",
  springblossom: "a light spring outfit under blooming cherry blossom trees, drifting pink petals and soft sunlight",
  halloweenparty: "a fun Halloween costume party look, tasteful spooky costume and makeup, carved jack-o-lanterns, cobwebs, purple and orange party lighting",
  pumpkinfield: "an autumn outfit with a plaid shirt and hat in a golden pumpkin patch at sunset, hay bales and falling leaves",
  hauntedcostume: "a stylish haunted-mansion costume portrait, dark elegant costume with a cape, candles, bats and fog in a gothic mansion hall",
  valentine: "a romantic Valentine's portrait, elegant red or blush outfit, roses, heart balloons and warm candlelight bokeh",
  chinesenewyear: "a festive Chinese New Year look, red and gold traditional attire, red lanterns, dragon decorations and fireworks in the background",
  diwali: "a Diwali celebration portrait, richly embroidered festive traditional Indian attire, hundreds of glowing diya oil lamps, rangoli patterns and warm golden light",
  holifestival: "a Holi festival of colours scene, white clothing splashed with vivid pink, yellow and blue powder, clouds of colour powder in the air, joyful crowd behind",
  thanksgiving: "a warm autumn Thanksgiving family-dinner scene, cozy knit outfit, table with roast turkey, pumpkins and candles, warm home lighting",
  stpatrick: "a cheerful St. Patrick's Day look, green outfit with a shamrock and a green hat, Irish pub street parade with green decorations",
  oktoberfest: "a traditional Bavarian Oktoberfest look, dirndl or lederhosen outfit, beer tent with wooden benches, pretzels and festive garlands",
  eidcelebration: "an elegant Eid celebration portrait, refined modest festive attire with delicate embroidery, crescent moon lanterns and ornate arches with warm golden light",
  hanukkah: "a warm Hanukkah evening portrait, elegant blue and silver attire, glowing menorah candles, cozy family interior",
  diadelosmuertos: "a festive Día de Muertos celebration look, elegant embroidered outfit with marigold flower crown, decorative sugar-skull face art, colourful altar and candles at night",
  midsummer: "a Scandinavian midsummer festival look, white linen clothing and a wildflower wreath in the hair, maypole and green meadow in soft northern evening light",
  songkran: "a joyful Songkran Thai water-festival scene, bright floral shirt, splashing water droplets frozen in the air, colourful Thai street celebration in the sun",

  bikinibeach: "a summer beach swimwear editorial, stylish one-piece or bikini swimsuit, sunny tropical beach with turquoise sea, natural confident standing pose Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  poolsideglam: "a glamorous poolside summer look, fashionable swimsuit with sunglasses and a light cover-up, luxury pool and palm trees, bright midday light Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  satinlingerie: "a classy satin lingerie-inspired fashion editorial, elegant matching satin set with a robe, soft boudoir-free styling, luxury bedroom-suite backdrop with soft window light Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  silkrobe: "an elegant silk robe morning portrait, long flowing satin robe over comfortable loungewear, coffee cup, sunlit hotel suite with sheer curtains Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  gymfitness: "a fitness and gym look, sporty leggings and sports top, athletic toned posture, modern gym with weights and dramatic side lighting Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  leatherbiker: "a bold leather biker look, fitted leather jacket, trousers and boots, motorcycle and neon night street background Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  slitgown: "a glamorous red-carpet evening gown with an elegant leg slit, statement jewellery, flashing cameras and a red carpet backdrop Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  latexstage: "a bold pop-star stage look, glossy latex-style catsuit or jacket, dramatic stage lighting, smoke and spotlights on a concert stage Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  bodyconnight: "a glamorous night-out look, fitted bodycon mini dress with heels and statement earrings, upscale cocktail bar with bokeh lights Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  corsetglam: "a couture corset-top outfit with a long skirt or tailored trousers, luxury runway backstage with warm lighting Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  wetlookhair: "a high-fashion wet-look beauty editorial, slicked-back wet hair, glossy skin highlights, fitted dark outfit, dark studio background with a single hard light Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  silhouettelight: "a dramatic backlit silhouette portrait, rim light outlining the figure in a fitted dress, dark studio with haze and a bright window behind Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  velvetlounge: "a sultry velvet lounge look, deep-red velvet suit or dress, cigar-bar interior with warm amber lighting and leather armchairs Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  meshfashion: "an avant-garde runway look with a sheer mesh overlay layered over a full opaque bodysuit and skirt, fashion-week runway lighting Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  bikerbabe: "a casual denim street look, high-waisted jeans with a fitted crop top and sneakers, urban graffiti wall with golden-hour light Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  goldshimmer: "a golden beauty editorial, shimmering gold body highlighter on face, shoulders and arms, gold metallic gown, dark backdrop with warm rim light Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  vegaslounge: "a Las Vegas showgirl stage look, sequin costume with a tall feather headdress and gloves, casino stage with spotlights Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  bondgirl: "a cinematic spy-agent glamour look, sleek satin gown or tailored suit with sunglasses, casino ballroom or Monaco terrace at night Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  schoolgirluniform: "a classic adult school-uniform look, pleated plaid skirt, white blouse, blazer, tie and knee socks, school corridor or campus courtyard background Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  nurseuniform: "a professional nurse look, clean medical scrubs or a classic white nurse uniform with a cap, stethoscope, bright modern hospital corridor Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  flightattendant: "a chic flight-attendant look, tailored uniform with a scarf and cap, small trolley case, airplane cabin or airport terminal background Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  policeuniform: "a police officer look, dark tailored police uniform with a badge and cap, city street with patrol car lights in the background Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  frenchmaid: "a classic maid costume look, black dress with a white apron and headband, feather duster, elegant vintage mansion interior Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  cheerleader: "a cheerleader look, team uniform with a pleated skirt and pom-poms, stadium field with crowd bokeh under floodlights Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  cowgirl: "a western cowgirl or cowboy look, denim, leather belt, boots and a cowboy hat, ranch fence and desert sunset background Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  sailoruniform: "a nautical sailor look, navy and white sailor uniform with a cap, harbour docks and a ship deck in bright daylight Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  secretaryoffice: "a sharp office look, tailored pencil skirt or trousers with a blouse and blazer, glasses, modern glass office with city view Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",
  firefighter: "a firefighter look, heavy protective jacket with reflective stripes and helmet, fire station with a red engine in the background Tasteful, classy and fully non-explicit: the subject is an adult, fully covered in the described clothing, no nudity, no suggestive posing, editorial fashion photography mood.",

};


const BASE_RULES =
  "Restyle the EXACT person in the supplied photo. Only the rendering medium/art style may change — " +
  "everything else must stay faithful to the source photo.\n" +
  "Copy exactly, do not reinterpret or beautify: face identity and proportions, EYE COLOR, eyebrow and " +
  "hair colour, hairstyle and hair length, skin tone, makeup, pose, head tilt, hand placement, camera " +
  "angle and crop.\n" +
  "Clothing must be reproduced exactly as worn in the photo: same garment type, same colour, same neckline, " +
  "same sleeve length (if the photo shows bare shoulders or straps, keep them bare — never add sleeves, " +
  "jackets or extra layers), same visible jewellery.\n" +
  "Keep every object and background element that is visible in the photo (glasses, cups, table, props) in " +
  "the same position; do not add or remove objects.\n" +
  "Do not change the person's age, body shape or expression. Fully clothed, tasteful, no nudity, no sexual " +
  "content. Output only the finished artwork image.";

const OUTFIT_RULES =
  "Restyle the EXACT person in the supplied photo. The art style, the OUTFIT and the scene may change to " +
  "match the chosen theme.\n" +
  "Copy exactly, do not reinterpret or beautify: face identity and proportions, EYE COLOR, eyebrow and " +
  "hair colour, skin tone, age, body shape and expression. Keep the pose and camera angle close to the source.\n" +
  "Replace the clothing with a complete, well-fitted themed costume that matches the requested style, " +
  "including matching accessories, hair styling and background. The costume must always be fully covering " +
  "and tasteful.\n" +
  "Do not change the person's age or body shape. No nudity, no lingerie, no sexual or suggestive content. " +
  "Output only the finished artwork image.";

const REALISM_RULES =
  "\n\nRENDERING MODE — PHOTOREALISTIC: the final image must look like a real photograph taken with a " +
  "professional camera (full-frame DSLR, 50-85mm lens, shallow depth of field), NOT a drawing, painting, " +
  "cartoon, anime, 3D render or digital illustration. Real human skin with pores, fine hair strands, " +
  "realistic fabric weave and stitching, physically correct lighting, shadows and reflections, natural " +
  "colour grading, subtle photographic grain. Absolutely no illustration outlines, no painterly brush " +
  "strokes, no stylised eyes, no smoothed plastic skin. Treat the chosen style only as wardrobe, scene, " +
  "props and lighting direction — realise it as a real-world photo shoot.";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const image = String(body?.image ?? "");
    const styles: string[] = Array.isArray(body?.styles) ? body.styles.slice(0, 4).map(String) : [];
    const customPrompt = String(body?.customPrompt ?? "").slice(0, 300);
    const changeOutfit = body?.changeOutfit === true;
    const photoreal = body?.photoreal === true;
    const aspect = body?.aspect === "9:16" || body?.aspect === "16:9" ? body.aspect : "1:1";

    if (!image.startsWith("data:image/") && !/^https?:\/\//.test(image)) {
      return json({ error: "A photo is required." }, 400);
    }
    if (!styles.length) return json({ error: "Pick at least one style." }, 400);

    const cost = 3 * styles.length;
    // Charged per rendered style (3 credits each), so the unit auth is 3.
    const auth = await requireAiCredits(req, corsHeaders, {
      credits: 3,
      usageType: "photo_styler",
      description: `Photo styler: ${styles.join(", ")}`,
      rateLimit: { bucket: "photo_styler", max: 12, windowSec: 60 },
    });
    if (auth.errorResponse) return auth.errorResponse;
    if ((auth.credits ?? 0) < cost) {
      return json(
        { error: `Insufficient AI credits. Need ${cost}, have ${auth.credits ?? 0}.`, creditsRequired: cost },
        402,
      );
    }

    const results: { style: string; image?: string; error?: string }[] = [];
    for (const style of styles) {
      const stylePrompt = STYLE_PROMPTS[style];
      if (!stylePrompt) {
        results.push({ style, error: "Unknown style" });
        continue;
      }
      const prompt = `${changeOutfit ? OUTFIT_RULES : BASE_RULES}\n\nStyle: ${stylePrompt}.${
        customPrompt ? ` Extra direction: ${customPrompt}.` : ""
      }\n\nReminder: ${
        changeOutfit
          ? "the face identity, eye colour, hair colour and skin tone stay identical to the source photo; the outfit, accessories and background follow the chosen theme."
          : "the style affects only technique, texture and lighting treatment — the eye colour, hair colour, clothing (including sleeve length and neckline) and props stay identical to the source photo."
      }${photoreal ? REALISM_RULES : ""}`;
      try {
        const out = await tryVertexImage(prompt, aspect, 1, [image]);
        const b64 = out?.data?.[0]?.b64_json;
        if (b64) results.push({ style, image: `data:image/png;base64,${b64}` });
        else results.push({ style, error: "The image model returned nothing. Try again." });
      } catch (e) {
        results.push({ style, error: e instanceof Error ? e.message : "Generation failed" });
      }
    }

    const ok = results.filter((r) => r.image).length;
    if (!ok) {
      return json({ error: "Image model unavailable right now. No credits were used.", results }, 503);
    }

    // Charge only for the styles that actually rendered.
    for (let i = 0; i < ok; i++) {
      await auth.deduct!().catch((e) => console.error("[photo-styler] deduct failed:", e));
    }

    return json({ results, creditsSpent: ok * 3 });
  } catch (e) {
    console.error("[photo-styler] error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
