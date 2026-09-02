import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { tryVertexImage } from "../_shared/vertexDirect.ts";
import { CAR_REFERENCE, MASCOT_REFERENCE } from "./brandReferences.ts";

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

  luxuryhomesit: "an elegant lifestyle portrait sitting in a luxury modern mansion interior, designer sofa, marble floor, tall windows with warm daylight, tasteful upscale outfit, shallow depth of field",
  marblevilla: "a refined portrait inside a marble villa with columns, gold accents and a grand staircase, soft cinematic lighting, luxury magazine mood",
  penthousewindow: "a portrait standing by a floor-to-ceiling penthouse window at golden hour, city skyline behind, elegant modern outfit, cinematic rim light",
  mirrorselfie: "a casual full-length mirror selfie taken with a smartphone, modern bedroom or boutique mirror, natural pose, phone visible in hand, realistic phone-camera look",
  casualselfie: "a natural selfie taken at arm's length in soft daylight, slightly wide-angle phone lens perspective, relaxed friendly expression, everyday realistic look",
  carselfie: "a selfie taken inside a modern car, seatbelt and window daylight, natural phone-camera perspective, casual stylish outfit",
  runwaymodel: "a high-fashion model walking a runway during a fashion show, designer outfit, catwalk lights, blurred audience and photographers, confident stride, editorial fashion photography",
  backstagemodel: "a backstage fashion-week portrait, clothing racks, mirrors with bulbs, stylists blurred in the background, couture outfit, candid editorial mood",
  magazinecover: "a glossy fashion magazine cover portrait, studio lighting, bold styling, professional retouch quality, clean composition with space for cover typography (do not add readable text)",
  vogueeditorial: "a high-end fashion editorial photograph, dramatic studio lighting, sculptural pose, designer styling, minimalist backdrop, printed-magazine quality",
  beautycloseup: "a beauty close-up portrait, flawless professional makeup, glowing skin, soft beauty-dish lighting, catchlights in the eyes, cosmetics-campaign quality",
  glammakeover: "a full glam makeover: professional evening makeup with contour, lashes and glossy lips, styled hair, elegant outfit, glamorous studio lighting — keep the same facial features and identity",
  newhairstyle: "a hair-salon transformation portrait with a fresh modern hairstyle and tasteful new hair colour, salon lighting, polished styling — same face and identity",
  naturalnomakeup: "a clean 'no-makeup makeup' portrait, dewy natural skin, minimal neutral tones, soft window light, fresh skincare-campaign look",
  studioheadshot: "a professional studio portrait on a seamless backdrop, three-point lighting, sharp focus on the eyes, polished but natural retouch",
  blackwhiteportrait: "a fine-art black and white portrait, dramatic chiaroscuro lighting, rich grain, deep contrast, timeless gallery mood",

  uniquephone: "a lifestyle photo of the person holding a modern smartphone towards the camera; the phone screen clearly shows the Unique app open, displaying the official Unique app logo: a glossy rounded-square icon with a smooth gradient from violet-purple (left) to hot pink (right), a large white calligraphic script letter 'U' centred on it and a bright four-point white sparkle star at the top right of the U. Directly UNDER the logo render the exact clean sans-serif text 'www.uniqueapp.fun' — spelled exactly that way, sharp and perfectly legible. Bright natural lighting, sharp screen, realistic reflections",
  uniquetshirt: "a lifestyle photo of the person wearing a clean white or black T-shirt printed on the chest with the official Unique app logo: a glossy rounded-square icon with a smooth gradient from violet-purple (left) to hot pink (right), a large white calligraphic script letter 'U' centred on it and a bright four-point white sparkle star at the top right of the U. Directly UNDER the logo render the exact clean sans-serif text 'www.uniqueapp.fun' — spelled exactly that way, sharp and perfectly legible. Studio-quality lighting, the print is flat on the fabric, undistorted and fully readable",
  uniqueflag: "a photo of the person proudly waving a large fabric flag in the wind; the flag shows the official Unique app logo: a glossy rounded-square icon with a smooth gradient from violet-purple (left) to hot pink (right), a large white calligraphic script letter 'U' centred on it and a bright four-point white sparkle star at the top right of the U. Directly UNDER the logo render the exact clean sans-serif text 'www.uniqueapp.fun' — spelled exactly that way, sharp and perfectly legible. Outdoor golden-hour light, dynamic joyful pose",
  uniquemascot: "a fun photo with a strict left-right composition: the walking brand mascot stands on the LEFT side of the frame and every person from the user photo stands on the RIGHT side of the frame. The mascot is a full-body plush character in a purple-to-hot-pink gradient: a big rounded head shaped like the Unique logo tile with a large white calligraphic script 'U' and a white four-point sparkle on the front of the head, plus a chubby plush body, two short arms with mitten hands and two short legs with big soft feet, standing upright at human height, waving one hand at the camera. The head has NO eyes, NO mouth, NO nose, NO facial features at all, and the mascot's body carries NO text or website address - only the U and the sparkle. CRITICAL: the people are NOT in costume. Keep each person's own normal everyday clothing exactly as in the user photo - never add a clown, jester, harlequin, circus, carnival or mascot costume, never add hats, colourful patchwork, stripes, bells or face paint to any person. Only the mascot is a costumed character. Directly under the mascot render the official Unique app logo: a glossy rounded-square icon with a smooth gradient from violet-purple (left) to hot pink (right), a large white calligraphic script letter 'U' centred on it and a bright four-point white sparkle star at the top right of the U, and the exact clean sans-serif text 'www.uniqueapp.fun' - spelled exactly that way, sharp and perfectly legible. Cheerful bright realistic scene, everyone facing camera",
  uniquebillboard: "a photo of the person standing on a city street in front of a huge advertising billboard displaying the official Unique app logo: a glossy rounded-square icon with a smooth gradient from violet-purple (left) to hot pink (right), a large white calligraphic script letter 'U' centred on it and a bright four-point white sparkle star at the top right of the U. Directly UNDER the logo render the exact clean sans-serif text 'www.uniqueapp.fun' — spelled exactly that way, sharp and perfectly legible. Evening urban lighting, the billboard glows, text is crisp and perfectly readable",
  uniquefanselfie: "an enthusiastic fan selfie: the person smiles at the camera holding up a phone or card showing the official Unique app logo: a glossy rounded-square icon with a smooth gradient from violet-purple (left) to hot pink (right), a large white calligraphic script letter 'U' centred on it and a bright four-point white sparkle star at the top right of the U. Directly UNDER the logo render the exact clean sans-serif text 'www.uniqueapp.fun' — spelled exactly that way, sharp and perfectly legible, with subtle purple-pink brand lighting around them, modern social-media look",
  uniquecar: "a lifestyle photo of every person from the user photo together beside a sleek modern car wrapped in glossy Unique brand colours — violet-purple to hot-pink gradient — with the official Unique app logo on the driver's door: a glossy rounded-square icon with a smooth gradient from violet-purple (left) to hot pink (right), a large white calligraphic script letter 'U' centred on it and a bright four-point white sparkle star at the top right of the U. Directly UNDER the logo render the exact clean sans-serif text 'www.uniqueapp.fun' — spelled exactly that way, sharp and perfectly legible. Sunny outdoor location, natural confident poses, the logo and website text are crisp and readable",
  uniquecoffee: "a lifestyle photo of the person holding a takeaway coffee cup branded with the official Unique app logo: a glossy rounded-square icon with a smooth gradient from violet-purple (left) to hot pink (right), a large white calligraphic script letter 'U' centred on it and a bright four-point white sparkle star at the top right of the U. Directly UNDER the logo render the exact clean sans-serif text 'www.uniqueapp.fun' — spelled exactly that way, sharp and perfectly legible. Café terrace or bright workspace background, natural light, the logo and website text are sharp on the cup sleeve",
  uniquecap: "a lifestyle photo of the person wearing a trendy baseball cap embroidered with the official Unique app logo: a glossy rounded-square icon with a smooth gradient from violet-purple (left) to hot pink (right), a large white calligraphic script letter 'U' centred on it and a bright four-point white sparkle star at the top right of the U. Directly UNDER the logo render the exact clean sans-serif text 'www.uniqueapp.fun' — spelled exactly that way, sharp and perfectly legible. Casual streetwear outfit, urban background, the logo and website text are clearly visible on the front of the cap",
  uniqueposter: "a photo of the person posing in front of a wall covered with stylish promotional posters; the largest poster shows the official Unique app logo: a glossy rounded-square icon with a smooth gradient from violet-purple (left) to hot pink (right), a large white calligraphic script letter 'U' centred on it and a bright four-point white sparkle star at the top right of the U. Directly UNDER the logo render the exact clean sans-serif text 'www.uniqueapp.fun' — spelled exactly that way, sharp and perfectly legible. Editorial street-style lighting, the website text is perfectly readable",
  uniquetote: "a lifestyle photo of the person carrying a canvas tote bag printed with the official Unique app logo: a glossy rounded-square icon with a smooth gradient from violet-purple (left) to hot pink (right), a large white calligraphic script letter 'U' centred on it and a bright four-point white sparkle star at the top right of the U. Directly UNDER the logo render the exact clean sans-serif text 'www.uniqueapp.fun' — spelled exactly that way, sharp and perfectly legible. Modern city street or market background, natural daylight, the logo and website text are flat and fully readable on the bag",
  uniquelaptop: "a lifestyle photo of the person working at a laptop with a glowing screen and stickers; the laptop lid and screen clearly show the official Unique app logo: a glossy rounded-square icon with a smooth gradient from violet-purple (left) to hot pink (right), a large white calligraphic script letter 'U' centred on it and a bright four-point white sparkle star at the top right of the U. Directly UNDER the logo render the exact clean sans-serif text 'www.uniqueapp.fun' — spelled exactly that way, sharp and perfectly legible. Bright coworking space or home desk, natural window light, the logo and website text are crisp",
};


