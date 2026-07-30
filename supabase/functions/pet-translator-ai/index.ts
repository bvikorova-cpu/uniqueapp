import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { action, ...params } = await req.json();

    const costMap: Record<string, number> = { translate: 4, emotion: 4, health: 5, training: 4, diet: 4, behavior: 5,
      photo_emotion: 5, audio_translate: 5, health_certificate: 6, smart_reminders: 4,
      reverse_translate: 3, symptom_check: 5, breed_identify: 4, video_analyze: 6,
      daily_tip: 1, onboarding_personalize: 2 };
    const cost = costMap[action] || 4;

    const { data: credits } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    const remaining = credits?.credits_remaining || 0;
    if (remaining < cost) {
      return new Response(JSON.stringify({ error: `Not enough credits. Need ${cost}, have ${remaining}.` }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const prompts: Record<string, string> = {
      translate: `You are an expert animal behaviorist. Analyze this pet sound/behavior:
Pet type: ${params.pet_type || "unknown"}
Description: ${params.description || ""}

Provide: 1. **Detected Emotion** 2. **Translation** 3. **Confidence Level** 4. **Body Language Context** 5. **Recommended Response** 6. **Fun Fact**`,

      emotion: `You are a veterinary behaviorist. Analyze the pet's emotional state:
Pet type: ${params.pet_type || "unknown"}
Behavior: ${params.behavior || ""}

Provide: 1. **Primary Emotion** 2. **Stress Level** (1-10) 3. **Mood Assessment** 4. **Emotional Triggers** 5. **Comfort Recommendations** 6. **Long-term Tips**`,

      health: `You are a veterinary health consultant (NOT a replacement for a real vet).
Pet breed: ${params.breed || "unknown"}, Age: ${params.age || "unknown"}
Symptoms: ${params.symptoms || ""}

⚠️ DISCLAIMER: AI guidance only. Always consult a real vet.

Provide: 1. **Symptom Analysis** 2. **Possible Conditions** 3. **Urgency Level** 🟢🟡🔴 4. **Home Care Tips** 5. **When to See a Vet** 6. **Prevention Tips**`,

      training: `You are a certified pet trainer. Create a training plan:
Breed: ${params.breed || "unknown"}, Age: ${params.age || "unknown"}
Goal: ${params.training_goal || "general obedience"}
Owner experience: ${params.experience || "beginner"}

Provide: 1. **Overview** 2. **Week 1-2 Plan** 3. **Week 3-4 Plan** 4. **Key Commands** 5. **Common Mistakes** 6. **Reinforcement Tips** 7. **Troubleshooting**`,

      diet: `You are a pet nutritionist. Create a nutrition plan:
Breed: ${params.breed || "unknown"}, Weight: ${params.weight || "unknown"}kg, Age: ${params.age || "unknown"}
Activity: ${params.activity_level || "moderate"}, Restrictions: ${params.restrictions || "none"}

Provide: 1. **Daily Caloric Needs** 2. **Diet Type** 3. **Meal Schedule** 4. **Portion Sizes** 5. **Essential Nutrients** 6. **Foods to Avoid** 7. **Treat Recommendations** 8. **Hydration Guide**`,

      behavior: `You are an animal behavior specialist. Analyze:
Behavior: ${params.behavior_pattern || ""}
Pet: ${params.breed_age || "unknown"}, Environment: ${params.environment || "unknown"}

Provide: 1. **Classification** 2. **Root Cause** 3. **Environmental Factors** 4. **Modification Plan** 5. **Timeline** 6. **Owner's Role** 7. **When to Seek Professional Help**`,

      photo_emotion: `You are an expert pet emotion analyst. Based on a photo analysis of a ${params.pet_type || "pet"}:

Provide a comprehensive emotional analysis:
1. **Detected Emotions**: Primary and secondary emotions visible
2. **Stress Indicators**: Signs of stress or relaxation
3. **Body Language Reading**: Ears, tail, posture, eyes analysis
4. **Comfort Level**: How comfortable the pet appears (1-10)
5. **Energy Level**: Current energy state
6. **Social Mood**: How the pet likely feels about interaction right now
7. **Recommendations**: What the owner should do based on the detected mood
8. **Fun Interpretation**: A playful "quote" from the pet's perspective`,

      audio_translate: `You are an expert pet sound translator. A user recorded their ${params.pet_type || "pet"} for ${params.recording_duration || "unknown"} seconds.
Context: ${params.description || ""}

Provide a detailed sound translation:
1. **Sound Classification**: Type of vocalization detected
2. **Primary Message**: What the pet is communicating
3. **Emotional Tone**: The emotion behind the sound
4. **Urgency Level**: How urgent the communication is (1-10)
5. **Context Interpretation**: Why the pet might be making this sound now
6. **Recommended Response**: How to respond appropriately
7. **Similar Sounds Guide**: Other sounds this pet makes and their meanings
8. **Pet Quote**: A fun translation in the pet's "voice"`,

      health_certificate: `You are a veterinary health documentation specialist. Generate a professional health certificate:

Pet Name: ${params.pet_name || "Unknown"}
Breed: ${params.breed || "Unknown"}
Age: ${params.age || "Unknown"}
Weight: ${params.weight || "Unknown"} kg
Vaccinations: ${params.vaccinations || "Not specified"}
Known Conditions: ${params.conditions || "None reported"}

Generate a comprehensive health certificate including:
1. **CERTIFICATE HEADER**: Professional title with date
2. **Pet Identification**: Complete pet profile
3. **Health Status Summary**: Overall health assessment
4. **Vaccination Record**: Status of each vaccine mentioned
5. **Body Condition Score**: Based on weight and breed
6. **Nutritional Assessment**: Based on breed and weight
7. **Recommended Upcoming Care**: Next vaccinations, checkups due
8. **Wellness Recommendations**: Breed-specific health tips
9. **⚠️ DISCLAIMER**: This is an AI-generated report, not a veterinary document

Format professionally with clear sections and dates.`,

      smart_reminders: `You are a veterinary care scheduling specialist. Generate a comprehensive care schedule:

Pet Name: ${params.pet_name || "Unknown"}
Breed: ${params.breed || "Unknown"}
Age: ${params.age || "Unknown"}
Weight: ${params.weight || "Unknown"} kg

Create a detailed smart care schedule:
1. **Daily Schedule**: Feeding times, walks, play sessions, grooming
2. **Weekly Tasks**: Bathing, nail trimming, dental care, training sessions
3. **Monthly Tasks**: Flea/tick prevention, weight check, toy rotation
4. **Quarterly Tasks**: Vet checkups, blood work reminders
5. **Annual Tasks**: Vaccinations, comprehensive health exam
6. **Breed-Specific Care**: Special needs for this breed
7. **Seasonal Reminders**: Weather-related care adjustments
8. **Emergency Preparedness**: Signs to watch for that need immediate attention

Format with clear time slots and priority levels.`,

      reverse_translate: `You are a pet language reverse-translator. The human wants to say to their ${params.pet_type || "pet"}: "${params.message || ""}".
Generate exactly:
1. **Sound to make** (e.g., "soft 'meow-meow', high pitch, 2 seconds")
2. **Body language** the human should use (posture, eyes, hand position)
3. **Phonetic guide** the human can mimic (e.g., "Mrrrr-ow")
4. **What your pet will likely understand**
5. **Tip** to make it more convincing
Keep it short, fun, and actionable.`,

      symptom_check: `You are a veterinary triage assistant (NOT a vet replacement).
Pet: ${params.species || "dog"}, breed ${params.breed || "unknown"}, age ${params.age || "unknown"}.
Selected symptoms: ${(params.symptoms || []).join(", ")}.
Duration: ${params.duration || "unknown"}.

Provide:
1. **Most likely conditions** (top 3, plain language)
2. **Urgency** — return one of: 🟢 LOW (monitor at home), 🟡 MEDIUM (vet within 48h), 🔴 HIGH (urgent vet today)
3. **Immediate home care steps**
4. **Red-flag symptoms** that mean go to ER NOW
5. **Disclaimer** — AI guidance only`,

      breed_identify: `You are a pet breed identification expert. Based on this photo description: "${params.photo_description || params.description || ""}" of a ${params.species || "dog"}.
Provide:
1. **Most likely breed(s)** (top 3 with confidence %)
2. **Mix indicators** if mixed
3. **Typical traits** (size, temperament, energy)
4. **Common health concerns** for this breed
5. **Care tips** specific to the breed`,

      video_analyze: `You are an animal behavior video analyst. The user uploaded a ${params.duration || "10"}s video of their ${params.species || "pet"} described as: "${params.description || ""}".
Provide:
1. **Behavioral classification**
2. **Body language reading** (head, ears, tail, posture, eyes — frame by frame summary)
3. **Emotional state**
4. **Trigger analysis** (what likely caused this)
5. **Recommended response**
6. **Concern level** 🟢🟡🔴`,

      daily_tip: `Generate ONE concise (max 280 chars), actionable, fun daily care tip for a ${params.species || "pet"} owner. Include 1 emoji. No intro, no markdown.`,

      onboarding_personalize: `Based on quiz answers ${JSON.stringify(params.answers || {})}, write a 2-sentence personalized welcome for this pet owner and recommend the FIRST tool they should try (translate / emotion / health / training). Markdown OK.` };

    const prompt = prompts[action];
    if (!prompt) throw new Error("Invalid action: " + action);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const messages = [
      { role: "system", content: "You are a professional pet care AI assistant. Provide detailed, accurate, and helpful responses in Markdown format. Be warm and caring in tone." },
      { role: "user", content: prompt },
    ];

    const callProvider = async (url: string, key: string, model: string) =>
      await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages }) });

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    let aiResponse: Response | null = null;

    // 1) Try OpenAI with short backoff on 429
    if (OPENAI_API_KEY) {
      for (let attempt = 0; attempt < 2; attempt++) {
        aiResponse = await callProvider("https://api.openai.com/v1/chat/completions", OPENAI_API_KEY, "gpt-4o-mini");
        if (aiResponse.ok || (aiResponse.status !== 429 && aiResponse.status !== 402 && aiResponse.status < 500)) break;
        await sleep(800 * (attempt + 1));
      }
    }

    // 2) Fallback to Lovable AI Gateway
    if ((!aiResponse || !aiResponse.ok) && LOVABLE_API_KEY) {
      for (let attempt = 0; attempt < 2; attempt++) {
        const fallback = await callProvider("https://ai.gateway.lovable.dev/v1/chat/completions", LOVABLE_API_KEY, "google/gemini-2.5-flash");
        if (fallback.ok) { aiResponse = fallback; break; }
        aiResponse = fallback;
        if (fallback.status !== 429 && fallback.status < 500) break;
        await sleep(800 * (attempt + 1));
      }
    }

    if (!aiResponse) throw new Error("AI not configured");

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      const detail = await aiResponse.text().catch(() => "");
      console.error("pet-translator-ai upstream", status, detail.slice(0, 500));
      if (status === 429) return new Response(JSON.stringify({ error: "AI is busy right now. Please try again in a few seconds." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402 || status === 403) return new Response(JSON.stringify({ error: "AI credits exhausted for this workspace. Please top up AI credits to continue." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI service error (${status})`);
    }



    const aiData = await aiResponse.json();
    const result = aiData.choices?.[0]?.message?.content || "No result generated.";

    await supabase.from("ai_credits").update({ credits_remaining: remaining - cost }).eq("user_id", user.id);

    // Log usage for stats / leaderboards
    await supabase.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: `pet_${action}`,
      credits_used: cost,
      description: `Pet Translator: ${action}` });

    return new Response(JSON.stringify({ result, credits_used: cost, credits_remaining: remaining - cost }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("pet-translator-ai error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
