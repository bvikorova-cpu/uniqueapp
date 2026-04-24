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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { subject, message, faq = [] }: TriageRequest = await req.json();

    if (!subject || !message || subject.length > 300 || message.length > 5000) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");

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
        model: "gpt-5",
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
      console.error("AI gateway error:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
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
