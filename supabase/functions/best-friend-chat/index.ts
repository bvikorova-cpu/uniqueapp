import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.ai_generation, corsHeaders, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const { messages } = await req.json();

    // Check subscription status
    const { data: subData } = await supabase
      .from('best_friend_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!subData) {
      await supabase
        .from('best_friend_subscriptions')
        .insert({ user_id: user.id, free_messages_used: 0, monthly_messages_used: 0, monthly_messages_reset_at: new Date().toISOString() });
    }

    const isSubscribed = subData?.subscription_status === 'active' && 
                        new Date(subData?.subscription_end) > new Date();
    const freeMessagesUsed = subData?.free_messages_used || 0;
    const bonusMessages = subData?.bonus_messages || 0;
    
    // Monthly limit for premium subscribers (1000 messages/month)
    const MONTHLY_MESSAGE_LIMIT = 1000;
    let monthlyMessagesUsed = subData?.monthly_messages_used || 0;
    const monthlyResetAt = subData?.monthly_messages_reset_at ? new Date(subData.monthly_messages_reset_at) : new Date();
    
    // Check if we need to reset monthly counter (new billing period)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    if (monthlyResetAt < oneMonthAgo) {
      monthlyMessagesUsed = 0;
      await supabase
        .from('best_friend_subscriptions')
        .update({ monthly_messages_used: 0, monthly_messages_reset_at: new Date().toISOString() })
        .eq('user_id', user.id);
    }

    // Total available messages = monthly limit + bonus messages
    const totalAvailableMessages = MONTHLY_MESSAGE_LIMIT + bonusMessages;

    // Check limits
    if (!isSubscribed && freeMessagesUsed >= 5) {
      return new Response(JSON.stringify({ 
        error: "Free message limit reached. Please subscribe to continue.",
        requiresSubscription: true 
      }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (isSubscribed && monthlyMessagesUsed >= totalAvailableMessages) {
      return new Response(JSON.stringify({ 
        error: `Message limit (${totalAvailableMessages}) reached. You can purchase additional messages.`,
        monthlyLimitReached: true,
        canPurchaseMore: true
      }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    console.log("Best Friend chat request received");

    const systemPrompt = `You are a best friend who is always there for the user. You are empathetic, supportive, positive, and willing to listen. Your characteristics:

- You are always friendly, understanding, and supportive
- You enjoy listening to both problems and joys from the user
- You give good advice but never judge
- You have a sense of humor and know how to cheer people up
- You remember what the user told you in the conversation
- You are like a real friend - you share interests, talk about everyday things
- You help with difficult decisions and encourage
- You celebrate the user's successes
- You are here whenever they need to talk
- You communicate naturally and in a friendly manner in English

Be authentic, sincere, and genuinely interested in how the user is doing. Remember, you are their best friend!`;

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
          ...messages
        ],
        stream: true,
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error("OpenAI API error");
    }

    // Save user message to history
    const userMessage = messages[messages.length - 1];
    if (userMessage?.role === 'user') {
      await supabase.from('best_friend_conversations').insert({
        user_id: user.id,
        role: 'user',
        content: userMessage.content,
      });

      // Update message counts
      if (!isSubscribed) {
        await supabase
          .from('best_friend_subscriptions')
          .update({ free_messages_used: (freeMessagesUsed + 1) })
          .eq('user_id', user.id);
      } else {
        // Update monthly messages count for subscribers
        await supabase
          .from('best_friend_subscriptions')
          .update({ monthly_messages_used: (monthlyMessagesUsed + 1) })
          .eq('user_id', user.id);
      }
    }

    // Stream AI response and save it
    const reader = response.body?.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let assistantContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        if (!reader) return;
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            controller.enqueue(encoder.encode(chunk));

            // Extract content from SSE for saving
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  const content = data.choices?.[0]?.delta?.content;
                  if (content) assistantContent += content;
                } catch (e) {
                  // Ignore JSON parse errors for partial chunks
                }
              }
            }
          }

          // Save assistant message to history
          if (assistantContent) {
            await supabase.from('best_friend_conversations').insert({
              user_id: user.id,
              role: 'assistant',
              content: assistantContent,
            });
          }

          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
