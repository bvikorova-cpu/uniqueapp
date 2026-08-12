// TEMPORARY diagnostics: verifies Veo video generation on Vertex AI. Delete after use.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { startVertexVideo, pollVertexVideo } from "../_shared/vertexDirect.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const body = await req.json().catch(() => ({}));
  if (body?.op) {
    const res = await pollVertexVideo(body.op);
    return new Response(JSON.stringify({ poll: res ? { ...res, videoBase64: res.videoBase64 ? `len:${res.videoBase64.length}` : null } : null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const op = await startVertexVideo({ prompt: "A dark empty hallway, flickering light, cinematic horror, vertical", durationSeconds: 8, aspectRatio: "9:16" });
  return new Response(JSON.stringify({ op }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
