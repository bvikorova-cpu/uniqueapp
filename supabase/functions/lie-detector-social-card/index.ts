// Social Card — generate shareable card metadata + public token
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = { 
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" 
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!, 
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, 
      { global: { headers: { Authorization: auth } } }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    
    const { quote, truth_score, source_type, source_id } = await req.json();
    if (!quote) return json({ error: "quote required" }, 400);
    
    // Blur quote: keep first/last word, replace middle words with ▓
    const words = String(quote).split(/\s+/).slice(0, 30);
    const blurred = words.map((w, i) => (i === 0 || i === words.length - 1 || w.length <= 2) ? w : "▓".repeat(Math.min(w.length, 6))).join(" ");
    
    const { data } = await supabase.from("lie_social_cards").insert({
      user_id: user.id, 
      blurred_quote: blurred, 
      truth_score: truth_score ?? null,
      source_type: source_type || "single", 
      source_id: source_id || null,
    }).select().single();
    
    return json({ card: data, share_url: `/card/${data!.share_token}` });
  } catch (e) { 
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500); 
  }
});

function json(b: any, s = 200) { 
  return new Response(JSON.stringify(b), { 
    status: s, 
    headers: { ...corsHeaders, "Content-Type": "application/json" } 
  }); 
}
