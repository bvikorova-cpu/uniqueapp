import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, effectId, effectName } = await req.json();

    if (!imageUrl || !effectId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Define effect prompts with detailed, specific instructions for better AI results
    const effectPrompts: Record<string, string> = {
      'sway-dance': 'Apply a smooth dancing animation effect with gentle swaying body movements, keeping the person centered and adding subtle motion blur to create a sense of rhythmic movement',
      'my-girlfriendssss': 'Transform the scene to show the person surrounded by multiple romantic partners in a warm, friendly group setting with soft lighting and happy expressions',
      'my-boyfriendssss': 'Transform the scene to show the person surrounded by multiple romantic partners in a warm, friendly group setting with soft lighting and happy expressions',
      'earth-zoom-out': 'Create a dramatic zoom-out perspective effect showing the person from increasingly high altitude, as if viewed from space, with Earth\'s curvature visible in the background',
      'wave-dance': 'Apply a wave-like dancing motion effect with fluid, undulating body movements that create a sense of flowing water or ocean waves',
      'earth-zoom-in': 'Create a dramatic zoom-in perspective effect approaching the person from space, with Earth\'s atmosphere and clouds visible in the background',
      'minecraft': 'Transform the entire image into Minecraft aesthetic - convert the person into blocky, pixelated cubic forms with distinct Minecraft game textures and block-based appearance',
      'box-me': 'Transform the person into a simplified box-like geometric cartoon character with clean edges, flat colors, and cubic proportions',
      'paper-fall': 'Add colorful paper confetti falling all around the person, with varied shapes and colors of paper pieces floating and falling through the air creating a celebratory atmosphere',
      'style-me': 'Apply a fashionable style transformation with enhanced vibrant colors, modern trendy clothing, stylish accessories, and overall contemporary aesthetic improvements',
      'ghibli': 'Transform into authentic Studio Ghibli anime art style with characteristic soft watercolor tones, gentle shading, whimsical atmosphere, and dreamy hand-painted quality',
      'ai-couple-hugging': 'Create a warm, romantic scene showing two people in a tender embrace with soft ambient lighting, intimate pose, and affectionate atmosphere',
      'nap-me': 'Transform into a peaceful sleeping or napping scene with the person in a relaxed resting position, soft dreamy lighting, and calm serene atmosphere',
      'spin-360': 'Create a dynamic 360-degree spinning rotation effect showing multiple perspectives of the person as if rotating in a circular motion',
      'sexy-me': 'Apply an attractive, confident transformation with enhanced facial features, glamorous styling, alluring expression, and sophisticated appearance',
      'gender-swap': 'Transform the person to opposite gender appearance while maintaining recognizable facial features - swap masculine features to feminine or vice versa with appropriate hairstyle and features',
      'smile': 'Transform the facial expression to show a bright, genuine, warm smile with happy eyes and joyful demeanor',
      'bodyshake': 'Apply a dynamic body shaking dance movement effect with energetic motion, as if dancing vigorously to upbeat music',
      'melt': 'Create a surreal melting effect where the person appears to be liquefying or melting like wax, with distorted flowing forms',
      'bloom-magic': 'Add magical blooming flowers appearing and growing around the person, with petals floating in the air and a fairy-tale enchanted garden atmosphere',
      'paperman': 'Transform into a paper-cut art style character with flat layered appearance, clean cut edges, and artistic paper craft aesthetic',
      'flying': 'Create a dynamic flying effect with the person soaring through the air, motion blur, wind effects, and clouds or sky background',
      'balloon-flyaway': 'Add numerous colorful helium balloons lifting and carrying the person up into the sky, with strings attached and an uplifting joyful atmosphere',
      'expansion': 'Create an expanding or growing effect where the person appears to be enlarging or inflating in size with distortion effects',
      'pet-lovers': 'Add adorable pets (dogs, cats, or other cute animals) interacting lovingly with the person, showing affection and playful interaction',
      'flame-carpet': 'Create a dramatic carpet or field of flames beneath the person\'s feet, with realistic fire effects but keeping the person safe above',
      'fashion-stride': 'Transform into a confident fashion runway walk pose with professional modeling posture, stylish movement, and catwalk atmosphere',
      'send-roses': 'Create a romantic scene with beautiful red roses being sent, held, or floating around the person with rose petals in the air',
      'finger-heart': 'Add a cute Korean-style finger heart gesture with the person\'s hands forming a small heart shape, expressing affection',
      'cartoon-doll': 'Transform into an adorable cartoon doll character with big expressive eyes, cute proportions, and toy-like charming appearance',
      'beast-companion': 'Add a magical fantasy beast or mythical creature companion standing protectively next to the person with an epic heroic atmosphere',
      'bloom-doorobear': 'Add a cute Doraemon-style cartoon bear character with blooming flowers and magical effects in a whimsical scene',
      'french-kiss': 'Create a romantic intimate kissing scene with two people in a passionate French kiss embrace with romantic atmosphere',
      'whos-arrested': 'Create a playful "getting arrested" scene with the person in handcuffs or police situation in a humorous, lighthearted way',
      'warmth-of-jesus': 'Create a spiritual, divine scene with holy warm light emanating from above, angelic atmosphere, and peaceful sacred feeling',
      'wild-laugh': 'Transform the expression into an exaggerated, wild, uncontrollable laughing face with intense joy and humor',
      'surprised': 'Transform the expression into a highly surprised, shocked face with wide eyes, open mouth, and dramatic astonished reaction',
      'explosion': 'Add a dramatic explosion effect in the background with realistic fire, smoke, debris, and action movie atmosphere',
      'face-punch': 'Create a comic-style face punch impact effect with motion lines, impact burst, and action comic book aesthetic',
      'ai-kiss': 'Create a romantic AI-generated kissing scene between two people with soft lighting and affectionate intimate atmosphere',
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
      'disco-ball': 'Add disco ball effects with sparkles, lights, and party atmosphere around the person',
      'dragon-rider': 'Show the person riding a majestic dragon with epic fantasy atmosphere and mythical creature',
      'mermaid-tail': 'Transform lower body into a beautiful mermaid tail with underwater ocean aesthetic',
      'ninja-stealth': 'Transform into a ninja with stealth pose, dark outfit, and martial arts atmosphere',
      'fairy-godmother': 'Transform into a fairy godmother with magical wand, sparkles, and enchanted appearance',
      'pirate-adventure': 'Transform into a pirate with adventure atmosphere, treasure, and nautical theme',
      'bubble-bounce': 'Surround the person with floating colorful bubbles creating playful bouncing effect',
      'neon-glow': 'Add vibrant neon glow effects with bright electric colors and futuristic cyberpunk aesthetic',
      'samurai-warrior': 'Transform into a samurai warrior with traditional armor, katana, and honorable stance',
      'candy-land': 'Surround with candy, lollipops, and sweet treats creating whimsical candy land scene',
      'time-freeze': 'Create time freeze effect with frozen motion, particles suspended in air',
      'fire-phoenix': 'Transform into a fire phoenix with blazing wings, flames, and rebirth symbolism',
      'ice-queen': 'Transform into an ice queen with frost crown, icy dress, and winter royalty aesthetic',
      'breakdance': 'Create dynamic breakdance pose with energetic movement and street dance atmosphere',
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
      'water-splash': 'Create dynamic water splash effect with liquid droplets and aquatic motion',
      'thunder-storm': 'Add dramatic thunder and lightning storm effects with electric bolts',
      'cherry-blossom': 'Surround with delicate pink cherry blossom petals floating in spring breeze',
      'autumn-leaves': 'Add falling autumn leaves in red, orange, yellow colors creating seasonal atmosphere',
      'tropical-paradise': 'Transform background into tropical paradise with palm trees, beach, and exotic flowers',
      'northern-lights': 'Add aurora borealis northern lights with green and purple waves in night sky',
      'shooting-star': 'Add shooting star streaking across with magical wish-granting atmosphere',
      'crown-jewels': 'Add royal crown with precious jewels, diamonds, and regal appearance'
    };

    const prompt = effectPrompts[effectId] || `Apply ${effectName} effect to this image`;

    console.log('Applying effect:', effectId, 'with prompt:', prompt);

    // Call Lovable AI for image editing
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl_result = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl_result) {
      throw new Error('No image generated');
    }

    console.log('Effect applied successfully');

    return new Response(
      JSON.stringify({ imageUrl: imageUrl_result }),
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
