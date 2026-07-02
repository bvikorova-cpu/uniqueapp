import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Video, VideoOff, Mic, MicOff, Monitor, Users, MessageSquare, Phone } from "lucide-react";
import { Whiteboard } from "./Whiteboard";
import { BreakoutRooms } from "./BreakoutRooms";
import { LessonRecording } from "./LessonRecording";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface LiveLessonRoomProps {
  lessonId: string;
  lessonTitle: string;
  isInstructor: boolean;
}

export function LiveLessonRoom({ lessonId, lessonTitle, isInstructor }: LiveLessonRoomProps) {
  const { toast } = useToast();
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showBreakoutRooms, setShowBreakoutRooms] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const joinLesson = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Insert participant record
      await supabase.from("live_lesson_participants").insert({
        lesson_id: lessonId,
        user_id: user.id,
      });

      // Update lesson status to live if instructor
      if (isInstructor) {
        await supabase.from("live_lessons").update({ status: "live" }).eq("id", lessonId);
      }

      // Subscribe to participants
      const channel = supabase
        .channel(`lesson-${lessonId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "live_lesson_participants",
            filter: `lesson_id=eq.${lessonId}`,
          },
          (payload) => {
            loadParticipants();
          }
        )
        .subscribe();

      loadParticipants();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    joinLesson();

    return () => {
      leaveLesson();
    };
  }, [lessonId, isInstructor]);

  const loadParticipants = async () => {
    const { data } = await supabase
      .from("live_lesson_participants")
      .select("*, profiles(full_name, avatar_url)")
      .eq("lesson_id", lessonId)
      .is("left_at", null);

    if (data) setParticipants(data);
  };

  const leaveLesson = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    // Update participant record
    await supabase
      .from("live_lesson_participants")
      .update({ left_at: new Date().toISOString() })
      .eq("lesson_id", lessonId)
      .eq("user_id", user.id);

    // End lesson if instructor
    if (isInstructor) {
      await supabase.from("live_lessons").update({ status: "ended" }).eq("id", lessonId);
    }
  };

  const toggleVideo = async () => {
    try {
      if (!isVideoEnabled) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: isAudioEnabled });
        setLocalStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsVideoEnabled(true);
      } else {
        if (localStream) {
          localStream.getVideoTracks().forEach(track => track.stop());
        }
        setIsVideoEnabled(false);
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera",
        variant: "destructive",
      });
    }
  };

  const toggleAudio = async () => {
    try {
      if (!isAudioEnabled) {
        if (!localStream) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideoEnabled });
          setLocalStream(stream);
        } else {
          const audioTrack = await navigator.mediaDevices.getUserMedia({ audio: true });
          localStream.addTrack(audioTrack.getAudioTracks()[0]);
        }
        setIsAudioEnabled(true);
      } else {
        if (localStream) {
          localStream.getAudioTracks().forEach(track => track.stop());
        }
        setIsAudioEnabled(false);
      }
    } catch (error) {
      toast({
        title: "Microphone Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (screenRef.current) {
          screenRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);

        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
      } else {
        if (screenRef.current?.srcObject) {
          const stream = screenRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
        setIsScreenSharing(false);
      }
    } catch (error) {
      toast({
        title: "Screen Share Error",
        description: "Could not start screen sharing",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Live Lesson Room works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{lessonTitle}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">
                <Users className="w-3 h-3 mr-1" />
                {participants.length} Participants
              </Badge>
              <Badge className="bg-red-500">● LIVE</Badge>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Local Video */}
          <Card className="relative aspect-video bg-muted overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <VideoOff className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            <Badge className="absolute bottom-2 left-2">You</Badge>
          </Card>

          {/* Screen Share */}
          {isScreenSharing && (
            <Card className="relative aspect-video bg-muted overflow-hidden md:col-span-2">
              <video
                ref={screenRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
              <Badge className="absolute bottom-2 left-2">
                <Monitor className="w-3 h-3 mr-1" />
                Screen Share
              </Badge>
            </Card>
          )}

          {/* Remote Participants */}
          {participants.slice(0, isScreenSharing ? 3 : 5).map((participant) => (
            <Card key={participant.id} className="relative aspect-video bg-muted overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Users className="w-12 h-12 text-muted-foreground" />
              </div>
              <Badge className="absolute bottom-2 left-2">
                {participant.profiles?.full_name || "Unknown"}
              </Badge>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            variant={isVideoEnabled ? "default" : "secondary"}
            size="lg"
            onClick={toggleVideo}
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>
          <Button
            variant={isAudioEnabled ? "default" : "secondary"}
            size="lg"
            onClick={toggleAudio}
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>
          {isInstructor && (
            <>
              <Button variant="secondary" size="lg" onClick={toggleScreenShare}>
                <Monitor className="w-5 h-5 mr-2" />
                {isScreenSharing ? "Stop Sharing" : "Share Screen"}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowWhiteboard(!showWhiteboard)}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Whiteboard
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowBreakoutRooms(!showBreakoutRooms)}
              >
                <Users className="w-5 h-5 mr-2" />
                Breakout Rooms
              </Button>
            </>
          )}
          <Button variant="destructive" size="lg" onClick={leaveLesson}>
            <Phone className="w-5 h-5 mr-2" />
            Leave
          </Button>
        </div>
      </Card>

      {/* Whiteboard */}
      {showWhiteboard && <Whiteboard lessonId={lessonId} isInstructor={isInstructor} />}

      {/* Breakout Rooms */}
      {showBreakoutRooms && isInstructor && (
        <BreakoutRooms lessonId={lessonId} participants={participants} />
      )}
    </div>
    </>
    );
}
