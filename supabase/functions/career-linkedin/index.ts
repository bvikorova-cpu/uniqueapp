import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("Unauthorized");

    const { profileContent, targetIndustry } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a LinkedIn profile optimization expert. Analyze the provided profile and:
1. Optimize the headline for maximum impact
2. Improve the About/Summary section
3. Enhance work experience descriptions
4. Suggest relevant skills to add
5. Provide keyword optimization for ${targetIndustry || 'general industry'}
6. Give tips for better engagement

Format response as JSON: { "suggestions": [], "enhancedProfile": "...", "keywords": [] }`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `LinkedIn Profile:\n${profileContent}` }
        ],
        tools: [{
          type: "function",
          function: {
            name: "enhance_linkedin",
            description: "Enhance LinkedIn profile with suggestions",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: { type: "string" }
                },
                enhancedProfile: { type: "string" },
                keywords: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["suggestions", "enhancedProfile", "keywords"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "enhance_linkedin" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data_ai = await response.json();
    const toolCall = data_ai.choices[0].message.tool_calls[0];
    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});