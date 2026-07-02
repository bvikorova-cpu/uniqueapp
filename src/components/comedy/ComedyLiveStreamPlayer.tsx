import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Radio } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ComedyLiveStreamPlayerProps {
  showId: string;
  streamKey: string;
}

export function ComedyLiveStreamPlayer({ showId, streamKey }: ComedyLiveStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    return (
    <>
      <FloatingHowItWorks title={"Comedy Live Stream Player - How it works"} steps={[{ title: 'Open', desc: 'Access the Comedy Live Stream Player section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Comedy Live Stream Player.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  const startStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setMediaStream(stream);
      setIsStreaming(true);
      toast.success("Streaming started!");
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Failed to access camera/microphone");
    }
  };

  const stopStreaming = async () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setIsStreaming(false);

    // Update show status to ended
    await supabase
      .from("comedy_shows")
      .update({ status: "ended" })
      .eq("id", showId);

    toast.success("Stream ended");
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {isStreaming && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
              <Radio className="h-4 w-4 animate-pulse" />
              <span className="font-bold">LIVE</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {!isStreaming ? (
            <Button onClick={startStreaming} className="flex-1">
              Start Streaming
            </Button>
          ) : (
            <Button onClick={stopStreaming} variant="destructive" className="flex-1">
              Stop Stream
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Stream Key: {streamKey}</p>
          <p className="mt-2">
            Note: This is a basic WebRTC implementation. For production, consider using services like Agora.io, Daily.co, or LiveKit for better quality and features.
          </p>
        </div>
      </div>
    </Card>
  );
}
