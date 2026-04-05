import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, ...params } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "generate-quiz":
        systemPrompt = "You are an expert quiz creator for online courses. Generate quizzes with multiple choice questions. For each question include: the question, 4 options (A-D), the correct answer, and a brief explanation. Format clearly with numbering.";
        userPrompt = `Create ${params.numQuestions} ${params.difficulty} difficulty quiz questions about: ${params.topic}`;
        break;

      case "generate-outline":
        systemPrompt = "You are an expert curriculum designer. Create detailed course outlines with modules, lessons, learning objectives, and estimated durations. Make it comprehensive and well-structured for online learning.";
        userPrompt = `Create a ${params.modules}-module course outline for "${params.title}" targeting ${params.audience}. Include lesson titles, learning objectives, and estimated duration per lesson.`;
        break;

      case "tutor-chat":
        systemPrompt = "You are an expert AI tutor. Help students understand concepts clearly. Use examples, analogies, and step-by-step explanations. Be encouraging and patient. Keep responses concise but thorough.";
        const messages = params.messages || [];
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [{ role: "system", content: systemPrompt }, ...messages],
          }),
        });
        if (!response.ok) {
          const status = response.status;
          if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          if (status === 402) return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          throw new Error(`AI gateway error: ${status}`);
        }
        const chatData = await response.json();
        return new Response(JSON.stringify({ result: chatData.choices?.[0]?.message?.content || "No response" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "design-certificate":
        systemPrompt = "You are a certificate designer. Create a detailed text description of a beautiful certificate design including layout, fonts, colors, decorative elements, and wording. Make it professional and ceremonial.";
        userPrompt = `Design a ${params.style} style certificate of completion for student "${params.studentName}" who completed the course "${params.courseName}". Include the full certificate text with honors and accolades.`;
        break;

      case "plagiarism-check":
        systemPrompt = "You are a plagiarism detection expert. Analyze the given text for originality. Check for common patterns, clichés, and potentially copied content. Provide an originality score (0-100%), flag any suspicious sections, and give recommendations. Be thorough but fair.";
        userPrompt = `Analyze this text for originality and potential plagiarism:\n\n${params.text}`;
        break;

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Payment required." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await aiResponse.json();
    const result = data.choices?.[0]?.message?.content || "No response generated";

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("tutorial-ai-tools error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
