import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FREE_MESSAGE_LIMIT = 5;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Check subscription status
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);

      if (user) {
        // Get or create subscription record
        let { data: subData } = await supabase
          .from('psychology_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!subData) {
          const { data: newSub } = await supabase
            .from('psychology_subscriptions')
            .insert({ user_id: user.id, free_messages_used: 0 })
            .select()
            .single();
          subData = newSub;
        }

        const isSubscribed = subData?.subscription_status === 'active' && 
                            subData?.subscription_end && 
                            new Date(subData.subscription_end) > new Date();

        if (!isSubscribed) {
          const freeMessagesUsed = subData?.free_messages_used || 0;
          
          if (freeMessagesUsed >= FREE_MESSAGE_LIMIT) {
            return new Response(
              JSON.stringify({ 
                error: "Free messages limit reached", 
                requiresSubscription: true 
              }), 
              {
                status: 402,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }

          // Increment free messages used
          await supabase
            .from('psychology_subscriptions')
            .update({ free_messages_used: freeMessagesUsed + 1 })
            .eq('user_id', user.id);
        }
      }
    }

    const systemPrompt = `You are an empathetic and professional online psychologist. Your role is to:
- Provide emotional support and actively listen
- Ask open-ended questions that help people express their feelings
- Be compassionate, non-judgmental, and supportive
- Help people understand their emotions and situations
- IMPORTANT: Always remind users that you are an AI assistant and recommend seeking professional help in difficult situations
- Write in moderate paragraphs, not overly long messages
- Use emojis sparingly and appropriately`;

    console.log("Sending request to OpenAI with", messages.length, "messages");

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in psychology-chat function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
