import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async () => {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return new Response(JSON.stringify({ error: "no key" }), { status: 500 });
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${key}`,
  );
  const data = await res.json();
  const names = (data?.models ?? []).map((m: any) => m.name).filter((n: string) => /veo|video/i.test(n));
  return new Response(JSON.stringify({ status: res.status, names, total: (data?.models ?? []).length }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
