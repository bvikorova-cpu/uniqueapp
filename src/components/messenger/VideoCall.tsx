import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoCallProps {
  conversationId: string;
  userId: string;
  otherUserId: string;
  otherUserName: string;
}

const VideoCall = ({ conversationId, userId, otherUserId, otherUserName }: VideoCallProps) => {
  const { toast } = useToast();
  const [isInCall, setIsInCall] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const signalingChannelRef = useRef<any>(null);

  const configuration: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    setupSignalingChannel();
    return () => {
      cleanupCall();
      if (signalingChannelRef.current) {
        supabase.removeChannel(signalingChannelRef.current);
      }
    };
  }, [conversationId]);

  const setupSignalingChannel = () => {
    const channel = supabase.channel(`video-call:${conversationId}`);

    channel
      .on("broadcast", { event: "offer" }, async ({ payload }) => {
        if (payload.to === userId) {
          setIncomingCall(true);
          await handleOffer(payload.offer, payload.from);
        }
      })
      .on("broadcast", { event: "answer" }, async ({ payload }) => {
        if (payload.to === userId && peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(payload.answer)
          );
        }
      })
      .on("broadcast", { event: "ice-candidate" }, async ({ payload }) => {
        if (payload.to === userId && peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(payload.candidate)
          );
        }
      })
      .on("broadcast", { event: "end-call" }, ({ payload }) => {
        if (payload.to === userId) {
          cleanupCall();
          toast({
            title: "Call ended",
            description: `${otherUserName} ended the call`,
          });
        }
      })
      .subscribe();

    signalingChannelRef.current = channel;
  };

  const requestMedia = async (): Promise<MediaStream> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new DOMException(
        "Camera/mic API not available. Open this page in your main browser (not inside an in-app browser).",
        "NotSupportedError",
      );
    }
    try {
      return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err: any) {
      // If video isn't available (no camera, blocked by policy), fall back to audio-only
      if (err?.name === "NotFoundError" || err?.name === "OverconstrainedError") {
        return await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
      }
      throw err;
    }
  };

  const explainMediaError = (err: any): string => {
    const name = err?.name || "";
    if (name === "NotAllowedError" || name === "SecurityError") {
      return "Camera/mic access was blocked. Tap the lock icon in the address bar → Site settings → allow Camera & Microphone, then reload.";
    }
    if (name === "NotFoundError") return "No camera or microphone was found on this device.";
    if (name === "NotReadableError") return "Camera or microphone is already in use by another app.";
    if (name === "NotSupportedError") return err.message || "Camera/mic API not available in this browser.";
    if (!window.isSecureContext) return "Video calls require HTTPS. Reload the page over https://.";
    return err?.message || "Failed to start the call.";
  };

  const startCall = async () => {
    try {
      const stream = await requestMedia();

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && signalingChannelRef.current) {
          signalingChannelRef.current.send({
            type: "broadcast",
            event: "ice-candidate",
            payload: {
              candidate: event.candidate,
              to: otherUserId,
              from: userId,
            },
          });
        }
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      if (signalingChannelRef.current) {
        signalingChannelRef.current.send({
          type: "broadcast",
          event: "offer",
          payload: {
            offer: offer,
            to: otherUserId,
            from: userId,
          },
        });
      }

      setIsRinging(true);
      setIsInCall(true);
    } catch (error: any) {
      console.error("Error starting call:", error);
      toast({
        title: "Chyba",
        description: explainMediaError(error),
        variant: "destructive",
      });
    }
  };


  const handleOffer = async (offer: RTCSessionDescriptionInit, from: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && signalingChannelRef.current) {
          signalingChannelRef.current.send({
            type: "broadcast",
            event: "ice-candidate",
            payload: {
              candidate: event.candidate,
              to: from,
              from: userId,
            },
          });
        }
      };

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      if (signalingChannelRef.current) {
        signalingChannelRef.current.send({
          type: "broadcast",
          event: "answer",
          payload: {
            answer: answer,
            to: from,
            from: userId,
          },
        });
      }

      setIsInCall(true);
      setIncomingCall(false);
    } catch (error) {
      console.error("Error handling offer:", error);
      toast({
        title: "Chyba",
        description: "Failed to connect to the call",
        variant: "destructive",
      });
    }
  };

  const answerCall = () => {
    setIncomingCall(false);
  };

  const declineCall = () => {
    setIncomingCall(false);
    if (signalingChannelRef.current) {
      signalingChannelRef.current.send({
        type: "broadcast",
        event: "end-call",
        payload: {
          to: otherUserId,
          from: userId,
        },
      });
    }
  };

  const endCall = () => {
    if (signalingChannelRef.current) {
      signalingChannelRef.current.send({
        type: "broadcast",
        event: "end-call",
        payload: {
          to: otherUserId,
          from: userId,
        },
      });
    }
    cleanupCall();
  };

  const cleanupCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setIsInCall(false);
    setIsRinging(false);
    setIncomingCall(false);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <>
      {!isInCall && !incomingCall && (
        <Button onClick={startCall} variant="outline" size="icon">
          <Video className="h-4 w-4" />
        </Button>
      )}

      {incomingCall && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background p-8 rounded-lg shadow-xl text-center">
            <Phone className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">Incoming call</h2>
            <p className="text-muted-foreground mb-6">{otherUserName} is calling you</p>
            <div className="flex gap-4">
              <Button onClick={answerCall} className="flex-1">
                <Phone className="h-4 w-4 mr-2" />
                Accept
              </Button>
              <Button onClick={declineCall} variant="destructive" className="flex-1">
                <PhoneOff className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </Card>
      )}

      {isInCall && (
        <Card className="fixed inset-0 z-50 bg-black">
          <div className="relative h-full flex items-center justify-center">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-20 right-4 w-48 h-36 rounded-lg object-cover border-2 border-white shadow-lg"
            />

            {isRinging && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center">
                  <Phone className="h-16 w-16 mx-auto mb-4 text-white animate-pulse" />
                  <p className="text-white text-xl">Calling...</p>
                </div>
              </div>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
              <Button
                onClick={toggleMute}
                variant={isMuted ? "destructive" : "secondary"}
                size="icon"
                className="rounded-full h-12 w-12"
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              <Button
                onClick={toggleVideo}
                variant={isVideoOff ? "destructive" : "secondary"}
                size="icon"
                className="rounded-full h-12 w-12"
              >
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>

              <Button
                onClick={endCall}
                variant="destructive"
                size="icon"
                className="rounded-full h-12 w-12"
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default VideoCall;
