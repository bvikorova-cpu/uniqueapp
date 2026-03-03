import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Not authenticated');
    }

    const { imageUrl, effectId, effectName } = await req.json();

    if (!imageUrl || !effectId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: credits } = await supabaseClient
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.credits_remaining < 3) {
      return new Response(
        JSON.stringify({ error: 'Insufficient AI credits. Need 3 credits for AI effect.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const effectPrompts: Record<string, string> = {
      'kungfu-club': 'Transform into a dynamic kung-fu action pose with martial arts stance, energy effects, and action movie fighting atmosphere',
      'holy-wings': 'Add beautiful large angel wings sprouting from the person\'s back with divine glow, feathers, and celestial holy atmosphere',
      'sheep-curls': 'Transform the hair into fluffy, curly sheep-like wool texture with bouncy spiral curls covering the head',
      'ai-muscle-generator': 'Transform the body to show enhanced muscular definition, athletic physique, defined abs, and strong toned appearance',
      'squish-it': 'Create a squished, compressed cartoon effect where the person appears flattened or squeezed with exaggerated proportions',
      'hair-growth-magic': 'Create a magical hair growth transformation showing long, flowing, luxurious hair extending dramatically from the head',
      'become-male': 'Transform appearance to masculine features including angular jawline, masculine facial structure, short hair, and male characteristics',
      'alive-art': 'Transform into a living painting or artwork with visible brush strokes, artistic texture, and fine art museum quality aesthetic',
      'become-female': 'Transform appearance to feminine features including softer face shape, longer hair, feminine facial features, and delicate characteristics',
      'anything-robot': 'Transform into a futuristic android/robot version with metallic surfaces, glowing LED lights, mechanical joints, and sci-fi cybernetic appearance',
      'magic-sparkle': 'Add magical sparkles and glitter floating around the person with enchanted fairy atmosphere and mystical glow',
      'cyborg-transform': 'Transform into a cyborg with robotic parts, cybernetic enhancements, LED lights, and futuristic sci-fi aesthetic',
      'snow-globe': 'Place the person inside a magical snow globe with falling snow, winter wonderland atmosphere, and glass sphere effect',
      'butterfly-wings': 'Add beautiful colorful butterfly wings emerging from the back with vibrant nature transformation',
      'vampire-mode': 'Transform into a vampire with dramatic gothic atmosphere, pale skin, fangs, and dark mysterious aesthetic',
      'plushie-party': 'Surround the person with cute kawaii plushies and stuffed animals in pastel colors creating cheerful scene',
      'rainbow-aura': 'Add a vibrant rainbow-colored aura glowing around the person with colorful light effects',
      'zombie-walk': 'Transform into a zombie with horror movie aesthetic, tattered clothes, and undead appearance',
      'superhero-landing': 'Create a dramatic superhero landing pose with impact effects and heroic atmosphere',
      'crystal-freeze': 'Transform the person into crystal ice sculpture with frozen effects and translucent appearance',
      'dragon-rider': 'Show the person riding a majestic dragon with epic fantasy atmosphere and mythical creature',
      'mermaid-tail': 'Transform lower body into a beautiful mermaid tail with underwater ocean aesthetic',
      'ninja-stealth': 'Transform into a ninja with stealth pose, dark outfit, and martial arts atmosphere',
      'fairy-godmother': 'Transform into a fairy godmother with magical wand, sparkles, and enchanted appearance',
      'pirate-adventure': 'Transform into a pirate with adventure atmosphere, treasure, and nautical theme',
      'neon-glow': 'Add vibrant neon glow effects with bright electric colors and futuristic cyberpunk aesthetic',
      'samurai-warrior': 'Transform into a samurai warrior with traditional armor, katana, and honorable stance',
      'candy-land': 'Surround with candy, lollipops, and sweet treats creating whimsical candy land scene',
      'time-freeze': 'Create time freeze effect with frozen motion, particles suspended in air',
      'fire-phoenix': 'Transform into a fire phoenix with blazing wings, flames, and rebirth symbolism',
      'ice-queen': 'Transform into an ice queen with frost crown, icy dress, and winter royalty aesthetic',
      'galaxy-portal': 'Create a swirling galaxy portal effect with cosmic colors and space-time distortion',
      'steampunk': 'Transform into steampunk style with Victorian gears, brass, and industrial aesthetic',
      'baby-filter': 'Transform face to baby-like appearance with cute chubby cheeks and innocent look',
      'old-age': 'Age the person showing elderly appearance with wrinkles and mature features',
      'elf-ears': 'Add pointed elf ears with fantasy mystical appearance',
      'werewolf': 'Transform into a werewolf with fur, fangs, and lupine features',
      'astronaut-space': 'Transform into an astronaut floating in space with spacesuit and cosmic background',
      'pixel-art': 'Transform into retro pixel art style with blocky 8-bit video game aesthetic',
      'oil-painting': 'Transform into classical oil painting with visible brush strokes and fine art museum quality',
      'comic-book': 'Transform into comic book style with bold outlines, halftone dots, and pop art aesthetic',
      'hologram': 'Create holographic effect with translucent glowing appearance and futuristic projection',
      'ghost-spirit': 'Transform into a ghost spirit with translucent ethereal appearance and supernatural glow',
      'clown-makeup': 'Apply colorful clown makeup with exaggerated features and circus entertainer look',
      'tribal-paint': 'Add tribal face paint with indigenous patterns and cultural warrior aesthetic',
      'bunny-ears': 'Add cute bunny ears with fluffy texture and playful rabbit appearance',
      'cat-whiskers': 'Add cat whiskers, ears, and feline features with cute kitty appearance',
      'dog-filter': 'Add dog ears, nose, and tongue with playful puppy filter effect',
      'unicorn-horn': 'Add magical unicorn horn with rainbow colors and mystical creature transformation',
      'devil-horns': 'Add devil horns with dark red color and mischievous demonic appearance',
      'halo-angel': 'Add glowing angel halo above head with divine holy light',
      'matrix-code': 'Create Matrix movie effect with green cascading code and digital reality aesthetic',
      'sunflower-crown': 'Add beautiful sunflower crown with bright yellow flowers arranged in wreath',
      'rose-petals': 'Surround with falling rose petals creating romantic atmosphere',
      'confetti-blast': 'Create explosion of colorful confetti celebrating festive moment',
      'laser-eyes': 'Add laser beams shooting from eyes with intense energy effects',
      'fire-breath': 'Show fire breathing from mouth with dragon-like flame effects',
      'water-splash': 'Create dynamic water splash with the person in action, liquid droplets flying around them',
      'thunder-storm': 'Add dramatic thunder and lightning storm with electric bolts illuminating them',
      'cherry-blossom': 'Show the person surrounded by delicate pink cherry blossom petals floating in gentle spring breeze',
      'autumn-leaves': 'Show the person surrounded by falling autumn leaves in vibrant red, orange, yellow colors',
      'tropical-paradise': 'Transform into tropical paradise scene with palm trees, crystal clear turquoise water',
      'northern-lights': 'Show the person beneath spectacular aurora borealis northern lights',
      'shooting-star': 'Show the person watching a magical shooting star streaking across the sky',
      'crown-jewels': 'Add royal crown with precious jewels and diamonds transforming them into royalty',
      'earth-zoom-out': 'Create dramatic zoom-out perspective showing the person from space altitude',
      'earth-zoom-in': 'Create dramatic zoom-in perspective approaching the person from space',
      'minecraft': 'Transform into Minecraft aesthetic with blocky, pixelated cubic forms',
      'box-me': 'Transform the person into a simplified box-like geometric cartoon character',
      'paper-fall': 'Add colorful paper confetti falling all around creating celebratory atmosphere',
      'style-me': 'Apply fashionable style transformation with enhanced vibrant colors and trendy clothing',
      'ghibli': 'Transform into authentic Studio Ghibli anime art style with characteristic soft watercolor tones',
      'ai-couple-hugging': 'Create a warm, romantic scene showing two people in a tender embrace',
      'nap-me': 'Transform into a peaceful sleeping or napping scene with relaxed resting position',
      'spin-360': 'Create dynamic 360-degree spinning rotation effect showing multiple perspectives',
      'sexy-me': 'Apply attractive, confident transformation with enhanced facial features and glamorous styling',
      'gender-swap': 'Transform to opposite gender appearance while maintaining recognizable facial features',
      'smile': 'Transform the facial expression to show a bright, genuine, warm smile',
      'melt': 'Create surreal melting effect where the person appears to be liquefying',
      'bloom-magic': 'Add magical blooming flowers appearing and growing around the person',
      'paperman': 'Transform into paper-cut art style character with flat layered appearance',
      'pet-lovers': 'Add adorable pets interacting lovingly with the person',
      'send-roses': 'Create romantic scene with beautiful red roses being sent or floating around',
      'finger-heart': 'Add cute Korean-style finger heart gesture forming a small heart shape',
      'cartoon-doll': 'Transform into adorable cartoon doll character with big expressive eyes',
      'beast-companion': 'Add magical fantasy beast or mythical creature companion',
      'bloom-doorobear': 'Add cute Doraemon-style cartoon bear with blooming flowers',
      'french-kiss': 'Create romantic intimate kissing scene with passionate embrace',
      'whos-arrested': 'Create playful "getting arrested" scene in humorous way',
      'warmth-of-jesus': 'Create spiritual, divine scene with holy warm light and angelic atmosphere',
      'wild-laugh': 'Transform into exaggerated, wild, uncontrollable laughing face',
      'surprised': 'Transform into highly surprised, shocked face with wide eyes',
      'ai-kiss': 'Create romantic AI-generated kissing scene with soft lighting',
      'watercolor': 'Transform into beautiful watercolor painting style with soft blended colors',
      'pop-art': 'Transform into bold pop art style with bright vibrant colors and Ben-Day dots',
      'angel-wings': 'Add magnificent white feathered angel wings with divine glow',
      'demon-wings': 'Add dramatic dark bat-like demon wings with gothic shadows',
      'knight-armor': 'Transform into medieval knight wearing full plate armor',
      'samurai-armor': 'Transform into samurai warrior with traditional Japanese armor',
      'viking-warrior': 'Transform into Viking warrior with horned helmet and fur cloak',
      'pharaoh-gold': 'Transform into ancient Egyptian pharaoh with golden headdress',
      'greek-statue': 'Transform into classical Greek marble statue with white stone texture',
      'bronze-statue': 'Transform into bronze statue with metallic patina',
      'ice-sculpture': 'Transform into translucent ice sculpture with frozen crystalline texture',
      'stained-glass': 'Transform into beautiful stained glass window art with colorful glass pieces',
      'mosaic-tiles': 'Transform into mosaic tile art with small colored pieces',
      'origami-fold': 'Transform into origami paper folding art with visible creases',
      'paper-cutout': 'Transform into paper cutout silhouette art with layered shadows',
      'glitter-bomb': 'Surround with explosion of colorful glitter particles and sparkles',
      'cotton-candy': 'Surround with fluffy pink and blue cotton candy clouds',
      'masquerade': 'Add elegant Venetian masquerade mask with ornate decorations',
      'tiki-mask': 'Add tribal tiki mask with carved wood texture',
      'sugar-skull': 'Transform into Mexican Día de los Muertos sugar skull',
      'gothic-castle': 'Place person in front of dark Gothic castle with spires',
      'medusa-gaze': 'Transform hair into writhing snakes like Medusa',
      'kawaii-anime': 'Transform into adorable kawaii anime style with big sparkling eyes',
      'underwater-dream': 'Create underwater scene surrounded by bubbles and coral reef',
      'golden-touch': 'Transform into solid gold statue with shiny metallic golden surface',
      'time-traveler': 'Show as time traveler with clock gears swirling around',
      'neon-city': 'Place in futuristic neon city at night with glowing neon signs',
      'crystal-wings': 'Add transparent crystalline wings with faceted gem surfaces',
      'shadow-clone': 'Create multiple shadow duplicates in different positions',
      'flower-power': 'Surround with abundant colorful flowers blooming everywhere',
      'storm-warrior': 'Transform into storm warrior with lightning powers',
      'desert-mirage': 'Create desert mirage effect with heat waves and sand dunes',
      'ocean-wave': 'Show interacting with large ocean wave and dramatic water spray',
      'cosmic-energy': 'Show with cosmic energy aura surrounded by stars and nebula',
      'starlight': 'Show under twinkling starlight with magical celestial sparkle',
      'rainbow-bridge': 'Show standing on colorful rainbow bridge arcing across the sky',
      'cloud-nine': 'Show floating peacefully on fluffy white clouds in dreamy sky',
      'vintage-photo': 'Transform into vintage photograph with sepia tones and aged paper texture'
    };

    const prompt = effectPrompts[effectId] || `Apply ${effectName} effect to this image. Keep the person's face exactly the same.`;

    console.log('Applying effect:', effectId, 'with prompt:', prompt);

    console.log("Fetching original image...");
    const imageBase64 = await fetchImageAsBase64(imageUrl);

    const binaryString = atob(imageBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const imageBlob = new Blob([bytes], { type: 'image/png' });
    
    const formData = new FormData();
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
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const base64Image = data.data?.[0]?.b64_json;

    if (!base64Image) {
      throw new Error('No image generated');
    }

    const imageUrl_result = `data:image/png;base64,${base64Image}`;

    console.log('Effect applied successfully');

    await supabaseClient
      .from('ai_credits')
      .update({ 
        credits_remaining: credits.credits_remaining - 3,
        last_used_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    await supabaseClient
      .from('ai_usage_history')
      .insert({
        user_id: user.id,
        usage_type: 'ai_effect',
        credits_used: 3,
        description: `AI Effect: ${effectName || effectId}`
      });

    return new Response(
      JSON.stringify({ 
        imageUrl: imageUrl_result,
        creditsRemaining: credits.credits_remaining - 3
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error applying effect:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to apply effect' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
