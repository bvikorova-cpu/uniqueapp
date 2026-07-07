import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import VideoCallStage from "@/components/health/VideoCallStage";
import HowItWorksHealth from "@/components/health/HowItWorksHealth";
import { Helmet } from "react-helmet-async";

export default function VideoConsultationRoom() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  return (
    <>
      <Helmet>
        <title>Video consultation | Unique Health</title>
        <meta name="description" content="Secure 1:1 video consultation with your doctor." />
      </Helmet>
      <Navbar />
      <main className="container mx-auto space-y-6 px-4 py-8">
        <h1 className="text-2xl font-semibold">Video consultation</h1>
        {appointmentId ? (
          <VideoCallStage appointmentId={appointmentId} />
        ) : (
          <p className="text-sm text-muted-foreground">Missing appointment id.</p>
        )}
        <HowItWorksHealth
          title="Video calls"
          steps={[
            "Open this page 5 minutes before your confirmed appointment.",
            "Click Join call — grant camera and microphone permissions.",
            "Wait for the other party; the connection is peer-to-peer.",
            "If audio or video fails, refresh the page — signalling reconnects automatically.",
          ]}
        />
      </main>
    </>
  );
}
