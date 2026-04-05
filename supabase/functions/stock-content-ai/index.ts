import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action, ...params } = body;
    
    // Try Lovable AI first, fall back to OpenAI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    
    const useLovable = !!LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY && !openaiKey) throw new Error("No AI API key configured");

    let systemPrompt = "";
    let userPrompt = "";
    let useJsonFormat = false;

    switch (action) {
      // === STOCK CONTENT ACTIONS ===
      case "plagiarism_scan":
        systemPrompt = "You are an AI image originality analyzer. Analyze the described image and return a JSON object with: originalityScore (0-100), matches (array of {source, similarity, url}), verdict (string), details (string).";
        userPrompt = `Analyze this image for originality: ${params.imageUrl}. Return a realistic plagiarism scan result as JSON.`;
        useJsonFormat = true;
        break;

      case "remove_background":
        systemPrompt = "You are an AI image processing assistant. Simulate background removal results.";
        userPrompt = `Process background removal for image: ${params.imageUrl} with replacement: ${params.bgColor}. Return JSON with resultUrl.`;
        useJsonFormat = true;
        break;

      case "generate_tags":
        systemPrompt = "You are an AI content tag generator. Analyze content and suggest relevant tags.";
        userPrompt = `Generate tags for: ${params.prompt}. Return JSON with tags (array), categories (array), keywords (array).`;
        useJsonFormat = true;
        break;

      // === TUTORIAL PLATFORM ACTIONS ===
      case "generate-quiz":
        systemPrompt = "You are an expert quiz creator for online courses. Generate quizzes with multiple choice questions. For each question include: the question, 4 options (A-D), the correct answer, and a brief explanation.";
        userPrompt = `Create ${params.numQuestions} ${params.difficulty} difficulty quiz questions about: ${params.topic}`;
        break;

      case "generate-outline":
        systemPrompt = "You are an expert curriculum designer. Create detailed course outlines with modules, lessons, learning objectives, and estimated durations.";
        userPrompt = `Create a ${params.modules}-module course outline for "${params.title}" targeting ${params.audience}. Include lesson titles, learning objectives, and estimated duration per lesson.`;
        break;

      case "tutor-chat": {
        systemPrompt = "You are an expert AI tutor. Help students understand concepts clearly. Use examples, analogies, and step-by-step explanations. Be encouraging and patient. Keep responses concise.";
        const messages = params.messages || [];
        
        const apiUrl = useLovable ? "https://ai.gateway.lovable.dev/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
        const apiKey = useLovable ? LOVABLE_API_KEY : openaiKey;
        const model = useLovable ? "google/gemini-2.5-flash-lite" : "gpt-4o-mini";
        
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model, messages: [{ role: "system", content: systemPrompt }, ...messages] }),
        });
        if (!response.ok) {
          const status = response.status;
          if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          if (status === 402) return new Response(JSON.stringify({ error: "Payment required." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          throw new Error(`AI error: ${status}`);
        }
        const chatData = await response.json();
        return new Response(JSON.stringify({ result: chatData.choices?.[0]?.message?.content || "No response" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "design-certificate":
        systemPrompt = "You are a certificate designer. Create detailed text for a beautiful certificate including layout description, wording, and accolades.";
        userPrompt = `Design a ${params.style} style certificate for "${params.studentName}" completing "${params.courseName}".`;
        break;

      case "plagiarism-check":
        systemPrompt = "You are a plagiarism detection expert. Analyze text for originality. Provide an originality score (0-100%), flag suspicious sections, and give recommendations.";
        userPrompt = `Analyze this text for originality:\n\n${params.text}`;
        break;

      case "translate-course":
        systemPrompt = "You are a professional course translator. Translate educational content accurately while preserving formatting, technical terms, and educational context. Maintain the same structure and tone.";
        userPrompt = `Translate this ${params.contentType} content to ${params.targetLang}:\n\n${params.content}`;
        break;

      case "analyze-reviews":
        systemPrompt = "You are an educational analytics expert. Analyze course reviews and provide: overall sentiment breakdown (positive/neutral/negative %), key themes, common praise points, common complaints, actionable improvement suggestions, and a brief executive summary.";
        userPrompt = `Analyze these course reviews and provide a detailed sentiment analysis report:\n\n${params.reviews}`;
        break;

      case "summarize-video":
        systemPrompt = "You are an expert note-taker and educational content summarizer. Create clear, well-structured study notes from video transcripts. Include key concepts, important details, and actionable takeaways.";
        userPrompt = `Create ${params.summaryType} summary notes for the video "${params.videoTitle || 'Untitled'}":\n\n${params.transcript}`;
        break;

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const apiUrl = useLovable ? "https://ai.gateway.lovable.dev/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
    const apiKey = useLovable ? LOVABLE_API_KEY : openaiKey;
    const model = useLovable ? "google/gemini-2.5-flash-lite" : "gpt-4o-mini";

    const fetchBody: any = {
      model,
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      max_tokens: 2000,
    };
    if (useJsonFormat && !useLovable) {
      fetchBody.response_format = { type: "json_object" };
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(fetchBody),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Payment required." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const err = await response.text();
      console.error("AI error:", err);
      throw new Error("AI processing failed");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    if (useJsonFormat) {
      try {
        const result = JSON.parse(content);
        return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch {
        return new Response(JSON.stringify({ result: content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("content-ai-tools error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
