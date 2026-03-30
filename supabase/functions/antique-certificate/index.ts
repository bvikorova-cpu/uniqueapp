import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageUrl, itemName } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { data: credits } = await supabase.from("antique_credits").select("*").eq("user_id", user.id).single();
    if (!credits || credits.credits_remaining < 15) {
      return new Response(JSON.stringify({ error: "Insufficient credits" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const certId = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are an expert antique authenticator issuing a Digital Certificate of Authenticity. Generate a formal certificate with these sections:

# 🏛️ CERTIFICATE OF AUTHENTICITY
**Certificate ID:** ${certId}
**Item:** ${itemName}
**Date Issued:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Then include:
1. **Item Description** - Detailed physical description
2. **Period & Origin** - Estimated era and geographical origin
3. **Authenticity Assessment** - Score out of 100 with detailed reasoning
4. **Materials & Craftsmanship** - Analysis of materials and construction
5. **Provenance Summary** - Brief ownership history estimation
6. **Condition Report** - Current state assessment
7. **Market Valuation** - Estimated value range in EUR
8. **Verification Notes** - AI analysis methodology used
9. **Disclaimer** - This is an AI-generated assessment for informational purposes

Format as a formal, professional certificate document using markdown.` },
          { role: "user", content: [
            { type: "text", text: `Generate a certificate of authenticity for this item named "${itemName}":` },
            { type: "image_url", image_url: { url: imageUrl } }
          ]}
        ],
        max_tokens: 2000,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "Unable to generate certificate.";

    await supabase.from("antique_credits").update({
      credits_remaining: credits.credits_remaining - 15
    }).eq("user_id", user.id);

    return new Response(JSON.stringify({ analysis, certificateId: certId }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
