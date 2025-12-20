import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CATEGORY_PROMPTS = {
  nature: `Analyze this nature image in detail:
- Identify the species (common and scientific name)
- Age estimation if applicable
- Health status and any visible issues
- Care instructions or habitat information
- Interesting facts
- Safety information if relevant`,
  
  objects: `Analyze this object/product in detail:
- Identify the item name and brand if visible
- Purpose and common uses
- Material composition
- Estimated value or price range
- Where to buy similar items
- Model number or specifications if applicable`,
  
  fashion: `Analyze this fashion item in detail:
- Brand identification
- Material and fabric composition
- Style and design elements
- Size estimation if visible
- Authenticity indicators
- Styling suggestions
- Where to buy similar items
- Price range`,
  
  text: `Extract and analyze text from this image:
- All visible text (OCR)
- Language detection
- Translation if not in English
- Document type if applicable
- Key information extraction
- Brand or logo identification`,
  
  food: `Analyze this food item in detail:
- Food name and cuisine type
- Main ingredients
- Nutritional estimates (calories, macros)
- Freshness assessment
- Recipe suggestions
- Allergen warnings
- Health score`,
  
  art: `Analyze this art/cultural item in detail:
- Art style and period
- Artist or creator (if identifiable)
- Technique used
- Cultural or historical context
- Material and medium
- Estimated age or period
- Significance or meaning`,
  
  safety: `Analyze this for safety information:
- Warning signs or symbols
- Hazard identification
- Safety precautions needed
- First aid information if applicable
- Proper handling or storage
- Risk level assessment`,
  
  home: `Analyze this home/interior element:
- Design style and period
- Materials used
- Color palette
- Condition assessment
- Design suggestions
- Material quality
- Potential issues (damage, wear, etc.)`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, category, analysisType = 'basic' } = await req.json();
    
    // Use service role for database operations to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Use anon key for auth verification
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAuth.auth.getUser(token);
    
    if (!user) throw new Error('Not authenticated');

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

    // Check user credits and tier using admin client
    const { data: creditsData, error: creditsError } = await supabaseAdmin
      .from('analyzer_credits')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creditsError) throw creditsError;

    // Create credits record if doesn't exist
    let credits = creditsData;
    if (!credits) {
      const { data: newCredits, error: insertError } = await supabaseAdmin
        .from('analyzer_credits')
        .insert({
          user_id: user.id,
          credits_remaining: 1,
          total_credits_purchased: 1,
          tier: 'free'
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      credits = newCredits;
    }

    // Check if user has enough credits
    const creditsRequired = analysisType === 'expert' ? 2 : 1;

    if (credits.credits_remaining < creditsRequired) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient credits',
          required: creditsRequired,
          remaining: credits.credits_remaining 
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Select AI model based on analysis type
    const aiModel = analysisType === 'expert' ? 'gpt-4o' : 'gpt-4o-mini';

    // Get category-specific prompt
    const categoryPrompt = CATEGORY_PROMPTS[category as keyof typeof CATEGORY_PROMPTS] 
      || CATEGORY_PROMPTS.objects;

    const fullPrompt = `${categoryPrompt}

Return the analysis in the following JSON format:
{
  "mainIdentification": "Primary identification (e.g., 'Oak Tree' or 'Nike Air Max')",
  "confidence": 0.95,
  "category": "${category}",
  "details": {
    "description": "Detailed description",
    "specifications": ["spec1", "spec2", "spec3"],
    "careInstructions": "How to care for or use this item",
    "safety": "Safety information if applicable",
    "value": "Estimated value or price range",
    "whereToFind": "Where to buy or find similar items"
  },
  "tags": ["tag1", "tag2", "tag3"],
  "additionalInfo": "Any other relevant information",
  "shopping": {
    "links": ["https://example.com"],
    "alternatives": ["Alternative 1", "Alternative 2"]
  }
}`;

    console.log('Calling OpenAI API with model:', aiModel);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { 
            role: 'user', 
            content: [
              { type: 'text', text: fullPrompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error('Failed to analyze image');
    }

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;
    
    let analysisResult;
    try {
      // Try to parse JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if JSON parsing fails
        analysisResult = {
          mainIdentification: 'Analysis Result',
          confidence: 0.85,
          category: category,
          details: {
            description: content,
            specifications: [],
            careInstructions: '',
            safety: '',
            value: '',
            whereToFind: ''
          },
          tags: [category],
          additionalInfo: content,
          shopping: { links: [], alternatives: [] }
        };
      }
    } catch {
      analysisResult = {
        mainIdentification: 'Analysis Result',
        confidence: 0.85,
        category: category,
        details: {
          description: content,
          specifications: [],
          careInstructions: '',
          safety: '',
          value: '',
          whereToFind: ''
        },
        tags: [category],
        additionalInfo: content,
        shopping: { links: [], alternatives: [] }
      };
    }

    // Save analysis to database using admin client
    const { data: savedAnalysis, error: saveError } = await supabaseAdmin
      .from('vision_analyses')
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        category: category,
        analysis_type: analysisType,
        main_identification: analysisResult.mainIdentification,
        confidence_score: analysisResult.confidence,
        detailed_info: analysisResult,
        tags: analysisResult.tags,
        credits_used: creditsRequired
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving analysis:', saveError);
      throw saveError;
    }

    // Deduct credits using admin client
    await supabaseAdmin
      .from('analyzer_credits')
      .update({ 
        credits_remaining: credits.credits_remaining - creditsRequired,
      })
      .eq('user_id', user.id);

    return new Response(
      JSON.stringify({ 
        analysis: savedAnalysis,
        creditsRemaining: credits.credits_remaining - creditsRequired
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in universal-vision-analyzer:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
