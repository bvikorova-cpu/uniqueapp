import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check subscription and limits
    const { data: subscription } = await supabaseClient
      .from('decor_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!subscription) {
      // Create free subscription
      await supabaseClient
        .from('decor_subscriptions')
        .insert({
          user_id: user.id,
          tier: 'free',
          designs_limit: 2,
          designs_used: 0,
          status: 'active'
        })
    } else if (subscription.designs_used >= subscription.designs_limit) {
      return new Response(
        JSON.stringify({ 
          error: 'Design limit reached', 
          message: `You've used ${subscription.designs_used}/${subscription.designs_limit} designs this month. Upgrade to Pro for 50 designs!` 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { originalImageUrl, roomType, stylePreference, customPrompt } = await req.json()

    if (!originalImageUrl || !roomType || !stylePreference) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Generating room design with Lovable AI...')

    // Generate design using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    const designPrompt = `Create a beautiful ${stylePreference} style ${roomType.replace('-', ' ')} interior design. 
    ${customPrompt ? `Additional requirements: ${customPrompt}` : ''}
    
    The design should include:
    - Furniture placement recommendations
    - Color palette suggestions
    - Lighting recommendations
    - 3-5 specific product suggestions with names, categories, and estimated prices
    
    Make it practical, modern, and achievable.`

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `${designPrompt}\n\nYou MUST respond with a valid JSON object in this exact format:
{
  "description": "Detailed description of the redesigned room",
  "colorPalette": ["color1", "color2", "color3"],
  "furnitureSuggestions": ["suggestion1", "suggestion2"],
  "lightingSuggestions": "Lighting recommendations",
  "products": [
    {"name": "Product Name", "category": "Category", "price": "€XX.XX"}
  ]
}`
              },
              {
                type: 'image_url',
                image_url: { url: originalImageUrl }
              }
            ]
          }
        ],
        modalities: ['image', 'text']
      })
    })

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'AI rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const errorText = await aiResponse.text()
      console.error('AI API error:', aiResponse.status, errorText)
      throw new Error('AI generation failed')
    }

    const aiData = await aiResponse.json()
    console.log('AI Response:', JSON.stringify(aiData, null, 2))
    
    // Extract generated image if available
    const generatedImageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url
    
    // Parse AI response
    const aiMessage = aiData.choices?.[0]?.message?.content || ''
    let designData: any = {}
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiMessage.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        designData = JSON.parse(jsonMatch[0])
      } else {
        // Fallback if no JSON found
        designData = {
          description: aiMessage,
          colorPalette: [],
          furnitureSuggestions: [],
          lightingSuggestions: '',
          products: []
        }
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e)
      designData = {
        description: aiMessage,
        colorPalette: [],
        furnitureSuggestions: [],
        lightingSuggestions: '',
        products: []
      }
    }

    // Save design to database
    const { data: design, error: designError } = await supabaseClient
      .from('ai_room_designs')
      .insert({
        user_id: user.id,
        original_image_url: originalImageUrl,
        redesigned_image_url: generatedImageUrl || originalImageUrl,
        room_type: roomType,
        style_preference: stylePreference,
        custom_prompt: customPrompt,
        product_suggestions: designData.products || []
      })
      .select()
      .single()

    if (designError) throw designError

    // Increment designs used
    await supabaseClient
      .from('decor_subscriptions')
      .update({ 
        designs_used: (subscription?.designs_used || 0) + 1 
      })
      .eq('user_id', user.id)

    const remainingDesigns = (subscription?.designs_limit || 2) - ((subscription?.designs_used || 0) + 1)

    return new Response(
      JSON.stringify({ 
        design,
        designData,
        remainingDesigns
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
