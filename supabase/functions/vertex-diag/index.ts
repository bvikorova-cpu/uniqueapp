import "../_shared/aiRedirect.ts";
import { tryDirectGeminiChat } from "../_shared/geminiDirect.ts";
import { hasVertex, tryVertexChat, tryVertexImage, vertexModel } from "../_shared/vertexDirect.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { getServiceAccount, getAccessToken } from "../_shared/vertexDirect.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const result: Record<string, unknown> = {
    ts: new Date().toISOString(),
    hasVertex: hasVertex(),
    vertexModel: vertexModel("google/gemini-2.5-flash"),
    gcp_project_id_set: !!Deno.env.get("GCP_PROJECT_ID"),
    gcp_location: Deno.env.get("GCP_LOCATION") || "(default us-central1)",
    gcp_sa_set: !!Deno.env.get("GCP_SERVICE_ACCOUNT_JSON"),
    lovable_key_set: !!Deno.env.get("LOVABLE_API_KEY"),
  };

  // Try a minimal Vertex chat completion (no auth required for this diagnostic).
  try {
    const data = await tryVertexChat({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: "Reply with the single word: PONG" }],
      max_tokens: 16,
      temperature: 0,
    });
    if (data) {
      result.vertexChatOk = true;
      result.vertexReply = data?.choices?.[0]?.message?.content ?? "(no content)";
      result.vertexUsage = data?.usage ?? null;
    } else {
      result.vertexChatOk = false;
      result.vertexNote = "tryVertexChat returned null (Vertex unavailable or failed) — would fall back to Lovable Gateway";
    }
  } catch (e) {
    result.vertexChatOk = false;
    result.vertexError = e instanceof Error ? e.message : String(e);
  }

  // Also try the geminiDirect wrapper.
  try {
    const d2 = await tryDirectGeminiChat({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: "Reply with the single word: HELLO" }],
      max_tokens: 16,
    });
    result.directGeminiOk = !!d2;
    result.directGeminiReply = d2?.choices?.[0]?.message?.content ?? null;
  } catch (e) {
    result.directGeminiOk = false;
    result.directGeminiError = e instanceof Error ? e.message : String(e);
  }

  // Vertex image generation (Imagen) test.
  try {
    const img = await tryVertexImage("A dark gothic mansion at night, cinematic horror, moody", "1024x1024", 1);
    if (img?.data?.length) {
      result.vertexImageOk = true;
      result.vertexImageBytes = String(img.data[0].b64_json ?? "").length;
    } else {
      result.vertexImageOk = false;
      result.vertexImageNote = "tryVertexImage returned null — would fall back to Lovable Gateway";
    }
  } catch (e) {
    result.vertexImageOk = false;
    result.vertexImageError = e instanceof Error ? e.message : String(e);
  }

  // Probe Gemini native image generation (responseModalities) candidates.
  try {
    const sa = getServiceAccount();
    const projectId = Deno.env.get("GCP_PROJECT_ID") || sa?.project_id;
    const location = Deno.env.get("GCP_LOCATION") || "us-central1";
    const token = sa ? await getAccessToken(sa) : null;
    const rawFetch: typeof fetch = (globalThis as any).__ORIGINAL_FETCH__ ?? fetch;
    const imageModels = [
      "gemini-2.5-flash-image",
      "imagen-3.0-fast-generate-001",
      "imagegeneration@006",
    ];
    const probe: Record<string, unknown> = {};
    for (const model of imageModels) {
      const iUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;
      const iRes = await rawFetch(iUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Generate an image: a dark gothic mansion at night" }] }],
          generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
        }),
      });
      const t = await iRes.text();
      probe[model] = { status: iRes.status, hasImage: t.includes("inlineData"), body: t.slice(0, 300) };
      if (iRes.ok && t.includes("inlineData")) break;
    }
    result.geminiImageProbe = probe;
  } catch (e) {
    result.geminiImageProbeError = e instanceof Error ? e.message : String(e);
  }

  // Direct gateway image generation test (the fallback path).
  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    const rawFetch: typeof fetch = (globalThis as any).__ORIGINAL_FETCH__ ?? fetch;
    const gRes = await rawFetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key! },
      body: JSON.stringify({ model: "openai/gpt-image-1-mini", prompt: "a small red square", n: 1, size: "1024x1024", quality: "low" }),
    });
    const gText = await gRes.text();
    result.gatewayImageStatus = gRes.status;
    result.gatewayImageOk = gRes.ok && (gText.includes("b64_json") || gText.includes("url"));
    result.gatewayImageBody = gText.slice(0, 300);
  } catch (e) {
    result.gatewayImageError = e instanceof Error ? e.message : String(e);
  }

  return new Response(JSON.stringify(result, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
