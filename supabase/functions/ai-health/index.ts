import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { askAI } from "../_shared/unifiedAI.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Diagnostic endpoint: reports which AI providers are configured and reachable. */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const result: Record<string, unknown> = {
    openai_key: !!Deno.env.get("OPENAI_API_KEY"),
    lovable_key: !!Deno.env.get("LOVABLE_API_KEY"),
  };

  try {
    const text = await askAI("You are a health check.", "Reply with OK.", {
      model: "gpt-4o-mini",
      max_tokens: 5,
    });
    result.ok = true;
    result.sample = text;
  } catch (e) {
    result.ok = false;
    result.error = e instanceof Error ? e.message : String(e);
    result.status = (e as any)?.status;
  }

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
