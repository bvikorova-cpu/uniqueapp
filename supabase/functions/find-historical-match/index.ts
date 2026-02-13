import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Historical figures database with Wikipedia portrait URLs
const historicalFigures = [
  { name: "Leonardo da Vinci", era: "Renaissance (1452-1519)", category: "artist", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Francesco_Melzi_-_Portrait_of_Leonardo.png/440px-Francesco_Melzi_-_Portrait_of_Leonardo.png" },
  { name: "Cleopatra VII", era: "Ancient Egypt (69-30 BC)", category: "royalty", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Kleopatra-VII.-Altes-Museum-Berlin1.jpg/440px-Kleopatra-VII.-Altes-Museum-Berlin1.jpg" },
  { name: "Napoleon Bonaparte", era: "French Empire (1769-1821)", category: "military", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg/440px-Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg" },
  { name: "Queen Elizabeth I", era: "Tudor England (1533-1603)", category: "royalty", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Darnley_stage_3.jpg/440px-Darnley_stage_3.jpg" },
  { name: "Julius Caesar", era: "Roman Empire (100-44 BC)", category: "military", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Bust_of_Julius_Caesar_%28Green_Caesar%29.jpg/440px-Bust_of_Julius_Caesar_%28Green_Caesar%29.jpg" },
  { name: "Marie Antoinette", era: "French Monarchy (1755-1793)", category: "royalty", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Marie-Antoinette%2C_1775_-_Mus%C3%A9e_Antoine_L%C3%A9cuyer.jpg/440px-Marie-Antoinette%2C_1775_-_Mus%C3%A9e_Antoine_L%C3%A9cuyer.jpg" },
  { name: "William Shakespeare", era: "Elizabethan Era (1564-1616)", category: "writer", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Shakespeare.jpg/440px-Shakespeare.jpg" },
  { name: "Joan of Arc", era: "Medieval France (1412-1431)", category: "military", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Joan_of_Arc_miniature_graded.jpg/440px-Joan_of_Arc_miniature_graded.jpg" },
  { name: "Alexander the Great", era: "Ancient Greece (356-323 BC)", category: "military", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Alexander_the_Great_mosaic_%28cropped%29.jpg/440px-Alexander_the_Great_mosaic_%28cropped%29.jpg" },
  { name: "Catherine the Great", era: "Russian Empire (1729-1796)", category: "royalty", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Profile_portrait_of_Catherine_II_by_Fedor_Rokotov_%281763%2C_Tretyakov_gallery%29.jpg/440px-Profile_portrait_of_Catherine_II_by_Fedor_Rokotov_%281763%2C_Tretyakov_gallery%29.jpg" },
  { name: "Michelangelo", era: "Renaissance (1475-1564)", category: "artist", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Miguel_%C3%81ngel%2C_por_Daniele_da_Volterra_%28detalle%29.jpg/440px-Miguel_%C3%81ngel%2C_por_Daniele_da_Volterra_%28detalle%29.jpg" },
  { name: "Genghis Khan", era: "Mongol Empire (1162-1227)", category: "military", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/YuanEmperorAlbumGenghisPortrait.jpg/440px-YuanEmperorAlbumGenghisPortrait.jpg" },
  { name: "Marco Polo", era: "Medieval Venice (1254-1324)", category: "explorer", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Marco_Polo_portrait.jpg/440px-Marco_Polo_portrait.jpg" },
  { name: "Charlemagne", era: "Carolingian Empire (742-814)", category: "royalty", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Charlemagne-by-Durer.jpg/440px-Charlemagne-by-Durer.jpg" },
  { name: "Nefertiti", era: "Ancient Egypt (1370-1330 BC)", category: "royalty", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Nofretete_Neues_Museum.jpg/440px-Nofretete_Neues_Museum.jpg" },
  { name: "Galileo Galilei", era: "Renaissance (1564-1642)", category: "scientist", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Justus_Sustermans_-_Portrait_of_Galileo_Galilei%2C_1636.jpg/440px-Justus_Sustermans_-_Portrait_of_Galileo_Galilei%2C_1636.jpg" },
  { name: "King Henry VIII", era: "Tudor England (1491-1547)", category: "royalty", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Workshop_of_Hans_Holbein_the_Younger_-_Portrait_of_Henry_VIII_-_Google_Art_Project.jpg/440px-Workshop_of_Hans_Holbein_the_Younger_-_Portrait_of_Henry_VIII_-_Google_Art_Project.jpg" },
  { name: "Queen Victoria", era: "Victorian Era (1819-1901)", category: "royalty", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Queen_Victoria_by_Bassano.jpg/440px-Queen_Victoria_by_Bassano.jpg" },
  { name: "Beethoven", era: "Classical Era (1770-1827)", category: "musician", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Beethoven.jpg/440px-Beethoven.jpg" },
  { name: "Mozart", era: "Classical Era (1756-1791)", category: "musician", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Wolfgang-amadeus-mozart_1.jpg/440px-Wolfgang-amadeus-mozart_1.jpg" },
];

const celebrities = [
  { name: "Marilyn Monroe", era: "Golden Age Hollywood (1926-1962)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Marilyn_Monroe_-_publicity.jpg/440px-Marilyn_Monroe_-_publicity.jpg" },
  { name: "Elvis Presley", era: "Rock and Roll Era (1935-1977)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Elvis_Presley_promoting_Jailhouse_Rock.jpg/440px-Elvis_Presley_promoting_Jailhouse_Rock.jpg" },
  { name: "Audrey Hepburn", era: "Classic Hollywood (1929-1993)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Audrey_Hepburn_-_1953.jpg/440px-Audrey_Hepburn_-_1953.jpg" },
  { name: "James Dean", era: "1950s Hollywood (1931-1955)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/James_Dean_-_publicity_-_early.jpg/440px-James_Dean_-_publicity_-_early.jpg" },
  { name: "Grace Kelly", era: "Golden Age Hollywood (1929-1982)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Grace_Kelly_1956.jpg/440px-Grace_Kelly_1956.jpg" },
];

const famousArtworks = [
  { name: "Mona Lisa Portrait", era: "Renaissance (1503-1519)", artist: "Leonardo da Vinci", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/440px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg" },
  { name: "Girl with a Pearl Earring", era: "Dutch Golden Age (1665)", artist: "Johannes Vermeer", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/440px-1665_Girl_with_a_Pearl_Earring.jpg" },
  { name: "The Birth of Venus", era: "Renaissance (1485)", artist: "Sandro Botticelli", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/640px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg" },
  { name: "Portrait of Adele Bloch-Bauer", era: "Art Nouveau (1907)", artist: "Gustav Klimt", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Gustav_Klimt_046.jpg/440px-Gustav_Klimt_046.jpg" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const { imageBase64, tier, userImageUrl } = await req.json();
    
    if (!imageBase64) {
      throw new Error("Image is required");
    }

    // Determine number of matches based on tier
    let numMatches = 1;
    let includeArtworks = false;
    let includeBio = false;
    let includeDNA = false;

    switch (tier) {
      case 'basic':
        numMatches = 1;
        break;
      case 'extended':
        numMatches = 10;
        includeArtworks = true;
        includeBio = true;
        break;
      case 'heritage':
        numMatches = 20;
        includeArtworks = true;
        includeBio = true;
        includeDNA = true;
        break;
    }

    // AI Analysis using OpenAI
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    console.log("Step 1: Analyzing facial features with AI...");

    // Step 1: Analyze facial features
    const analysisResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this face in detail. Describe: face shape, eye shape and color, nose structure, jawline, cheekbones, lips, skin tone, hair color/style, and any distinctive features. Be specific and detailed."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error("AI analysis error:", analysisResponse.status, errorText);
      throw new Error("Facial analysis failed");
    }

    const analysisData = await analysisResponse.json();
    const facialAnalysis = analysisData.choices?.[0]?.message?.content || "";
    console.log("Facial analysis:", facialAnalysis);

    // Step 2: Match with historical figures based on the analysis
    console.log("Step 2: Finding historical matches...");
    
    const historicalList = historicalFigures.map(f => `${f.name} - ${f.era} (${f.category})`).join('\n');
    const celebrityList = celebrities.map(c => `${c.name} - ${c.era}`).join('\n');
    const artworkList = includeArtworks ? famousArtworks.map(a => `${a.name} by ${a.artist} - ${a.era}`).join('\n') : '';

    const matchingPrompt = `You are a facial similarity expert. Based on this detailed facial analysis of a person's photo:
"${facialAnalysis}"

Compare their SPECIFIC facial features (face shape, eye shape/color, nose structure, jawline, cheekbones, lips, skin tone, hair) against the known appearances of these historical figures and celebrities. Only select people who genuinely share similar facial features.

AVAILABLE PEOPLE:
HISTORICAL FIGURES:
${historicalList}

CELEBRITIES:
${celebrityList}

${includeArtworks ? `FAMOUS ARTWORKS:\n${artworkList}` : ''}

CRITICAL RULES:
- ONLY select people whose known facial features actually match the analyzed face
- If the person has a round face, do NOT match them with someone known for a long/angular face
- Match eye shape, nose width, jawline, cheekbone structure realistically
- Similarity scores must be HONEST: 65-75 = slight resemblance, 76-85 = noticeable similarity, 86-92 = striking resemblance
- Most matches should be in the 65-80 range. Only give 85+ if features truly align closely
- Return exactly ${numMatches} matches, sorted by similarity (highest first)

For each match return:
1. name - exact name from the list above
2. similarity - honest score based on actual facial feature overlap
3. reason - explain WHICH specific facial features match (e.g. "Both share a strong square jawline, deep-set eyes, and a prominent brow ridge")

Return ONLY a valid JSON array. Example:
[{"name":"Leonardo da Vinci","similarity":78,"reason":"Both share a high forehead, deep-set eyes with heavy lids, and a strong aquiline nose."}]`;

    const matchResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: matchingPrompt
          }
        ],
      }),
    });

    if (!matchResponse.ok) {
      const errorText = await matchResponse.text();
      console.error("AI matching error:", matchResponse.status, errorText);
      throw new Error("Historical matching failed");
    }

    const matchData = await matchResponse.json();
    let matchesText = matchData.choices?.[0]?.message?.content || "[]";
    
    // Clean up JSON response
    matchesText = matchesText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let aiMatches;
    try {
      aiMatches = JSON.parse(matchesText);
    } catch (e) {
      console.error("Failed to parse AI response:", matchesText);
      // Fallback to random matches if AI fails
      aiMatches = historicalFigures.slice(0, numMatches).map(f => ({
        name: f.name,
        similarity: Math.floor(Math.random() * 20 + 70),
        reason: `Shares similar facial characteristics with ${f.name}.`
      }));
    }

    console.log("AI generated matches:", aiMatches);

    // Build final matches with enhanced data
    const matches = aiMatches.slice(0, numMatches).map((match: any) => {
      const matchResult: any = {
        name: match.name,
        era: match.era || historicalFigures.find(f => f.name === match.name)?.era || 
             celebrities.find(c => c.name === match.name)?.era || "Unknown",
        similarity: Math.min(92, Math.max(65, match.similarity)),
      };

      if (includeBio) {
        matchResult.bio = match.reason || `Remarkable similarities in facial structure and features with ${match.name}.`;
      }

      // Use real portrait from our database
      const figureData = historicalFigures.find(f => f.name === match.name) ||
                         celebrities.find(c => c.name === match.name) ||
                         famousArtworks.find(a => a.name === match.name);
      matchResult.imageUrl = (figureData as any)?.image || null;

      return matchResult;
    });

    // Sort by similarity
    matches.sort((a: any, b: any) => b.similarity - a.similarity);

    const response = {
      matches,
      tier,
      aiAnalysis: tier === 'heritage' ? facialAnalysis : undefined,
    };

    // Save matches to database
    try {
      const { error: insertError } = await supabaseClient
        .from('historical_matches')
        .insert({
          user_id: user.id,
          tier,
          user_image_url: userImageUrl || null,
          matches: matches,
          is_public: false,
        });

      if (insertError) {
        console.error('Error saving match to database:', insertError);
      } else {
        console.log('Successfully saved match with image URL:', userImageUrl);
      }
    } catch (dbError) {
      console.error('Database save error:', dbError);
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
