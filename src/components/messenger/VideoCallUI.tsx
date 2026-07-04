import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { 
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff, 
  Maximize2, Minimize2, Users, MessageCircle, Shield,
  Lock, Volume2, Settings
} from 'lucide-react';
interface VideoCallUIProps {
  participant?: {
    name: string;
    avatar?: string;
  };
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  isConnected?: boolean;
  isEncrypted?: boolean;
  duration?: string;
  onEndCall?: () => void;
  onToggleVideo?: () => void;
  onToggleAudio?: () => void;
}

export const VideoCallUI = ({
  participant = { name: 'John Doe' },
  isVideoEnabled: initialVideo = true,
  isAudioEnabled: initialAudio = true,
  isConnected = true,
  isEncrypted = true,
  duration = '03:45',
  onEndCall,
  onToggleVideo,
  onToggleAudio,
}: VideoCallUIProps) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(initialVideo);
  const [isAudioEnabled, setIsAudioEnabled] = useState(initialAudio);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    onToggleVideo?.();
  };

  const handleToggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    onToggleAudio?.();
  };

  return (
    <Card className="overflow-hidden bg-gray-900 text-white">
      <CardContent className="p-0 relative aspect-video min-h-[300px]">
        {/* Main Video Area */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
          {isVideoEnabled ? (
            <div className="text-center text-gray-400">
              <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Video Stream</p>
            </div>
          ) : (
            <Avatar className="h-24 w-24">
              <AvatarImage src={participant.avatar} />
              <AvatarFallback className="text-2xl bg-gray-700">
                {participant.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-semibold">{participant.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span>{duration}</span>
                  {isEncrypted && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-0 text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      E2E Encrypted
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Self Preview */}
        <motion.div
          className="absolute bottom-20 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700"
          drag
          dragConstraints={{ left: -200, right: 0, top: -200, bottom: 0 }}
        >
          <div className="w-full h-full flex items-center justify-center bg-gray-700">
            <span className="text-xs text-gray-400">You</span>
          </div>
        </motion.div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant={isAudioEnabled ? "secondary" : "destructive"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={handleToggleAudio}
              >
                {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant={isVideoEnabled ? "secondary" : "destructive"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={handleToggleVideo}
              >
                {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="destructive"
                size="icon"
                className="h-14 w-14 rounded-full"
                onClick={onEndCall}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="secondary"
                size="icon"
                className="h-12 w-12 rounded-full"
               onClick={() => { window.location.href = "/messenger"; }}>
                <MessageCircle className="h-5 w-5" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="secondary"
                size="icon"
                className="h-12 w-12 rounded-full"
               onClick={() => { window.location.href = "/settings"; }}>
                <Settings className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Connection Status */}
        <AnimatePresence>
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 flex items-center justify-center"
            >
              <div className="text-center">
                <div className="animate-pulse mb-4">
                  <Phone className="h-12 w-12 mx-auto text-primary" />
                </div>
                <p className="text-lg">Connecting...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export const IncomingCallUI = ({
  caller = { name: 'Jane Doe', avatar: '' },
  isVideoCall = true,
  onAccept,
  onDecline,
}: {
  caller?: { name: string; avatar?: string };
  isVideoCall?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
    >
      <div className="text-center text-white">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Avatar className="h-32 w-32 mx-auto border-4 border-primary">
            <AvatarImage src={caller.avatar} />
            <AvatarFallback className="text-4xl bg-primary">
              {caller.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </motion.div>
        
        <h2 className="text-2xl font-bold mt-6">{caller.name}</h2>
        <p className="text-gray-400 mt-2">
          Incoming {isVideoCall ? 'Video' : 'Voice'} Call...
        </p>

        <div className="flex justify-center gap-8 mt-10">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="destructive"
              size="icon"
              className="h-16 w-16 rounded-full"
              onClick={onDecline}
            >
              <PhoneOff className="h-8 w-8" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              size="icon"
              className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600"
              onClick={onAccept}
            >
              {isVideoCall ? <Video className="h-8 w-8" /> : <Phone className="h-8 w-8" />}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export const EncryptionIndicator = ({ isEncrypted = true }: { isEncrypted?: boolean }) => {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
      isEncrypted 
        ? 'bg-green-500/20 text-green-600' 
        : 'bg-yellow-500/20 text-yellow-600'
    }`}>
      {isEncrypted ? (
        <>
          <Shield className="h-4 w-4" />
          <span>End-to-End Encrypted</span>
        </>
      ) : (
        <>
          <Lock className="h-4 w-4" />
          <span>Standard Encryption</span>
        </>
      )}
    </div>
  );
};
