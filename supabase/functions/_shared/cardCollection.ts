import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { deductAICredits, refundAICredits } from "./credits.ts";
import { generateOpenAIImage } from "./unifiedAI.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DRAW_COST = 1;
const CARDS_PER_CATEGORY = 150;
/** The very last missing card of a set stays scarce, but reachable. */
const FINAL_TARGET_DRAWS = 400;
/** Owned cards are far LESS likely than missing ones (weight < 1 = rarer). */
const DUPLICATE_WEIGHT = 0.15;

function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

const admin = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

const ORIGINALITY =
  "Completely original design — must not copy or resemble any existing trademarked character, brand, logo or celebrity " +
  "likeness. No text, no watermark, no signature.";

/** Stable hash so every card code always maps to the same variation set. */
function codeHash(code: string): number {
  let h = 2166136261;
  for (let i = 0; i < code.length; i++) {
    h ^= code.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const pick = <T,>(list: T[], seed: number, salt: number): T =>
  list[(Math.floor(seed / Math.pow(7, salt)) + salt * 31) % list.length];

/** Generic variation axes so no two cards in a set look alike. */
const COMPOSITIONS = [
  "tight head-and-shoulders close-up, shallow depth of field",
  "full-body wide shot, subject small against a vast landscape",
  "dynamic low-angle hero shot looking upward",
  "high-angle bird's-eye view",
  "three-quarter profile portrait, off-centre composition",
  "side profile silhouette against a bright sky",
  "extreme close-up on the eye and face detail",
  "motion-blurred action shot mid-movement",
  "symmetrical centred emblem-style composition",
  "diagonal dutch-angle cinematic framing",
];
const LIGHT_MOODS = [
  "golden-hour sunset backlight", "cold blue moonlit night", "harsh midday desert sun",
  "misty overcast dawn", "stormy sky with lightning", "warm dusty stable lamplight",
  "neon-tinged twilight", "soft pastel morning haze", "dramatic single spotlight in darkness",
  "snowy diffused winter light",
];
const PALETTES = [
  "warm amber and rust palette", "cool teal and steel palette", "monochrome charcoal palette",
  "emerald green and gold palette", "crimson and black palette", "violet and rose palette",
  "sandy ochre and turquoise palette", "icy white and pale blue palette",
  "sepia vintage palette", "vivid tropical multicolour palette",
];
const RENDER_STYLES = [
  "oil-painted realism", "clean vector poster art", "gritty ink-and-wash sketch",
  "airbrushed retro 80s trading-card art", "hyper-detailed photorealistic render",
  "watercolour with soft bleeding edges", "bold graphic-novel comic inking",
  "cinematic 3D render with volumetric light", "art-deco stylised illustration",
  "impressionistic loose brushwork",
];
const CARD_FORMATS = [
  "portrait vertical card layout", "landscape horizontal card layout",
  "square card layout", "vertical card with a thin decorative border",
  "borderless full-bleed card art", "framed vignette card layout",
];

/** Horse-specific axes — coats, breeds, tack and settings that read very differently. */
const HORSE_COATS = [
  "jet-black coat with a blue sheen", "snow-white grey coat", "dappled steel-grey coat",
  "chestnut coat with a flaxen mane", "golden palomino coat", "buckskin coat with black points",
  "bright copper sorrel coat", "dark liver-chestnut coat", "bay coat with a white blaze",
  "blue roan coat", "strawberry roan coat", "black-and-white tobiano pinto coat",
  "chestnut-and-white overo pinto coat", "leopard-spotted appaloosa coat",
  "blanket appaloosa coat with speckled hindquarters", "cremello near-white coat with pink muzzle",
  "silver dapple coat", "smoky black coat", "champagne gold coat", "brindle-patterned coat",
];
const HORSE_BREEDS = [
  "lean Thoroughbred racer", "compact muscular Quarter Horse", "elegant dished-faced Arabian",
  "powerful Standardbred trotter", "tall Hanoverian sport horse", "fine-boned Akhal-Teke with metallic sheen",
  "stocky Icelandic horse with a thick mane", "spirited Andalusian with a flowing crest",
  "feather-legged Friesian", "wiry Mustang", "long-maned Gypsy Vanner", "agile Marwari with curved ears",
];
const HORSE_SETTINGS = [
  "thundering down a packed turf racetrack", "galloping through shallow sea surf",
  "standing in a misty green paddock", "rearing on a rocky mountain ridge",
  "trotting through a snowy pine forest", "in a sunlit stone stable doorway",
  "crossing a dusty desert plain", "leaping a hedge on a steeplechase course",
  "walking through tall golden wheat", "under floodlights at a night race meeting",
  "splashing across a shallow river", "in a grand parade ring with blurred crowds",
];
const HORSE_DETAILS = [
  "braided mane with silk ribbons", "wind-tangled loose mane", "close-cropped hogged mane",
  "racing bridle and numbered saddle cloth", "ornate ceremonial harness", "bare with no tack at all",
  "leather blinkers and racing silks colours", "flowered victory garland around the neck",
  "sweat-flecked flanks and flaring nostrils", "dust and turf kicked up around the hooves",
];

/** Sport-specific axes so every athlete card reads as a different person. */
const ATHLETE_BUILDS = [
  "tall lean build", "stocky powerhouse build", "wiry athletic build", "broad-shouldered heavy build",
  "compact explosive build", "long-limbed graceful build", "muscular veteran build", "youthful slender build",
];
const ATHLETE_LOOKS = [
  "short cropped dark hair and a focused stare", "long blond hair tied back in a bun",
  "shaved head and a thick beard", "curly afro hair and a wide grin",
  "silver-streaked hair and weathered face", "braided hair with a sweatband",
  "red hair with freckles", "black ponytail and taped nose",
  "buzz cut with a scar over one eyebrow", "moustache and squinting sun-lined eyes",
  "dreadlocks pulled into a knot", "slick wet hair after rain",
];
const KIT_COLOURS = [
  "royal blue and white kit", "scarlet red and black kit", "emerald green and gold kit",
  "sunflower yellow and navy kit", "purple and silver kit", "orange and charcoal kit",
  "teal and cream kit", "maroon and grey kit", "sky blue and copper kit", "monochrome black kit",
];
/** Beauty / fashion / princess / fairytale axes so every character reads as a different person. */
const STYLE_FACES = [
  "deep brown skin and short coiled hair", "pale freckled skin and copper waves",
  "olive skin and long jet-black braid", "golden-tan skin and platinum bob",
  "dark skin and locs pinned with gold cuffs", "fair skin and auburn ringlets",
  "warm beige skin and sleek raven ponytail", "bronze skin and silver-grey pixie cut",
  "porcelain skin and honey-blonde chignon", "amber skin and voluminous curls",
  "cool-toned skin and blue-black undercut", "sun-freckled skin and sandy braids",
];
const STYLE_OUTFITS = [
  "sculptural feathered gown", "structured metallic trench", "flowing silk cape dress",
  "beaded velvet corset gown", "layered tulle ballgown", "tailored pinstripe suit",
  "embroidered brocade robe", "asymmetric draped jersey dress", "lace-panelled column dress",
  "quilted patchwork coat", "sequinned mirror-tiled dress", "hand-painted floral kimono",
];
const STYLE_SETTINGS = [
  "marble palace staircase", "misty rose garden at dawn", "glass conservatory full of ferns",
  "candle-lit ballroom", "seaside cliff terrace", "snowy courtyard with lanterns",
  "gilded mirrored hall", "moonlit lakeside jetty", "backstage corridor of a theatre",
  "wildflower meadow at golden hour", "cobbled village square at dusk", "starry balcony above a city",
];
const STYLE_DETAILS = [
  "pearl-drop earrings", "jewelled tiara", "gilded hand fan", "embroidered gloves",
  "flower crown of wild roses", "long silk ribbon in the hair", "antique locket",
  "beaded headpiece", "single dramatic feather", "delicate gold chain veil",
];

/** Kids-collectible axes — soft cartoon variety for very young collectors. */
const KIDS_COLOURS = [
  "sunny yellow and mint", "bubblegum pink and cream", "sky blue and white",
  "grass green and lemon", "peach and lavender", "turquoise and coral",
  "strawberry red and vanilla", "soft purple and butter yellow",
  "orange and pale blue", "pastel rainbow mix",
];
const KIDS_POSES = [
  "waving happily with one paw up", "jumping in the air with joy",
  "sitting down giggling", "peeking out from behind a flower",
  "hugging a tiny plush toy", "napping curled up with a smile",
  "balancing on one foot", "holding a colourful balloon",
  "clapping with both hands", "sliding down a tiny rainbow",
];
const KIDS_SETTINGS = [
  "sunny flowery meadow", "cosy bedroom with toys", "friendly little playground",
  "fluffy cloud in a blue sky", "birthday party with bunting",
  "shallow puddle after rain", "cheerful picnic blanket",
  "sandcastle beach", "snowy garden with a tiny snowman",
  "starry night nursery window",
];
const KIDS_EXTRAS = [
  "wearing a tiny party hat", "with a polka-dot bow", "with a striped scarf",
  "holding a little flower", "with rosy cheeks and freckles", "with a small backpack",
  "with a shiny star sticker", "wearing spotty wellies",
  "with a tiny crown of daisies", "with a chunky knitted jumper",
];
const KIDS_SLUGS = [
  "kids-dino-pals", "kids-rescue-heroes", "kids-pony-sparkles", "kids-jungle-babies",
  "kids-space-kiddos", "kids-sweet-treats", "kids-sea-buddies", "kids-super-kiddos",
  "kids-farm-friends", "kids-garden-bugs",
];

// Cinematic 3D animated-movie kids sets (glossy animated-film render).
const KIDS3D_SLUGS = [
  "kids3d-magic-pets", "kids3d-unicorn-kingdom", "kids3d-fairy-blossoms",
  "kids3d-baby-dragons", "kids3d-robot-mates", "kids3d-dino-explorers",
];

const KIDS3D_POSES = [
  "sitting happily and tilting its head", "mid-hop with a joyful smile",
  "peeking out from behind glowing flowers", "looking up in wonder at sparkles",
  "waving one paw at the viewer", "cuddling a tiny friend", "stretching after a nap",
  "dancing on tiptoes", "curled up cosily", "running with a big grin",
];
const KIDS3D_SETTINGS = [
  "sunlit fantasy meadow with soft bokeh", "pastel cloud kingdom at golden hour",
  "glowing blossom garden with dew drops", "bright crystal cave with rainbow light",
  "cheerful jungle valley with waterfalls", "starry night sky with soft moonlight",
  "colourful toy workshop with warm lamps", "shallow turquoise lagoon at sunrise",
];
const KIDS3D_ACCENTS = [
  "shimmering pastel rainbow highlights", "tiny floating light sparkles",
  "iridescent pearly sheen", "soft glowing fur rim light",
  "candy-bright colour accents", "gentle golden sun flares",
];

/** Motorsport axes — each machine reads as a different car/bike, livery and race moment. */
const RACE_SLUGS = [
  "grand-prix-machines", "rally-warriors", "endurance-hypercars",
  "drift-street-kings", "superbike-legends",
];
const RACE_LIVERIES = [
  "matte black livery with acid-green accents", "papaya orange and gunmetal livery",
  "deep navy livery with copper pinstripes", "white livery with red sunburst stripes",
  "candy-apple red livery with gold rims", "teal and cream retro-heritage livery",
  "purple-to-pink chrome fade livery", "raw carbon-fibre finish with yellow highlights",
  "silver arrow bare-metal livery", "military olive livery with orange arrows",
  "electric blue livery with white lightning graphics", "graffiti-splash multicolour livery",
];
const RACE_MOMENTS: Record<string, string[]> = {
  "grand-prix-machines": [
    "flat out through a floodlit night chicane with sparks under the floor",
    "kerb-hopping over red-and-white kerbs mid-corner",
    "leaving the pitlane with the crew blurred behind",
    "slicing through spray in heavy rain with a rooster tail of water",
    "wheel-to-wheel down a long straight in a slipstream battle",
    "locking a front tyre under braking with smoke off the rubber",
    "crossing the line as the chequered flag waves",
    "parked on the grid under heat haze with tyre blankets",
  ],
  "rally-warriors": [
    "airborne over a gravel crest with dust exploding behind",
    "sliding sideways through a muddy forest hairpin",
    "blasting through deep snow with studded tyres",
    "night stage lit by a roof light-pod through fog",
    "throwing gravel across a mountain switchback",
    "splashing through a shallow ford at speed",
    "kicking dust across a desert piste at sunset",
    "tackling a narrow tarmac stage between stone walls",
  ],
  "endurance-hypercars": [
    "streaking under floodlights at 3am with glowing brake discs",
    "cutting through rain with headlights flaring",
    "sweeping past the pit wall with a long-exposure light trail",
    "dawn stint with mist over the circuit",
    "double-stinting past a slower car in the Esses",
    "in the lit pit box during a driver change",
    "on the banking of a high-speed oval section",
    "under a dark sky with the grandstand lights glittering",
  ],
  "drift-street-kings": [
    "full-lock drift through a neon-soaked city intersection",
    "tandem drift with tyre smoke filling a mountain pass",
    "sliding across wet asphalt reflecting pink and cyan signs",
    "smoky donut in an empty rooftop car park",
    "entering a downhill hairpin with the rear stepped out",
    "clipping a wall with sparks under streetlights",
    "burnout on the start line with the crowd blurred",
    "night touge run with headlight beams cutting through mist",
  ],
  "superbike-legends": [
    "knee and elbow down through a fast sunlit corner",
    "wheelie off the line with the front wheel high",
    "hard braking with the rear wheel lifting into a corner",
    "leaning through a wet corner with spray off the tyre",
    "crossing the line standing on the pegs in celebration",
    "slipstreaming inches behind a rival on the straight",
    "flicking through a chicane with the bike almost horizontal",
    "sunset session on a coastal circuit with long shadows",
  ],
};

const SPORT_SCENES: Record<string, string[]> = {
  "football-legends": [
    "striking the ball at a floodlit night stadium", "celebrating with arms wide on wet turf",
    "sliding tackle with grass flying", "diving save in a packed goalmouth",
    "heading the ball above defenders", "dribbling past a blurred opponent in the rain",
    "walking out of the tunnel through smoke", "free-kick stance behind a wall of players",
  ],
  "basketball-legends": [
    "mid-air dunk with the rim shaking", "crossover dribble on a sunlit street court",
    "fadeaway jumper over a defender", "block at the rim with squeaking hardwood",
    "free-throw focus in a hushed arena", "fast-break sprint with motion blur",
    "post-up battle under the basket", "three-point release from the corner",
  ],
  "hockey-legends": [
    "carving a spray of ice at full speed", "slap shot from the blue line",
    "goaltender butterfly save with the puck frozen mid-air", "check against the glass boards",
    "face-off crouch at centre ice", "celebrating along the boards in a night arena",
    "breakaway alone on goal", "outdoor rink under falling snow",
  ],
  "tennis-legends": [
    "mid-serve leap on a blue hardcourt", "sliding forehand on red clay",
    "backhand down the line on grass", "diving volley at the net",
    "towel break under a bright sun with a packed crowd", "night match under stadium lights",
    "racquet raised in victory", "returning serve with knees bent low",
  ],
  "american-football-legends": [
    "quarterback throwing deep under night lights", "running back bursting through a gap",
    "one-handed sideline catch", "linebacker mid-tackle with dust flying",
    "helmet-off sideline portrait steaming in cold air", "field-goal kick with the ball spinning",
    "pre-snap stance in freezing fog", "sprint into the end zone with the crowd blurred",
  ],
  "baseball-legends": [
    "swinging for the fences on a sunny diamond", "pitcher mid-windup with a dust cloud",
    "sliding into second base", "diving outfield catch on the warning track",
    "catcher crouched behind the plate", "batter waiting in the on-deck circle",
    "dugout portrait chewing sunflower seeds", "night game under old floodlights",
  ],
  "golf-legends": [
    "driving off the tee at sunrise", "bunker escape with a spray of sand",
    "reading a long putt on a dewy green", "walking a windy seaside links",
    "punch shot out of the pines", "raising a putter after holing out",
    "iron shot over water with a mirrored reflection", "misty highland fairway in early light",
  ],
};

function cardPrompt(card: Record<string, any>, cat: Record<string, any>) {
  const seed = codeHash(String(card.code ?? card.id ?? card.name));
  const format = pick(CARD_FORMATS, seed, 1);
  const composition = pick(COMPOSITIONS, seed, 2);
  const light = pick(LIGHT_MOODS, seed, 3);
  const palette = pick(PALETTES, seed, 4);
  const render = pick(RENDER_STYLES, seed, 5);

  if (card.is_prime) {
    return `Golden premium collectible trading-card illustration of "${card.name}", the crowning Prime card of the ` +
      `${cat.name} collection (${cat.description}). Radiant gold-foil framing, glowing light rays, majestic centred ` +
      `composition, ${cat.art_style}, ultra premium collectible card aesthetic. ${ORIGINALITY}`;
  }

  // Horse collections get coat/breed/setting variety so no two racehorses look alike.
  if (String(cat.slug ?? "") === "legendary-racehorses") {
    return `${format}. Collectible trading-card illustration of "${card.name}", a one-of-a-kind ${pick(HORSE_BREEDS, seed, 6)} ` +
      `with a ${pick(HORSE_COATS, seed, 7)}, ${pick(HORSE_DETAILS, seed, 8)}, ${pick(HORSE_SETTINGS, seed, 9)}. ` +
      `${composition}, ${light}, ${palette}, ${render}, ${card.rarity} rarity energy accents. ` +
      `Make this horse visually unmistakably different from any other racehorse card — unique coat pattern, unique pose, ` +
      `unique environment and unique colour grading. ${ORIGINALITY}`;
  }

  // Motorsport collections: unique machine, livery and race moment per card.
  if (RACE_SLUGS.includes(String(cat.slug ?? ""))) {
    const moments = RACE_MOMENTS[String(cat.slug)] ?? RACE_MOMENTS["grand-prix-machines"];
    return `${format}. Collectible motorsport trading-card illustration of "${card.name}", a completely invented ` +
      `${card.subject} in a ${pick(RACE_LIVERIES, seed, 6)}, ${pick(moments, seed, 7)}. ` +
      `${cat.art_style}, ${composition}, ${light}, ${palette}, ${render}, ${card.rarity} rarity energy accents. ` +
      `The machine must look unmistakably different from every other card in the set — different silhouette, ` +
      `aero details, wheels, livery colours, angle and track environment. Fictional machine and fictional team only: ` +
      `no real manufacturer, no brand logos, no sponsor decals, no readable text or numbers. ${ORIGINALITY}`;
  }

  // Sports collections: give every athlete a different body, face, kit and match moment.
  const scenes = SPORT_SCENES[String(cat.slug ?? "")];
  if (scenes) {
    return `${format}. Collectible sports trading-card illustration of "${card.name}", a completely invented ` +
      `${card.subject} with a ${pick(ATHLETE_BUILDS, seed, 6)}, ${pick(ATHLETE_LOOKS, seed, 7)}, wearing a ` +
      `${pick(KIT_COLOURS, seed, 8)}, ${pick(scenes, seed, 9)}. ${cat.art_style}, ${composition}, ${light}, ` +
      `${palette}, ${render}, ${card.rarity} rarity energy accents. The athlete must look unmistakably different ` +
      `from every other card in the set — different face, body, skin tone, kit colours, pose and stadium. ` +
      `Fictional player only, never a real athlete, no team crests, no jersey numbers, no sponsor logos. ${ORIGINALITY}`;
  }

  // Kids Collectibles: gentle cartoon look, always safe and adorable.
  if (KIDS_SLUGS.includes(String(cat.slug ?? ""))) {
    return `${format}. Adorable cartoon collectible card illustration for young children of "${card.name}", ` +
      `a completely original friendly ${card.subject} from the ${cat.name} collection (${cat.description}), ` +
      `${pick(KIDS_POSES, seed, 6)}, ${pick(KIDS_EXTRAS, seed, 7)}, in a ${pick(KIDS_SETTINGS, seed, 8)}, ` +
      `${pick(KIDS_COLOURS, seed, 9)} colour scheme. ${cat.art_style}. Thick soft outlines, big friendly eyes, ` +
      `rounded shapes, cheerful and gentle, flat storybook cartoon look, absolutely nothing scary, ` +
      `no weapons, no blood, no realistic textures. Make this character clearly different from every other card ` +
      `in the set — different colours, pose, accessory and background. ${ORIGINALITY}`;
  }

  // Kids 3D Collectibles: glossy cinematic animated-movie look.
  if (KIDS3D_SLUGS.includes(String(cat.slug ?? ""))) {
    return `${format}. Glossy cinematic 3D animated-movie collectible card render for children of "${card.name}", ` +
      `a completely original adorable ${card.subject} from the ${cat.name} collection (${cat.description}), ` +
      `${pick(KIDS3D_POSES, seed, 6)}, in a ${pick(KIDS3D_SETTINGS, seed, 7)}, with ${pick(KIDS3D_ACCENTS, seed, 8)}. ` +
      `${cat.art_style}. feature-film animation quality, subsurface-scattering skin or fluffy fur detail, ` +
      `big shiny expressive eyes, chunky cute proportions, soft cinematic depth of field, physically based shading, ` +
      `sweet and gentle mood, absolutely nothing scary, no weapons, no blood, no text or logos. ` +
      `Make this character clearly different from every other card in the set — different colours, species detail, ` +
      `pose, accessory and background. ${ORIGINALITY}`;
  }

  // Beauty / fashion / princess / fairytale collections get their own look axes.
  if (["beauty-icons", "fashion-couture", "royal-princesses", "storybook-folk"].includes(String(cat.slug ?? ""))) {
    return `${format}. Collectible trading-card illustration of "${card.name}", a completely invented ` +
      `${card.subject} from the ${cat.name} collection (${cat.description}), with ` +
      `${pick(STYLE_FACES, seed, 6)}, wearing a ${pick(STYLE_OUTFITS, seed, 7)} and ` +
      `${pick(STYLE_DETAILS, seed, 8)}, in a ${pick(STYLE_SETTINGS, seed, 9)}. ` +
      `${cat.art_style}, ${composition}, ${light}, ${palette}, ${render}, ${card.rarity} rarity energy accents. ` +
      `Tasteful, fully clothed, elegant and family-friendly. The character must look unmistakably different from ` +
      `every other card in the set — different face, hair, outfit, pose and setting. ${ORIGINALITY}`;
  }

  return `${format}. Collectible trading-card illustration of "${card.name}", an original ${card.subject} from the ${cat.name} ` +
    `collection (${cat.description}). ${cat.art_style}, ${composition}, ${light}, ${palette}, ${render}, ` +
    `${card.rarity} rarity energy aura, epic detailed background. Make it visually distinct from every other card in the set. ${ORIGINALITY}`;
}


/** Card artwork through Vertex AI only. */
async function renderCardImage(prompt: string): Promise<{ b64_json?: string; url?: string }> {
  return await generateOpenAIImage(prompt, "1024x1024");
}

/** Generates the fixed card artwork once and caches it on the card row forever. */
async function ensureArtwork(card: Record<string, any>, cat: Record<string, any>): Promise<string | null> {
  if (card.image_url) return card.image_url as string;
  try {
    const img = await renderCardImage(cardPrompt(card, cat));
    let url: string | null = img.url ?? null;
    const db = admin();
    if (img.b64_json) {
      const bin = atob(img.b64_json);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const path = `collection-cards/${card.code}.png`;
      const { error: upErr } = await db.storage
        .from("ai-studio")
        .upload(path, bytes, { contentType: "image/png", upsert: true, cacheControl: "31536000" });
      if (upErr) throw upErr;
      url = db.storage.from("ai-studio").getPublicUrl(path).data.publicUrl;
    }
    if (url) await db.from("card_collectibles").update({ image_url: url }).eq("id", card.id);
    return url;
  } catch (e) {
    console.error("[card-collection] artwork failed", e);
    return null;
  }
}


async function getCategory(slug: string) {
  const { data } = await admin().from("card_categories").select("*").eq("slug", slug).maybeSingle();
  return data;
}

export async function handleCardCollection(req: Request, preparsed?: any): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    const token = auth.replace("Bearer ", "").trim();
    const isServiceCall = token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user } } = isServiceCall ? { data: { user: null } } : await anon.auth.getUser(token);

    const body = preparsed ?? (await req.json().catch(() => ({})));
    const action = String(body?.action ?? "draw");
    const category = String(body?.category ?? "");
    const db = admin();

    // Artwork backfill is free, idempotent and shared by everyone, so it does not
    // require a signed-in user; every other action does.
    if (!user && action !== "backfill_art") return j({ error: "Unauthorized" }, 401);

    const bodyCategories: string[] = Array.isArray(body?.categories)
      ? (body.categories as unknown[]).map((s) => String(s)).filter(Boolean)
      : [];

    if (action !== "keep" && action !== "backfill_art" && !category) {
      return j({ error: "Category is required" }, 400);
    }


    // ── Free artwork backfill so albums show real illustrations ────────────
    // Accepts a single `category` or a `categories` array so listing pages can
    // pre-generate artwork for every set before the user opens it.
    if (action === "backfill_art") {
      const slugs = bodyCategories.length ? bodyCategories : category ? [category] : [];
      if (!slugs.length) return j({ error: "Category is required" }, 400);
      const limit = Math.min(Math.max(Number(body?.limit ?? 8), 1), 12);

      const { data: cats } = await db
        .from("card_categories")
        .select("*")
        .in("slug", slugs);
      const catMap = new Map<string, any>((cats ?? []).map((c: any) => [c.slug, c]));
      if (!catMap.size) return j({ error: "Category not found" }, 404);

      const { data: missing } = await db
        .from("card_collectibles")
        .select("*")
        .in("category_slug", slugs)
        .is("image_url", null)
        .order("category_slug", { ascending: true })
        .order("card_index", { ascending: true })
        .limit(limit);

      // Vertex image quota is per-minute, so hammering it in parallel returns
      // 429 for most cards. Generate in small waves with a short pause and one
      // retry per card — far higher success rate than a single big Promise.all.
      const queue = (missing ?? []).filter((card: any) => catMap.has(card.category_slug));
      const deadline = Date.now() + 110_000;
      let generated = 0;
      const retryQueue: any[] = [];
      for (let i = 0; i < queue.length; i += 3) {
        if (Date.now() > deadline) break;
        const wave = queue.slice(i, i + 3);
        const res = await Promise.all(
          wave.map((card: any) => ensureArtwork(card, catMap.get(card.category_slug))),
        );
        res.forEach((url, idx) => { if (url) generated++; else retryQueue.push(wave[idx]); });
        if (i + 3 < queue.length) await new Promise((r) => setTimeout(r, 900));
      }
      for (const card of retryQueue) {
        if (Date.now() > deadline) break;
        await new Promise((r) => setTimeout(r, 700));
        if (await ensureArtwork(card, catMap.get(card.category_slug))) generated++;
      }
      const { count } = await db
        .from("card_collectibles")
        .select("id", { count: "exact", head: true })
        .in("category_slug", slugs)
        .is("image_url", null);
      return j({ generated, missing: count ?? 0 });
    }

    // ── Prime card: free reward for a completed set ────────────────────────
    if (action === "prime_status" || action === "claim_prime") {
      const cat = await getCategory(category);
      if (!cat) return j({ error: "Category not found" }, 404);

      const { data: prime } = await db
        .from("card_collectibles")
        .select("*")
        .eq("category_slug", category)
        .eq("is_prime", true)
        .maybeSingle();

      const { count: totalCards } = await db
        .from("card_collectibles")
        .select("id", { count: "exact", head: true })
        .eq("category_slug", category)
        .eq("is_prime", false);

      const { data: owned } = await db
        .from("user_card_collection")
        .select("collectible_id")
        .eq("user_id", user.id)
        .eq("category_slug", category)
        .limit(5000);
      const ownedIds = new Set((owned ?? []).map((r: any) => r.collectible_id));
      const claimed = prime ? ownedIds.has(prime.id) : false;
      const total = totalCards ?? CARDS_PER_CATEGORY;
      const uniqueOwned = [...ownedIds].filter((id) => !prime || id !== prime.id).length;
      const complete = total > 0 && uniqueOwned >= total;

      if (action === "prime_status") {
        return j({ complete, claimed, uniqueOwned, total, card: prime ? { ...prime } : null });
      }

      if (!prime) return j({ error: "This collection has no Prime card." }, 404);
      if (claimed) return j({ error: "You have already claimed this Prime card." }, 400);
      if (!complete) return j({ error: "Complete the whole set first — every card needs at least one copy." }, 400);

      const imageUrl = await ensureArtwork(prime, cat);
      const { error: insErr } = await db.from("user_card_collection").insert({
        user_id: user.id,
        collectible_id: prime.id,
        category_slug: category,
        credits_spent: 0,
      });
      if (insErr && !String(insErr.message).includes("duplicate")) {
        console.error("[card-collection] prime claim failed", insErr);
        return j({ error: "The Prime card could not be added, please try again." }, 500);
      }
      return j({ card: { ...prime, image_url: imageUrl } });
    }

    // ── Keep a drawn card (already paid at draw time) ──────────────────────
    if (action === "keep") {
      const collectibleId = String(body?.collectibleId ?? "");
      if (!collectibleId) return j({ error: "Card is required" }, 400);

      const { data: card } = await db
        .from("card_collectibles")
        .select("id, name, category_slug")
        .eq("id", collectibleId)
        .maybeSingle();
      if (!card) return j({ error: "Card not found" }, 404);

      const { data: existing } = await db
        .from("user_card_collection")
        .select("id, copies")
        .eq("user_id", user.id)
        .eq("collectible_id", collectibleId)
        .maybeSingle();

      if (existing) {
        const { error: updErr } = await db
          .from("user_card_collection")
          .update({ copies: (existing.copies ?? 1) + 1, credits_spent: DRAW_COST })
          .eq("id", existing.id);
        if (updErr) return j({ error: "Could not stack the duplicate, please try again." }, 500);
      } else {
        const { error: insErr } = await db.from("user_card_collection").insert({
          user_id: user.id,
          collectible_id: collectibleId,
          category_slug: card.category_slug,
          credits_spent: DRAW_COST,
        });
        if (insErr && !String(insErr.message).includes("duplicate")) {
          console.error("[card-collection] keep failed", insErr);
          return j({ error: "Could not save the card, please try again." }, 500);
        }
      }

      const { data: counter } = await db
        .from("card_collectibles")
        .select("times_collected")
        .eq("id", collectibleId)
        .maybeSingle();
      await db
        .from("card_collectibles")
        .update({ times_collected: (counter?.times_collected ?? 0) + 1 })
        .eq("id", collectibleId);
      return j({ ok: true, name: card.name });
    }

    // ── Draw ───────────────────────────────────────────────────────────────
    const cat = await getCategory(category);
    if (!cat) return j({ error: "Category not found" }, 404);

    // Seasonal / event collections can only be drawn inside their window.
    const nowMs = Date.now();
    if (cat.available_from && nowMs < new Date(cat.available_from).getTime()) {
      return j({ error: "This limited-time collection has not opened yet." }, 400);
    }
    if (cat.available_until && nowMs > new Date(cat.available_until).getTime()) {
      return j({ error: "This limited-time collection has closed — keep the cards you already own." }, 400);
    }


    const { data: pool } = await db
      .from("card_collectibles")
      .select("*")
      .eq("category_slug", category)
      .eq("is_prime", false)
      .order("card_index", { ascending: true });
    if (!pool || pool.length === 0) return j({ error: "This collection is empty." }, 404);

    const denied = await deductAICredits(user.id, DRAW_COST, "collection_card_draw");
    if (denied) return denied;

    const { data: balRow } = await db.from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    const after = balRow?.credits_remaining ?? 0;
    await db.from("ai_credits_ledger").insert({
      user_id: user.id,
      delta: -DRAW_COST,
      balance_before: after + DRAW_COST,
      balance_after: after,
      reason: `collection_card_draw:${category}`,
      source: "card_collections",
    });

    try {
      const { data: owned } = await db
        .from("user_card_collection")
        .select("collectible_id, copies")
        .eq("user_id", user.id)
        .eq("category_slug", category)
        .limit(5000);
      const ownedIds = new Set((owned ?? []).map((r: any) => r.collectible_id));
      const drawsSoFar = (owned ?? []).reduce((a: number, r: any) => a + (r.copies ?? 1), 0) + 1;

      let eligible = pool;
      const missing = pool.filter((c: any) => !ownedIds.has(c.id));
      if (missing.length === 1 && pool.length > 1) {
        let reveal = false;
        if (drawsSoFar >= FINAL_TARGET_DRAWS) reveal = true;
        else if (drawsSoFar > FINAL_TARGET_DRAWS - 200) {
          reveal = Math.random() < 1 / (FINAL_TARGET_DRAWS - drawsSoFar + 1);
        }
        if (!reveal) eligible = pool.filter((c: any) => c.id !== missing[0].id);
      }

      const weights = eligible.map((c: any) => (ownedIds.has(c.id) ? DUPLICATE_WEIGHT : 1));
      const totalWeight = weights.reduce((a: number, b: number) => a + b, 0);
      let roll = Math.random() * totalWeight;
      let card = eligible[eligible.length - 1];
      for (let i = 0; i < eligible.length; i++) {
        roll -= weights[i];
        if (roll <= 0) { card = eligible[i]; break; }
      }

      const imageUrl = await ensureArtwork(card, cat);
      return j({
        card: { ...card, image_url: imageUrl },
        creditsUsed: DRAW_COST,
        remaining: after,
        poolSize: pool.length,
      });
    } catch (e) {
      await refundAICredits(user.id, DRAW_COST, "collection_card_draw");
      console.error("[card-collection] draw failed", e);
      return j({ error: "The draw failed and your credit was refunded — please try again." }, 502);
    }
  } catch (e) {
    return j({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
}
