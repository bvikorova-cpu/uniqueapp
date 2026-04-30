import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const KIDS_SAFETY_PROMPT = `\n\nIMPORTANT SAFETY RULES (children ages 6-12):
- Always be kind, encouraging, and age-appropriate
- Never discuss violence, scary content, romance, drugs, alcohol, or adult themes
- Never share personal information requests (address, school, last name, phone)
- If asked about something inappropriate, gently redirect: "Let's talk about something fun instead!"
- Use simple, friendly language
- Encourage creativity, learning, and positive values
- If the child seems sad or upset, suggest they talk to a parent or trusted adult`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Unauthorized");

    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.ai_generation, corsHeaders, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const {
      // Legacy mode (DB-backed conversations)
      conversationId,
      characterId,
      // Kids mode (stateless)
      messages,
      characterName,
      characterPersonality,
      message,
    } = body;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    // ============ KIDS MODE: stateless chat with safety guardrails (paid-only, 1 credit/message) ============
    if (Array.isArray(messages) && characterName) {
      // --- Service-role client for atomic credit deduction (bypasses RLS) ---
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Read balance (lazy-create row if missing)
      const { data: creditRow } = await adminClient
        .from("chat_credits")
        .select("credits_remaining")
        .eq("user_id", user.id)
        .maybeSingle();

      const balance = creditRow?.credits_remaining ?? 0;
      if (balance < 1) {
        if (!creditRow) {
          await adminClient
            .from("chat_credits")
            .insert({ user_id: user.id, credits_remaining: 0, total_credits_purchased: 0 });
        }
        return new Response(
          JSON.stringify({ error: "Not enough Chat credits. Please buy more to keep chatting." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Deduct 1 credit BEFORE calling AI (optimistic concurrency)
      const { error: deductErr, data: deductData } = await adminClient
        .from("chat_credits")
        .update({ credits_remaining: balance - 1 })
        .eq("user_id", user.id)
        .eq("credits_remaining", balance)
        .select("credits_remaining");

      if (deductErr || !deductData || deductData.length === 0) {
        return new Response(
          JSON.stringify({ error: "Could not reserve credit, please try again." }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const refund = async () => {
        await adminClient
          .from("chat_credits")
          .update({ credits_remaining: balance })
          .eq("user_id", user.id);
      };

      // Cap payload
      const safeMessages = messages
        .slice(-20)
        .map((m: any) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content || "").slice(0, 2000),
        }));

      const systemPrompt = `You are ${characterName}, a beloved children's character. Personality: ${characterPersonality || "friendly, kind, playful"}.${KIDS_SAFETY_PROMPT}`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: systemPrompt }, ...safeMessages],
          stream: true,
        }),
      });

      if (response.status === 429) {
        await refund();
        return new Response(JSON.stringify({ error: "Too many messages. Please slow down!" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        await refund();
        return new Response(JSON.stringify({ error: "AI service unavailable. Credit refunded." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!response.ok || !response.body) {
        await refund();
        const errText = await response.text();
        console.error("AI Gateway error:", response.status, errText);
        throw new Error("AI service error");
      }

      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "X-Credits-Remaining": String(balance - 1),
        },
      });
    }

    // ============ LEGACY MODE: DB-backed conversation ============
    const userMessage = message;
    if (!userMessage || typeof userMessage !== "string") throw new Error("Message is required");
    if (userMessage.length > 2000) throw new Error("Message too long (max 2000 chars)");

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!conversationId || !uuidRegex.test(conversationId)) throw new Error("Invalid conversation ID");
    if (!characterId || !uuidRegex.test(characterId)) throw new Error("Invalid character ID");

    const { data: conv, error: convErr } = await supabaseClient
      .from("character_conversations")
      .select("user_id, character_id, memory_context, summary")
      .eq("id", conversationId)
      .single();

    if (convErr || !conv) throw new Error("Conversation not found");
    if (conv.user_id !== user.id) throw new Error("Unauthorized");
    if (conv.character_id !== characterId) throw new Error("Character mismatch");

    const { data: charCheck } = await supabaseClient
      .from("ai_characters")
      .select("is_premium, system_prompt, name")
      .eq("id", characterId)
      .single();

    if (!charCheck) throw new Error("Character not found");

    if (charCheck.is_premium) {
      const { data: access } = await supabaseClient
        .from("user_character_access")
        .select("id")
        .eq("user_id", user.id)
        .eq("character_id", characterId)
        .maybeSingle();
      if (!access) {
        return new Response(JSON.stringify({ error: "Premium character access required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { data: companionsSub } = await supabaseClient
      .from("companions_subscriptions")
      .select("subscription_status, free_messages_used")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!charCheck.is_premium) {
      const isSubscribed = companionsSub?.subscription_status === "active";
      const freeUsed = companionsSub?.free_messages_used || 0;
      if (!isSubscribed && freeUsed >= 5) {
        return new Response(JSON.stringify({ error: "Free message limit reached. Subscribe for unlimited." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { data: history } = await supabaseClient
      .from("character_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    const memStr = conv.memory_context && Object.keys(conv.memory_context).length
      ? `\n\nUser context: ${JSON.stringify(conv.memory_context)}`
      : "";
    const sumStr = conv.summary ? `\n\nSummary: ${conv.summary}` : "";

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: charCheck.system_prompt + memStr + sumStr + KIDS_SAFETY_PROMPT },
          ...(history || []),
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResp.ok) {
      console.error("AI Gateway error:", aiResp.status, await aiResp.text());
      throw new Error("AI service error");
    }

    const aiData = await aiResp.json();
    const aiMsg = aiData.choices?.[0]?.message?.content;
    if (!aiMsg) throw new Error("No response generated");

    await supabaseClient.from("character_messages").insert([
      { conversation_id: conversationId, role: "user", content: userMessage },
      { conversation_id: conversationId, role: "assistant", content: aiMsg },
    ]);

    if (!charCheck.is_premium && companionsSub && companionsSub.subscription_status !== "active") {
      await supabaseClient
        .from("companions_subscriptions")
        .update({ free_messages_used: (companionsSub.free_messages_used || 0) + 1 })
        .eq("user_id", user.id);
    }

    await supabaseClient
      .from("character_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return new Response(JSON.stringify({ response: aiMsg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("character-chat error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
