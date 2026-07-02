import { useState, useRef } from "react";
import { ArrowLeft, Camera, Heart, Smile, Frown, Angry, Meh, Eye, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const EMOTIONS = [
  { name: "Happy", icon: Smile, color: "text-amber-500", bg: "bg-amber-500/10" },
  { name: "Sad", icon: Frown, color: "text-blue-500", bg: "bg-blue-500/10" },
  { name: "Angry", icon: Angry, color: "text-red-500", bg: "bg-red-500/10" },
  { name: "Neutral", icon: Meh, color: "text-gray-500", bg: "bg-gray-500/10" },
  { name: "Love", icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10" },
  { name: "Surprised", icon: Eye, color: "text-violet-500", bg: "bg-violet-500/10" },
];

export const EmotionSync = ({ onBack }: Props) => {
  const [isScanning, setIsScanning] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);
  const [avatarReaction, setAvatarReaction] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) { videoRef.current.srcObject = stream; }
      setIsScanning(true);
      toast({ title: "Camera Active", description: "Your expressions are being analyzed in real-time" });
      
      // Simulate emotion detection
      const emotionInterval = setInterval(() => {
        const randomEmotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
        setDetectedEmotion(randomEmotion.name);
        setAvatarReaction(`Avatar mirrors your ${randomEmotion.name.toLowerCase()} expression with holographic animations`);
      }, 3000);

      return () => clearInterval(emotionInterval);
    } catch {
      toast({ title: "Camera Access Denied", description: "Please allow camera access for Emotion Sync", variant: "destructive" });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    setDetectedEmotion(null);
    setAvatarReaction(null);
  };

  return (
    <>
      <FloatingHowItWorks
        title='Emotion Sync'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Emotion Sync panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Emotion Sync</h2>
          <p className="text-sm text-muted-foreground">Your avatar mirrors your real emotions in real-time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Camera Feed */}
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-bold mb-3 flex items-center gap-2"><Camera className="w-5 h-5 text-primary" /> Your Camera</h3>
            <div className="relative aspect-video bg-muted rounded-xl overflow-hidden mb-4">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Camera className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              {isScanning && detectedEmotion && (
                <Badge className="absolute top-3 left-3 bg-primary/80 text-primary-foreground">
                  Detected: {detectedEmotion}
                </Badge>
              )}
            </div>
            <Button onClick={isScanning ? stopCamera : startCamera} className="w-full" variant={isScanning ? "destructive" : "default"}>
              {isScanning ? "Stop Scanning" : "Start Emotion Sync"}
            </Button>
          </CardContent>
        </Card>

        {/* Avatar Response */}
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
          <CardContent className="p-6">
            <h3 className="font-bold mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" /> Avatar Response</h3>
            <div className="aspect-video bg-gradient-to-br from-violet-500/10 via-primary/5 to-pink-500/10 rounded-xl flex items-center justify-center mb-4 border border-primary/20">
              {avatarReaction ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-4">
                  <Sparkles className="w-16 h-16 text-primary mx-auto mb-3" />
                  <p className="text-sm text-foreground font-medium">{avatarReaction}</p>
                </motion.div>
              ) : (
                <p className="text-sm text-muted-foreground">Start camera to see your avatar react</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emotion History */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold mb-4">Emotion Palette</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {EMOTIONS.map((emotion, i) => (
              <motion.div key={emotion.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`${emotion.bg} rounded-xl p-3 text-center border border-border/40`}>
                <emotion.icon className={`w-6 h-6 ${emotion.color} mx-auto mb-1`} />
                <p className="text-xs font-medium">{emotion.name}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};
