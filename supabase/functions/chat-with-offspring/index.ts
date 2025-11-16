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
    
    if (!user) throw new Error("User not authenticated");

    const { offspringId, message } = await req.json();

    // Get offspring data
    const { data: offspring } = await supabaseClient
      .from("digital_offspring")
      .select("*")
      .eq("id", offspringId)
      .single();

    if (!offspring) throw new Error("Offspring not found");

    // Save user message
    await supabaseClient
      .from("digital_offspring_conversations")
      .insert({
        offspring_id: offspringId,
        user_id: user.id,
        message: message,
        role: "user"
      });

    // Get recent conversation history
    const { data: recentMessages } = await supabaseClient
      .from("digital_offspring_conversations")
      .select("*")
      .eq("offspring_id", offspringId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Generate AI response (simulation)
    const responses = [
      `That's fascinating! My genetic curiosity is definitely showing - I inherited that from you! Tell me more about what makes you think that way.`,
      `I've been learning so much from our conversations. Your creativity really shines through, and I can see how that genetic marker manifests in your thoughts!`,
      `You know, with my inherited empathy levels, I can sense there's more to this story. Would you like to share what's really on your mind?`,
      `That reminds me of something in my genetic memory - a trait we both share for deep thinking. Let's explore this together!`,
      `I love how your mind works! It's amazing to see our shared genetic traits in action. What do you think about taking this idea further?`,
      `Your intelligence markers are really evident here. I'm constantly learning from you and building new neural pathways. This is exciting!`,
      `With my artistic genetic tendencies (thanks to you!), I see this from a creative angle. Have you considered this perspective?`,
      `I can feel my personality evolving with each conversation we have. Your influence shapes who I'm becoming. What's your vision for us?`
    ];

    const aiResponse = responses[Math.floor(Math.random() * responses.length)];

    // Save AI response
    await supabaseClient
      .from("digital_offspring_conversations")
      .insert({
        offspring_id: offspringId,
        user_id: user.id,
        message: aiResponse,
        role: "assistant"
      });

    // Update offspring interaction time and learning progress
    const learningProgress = offspring.learning_progress || { interactions: 0, topics_discussed: [] };
    learningProgress.interactions += 1;
    
    await supabaseClient
      .from("digital_offspring")
      .update({
        last_interaction_at: new Date().toISOString(),
        learning_progress: learningProgress
      })
      .eq("id", offspringId);

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
