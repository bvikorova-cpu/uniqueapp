// TEMPORARY diagnostics: verifies Veo video generation. Delete after use.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { startVertexVideo, pollVertexVideo } from "../_shared/vertexDirect.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const body = await req.json().catch(() => ({}));
  const rawFetch: typeof fetch = (globalThis as any).__ORIGINAL_FETCH__ ?? fetch;
  const key = Deno.env.get("GEMINI_API_KEY");

  if (body?.list) {
    const res = await rawFetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}&pageSize=200`);
    const data = await res.json().catch(() => null);
    const names = (data?.models ?? []).map((m: any) => m.name).filter((n: string) => /veo|video/i.test(n));
    return new Response(JSON.stringify({ status: res.status, veoModels: names, total: data?.models?.length ?? 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (body?.op) {
    const res = await pollVertexVideo(body.op);
    return new Response(JSON.stringify({ poll: res ? { ...res, videoBase64: res.videoBase64 ? `len:${res.videoBase64.length}` : null } : null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const op = await startVertexVideo({ prompt: "A dark empty hallway, flickering light, cinematic horror, vertical", durationSeconds: 8, aspectRatio: "9:16" });
  return new Response(JSON.stringify({ op }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