/** Object-only brand references. They deliberately contain no person whose identity could leak into output. */
const STYLE_REFS: Record<string, string> = {
  uniquemascot: MASCOT_REFERENCE,
  uniquecar: CAR_REFERENCE,
};

const BASE_RULES =
  "Restyle EVERY person in the supplied photo. Preserve the exact number of people and each distinct identity. Only the rendering medium/art style may change — " +
  "everything else must stay faithful to the source photo.\n" +
  "For every person copy exactly, do not reinterpret or beautify: face identity and proportions, EYE COLOR, eyebrow and " +
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
  "Restyle EVERY person in the supplied photo. Preserve the exact number of people and each distinct identity. The art style, OUTFITS and scene may change to " +
  "match the chosen theme.\n" +
  "For every person copy exactly, do not reinterpret or beautify: face identity and proportions, EYE COLOR, eyebrow and " +
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
          ? "every person's face identity, eye colour, hair colour and skin tone stay identical to the source photo; outfits, accessories and background follow the chosen theme."
          : "the style affects only technique, texture and lighting treatment — every person's eye colour, hair colour, clothing (including sleeve length and neckline) and props stay identical to the source photo."
      }${photoreal ? REALISM_RULES : ""}`;
      try {
        const ref = STYLE_REFS[style];
        const refPrompt = ref
          ? `${prompt}\n\nTWO IMAGES ARE SUPPLIED AND EACH IS LABELLED.\nUSER SOURCE PHOTO is the sole identity and people source. Preserve EVERY person visible in it. Keep the exact number of people, their distinct faces, ages, genders, skin tones, hair and family grouping. Do not omit, merge or replace anyone.\nBRAND REFERENCE is an object/branding reference only. Copy only the mascot or car design, purple-to-hot-pink gradient, white calligraphic 'U' with sparkle, logo tile and website placement.\nABSOLUTE EXCLUSION: ignore and remove the girl shown in the BRAND REFERENCE. She is not a subject and must never appear, be copied, blended, mirrored, or influence any face, body, hair, clothes or pose. All humans in the result must come only from USER SOURCE PHOTO. Never print text on the mascot's body.`
          : prompt;
        const inputs = ref
          ? [
            { label: "USER SOURCE PHOTO — use ALL people from this image as the only human subjects:", image },
            { label: "OBJECT-ONLY BRAND REFERENCE — copy ONLY the mascot/car and branding. It contains no human subject:", image: ref },
          ]
          : [image];
        const out = await tryVertexImage(refPrompt, aspect, 1, inputs);
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
