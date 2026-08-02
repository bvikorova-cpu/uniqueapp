import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Not authenticated");

    const { match_id, category } = await req.json();
    if (!match_id || !category) throw new Error("match_id and category required");

    // Get match info
    const { data: match } = await supabase
      .from("brain_duel_matches")
      .select("*")
      .eq("id", match_id)
      .single();

    if (!match) throw new Error("Match not found");

    const totalQuestions = match.total_questions || 10;

    // ---- Anti-duplicate: collect every question both players already answered ----
    const playerIds = [match.player1_id, match.player2_id].filter(Boolean);
    const seenIds = new Set<string>();
    const seenTexts: string[] = [];
    if (playerIds.length) {
      const { data: prevAnswers } = await supabase
        .from("brain_duel_answers")
        .select("question_id")
        .in("user_id", playerIds)
        .limit(2000);
      (prevAnswers || []).forEach((a: any) => a.question_id && seenIds.add(a.question_id));
      const ids = Array.from(seenIds);
      if (ids.length) {
        const { data: seenQs } = await supabase
          .from("brain_duel_questions")
          .select("question")
          .in("id", ids.slice(-300));
        (seenQs || []).forEach((q: any) => q.question && seenTexts.push(q.question));
      }
    }

    // Fallback: serve questions from the existing question bank so a duel never
    // dies on an AI outage / rate limit (entry credits are already deducted).
    const serveFromBank = async (reason: string) => {
      console.warn("Falling back to question bank:", reason);
      const fetchBank = async (useCategory: boolean) => {
        // Random window over the bank so repeated duels don't hit the same rows.
        const offset = Math.floor(Math.random() * 500);
        let q = supabase
          .from("brain_duel_questions")
          .select("id, question, option_a, option_b, option_c, option_d, difficulty");
        if (useCategory) q = q.eq("category", category);
        const { data } = await q.range(offset, offset + 199);
        if (data && data.length) return data;
        const { data: head } = await (useCategory
          ? supabase.from("brain_duel_questions").select("id, question, option_a, option_b, option_c, option_d, difficulty").eq("category", category).limit(200)
          : supabase.from("brain_duel_questions").select("id, question, option_a, option_b, option_c, option_d, difficulty").limit(200));
        return head || [];
      };

      let bank = await fetchBank(true);
      let fresh = bank.filter((q: any) => !seenIds.has(q.id));
      if (fresh.length < totalQuestions) {
        const any = await fetchBank(false);
        const merged = [...fresh, ...any.filter((q: any) => !seenIds.has(q.id) && !fresh.some((f: any) => f.id === q.id))];
        fresh = merged;
      }
      // Only if there is genuinely nothing fresh do we allow repeats.
      const pool = fresh.length >= totalQuestions ? fresh : (fresh.length ? fresh : bank);
      if (!pool || pool.length === 0) return null;
      const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, totalQuestions);
      return new Response(JSON.stringify({ questions: shuffled, source: "bank" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    };


    // Generate questions with AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      const fb = await serveFromBank("missing_api_key");
      if (fb) return fb;
      throw new Error("AI API key not configured");
    }

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 1.1,
        messages: [
          {
            role: "system",
            content: "You generate trivia quiz questions. Return ONLY valid JSON array, no markdown."
          },
          {
            role: "user",
            content: `Generate ${totalQuestions} unique trivia questions about "${category}". Mix easy, medium and hard difficulty.
Randomisation seed: ${crypto.randomUUID()} (use it to pick fresh, varied subtopics every time).

CRITICAL RULES:
- "correct_answer_text" MUST be EXACTLY equal (character-for-character, same casing) to one of option_a/b/c/d
- Do NOT invent a new string — copy it verbatim from the matching option
- Each question must have exactly 4 distinct options
- Questions must be factual and verifiable
- Mix difficulties (~30% easy, 40% medium, 30% hard)
- No duplicate questions
- Cover different subtopics/eras/regions than typical "top 10" trivia
${seenTexts.length ? `\nDO NOT repeat or paraphrase any of these already-used questions:\n${seenTexts.slice(-60).map((t) => `- ${t}`).join("\n")}` : ""}`

          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_questions",
              description: "Generate trivia questions",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        option_a: { type: "string" },
                        option_b: { type: "string" },
                        option_c: { type: "string" },
                        option_d: { type: "string" },
                        correct_answer_text: { type: "string", description: "Must exactly match one of the four options verbatim" },
                        difficulty: { type: "string", enum: ["easy", "medium", "hard"] }
                      },
                      required: ["question", "option_a", "option_b", "option_c", "option_d", "correct_answer_text", "difficulty"]
                    }
                  }
                },
                required: ["questions"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_questions" } }
      }) });

    if (!aiResponse.ok) {
      const fb = await serveFromBank(`ai_status_${aiResponse.status}`);
      if (fb) return fb;
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds to workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    
    let generatedQuestions;
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      const parsed = JSON.parse(toolCall.function.arguments);
      generatedQuestions = parsed.questions;
    } else {
      // Fallback: try parsing content directly
      const content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        generatedQuestions = JSON.parse(jsonMatch[0]);
      } else {
        const fb = await serveFromBank("parse_failed");
        if (fb) return fb;
        throw new Error("Failed to parse AI response");
      }
    }

    // Store questions in DB — derive correct_answer letter from text to prevent AI mislabeling
    const norm = (s: string) => (s || "").trim().toLowerCase();
    const questionsToInsert = generatedQuestions
      .map((q: any) => { const opts: Record<string, string> = {
          a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d };
        const target = norm(q.correct_answer_text || q.correct_answer || "");
        let letter = (["a", "b", "c", "d"] as const).find((k) => norm(opts[k]) === target);
        // Fallback: if AI returned a single letter, accept it
        if (!letter && ["a", "b", "c", "d"].includes(norm(q.correct_answer || ""))) {
          letter = norm(q.correct_answer) as "a" | "b" | "c" | "d";
        }
        if (!letter) return null;
        return { category,
          question: q.question,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_answer: letter,
          difficulty: q.difficulty || "medium" };
      })
      .filter(Boolean)
      // Drop anything the players already saw in earlier duels.
      .filter((q: any) => !seenTexts.some((t) => norm(t) === norm(q.question)));


    if (questionsToInsert.length === 0) {
      const fb = await serveFromBank("no_valid_questions");
      if (fb) return fb;
      throw new Error("AI returned no valid questions");
    }

    const { data: savedQuestions, error: qError } = await supabase
      .from("brain_duel_questions")
      .insert(questionsToInsert)
      .select();

    if (qError) {
      const fb = await serveFromBank("insert_failed");
      if (fb) return fb;
      throw qError;
    }

    // Return questions without correct_answer
    const clientQuestions = savedQuestions.map((q: any) => ({ id: q.id,
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      difficulty: q.difficulty }));

    return new Response(JSON.stringify({ questions: clientQuestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Get questions error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
