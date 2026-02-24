import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Not authenticated");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;

    if (!user) {
      throw new Error("User not found");
    }

    console.log("[GET-PURCHASES] Loading purchases for user:", user.id);

    // Get all purchases by user ID or email
    const { data: downloads, error } = await supabaseClient
      .from("stock_content_downloads")
      .select(`
        *,
        stock_content_items (
          id,
          title,
          description,
          thumbnail_url,
          file_url,
          content_type,
          category
        )
      `)
      .or(`buyer_id.eq.${user.id},buyer_email.eq.${user.email}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET-PURCHASES] Error:", error);
      throw error;
    }

    console.log("[GET-PURCHASES] Found", downloads?.length || 0, "purchases");

    return new Response(JSON.stringify({ purchases: downloads || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("[GET-PURCHASES] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
