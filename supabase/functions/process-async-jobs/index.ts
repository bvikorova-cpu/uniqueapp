// Async job worker – pulls a batch from async_jobs and dispatches by queue name.
// Invoked by pg_cron every minute. Idempotent, safe to run in parallel via SKIP LOCKED.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const admin = () => createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

type Job = {
  id: number;
  queue_name: string;
  payload: Record<string, unknown>;
  attempts: number;
};

async function handleJob(job: Job): Promise<void> {
  // Dispatch by queue name. Extend with more handlers as needed.
  switch (job.queue_name) {
    case "noop":
      return;
    case "invoke_function": {
      // payload: { function: string, body?: any, headers?: Record<string,string> }
      const fn = String(job.payload.function || "");
      if (!fn) throw new Error("payload.function required");
      const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/${fn}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          ...(job.payload.headers as Record<string, string> | undefined ?? {}),
        },
        body: JSON.stringify(job.payload.body ?? {}),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`invoke ${fn} ${res.status}: ${text.slice(0, 300)}`);
      return;
    }
    default:
      throw new Error(`unknown queue: ${job.queue_name}`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sb = admin();
  const worker = `worker-${crypto.randomUUID().slice(0, 8)}`;
  const url = new URL(req.url);
  const queue = url.searchParams.get("queue") ?? "default";
  const batch = Math.min(50, Number(url.searchParams.get("batch") ?? "10"));

  const { data: jobs, error } = await sb.rpc("dequeue_async_jobs", {
    _queue: queue, _worker: worker, _batch: batch,
  });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results: Array<{ id: number; ok: boolean; error?: string }> = [];
  for (const job of (jobs ?? []) as Job[]) {
    try {
      await handleJob(job);
      await sb.rpc("complete_async_job", { _id: job.id, _success: true, _error: null });
      results.push({ id: job.id, ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await sb.rpc("complete_async_job", { _id: job.id, _success: false, _error: msg });
      results.push({ id: job.id, ok: false, error: msg });
    }
  }

  return new Response(JSON.stringify({ worker, queue, processed: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
