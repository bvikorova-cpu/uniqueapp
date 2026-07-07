import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import VideoCallStage from "@/components/health/VideoCallStage";
import PreCallLobby from "@/components/health/PreCallLobby";
import HowItWorksHealth from "@/components/health/HowItWorksHealth";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarClock, Loader2, ArrowLeft, User } from "lucide-react";
import { format, differenceInMinutes } from "date-fns";

interface AppointmentCtx {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  provider_id: string;
  patient_id: string;
  reason: string | null;
  provider_name: string | null;
  patient_name: string | null;
  role: "doctor" | "patient" | "unknown";
}

export default function VideoConsultationRoom() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [ctx, setCtx] = useState<AppointmentCtx | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!appointmentId) return;
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const { data: appt, error: apptErr } = await supabase
        .from("healthcare_appointments")
        .select("id, scheduled_at, duration_minutes, status, provider_id, patient_id, reason")
        .eq("id", appointmentId)
        .maybeSingle();
      if (apptErr || !appt) {
        setError("Appointment not found or you do not have access.");
        setLoading(false);
        return;
      }
      const role: AppointmentCtx["role"] =
        user?.id === appt.provider_id ? "doctor" : user?.id === appt.patient_id ? "patient" : "unknown";
      const otherId = role === "doctor" ? appt.patient_id : appt.provider_id;
      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", otherId)
        .maybeSingle();
      const { data: healthcare } = await supabase
        .from("healthcare_profiles")
        .select("provider_name")
        .eq("user_id", appt.provider_id)
        .maybeSingle();
      setCtx({
        ...appt,
        provider_name: healthcare?.provider_name ?? null,
        patient_name: role === "doctor" ? (otherProfile?.full_name ?? null) : null,
        role,
      });
      setLoading(false);
    })();
  }, [appointmentId]);

  const now = new Date();
  const scheduled = ctx ? new Date(ctx.scheduled_at) : null;
  const minutesUntil = scheduled ? differenceInMinutes(scheduled, now) : null;
  const windowEnd = scheduled
    ? new Date(scheduled.getTime() + ((ctx?.duration_minutes ?? 30) + 15) * 60000)
    : null;
  const beforeWindow = minutesUntil !== null && minutesUntil > 5;
  const afterWindow = windowEnd ? now > windowEnd : false;
  const inWindow = !beforeWindow && !afterWindow;

  const disabledReason = !ctx
    ? undefined
    : ctx.status !== "confirmed" && ctx.status !== "in_progress"
      ? `Call is only available for confirmed appointments (current: ${ctx.status}).`
      : beforeWindow
        ? `Doors open 5 minutes before start (in ${minutesUntil} min).`
        : afterWindow
          ? "This appointment window has ended."
          : undefined;

  return (
    <>
      <Helmet>
        <title>{ctx?.provider_name ? `Call with ${ctx.provider_name} · Unique Health` : "Video consultation · Unique Health"}</title>
        <meta name="description" content="Secure 1:1 video consultation with your doctor via WebRTC." />
      </Helmet>
      <Navbar />
      <main className="container mx-auto max-w-5xl space-y-6 px-4 py-8 pt-24">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link to={ctx?.role === "doctor" ? "/doctor-dashboard" : "/my-bookings/doctors"}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Link>
          </Button>
          {ctx && (
            <Badge variant={ctx.status === "confirmed" ? "default" : "outline"}>{ctx.status}</Badge>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold">Video consultation</h1>
          {loading ? (
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading appointment…
            </p>
          ) : error ? (
            <p className="mt-1 text-sm text-destructive">{error}</p>
          ) : ctx ? (
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarClock className="h-4 w-4" />
                {scheduled && format(scheduled, "PPP · p")} ({ctx.duration_minutes} min)
              </span>
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {ctx.role === "doctor"
                  ? `Patient: ${ctx.patient_name ?? "Unknown"}`
                  : `Doctor: ${ctx.provider_name ?? "Unknown"}`}
              </span>
              {ctx.reason && <span className="italic">"{ctx.reason}"</span>}
            </div>
          ) : null}
        </div>

        {ctx?.status === "confirmed" && !inWindow && !joined && (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              {beforeWindow
                ? `The call room opens 5 minutes before ${scheduled ? format(scheduled, "p") : "start"}. Come back then.`
                : "This appointment window has closed. Please rebook if you missed the call."}
            </CardContent>
          </Card>
        )}

        {appointmentId && ctx && !joined && (
          <PreCallLobby
            onJoin={() => setJoined(true)}
            disabledReason={disabledReason}
          />
        )}

        {appointmentId && joined && (
          <VideoCallStage appointmentId={appointmentId} />
        )}

        <HowItWorksHealth
          title="Video calls"
          steps={[
            "Open this page up to 5 minutes before your confirmed appointment.",
            "Click 'Test camera & microphone' — allow browser access when prompted.",
            "Pick devices, check your mic level, then click 'Join call'.",
            "The connection is peer-to-peer (WebRTC). If audio/video fails, refresh — signalling reconnects automatically.",
          ]}
        />
      </main>
    </>
  );
}
