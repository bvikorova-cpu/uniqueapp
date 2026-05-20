import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { useCall } from "@/contexts/CallContext";

interface VideoCallProps {
  conversationId: string;
  userId: string;
  otherUserId: string;
  otherUserName: string;
}

/**
 * Thin trigger that delegates to the global <CallProvider>.
 * The actual ringtone, incoming-call UI and WebRTC handling live in
 * `src/contexts/CallContext.tsx` so calls work app-wide — the callee
 * does not need to be inside Messenger to be rung.
 */
const VideoCall = ({ conversationId, otherUserId, otherUserName }: VideoCallProps) => {
  const { startCall, busy } = useCall();

  return (
    <Button
      onClick={() => startCall({ conversationId, otherUserId, otherUserName })}
      variant="outline"
      size="icon"
      disabled={busy}
      title={`Video call ${otherUserName}`}
    >
      <Video className="h-4 w-4" />
    </Button>
  );
};

export default VideoCall;
