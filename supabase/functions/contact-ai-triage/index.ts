// AI triage for incoming contact messages — categorizes, suggests FAQ, detects sentiment & language
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface TriageRequest {
  subject: string;
  message: string;
  faq?: Array<{ id: string; category: string; question: string; keywords?: string[] }>;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");

    if (body.action === "live_chat" || Array.isArray(body.messages)) {
      const messages = Array.isArray(body.messages) ? (body.messages as ChatMessage[]).slice(-20) : [];
      const safeMessages = messages
        .filter((m) => ["user", "assistant"].includes(m?.role) && typeof m?.content === "string")
        .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

      if (!safeMessages.length) {
        return new Response(JSON.stringify({ error: "messages required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are the Unique support assistant — friendly, concise, multilingual, and policy-safe. Unique is a paid creator platform using EUR, AI tools cost credits, main platform is 16+, Kids Channel is 6–12. Help with account, subscriptions, AI credits, payouts, profile, and technical issues. For refunds, KYC disputes, legal, or sensitive account actions, direct the user to submit the contact ticket form. Never invent prices or policies. Keep replies under 4 short sentences when possible.",
            },
            ...safeMessages,
          ],
          temperature: 0.4,
          max_tokens: 500,
        }),
      });

      if (!resp.ok) {
        const t = await resp.text();
        console.error("OpenAI live chat error:", resp.status, t);
        return new Response(JSON.stringify({ error: "AI service error", status: resp.status }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await resp.json();
      return new Response(JSON.stringify({ reply: data?.choices?.[0]?.message?.content ?? "" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject, message, faq = [] }: TriageRequest = body;

    if (!subject || !message || subject.length > 300 || message.length > 5000) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const faqList = faq.slice(0, 30).map((f) => `${f.id} | [${f.category}] ${f.question}`).join("\n");

    const systemPrompt = `You are a customer-support triage AI. Classify incoming messages, detect sentiment and language, and suggest the most relevant FAQ entry (if any). Always respond via the provided tool.`;

    const userPrompt = `Subject: ${subject}\n\nMessage: ${message}\n\nAvailable FAQ entries (id | [category] question):\n${faqList || "(none)"}`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "triage_message",
              description: "Categorize a support message and suggest a relevant FAQ entry.",
              parameters: {
                type: "object",
                properties: {
                  category: {
                    type: "string",
                    enum: ["support", "billing", "bug", "feature", "partnership", "press", "account"],
                  },
                  priority: { type: "string", enum: ["low", "normal", "high", "urgent"] },
                  sentiment: { type: "string", enum: ["positive", "neutral", "negative", "frustrated"] },
                  language: { type: "string", description: "ISO 639-1 code (e.g. en, sk, de, es)" },
                  suggested_faq_id: {
                    type: "string",
                    description: "UUID of the most relevant FAQ entry, or empty string if none fits well.",
                  },
                  confidence: { type: "number", minimum: 0, maximum: 1 },
                  summary: { type: "string", description: "One-sentence English summary of the issue (max 140 chars)." },
                },
                required: ["category", "priority", "sentiment", "language", "suggested_faq_id", "confidence", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "triage_message" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit, try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await resp.text();
      console.error("OpenAI API error:", resp.status, t);
      return new Response(JSON.stringify({ error: "OpenAI API error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments) : null;

    if (!args) {
      return new Response(JSON.stringify({ error: "No triage result" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("triage error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
