import { startVertexVideo, pollVertexVideo, VEO_LITE_MODELS } from "../_shared/vertexDirect.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async () => {
  const op = await startVertexVideo({
    prompt: "A calm sunrise over a quiet lake, gentle camera push in.",
    durationSeconds: 8,
    aspectRatio: "16:9",
    models: VEO_LITE_MODELS,
    resolution: "720p",
    generateAudio: true,
  });
  const poll = op ? await pollVertexVideo(op) : null;
  return new Response(JSON.stringify({ op, polled: poll ? { done: poll.done, error: poll.error, bytes: poll.videoBase64?.length ?? 0 } : null }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
