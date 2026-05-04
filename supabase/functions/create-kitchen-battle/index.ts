import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const THEMES = [
  "Street Food Showdown", "Fine Dining Fusion", "Mystery Box Madness",
  "Dessert Wars", "One-Pan Wonders", "Spice It Up", "Plant-Based Battle",
  "Comfort Food Classics", "Breakfast Reinvented", "Midnight Snack Duel",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("No authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: { user } } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) throw new Error("Unauthorized");

    const body = await req.json().catch(() => ({}));
    const theme = body.theme || THEMES[Math.floor(Math.random() * THEMES.length)];
    const description = body.description || `Compete with your best dish around: ${theme}`;

    const { data, error } = await supabase.from("kitchen_battles").insert({
      theme, description, created_by: user.id,
    }).select().single();
    if (error) throw error;

    return new Response(JSON.stringify({ battle: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
    });
  }
});
