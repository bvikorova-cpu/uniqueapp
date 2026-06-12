import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SIN_CATEGORIES = [
  "Pride", "Greed", "Lust", "Envy", "Gluttony", "Wrath", "Sloth",
  "Dishonesty", "Betrayal", "Theft", "Violence", "Negligence"
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );

  try {
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const rawText = typeof body?.confessionText === "string" ? body.confessionText : "";
    const isAnonymous = !!body?.isAnonymous;

    // Sanitize: strip control/zero-width chars, collapse newlines, cap length
    const stripped = rawText.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\uFEFF]/g, "");
    const collapsed = stripped.replace(/\n{3,}/g, "\n\n").trim();
    const confessionText = collapsed.slice(0, 4000);
    if (confessionText.length < 10) {
      return new Response(JSON.stringify({ error: "Confession too short (min 10 chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const BANNED = ["nigger","faggot","kike","tranny","retard"];
    const lower = confessionText.toLowerCase();
    if (BANNED.some(w => lower.includes(w))) {
      return new Response(JSON.stringify({ error: "Content violates community guidelines" }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate-limit: max 5 confessions / 10 min per user
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabaseClient
      .from("confessions").select("id", { count: "exact", head: true })
      .eq("user_id", user.id).gte("created_at", since);
    if ((count ?? 0) >= 5) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a confession analyzer. Categorize the confession into one of these sin categories: ${SIN_CATEGORIES.join(", ")}. Also assess severity on a scale of 1-10.`
          },
          {
            role: "user",
            content: confessionText
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "categorize_confession",
              description: "Categorize a confession and assess its severity",
              parameters: {
                type: "object",
                properties: {
                  category: { type: "string", enum: SIN_CATEGORIES, description: "The sin category" },
                  severity: { type: "number", minimum: 1, maximum: 10, description: "Severity score 1-10" }
                },
                required: ["category", "severity"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "categorize_confession" } }
      })
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("OpenAI error:", errText);
      throw new Error("AI categorization failed");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const parsed = JSON.parse(toolCall?.function?.arguments || "{}");
    const category = parsed.category || "Pride";
    const severity = parsed.severity || 5;

    const { data: confession, error } = await supabaseClient
      .from("confessions")
      .insert({
        user_id: user.id,
        confession_text: confessionText,
        sin_category: category,
        severity_score: severity,
        is_anonymous: isAnonymous,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        confession: {
          id: confession.id,
          category,
          severity,
          created_at: confession.created_at
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});