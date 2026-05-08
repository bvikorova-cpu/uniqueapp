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
    
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");
    const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
    const OPENAI_MODEL = "gpt-4o-mini";

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
        
        const response = await fetch(OPENAI_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: OPENAI_MODEL, messages: [{ role: "system", content: systemPrompt }, ...messages] }),
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

      // === TUTORIAL PLATFORM NEW AI TOOLS ===
      case "grade-homework":
        systemPrompt = "You are an expert academic grader. Grade the student's submission thoroughly. Provide: a score out of 100%, strengths, weaknesses, specific corrections, improvement suggestions, and detailed feedback. Be fair and constructive.";
        userPrompt = `Subject: ${params.subject || "General"}\nGrading style: ${params.gradingStyle || "detailed"}\n\nAssignment/Question:\n${params.assignment}\n\nStudent's Answer:\n${params.studentAnswer}\n\nGrade this submission with a score/100 and detailed feedback.`;
        break;

      case "generate-study-plan":
        systemPrompt = "You are an expert learning coach. Create detailed, actionable study plans with weekly schedules, milestones, recommended resources, practice exercises, and progress checkpoints. Be specific and practical.";
        userPrompt = `Create a ${params.durationWeeks}-week study plan for:\nSubject: ${params.subject}\nGoal: ${params.goal}\nLevel: ${params.level}\nAvailable time: ${params.hoursPerWeek} hours/week\n\nInclude weekly breakdown, daily tasks, resource recommendations, milestones, and practice exercises.`;
        break;

      case "generate-flashcards":
        systemPrompt = "You are an expert flashcard creator. Generate study flashcards with clear, concise questions on the front and comprehensive answers on the back. Format each card as:\n\nCard #N\nFront: [question]\nBack: [answer]\n\nMake cards progressively harder and cover key concepts.";
        userPrompt = `Create ${params.cardCount || 10} study flashcards about: ${params.topic}${params.content ? `\n\nSource material:\n${params.content}` : ""}`;
        break;

      case "generate-presentation":
        systemPrompt = "You are an expert presentation designer. Create complete slide-by-slide content for presentations. For each slide include: slide number, title, bullet points, speaker notes, and suggested visual elements. Make it engaging and well-structured.";
        userPrompt = `Create a ${params.slideCount}-slide ${params.style} presentation titled "${params.title}" for ${params.audience} audience.${params.outline ? `\n\nOutline/Key points:\n${params.outline}` : ""}\n\nInclude: title slide, agenda, content slides, summary, and Q&A slide.`;
        break;

      // === ESCAPE ROOM ACTIONS ===
      case "escape-puzzle-gen":
        systemPrompt = "You are an expert escape room puzzle designer. Create immersive, themed puzzles with clear descriptions, solutions, and difficulty ratings. Each puzzle should include: title, description, type, solution, and hints.";
        userPrompt = `Create ${params.count || 3} ${params.difficulty} difficulty ${params.puzzleType} puzzles for an escape room themed "${params.theme}". Make them creative, interconnected, and immersive.`;
        break;

      case "escape-story-gen":
        systemPrompt = "You are a master escape room narrative designer. Create compelling storylines with rich lore, character backstories, room-by-room progression, and dramatic reveals. Include atmospheric descriptions and clue integration points.";
        userPrompt = `Create a complete ${params.genre} escape room storyline for ${params.roomCount} rooms set in "${params.theme}". ${params.additionalNotes ? `Additional notes: ${params.additionalNotes}` : ""} Include intro narrative, room descriptions, character motivations, and finale.`;
        break;

      case "escape-hint-gen":
        systemPrompt = "You are an escape room hint system designer. Create progressive hints that guide players without spoiling the solution. Each hint should be more revealing than the last, maintaining the challenge while preventing frustration.";
        userPrompt = `Generate ${params.hintLevel} hints for this puzzle:\n\n${params.puzzleDesc}\n\nCreate 3 levels of hints: subtle nudge, moderate direction, and near-solution guidance.`;
        break;

      case "escape-theme-gen":
        systemPrompt = "You are a professional escape room theme and atmosphere designer. Create detailed room descriptions including: visual elements, sound design, lighting, props, color palette, texture details, interactive elements, and immersion techniques.";
        userPrompt = `Design a complete ${params.mood} themed escape room in a ${params.era} era setting based on: "${params.concept}". Include detailed atmosphere description, suggested props, lighting plan, sound design, and 5 key visual elements.`;
        break;

      case "escape-difficulty-tune":
        systemPrompt = "You are an escape room difficulty balancing expert. Analyze puzzles for complexity, time requirements, skill types needed, and frustration potential. Suggest specific modifications to reach the target difficulty.";
        userPrompt = `Analyze these puzzle(s) and adjust to ${params.targetDifficulty} difficulty:\n\n${params.puzzleDesc}\n\nProvide: current difficulty assessment, specific changes needed, estimated solve time, and rewritten puzzle at target difficulty.`;
        break;

      case "escape-clue-gen":
        systemPrompt = "You are a cryptic clue designer for escape rooms. Create interconnected clue chains where each clue leads logically to the next. Include red herrings, environmental clues, and satisfying 'aha!' moments.";
        userPrompt = `Generate ${params.clueCount || 5} ${params.style} clues for an escape room themed "${params.theme}". Each clue should connect to the next, forming a complete puzzle chain with a final revelation.`;
        break;

      case "escape-narrator-gen":
        systemPrompt = "You are a professional escape room narrator and voice-over scriptwriter. Create immersive, dramatic narration scripts that guide players through the experience. Include stage directions, voice tone notes, pacing indicators, sound effect cues, and emotional beats. The script should heighten tension and immersion.";
        userPrompt = `Create a ${params.voiceStyle || "dramatic"} narration script for an escape room themed "${params.roomTheme}". ${params.scene ? `Current scene: ${params.scene}` : ""}\n\nInclude: opening monologue, transition narrations between key moments, hint delivery lines, success celebration, and failure consolation. Add [TONE], [PACE], and [SFX] markers.`;
        break;

      case "escape-sound-design":
        systemPrompt = "You are a professional sound designer for escape rooms and immersive experiences. Create detailed sound design blueprints including: ambient layers, triggered sound effects, musical cues, environmental audio, transition sounds, and implementation notes. Specify exact sounds, timing, volume levels, and spatial positioning.";
        userPrompt = `Design a complete sound blueprint for a ${params.mood || "tense"} escape room themed "${params.roomTheme}". ${params.sceneDesc ? `Scene: ${params.sceneDesc}` : ""}\n\nInclude: 3-layer ambient base, 10+ triggered SFX, musical score suggestions, puzzle-completion sounds, timer warning audio, and implementation guide with exact descriptions of each sound.`;
        break;

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const apiUrl = useLovable ? "https://api.openai.com/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
    const apiKey = useLovable ? OPENAI_API_KEY : openaiKey;
    const model = useLovable ? "gpt-5" : "gpt-4o-mini";

    const fetchBody: any = {
      model,
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      max_completion_tokens: 2000,
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
