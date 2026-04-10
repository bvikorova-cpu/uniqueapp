import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Invalid session");

    const { action, ...params } = await req.json();

    const costMap: Record<string, number> = {
      translate: 4, emotion: 4, health: 5, training: 4, diet: 4, behavior: 5,
    };
    const cost = costMap[action] || 4;

    // Check credits
    const { data: credits } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    const remaining = credits?.credits_remaining || 0;
    if (remaining < cost) {
      return new Response(JSON.stringify({ error: `Not enough credits. Need ${cost}, have ${remaining}.` }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompts: Record<string, string> = {
      translate: `You are an expert animal behaviorist and pet communication specialist. Analyze the following pet sound/behavior description and provide a detailed translation.

Pet type: ${params.pet_type || "unknown"}
Sound/behavior description: ${params.description || ""}

Provide:
1. **Detected Emotion**: Primary emotion (e.g., Happy, Anxious, Hungry, Playful, Distressed)
2. **Translation**: What the pet is likely trying to communicate
3. **Confidence Level**: How confident the analysis is (percentage)
4. **Body Language Context**: What body language to look for to confirm
5. **Recommended Response**: How the owner should respond
6. **Fun Fact**: An interesting fact about this type of pet communication`,

      emotion: `You are a veterinary behaviorist specializing in animal emotions. Analyze the pet's current emotional state based on the described behavior.

Pet type: ${params.pet_type || "unknown"}
Behavior described: ${params.behavior || ""}

Provide a detailed report:
1. **Primary Emotion**: (e.g., Calm, Anxious, Excited, Fearful, Content)
2. **Stress Level**: (1-10 scale with explanation)
3. **Mood Assessment**: Overall mood description
4. **Emotional Triggers**: What might be causing this state
5. **Comfort Recommendations**: How to help if the pet is stressed
6. **Long-term Emotional Health Tips**: Advice for maintaining good emotional health`,

      health: `You are a veterinary health consultant (not a replacement for a real vet). Analyze the symptoms described and provide guidance.

Pet breed: ${params.breed || "unknown"}
Pet age: ${params.age || "unknown"}
Symptoms: ${params.symptoms || ""}

⚠️ IMPORTANT DISCLAIMER: This is AI-based guidance only and NOT a veterinary diagnosis. Always consult a real veterinarian.

Provide:
1. **Symptom Analysis**: What these symptoms might indicate
2. **Possible Conditions**: (listed with likelihood)
3. **Urgency Level**: 🟢 Low / 🟡 Medium / 🔴 High - Should they see a vet immediately?
4. **Home Care Tips**: What they can do right now
5. **When to See a Vet**: Clear guidance on vet visit timing
6. **Prevention Tips**: How to prevent similar issues`,

      training: `You are a certified professional dog/pet trainer. Create a personalized training plan.

Pet breed: ${params.breed || "unknown"}
Pet age: ${params.age || "unknown"}
Training goal: ${params.training_goal || "general obedience"}
Owner experience: ${params.experience || "beginner"}

Create a detailed training plan:
1. **Training Overview**: Summary of the approach
2. **Week 1-2 Plan**: Day-by-day exercises
3. **Week 3-4 Plan**: Progressive exercises
4. **Key Commands**: Step-by-step for each command
5. **Common Mistakes to Avoid**: Top 5 mistakes
6. **Positive Reinforcement Tips**: Reward strategies
7. **Troubleshooting**: What to do if the pet doesn't respond`,

      diet: `You are a pet nutritionist. Create a custom nutrition plan.

Pet breed: ${params.breed || "unknown"}
Weight: ${params.weight || "unknown"} kg
Age: ${params.age || "unknown"}
Activity level: ${params.activity_level || "moderate"}
Restrictions: ${params.restrictions || "none"}

Provide:
1. **Daily Caloric Needs**: Calculated estimate
2. **Recommended Diet Type**: (raw, kibble, wet, mixed)
3. **Meal Schedule**: How many meals and when
4. **Portion Sizes**: Specific amounts
5. **Essential Nutrients**: Key vitamins and minerals needed
6. **Foods to Avoid**: Dangerous foods for this pet
7. **Treat Recommendations**: Healthy treat options
8. **Hydration Guide**: Water intake recommendations`,

      behavior: `You are an animal behavior specialist. Provide a deep behavioral analysis.

Behavior pattern: ${params.behavior_pattern || ""}
Pet breed & age: ${params.breed_age || "unknown"}
Living environment: ${params.environment || "unknown"}

Provide:
1. **Behavior Classification**: Type of behavior (anxiety, territorial, playful, etc.)
2. **Root Cause Analysis**: Why the pet exhibits this behavior
3. **Environmental Factors**: How the environment affects behavior
4. **Modification Plan**: Step-by-step behavior modification
5. **Timeline**: Expected timeline for improvement
6. **Owner's Role**: What the owner needs to change
7. **Professional Help**: When to seek a professional behaviorist`,
    };

    const prompt = prompts[action];
    if (!prompt) throw new Error("Invalid action");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a professional pet care AI assistant. Provide detailed, accurate, and helpful responses in Markdown format. Be warm and caring in tone." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI service payment required." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI service error");
    }

    const aiData = await aiResponse.json();
    const result = aiData.choices?.[0]?.message?.content || "No result generated.";

    // Deduct credits
    await supabase.from("ai_credits").update({
      credits_remaining: remaining - cost,
    }).eq("user_id", user.id);

    return new Response(JSON.stringify({ result, credits_used: cost, credits_remaining: remaining - cost }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("pet-translator-ai error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
