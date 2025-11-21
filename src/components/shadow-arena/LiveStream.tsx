import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Eye, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LiveStreamProps {
  participantId: string;
  battleId: string;
  isStreamer: boolean;
}

export function LiveStream({ participantId, battleId, isStreamer }: LiveStreamProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<Array<{ user: string; message: string }>>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Set up real-time viewer count tracking
    const channel = supabase
      .channel(`battle-${battleId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setViewerCount(Object.keys(state).length);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [battleId]);

  const startStream = async () => {
    try {
      // Get user media (camera + microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Call edge function to start stream
      const { error } = await supabase.functions.invoke('start-stream', {
        body: { battleId, participantId }
      });

      if (error) throw error;

      setIsStreaming(true);
      toast.success('Stream started successfully! You are now live!');
    } catch (error) {
      console.error('Start stream error:', error);
      toast.error('Failed to start stream. Please check your camera and microphone permissions.');
    }
  };

  const stopStream = async () => {
    try {
      // Stop all tracks
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      // Call edge function to stop stream
      const { error } = await supabase.functions.invoke('stop-stream', {
        body: { participantId }
      });

      if (error) throw error;

      setIsStreaming(false);
      toast.success('Stream ended');
    } catch (error) {
      console.error('Stop stream error:', error);
      toast.error('Failed to stop stream');
    }
  };

  return (
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
                className="flex-1 bg-red-600 hover:bg-red-700"
                size="lg"
              >
                <Video className="mr-2 h-5 w-5" />
                Start Live Stream
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
    </Card>
  );
}
