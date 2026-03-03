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
    const { contentId } = await req.json();
    
    if (!contentId) {
      throw new Error("Content ID is required");
    }

    console.log("[VERIFY-STOCK] Checking purchase for content:", contentId);

    // Get user email from auth header or request
    let userEmail = null;
    let userId = null;
    
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      userId = data.user?.id || null;
      userEmail = data.user?.email || null;
    }

    if (!userId && !userEmail) {
      return new Response(JSON.stringify({ 
        purchased: false, 
        message: "Please log in to access your purchases" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user has purchased this content
    let query = supabaseClient
      .from("stock_content_downloads")
      .select("*, stock_content_items(*)")
      .eq("content_id", contentId);

    if (userId) {
      query = query.eq("buyer_id", userId);
    } else if (userEmail) {
      query = query.eq("buyer_email", userEmail);
    }

    const { data: download, error } = await query.maybeSingle();

    if (error) {
      console.error("[VERIFY-STOCK] Error checking purchase:", error);
      throw error;
    }

    if (download) {
      console.log("[VERIFY-STOCK] Purchase found, returning download URL");
      return new Response(JSON.stringify({
        purchased: true,
        download_url: download.download_url,
        purchased_at: download.created_at,
        content: download.stock_content_items,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      purchased: false,
      message: "Content not purchased" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("[VERIFY-STOCK] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
