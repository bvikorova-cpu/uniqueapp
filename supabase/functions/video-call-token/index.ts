// Issues short-lived ICE credentials + room id for an appointment's video call.
// Callable by patient or provider of a *confirmed* appointment inside the join window.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const Body = z.object({ appointment_id: z.string().uuid() });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) return json({ error: "unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: userData } = await admin.auth.getUser(jwt);
    const user = userData.user;
    if (!user) return json({ error: "unauthorized" }, 401);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);
    const { appointment_id } = parsed.data;

    const { data: appt } = await admin
      .from("healthcare_appointments")
      .select("id,patient_id,provider_id,status,scheduled_at,duration_min")
      .eq("id", appointment_id)
      .maybeSingle();
    if (!appt) return json({ error: "not_found" }, 404);
    if (appt.patient_id !== user.id && appt.provider_id !== user.id)
      return json({ error: "forbidden" }, 403);
    if (appt.status !== "confirmed") return json({ error: "not_confirmed" }, 400);

    const start = new Date(appt.scheduled_at).getTime();
    const end = start + ((appt.duration_min ?? 30) + 15) * 60_000;
    const now = Date.now();
    if (now < start - 5 * 60_000 || now > end) return json({ error: "outside_window" }, 400);

    // Upsert video_call_session row
    const roomId = `appt-${appointment_id}`;
    const isDoctor = appt.provider_id === user.id;
    const iceConfig = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // TURN via env if provided:
        ...(Deno.env.get("TURN_URL")
          ? [{
              urls: Deno.env.get("TURN_URL")!,
              username: Deno.env.get("TURN_USERNAME") ?? "",
              credential: Deno.env.get("TURN_CREDENTIAL") ?? "",
            }]
          : []),
      ],
    };

    const patch: Record<string, unknown> = {
      appointment_id,
      room_id: roomId,
      ice_config: iceConfig,
    };
    if (isDoctor) patch.doctor_joined_at = new Date().toISOString();
    else patch.patient_joined_at = new Date().toISOString();

    await admin.from("video_call_sessions").upsert(patch, { onConflict: "room_id" });

    return json({ room_id: roomId, ice_config: iceConfig, role: isDoctor ? "doctor" : "patient" });
  } catch (e) {
    console.error("video-call-token error", e);
    return json({ error: "internal" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
