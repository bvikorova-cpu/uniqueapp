import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { courseName } = await req.json();
    
    if (!courseName) {
      return new Response(
        JSON.stringify({ error: "courseName is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert educational content creator who creates detailed courses in English.
For each course you will create 10 topics, where each topic has:
- Title (e.g., "Topic 1: ...")
- Content of 400-600 words with specific information, examples, and details

IMPORTANT: Content MUST be specific to the subject area. For example:
- For "Marketing and Advertising": specific forms of marketing (digital, content, email marketing), strategies, tools, metrics, campaign examples
- For "Accounting Basics": specific accounting procedures, documents, statements, bookkeeping examples
- For "First Aid": specific procedures, techniques, situations, steps

Each topic has structure:
**Section Heading:**
Text with specific information, examples, procedures...

Return a JSON object with this format:
{
  "topics": [
    {
      "title": "Topic 1: ...",
      "content": "detailed content 400-600 words..."
    },
    ... 9 more topics
  ]
}`;

    const userPrompt = `Create 10 detailed topics for the course: "${courseName}"

Each topic must contain:
1. Specific information related to this field
2. Practical examples and situations
3. Procedures and techniques
4. 400-600 words

Topic sequence:
1. Introduction and basics
2. Key concepts and terminology
3. Practical applications and examples
4. Advanced techniques and methods
5. Solving common problems
6. Real case studies
7. Best practices and recommendations
8. Tools and resources
9. Trends and future developments
10. Summary and certification preparation`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please check your OpenAI account." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let topics;
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      topics = parsed.topics;
      
      if (!topics || !Array.isArray(topics) || topics.length === 0) {
        console.error('No topics found in parsed response. Parsed object keys:', Object.keys(parsed));
        throw new Error('No topics in response');
      }
      
      console.log(`Successfully parsed ${topics.length} topics`);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      console.error("Parse error:", errorMessage);
      console.error("Content type:", typeof content);
      console.error("Content preview (first 500 chars):", typeof content === 'string' ? content.substring(0, 500) : JSON.stringify(content).substring(0, 500));
      throw new Error(`Invalid AI response format: ${errorMessage}`);
    }

    return new Response(
      JSON.stringify({ topics }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error in generate-course-content:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
