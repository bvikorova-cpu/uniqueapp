import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, action } = await req.json();
    
    if (!text || !action) {
      throw new Error("Missing required fields");
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (action === 'analyze') {
      systemPrompt = `You are a friendly reading companion for kids aged 6-12.
Your job is to help kids understand what they read by:
- Creating a simple, clear summary
- Identifying new or difficult words and explaining them

Always use encouraging, kid-friendly language.

Format your response as JSON with this structure:
{
  "summary": "A clear, simple summary of the text",
  "vocabulary": [
    {
      "word": "word from the text",
      "definition": "simple, kid-friendly definition"
    }
  ]
}`;

      userPrompt = `Please analyze this text and help a child understand it:

${text}

Provide a summary and identify 3-5 important or difficult words with their definitions.`;

    } else if (action === 'quiz') {
      systemPrompt = `You are a friendly reading companion creating fun comprehension quizzes for kids aged 6-12.

Format your response as JSON with this structure:
{
  "question": "A clear question about the text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "The correct option text"
}`;

      userPrompt = `Create a fun comprehension question about this text:

${text}

Make it engaging and appropriate for kids!`;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Too many requests. Please try again in a moment.");
      }
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in kids-reading-companion:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
