import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Video, Send, Users, Gift, ArrowLeft, VideoOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useOneOffPaymentVerify } from "@/hooks/useOneOffPaymentVerify";

interface Message {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

interface GiftType {
  id: string;
  name: string;
  icon: string;
  price: number;
}

const GIFT_IDS = {
  rose: "00000000-0000-0000-0000-000000000001",
  heart: "00000000-0000-0000-0000-000000000002",
  diamond: "00000000-0000-0000-0000-000000000003",
  crown: "00000000-0000-0000-0000-000000000004",
};

export default function LiveStream() {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<any>(null);

  // Fetch available gifts
  const { data: gifts = [] } = useQuery({
    queryKey: ["platform-gifts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_gifts")
        .select("*")
        .eq("category", "stream_gift")
        .order("price", { ascending: true });
      
      if (error) throw error;
      return data as GiftType[];
    },
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // Fetch stream details
  const { data: stream } = useQuery({
    queryKey: ["stream", streamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_streams")
        .select(`
          *,
          influencer_profiles(
            user_id,
            display_name,
            profile_photo_url
          )
        `)
        .eq("id", streamId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch messages with realtime updates
  const { data: messages = [] } = useQuery({
    queryKey: ["stream-messages", streamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stream_messages")
        .select("*")
        .eq("stream_id", streamId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;
      
      // Fetch user profiles separately
      const userIds = [...new Set(data.map(m => m.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      // Merge profiles with messages
      return data.map(msg => ({
        ...msg,
        profiles: profiles?.find(p => p.id === msg.user_id)
      })) as Message[];
    },
    refetchInterval: 2000,
  });

  // Join stream
  useEffect(() => {
    if (!user || !streamId) return;

    const joinStream = async () => {
      await supabase.from("stream_viewers").insert({
        stream_id: streamId,
        user_id: user.id,
      });
    };

    const leaveStream = async () => {
      await supabase
        .from("stream_viewers")
        .update({ left_at: new Date().toISOString() })
        .eq("stream_id", streamId)
        .eq("user_id", user.id)
        .is("left_at", null);
    };

    joinStream();
    return () => {
      leaveStream();
    };
  }, [user, streamId]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase.from("stream_messages").insert({
        stream_id: streamId,
        user_id: user.id,
        message: text,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["stream-messages", streamId] });
    },
    onError: (error) => {
      toast.error("Error sending message");
      console.error(error);
    },
  });

  // Send gift mutation
  const sendGiftMutation = useMutation({
    mutationFn: async (gift: GiftType) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase.functions.invoke("send-stream-gift", {
        body: {
          streamId,
          giftId: gift.id,
          message: giftMessage,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, gift) => {
      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success(`Opening payment for ${gift.name} ${gift.icon}`);
        setGiftMessage("");
      }
    },
    onError: (error) => {
      toast.error("Error sending gift");
      console.error(error);
    },
  });

  // WebRTC Configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Start broadcasting (influencer)
  const startBroadcast = async () => {
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
      const channel = supabase.channel(`stream:${streamId}`, {
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
      setIsStreaming(true);
      setIsConnecting(false);
      toast.success("Stream started!");
    } catch (error) {
      console.error("Error starting broadcast:", error);
      toast.error("Error starting stream");
      setIsConnecting(false);
    }
  };

  // Create offer for viewer (influencer side)
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
      const channel = supabase.channel(`stream:${streamId}`, {
        config: {
          broadcast: { self: true },
        },
      });

      channelRef.current = channel;

      // Listen for offers from broadcaster
      channel.on('broadcast', { event: 'offer' }, async ({ payload }) => {
        console.log('Received offer:', payload);
        if (payload.targetId === user?.id || !payload.targetId) {
          await handleOffer(payload.offer);
        }
      });

      // Listen for ICE candidates
      channel.on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        console.log('Received ICE candidate:', payload);
        if ((payload.targetId === user?.id || !payload.targetId) && peerConnectionRef.current && payload.candidate) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(payload.candidate)
          );
        }
      });

      await channel.subscribe();

      // Notify broadcaster that viewer joined
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
      toast.error("Error connecting to stream");
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
  const stopStreaming = () => {
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

    setIsStreaming(false);
    toast.info("Stream ended");
  };

  // Auto-join as viewer if not influencer
  useEffect(() => {
    if (stream && user && stream.influencer_id !== user.id && stream.is_live && !isStreaming && !isConnecting) {
      joinAsViewer();
    }
  }, [stream, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!stream) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading stream...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <Button
          onClick={() => navigate("/influ-king")}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="relative bg-black aspect-video rounded-t-lg overflow-hidden">
                  <video 
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted={user?.id === stream.influencer_profiles?.user_id}
                  />
                  
                  {!isStreaming && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-center text-white space-y-4">
                        <Video className="h-24 w-24 mx-auto opacity-50" />
                        {user?.id === stream.influencer_profiles?.user_id ? (
                          <>
                            <p className="text-lg">Click the button to start the camera</p>
                            <Button 
                              onClick={startBroadcast} 
                              variant="default"
                              size="lg"
                              disabled={isConnecting}
                              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                            >
                              {isConnecting ? "Connecting camera..." : "📹 Start camera"}
                            </Button>
                          </>
                        ) : (
                          <>
                            <p className="text-lg">
                              {isConnecting ? "Connecting to stream..." : "Stream is preparing..."}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {user?.id === stream.influencer_profiles?.user_id && isStreaming && (
                    <div className="absolute bottom-4 right-4">
                      <Button onClick={stopStreaming} variant="destructive" size="sm">
                        <VideoOff className="h-4 w-4 mr-2" />
                        Stop Stream
                      </Button>
                    </div>
                  )}

                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge variant="destructive" className={isStreaming ? "animate-pulse" : ""}>
                      🔴 {isStreaming ? "LIVE" : "OFFLINE"}
                    </Badge>
                    <Badge variant="secondary">
                      <Users className="h-3 w-3 mr-1" />
                      {stream.viewer_count}
                    </Badge>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={stream.influencer_profiles?.profile_photo_url} />
                      <AvatarFallback>
                        {stream.influencer_profiles?.display_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-bold">{stream.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {stream.influencer_profiles?.display_name}
                      </p>
                    </div>
                  </div>
                  {stream.description && (
                    <p className="text-muted-foreground">{stream.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-1">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center justify-between">
                  <span>Live Chat</span>
                  <div className="flex items-center gap-2">
                    {streamId && <SuperChatDialog streamId={streamId} />}
                    <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Gift className="h-4 w-4 mr-2" />
                        Gifts
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send a virtual gift</DialogTitle>
                        <DialogDescription>
                          Support your favorite influencer
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Input
                          placeholder="Add a message to the gift (optional)"
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          {gifts.map((gift) => (
                            <Button
                              key={gift.id}
                              variant="outline"
                              className="h-24 flex flex-col gap-2"
                              onClick={() => sendGiftMutation.mutate(gift)}
                              disabled={!user || sendGiftMutation.isPending}
                            >
                              <span className="text-4xl">{gift.icon}</span>
                              <span className="text-sm">{gift.name}</span>
                              <span className="text-xs text-muted-foreground">
                                €{gift.price.toFixed(2)}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  </div>
                </CardTitle>
                {streamId && (
                  <div className="pt-2">
                    <SuperChatFeed streamId={streamId} />
                  </div>
                )}
              </CardHeader>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.profiles?.avatar_url} />
                        <AvatarFallback>
                          {msg.profiles?.full_name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {msg.profiles?.full_name || "User"}
                        </p>
                        <p className="text-sm text-muted-foreground">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (message.trim()) {
                      sendMessageMutation.mutate(message);
                    }
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={user ? "Write a message..." : "Log in to chat"}
                    disabled={!user}
                  />
                  <Button type="submit" disabled={!user || !message.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
