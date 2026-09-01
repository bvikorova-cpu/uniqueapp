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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const image = String(body?.image ?? "");
    const styles: string[] = Array.isArray(body?.styles) ? body.styles.slice(0, 4).map(String) : [];
    const customPrompt = String(body?.customPrompt ?? "").slice(0, 300);
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
      const prompt = `${BASE_RULES}\n\nStyle: ${stylePrompt}.${
        customPrompt ? ` Extra direction: ${customPrompt}.` : ""
      }\n\nReminder: the style affects only technique, texture and lighting treatment — the eye colour, hair colour, clothing (including sleeve length and neckline) and props stay identical to the source photo.`;
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
