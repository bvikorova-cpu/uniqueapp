import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface LiveStreamProps {
  participantId: string;
  battleId: string;
  isStreamer: boolean;
}

export function LiveStream({ participantId, battleId, isStreamer }: LiveStreamProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<any>(null);

  // WebRTC Configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Track viewer count via Supabase presence
  useEffect(() => {
    const channel = supabase.channel(`battle:${battleId}:presence`);
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setViewerCount(count);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [battleId]);

  // Start broadcasting (streamer)
  const startStream = async () => {
    try {
      setIsConnecting(true);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: "user"
        },
        audio: true
      });

      localStreamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Setup Supabase Realtime channel for signaling
      const channel = supabase.channel(`battle:${battleId}:stream`, {
        config: {
          broadcast: { self: true },
        },
      });

      channelRef.current = channel;

      // Listen for viewer join requests
      channel.on('broadcast', { event: 'viewer-join' }, async ({ payload }) => {
        console.log('Viewer joined:', payload);
        await createOfferForViewer(payload.viewerId);
      });

      // Listen for answers from viewers
      channel.on('broadcast', { event: 'answer' }, async ({ payload }) => {
        console.log('Received answer:', payload);
        if (peerConnectionRef.current && payload.answer) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(payload.answer)
          );
        }
      });

      // Listen for ICE candidates
      channel.on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        console.log('Received ICE candidate:', payload);
        if (peerConnectionRef.current && payload.candidate) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(payload.candidate)
          );
        }
      });

      await channel.subscribe();

      // Call edge function to update stream status
      const { error } = await supabase.functions.invoke('start-stream', {
        body: { battleId, participantId }
      });

      if (error) throw error;

      setIsStreaming(true);
      setIsConnecting(false);
      toast.success("Stream started!");
    } catch (error) {
      console.error("Error starting stream:", error);
      toast.error("Failed to start stream");
      setIsConnecting(false);
    }
  };

  // Create offer for viewer (streamer side)
  const createOfferForViewer = async (viewerId: string) => {
    if (!localStreamRef.current) return;

    const peerConnection = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = peerConnection;

    // Add local stream tracks
    localStreamRef.current.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStreamRef.current!);
    });

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: {
            candidate: event.candidate,
            targetId: viewerId,
          },
        });
      }
    };

    // Create and send offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'offer',
        payload: {
          offer: offer,
          targetId: viewerId,
        },
      });
    }
  };

  // Join as viewer
  const joinAsViewer = async () => {
    try {
      setIsConnecting(true);

      // Setup Supabase Realtime channel
      const channel = supabase.channel(`battle:${battleId}:stream`, {
        config: {
          broadcast: { self: true },
        },
      });

      channelRef.current = channel;

      // Listen for offers from broadcaster
      channel.on('broadcast', { event: 'offer' }, async ({ payload }) => {
        console.log('Received offer:', payload);
        const { data: { user } } = await supabase.auth.getUser();
        if (payload.targetId === user?.id || !payload.targetId) {
          await handleOffer(payload.offer);
        }
      });

      // Listen for ICE candidates
      channel.on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        console.log('Received ICE candidate:', payload);
        const { data: { user } } = await supabase.auth.getUser();
        if ((payload.targetId === user?.id || !payload.targetId) && peerConnectionRef.current && payload.candidate) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(payload.candidate)
          );
        }
      });

      await channel.subscribe();

      // Notify broadcaster that viewer joined
      const { data: { user } } = await supabase.auth.getUser();
      channel.send({
        type: 'broadcast',
        event: 'viewer-join',
        payload: {
          viewerId: user?.id,
        },
      });

      setIsConnecting(false);
    } catch (error) {
      console.error("Error joining as viewer:", error);
      toast.error("Failed to join stream");
      setIsConnecting(false);
    }
  };

  // Handle offer (viewer side)
  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    const peerConnection = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = peerConnection;

    // Handle incoming stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote track');
      if (videoRef.current && event.streams[0]) {
        videoRef.current.srcObject = event.streams[0];
        setIsStreaming(true);
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: {
            candidate: event.candidate,
          },
        });
      }
    };

    // Set remote description and create answer
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    // Send answer back
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'answer',
        payload: {
          answer: answer,
        },
      });
    }
  };

  // Stop streaming
  const stopStream = async () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Call edge function to update stream status
    try {
      await supabase.functions.invoke('stop-stream', {
        body: { participantId }
      });
    } catch (error) {
      console.error("Error stopping stream:", error);
    }

    setIsStreaming(false);
    toast.info("Stream ended");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return (
    <><FloatingHowItWorks title="LiveStream — How it works" steps={[{title:"Open this section",desc:"Access LiveStream from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<Card className="overflow-hidden bg-black border-red-900/50">
      <div className="relative aspect-video bg-gradient-to-br from-red-950/20 to-black">
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted={isStreamer}
          className="w-full h-full object-cover"
        />
        
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <Video className="h-16 w-16 mx-auto mb-4 text-red-500 animate-pulse" />
              <p className="text-xl font-bold text-red-400 mb-2">
                {isStreamer ? 'Start Your Live Performance' : 'Stream Not Active'}
              </p>
              <p className="text-sm text-gray-400">
                {isStreamer ? 'Click the button below to go live' : 'Waiting for the performer to start'}
              </p>
            </div>
          </div>
        )}

        {isStreaming && (
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-red-600 animate-pulse">
              🔴 LIVE
            </Badge>
            <Badge className="bg-black/80">
              <Eye className="h-4 w-4 mr-1" />
              {viewerCount} watching
            </Badge>
          </div>
        )}
      </div>

      {isStreamer && (
        <div className="p-4 bg-gradient-to-r from-red-950/50 to-black border-t border-red-900/50">
          <div className="flex gap-4">
            {!isStreaming ? (
              <Button 
                onClick={startStream}
                disabled={isConnecting}
                className="flex-1 bg-red-600 hover:bg-red-700"
                size="lg"
              >
                <Video className="mr-2 h-5 w-5" />
                {isConnecting ? 'Connecting...' : 'Start Live Stream'}
              </Button>
            ) : (
              <Button 
                onClick={stopStream}
                className="flex-1 bg-gray-700 hover:bg-gray-800"
                size="lg"
              >
                <VideoOff className="mr-2 h-5 w-5" />
                End Stream
              </Button>
            )}
          </div>
        </div>
      )}

      {!isStreamer && !isStreaming && !isConnecting && (
        <div className="p-4 bg-gradient-to-r from-red-950/50 to-black border-t border-red-900/50">
          <Button 
            onClick={joinAsViewer}
            className="w-full bg-red-600 hover:bg-red-700"
            size="lg"
          >
            <Video className="mr-2 h-5 w-5" />
            Join Stream
          </Button>
        </div>
      )}
    </Card>
  </>
  );
}
