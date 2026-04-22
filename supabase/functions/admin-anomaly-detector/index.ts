import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [{ data: refunds }, { data: tx }, { data: signups }, { data: bans }] = await Promise.all([
      supabase.from("transactions").select("amount, created_at, status").gte("created_at", since),
      supabase.from("transactions").select("amount, created_at, user_id").gte("created_at", since),
      supabase.from("profiles").select("id, created_at").gte("created_at", since),
      supabase.from("user_roles").select("user_id, role").eq("role", "banned"),
    ]);

    const refundCount = refunds?.filter((r) => r.status === "refunded").length || 0;
    const txTotal = tx?.reduce((s, t) => s + (Number(t.amount) || 0), 0) || 0;
    const signupCount = signups?.length || 0;
    const banCount = bans?.length || 0;

    const stats = { refundCount, txTotal, txCount: tx?.length || 0, signupCount, banCount };

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content:
              "You are a fraud and anomaly detection AI for a multi-creator platform. Analyse the past 24h stats and flag suspicious patterns. Respond ONLY by calling the report_anomalies tool.",
          },
          { role: "user", content: `Stats (24h): ${JSON.stringify(stats)}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_anomalies",
              description: "Report detected anomalies",
              parameters: {
                type: "object",
                properties: {
                  risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
                  anomalies: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        severity: { type: "string", enum: ["info", "warn", "danger"] },
                        description: { type: "string" },
                        recommendation: { type: "string" },
                      },
                      required: ["title", "severity", "description", "recommendation"],
                    },
                  },
                },
                required: ["risk_level", "anomalies"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_anomalies" } },
      }),
    });

    if (aiResp.status === 429)
      return new Response(JSON.stringify({ error: "Rate limited" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    if (aiResp.status === 402)
      return new Response(JSON.stringify({ error: "Add credits to Lovable AI workspace" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    const aiData = await aiResp.json();
    const tool = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const args = tool ? JSON.parse(tool.function.arguments) : { risk_level: "low", anomalies: [] };

    return new Response(JSON.stringify({ ...args, stats }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("anomaly error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
