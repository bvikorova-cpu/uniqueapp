import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Historical figures database
const historicalFigures = [
  { name: "Leonardo da Vinci", era: "Renaissance (1452-1519)", category: "artist" },
  { name: "Cleopatra VII", era: "Ancient Egypt (69-30 BC)", category: "royalty" },
  { name: "Napoleon Bonaparte", era: "French Empire (1769-1821)", category: "military" },
  { name: "Queen Elizabeth I", era: "Tudor England (1533-1603)", category: "royalty" },
  { name: "Julius Caesar", era: "Roman Empire (100-44 BC)", category: "military" },
  { name: "Marie Antoinette", era: "French Monarchy (1755-1793)", category: "royalty" },
  { name: "William Shakespeare", era: "Elizabethan Era (1564-1616)", category: "writer" },
  { name: "Joan of Arc", era: "Medieval France (1412-1431)", category: "military" },
  { name: "Alexander the Great", era: "Ancient Greece (356-323 BC)", category: "military" },
  { name: "Catherine the Great", era: "Russian Empire (1729-1796)", category: "royalty" },
  { name: "Michelangelo", era: "Renaissance (1475-1564)", category: "artist" },
  { name: "Genghis Khan", era: "Mongol Empire (1162-1227)", category: "military" },
  { name: "Marco Polo", era: "Medieval Venice (1254-1324)", category: "explorer" },
  { name: "Charlemagne", era: "Carolingian Empire (742-814)", category: "royalty" },
  { name: "Nefertiti", era: "Ancient Egypt (1370-1330 BC)", category: "royalty" },
  { name: "Galileo Galilei", era: "Renaissance (1564-1642)", category: "scientist" },
  { name: "King Henry VIII", era: "Tudor England (1491-1547)", category: "royalty" },
  { name: "Queen Victoria", era: "Victorian Era (1819-1901)", category: "royalty" },
  { name: "Beethoven", era: "Classical Era (1770-1827)", category: "musician" },
  { name: "Mozart", era: "Classical Era (1756-1791)", category: "musician" },
];

const celebrities = [
  { name: "Marilyn Monroe", era: "Golden Age Hollywood (1926-1962)" },
  { name: "Elvis Presley", era: "Rock and Roll Era (1935-1977)" },
  { name: "Audrey Hepburn", era: "Classic Hollywood (1929-1993)" },
  { name: "James Dean", era: "1950s Hollywood (1931-1955)" },
  { name: "Grace Kelly", era: "Golden Age Hollywood (1929-1982)" },
];

const famousArtworks = [
  { name: "Mona Lisa Portrait", era: "Renaissance (1503-1519)", artist: "Leonardo da Vinci" },
  { name: "Girl with a Pearl Earring", era: "Dutch Golden Age (1665)", artist: "Johannes Vermeer" },
  { name: "The Birth of Venus", era: "Renaissance (1485)", artist: "Sandro Botticelli" },
  { name: "Portrait of Adele Bloch-Bauer", era: "Art Nouveau (1907)", artist: "Gustav Klimt" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const matchingPrompt = `Based on this facial analysis:
"${facialAnalysis}"

Find the ${numMatches} best matches from these historical figures and celebrities:

HISTORICAL FIGURES:
${historicalList}

CELEBRITIES:
${celebrityList}

${includeArtworks ? `FAMOUS ARTWORKS:\n${artworkList}` : ''}

For each match, provide:
1. name - exact name from the list
2. similarity - realistic score 65-92 (higher for better matches)
3. reason - specific facial features that match (2-3 sentences)

Return ONLY a valid JSON array with these exact fields. Example:
[{"name":"Leonardo da Vinci","similarity":87,"reason":"Similar facial structure..."}]`;

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

      // Add placeholder image
      matchResult.imageUrl = `https://picsum.photos/seed/${match.name.replace(/\s/g, '')}/400/500`;

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
