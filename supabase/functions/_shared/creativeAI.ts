// Shared chat-completion helper for Creative Forge functions.
// Prefers the Lovable AI Gateway and falls back to direct OpenAI (and back again)
// when a provider is rate limited (429) or out of credits/quota (402).

export interface CreativeAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class CreativeAIError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "CreativeAIError";
  }
}

export async function callCreativeAI(messages: CreativeAIMessage[]): Promise<string> {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!OPENAI_API_KEY && !LOVABLE_API_KEY) {
    throw new CreativeAIError(500, "AI is not configured");
  }

  const call = (useGateway: boolean) =>
    fetch(
      useGateway
        ? "https://ai.gateway.lovable.dev/v1/chat/completions"
        : "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: useGateway
          ? { "Lovable-API-Key": LOVABLE_API_KEY!, "Content-Type": "application/json" }
          : { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: useGateway ? "openai/gpt-5.4-mini" : "gpt-4o-mini",
          messages,
        }),
      },
    );

  let usingGateway = !!LOVABLE_API_KEY;
  let res = await call(usingGateway);

  // Provider exhausted -> switch to the other provider once.
  if (!res.ok && (res.status === 429 || res.status === 402)) {
    const canSwitch = usingGateway ? !!OPENAI_API_KEY : !!LOVABLE_API_KEY;
    if (canSwitch) {
      await res.text().catch(() => {});
      console.warn(`Creative AI provider ${res.status}; switching provider`);
      usingGateway = !usingGateway;
      res = await call(usingGateway);
    }
  }

  // Transient retries with backoff.
  for (let attempt = 1; attempt <= 2 && (res.status === 429 || res.status >= 500); attempt++) {
    const retryAfter = Number(res.headers.get("retry-after")) || 0;
    const waitMs = retryAfter > 0 ? retryAfter * 1000 : attempt * 1200;
    await res.text().catch(() => {});
    await new Promise((r) => setTimeout(r, waitMs));
    res = await call(usingGateway);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("Creative AI error:", res.status, body);
    if (res.status === 429) throw new CreativeAIError(429, "AI is busy right now. Please try again in a few seconds.");
    if (res.status === 402) throw new CreativeAIError(402, "AI service temporarily unavailable. Please try again later.");
    throw new CreativeAIError(502, "AI request failed. Please try again.");
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.toString().trim() || "";
  if (!content) throw new CreativeAIError(502, "AI returned an empty response. Please try again.");
  return content;
}
