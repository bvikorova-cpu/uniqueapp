import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin
    const { data: roleCheck } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: any = {};
    try { body = await req.json(); } catch { body = {}; }
    const stats = (body && typeof body === "object" && body.stats && typeof body.stats === "object") ? body.stats : {};
    const num = (v: any) => (typeof v === "number" && isFinite(v) ? v : 0);
    const totalUsers = num(stats.totalUsers);
    const premiumUsers = num(stats.premiumUsers);
    const totalRevenue = num(stats.totalRevenue);
    const monthlyRevenue = num(stats.monthlyRevenue);
    const masterchefEarnings = num(stats.masterchefEarnings);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");

    const prompt = `Analyze this platform data and produce 4 sharp, actionable executive insights. Be specific, mention numbers, suggest concrete actions.

Data:
- Total users: ${totalUsers}
- Premium users: ${premiumUsers} (${((premiumUsers / Math.max(totalUsers, 1)) * 100).toFixed(1)}% conversion)
- Total revenue: €${totalRevenue.toFixed(2)}
- Monthly revenue: €${monthlyRevenue.toFixed(2)}
- MasterChef earnings: €${masterchefEarnings.toFixed(2)}

Return JSON only.`;

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a senior product/revenue analyst. Output concise, executive-grade insights." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "produce_insights",
            description: "Return 4 admin insights",
            parameters: {
              type: "object",
              properties: {
                insights: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Short bold headline (max 8 words)" },
                      body: { type: "string", description: "1-2 sentence insight with numbers" },
                      action: { type: "string", description: "One concrete recommendation" },
                      sentiment: { type: "string", enum: ["positive", "warning", "neutral", "critical"] },
                      icon: { type: "string", enum: ["trending-up", "alert-triangle", "lightbulb", "target", "trending-down", "zap"] },
                    },
                    required: ["title", "body", "action", "sentiment", "icon"],
                  },
                  minItems: 4,
                  maxItems: 4,
                },
              },
              required: ["insights"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "produce_insights" } },
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded, try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("OpenAI API error:", aiResp.status, t);
      throw new Error("OpenAI API error");
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const insights = toolCall ? JSON.parse(toolCall.function.arguments).insights : [];

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("admin-ai-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
