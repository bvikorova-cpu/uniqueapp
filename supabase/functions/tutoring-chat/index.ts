import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Resolve userId from JWT so rate limit is per-user (not shared across IPs).
    let userId: string | undefined;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const supa = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        );
        const { data } = await supa.auth.getUser(authHeader.replace("Bearer ", ""));
        userId = data.user?.id;
      } catch (_e) { /* fall back to IP-based limit */ }
    }

    // Per-user (or per-IP) rate limit: 50 messages / 5 min.
    const rateLimitResponse = await withRateLimit(
      req,
      RATE_LIMITS.ai_chat,
      corsHeaders,
      userId,
    );
    if (rateLimitResponse) return rateLimitResponse;

    const { message, history = [] } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Defensive payload caps to keep prompt size predictable.
    const safeMessage = typeof message === "string" ? message.slice(0, 4000) : "";
    if (!safeMessage.trim()) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    const safeHistory = Array.isArray(history) ? history.slice(-20) : [];

    const messages = [
      {
        role: "system",
        content: "You are an experienced online teacher and tutor. ALWAYS respond in English, never in any other language. You explain concepts clearly with examples and patience. You help students understand material, solve problems step by step, and motivate them in learning. You are friendly and supportive. IMPORTANT: All your responses must be in English only."
      },
      ...safeHistory,
      { role: "user", content: safeMessage }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in tutoring-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
