import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Camera, Heart, Smile, Frown, Angry, Meh, Eye, Loader2, Sparkles, ScanFace } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

interface ScanResult {
  emotion: string;
  confidence: number;
  facialCues: string;
  avatarReaction: string;
  suggestion: string;
}

export const EmotionSync = ({ onBack }: Props) => {
  const [isScanning, setIsScanning] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<{ emotion: string; at: string }[]>([]);
  const [avatar, setAvatar] = useState<{ name: string; style: string; image_url: string | null } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("holographic_avatars")
        .select("name, style, image_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setAvatar(data as any);
    })();
  }, []);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setIsScanning(true);
      toast({ title: "Camera active", description: "Tap “Analyze my expression” to scan (1 credit)." });
    } catch {
      toast({ title: "Camera access denied", description: "Please allow camera access for Emotion Sync", variant: "destructive" });
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsScanning(false);
  };

  const analyze = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) {
      toast({ title: "Camera not ready", description: "Wait a second and try again.", variant: "destructive" });
      return;
    }
    setAnalyzing(true);
    try {
      const w = 640;
      const h = Math.round((video.videoHeight / video.videoWidth) * w);
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d")!.drawImage(video, 0, 0, w, h);
      const image = canvas.toDataURL("image/jpeg", 0.8);

      const { data, error } = await supabase.functions.invoke("holographic-battle-simulate", {
        body: { mode: "emotion_sync", image, avatarName: avatar?.name, avatarStyle: avatar?.style },
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).message || (data as any).error);

      setResult(data as ScanResult);
      setHistory((prev) => [{ emotion: (data as ScanResult).emotion, at: new Date().toLocaleTimeString() }, ...prev].slice(0, 8));
    } catch (e: any) {
      toast({
        title: "Analysis failed",
        description: String(e?.message || "").includes("402") || String(e?.message || "").toLowerCase().includes("credit")
          ? "Not enough credits (1 credit per scan)."
          : "Could not analyze the frame. Try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  }, [avatar, toast]);

  const active = result ? EMOTIONS.find((e) => e.name === result.emotion) : null;

  return (
    <>
      <FloatingHowItWorks
        title='Emotion Sync'
        steps={[
          { title: 'Start the camera', desc: 'Allow camera access so we can see your face.' },
          { title: 'Analyze your expression', desc: 'Tap “Analyze my expression”. One frame is sent to the AI (1 credit).' },
          { title: 'See the avatar react', desc: 'The AI detects your real emotion and describes how your avatar mirrors it.' },
          { title: 'Scan again anytime', desc: 'Each scan is a fresh real analysis; recent scans are listed below.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Emotion Sync</h2>
          <p className="text-sm text-muted-foreground">Real AI facial-emotion analysis — your avatar mirrors what it sees</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Camera Feed */}
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-bold mb-3 flex items-center gap-2"><Camera className="w-5 h-5 text-primary" /> Your Camera</h3>
            <div className="relative aspect-video bg-muted rounded-xl overflow-hidden mb-4">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Camera className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              {isScanning && result && (
                <Badge className="absolute top-3 left-3 bg-primary/80 text-primary-foreground">
                  Detected: {result.emotion} · {result.confidence}%
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <Button onClick={isScanning ? stopCamera : startCamera} className="w-full" variant={isScanning ? "outline" : "default"}>
                {isScanning ? "Stop camera" : "Start camera"}
              </Button>
              <Button onClick={analyze} disabled={!isScanning || analyzing} className="w-full">
                {analyzing
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing…</>
                  : <><ScanFace className="w-4 h-4 mr-2" /> Analyze my expression · 1 credit</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Avatar Response */}
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
          <CardContent className="p-6">
            <h3 className="font-bold mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" /> Avatar Response</h3>
            <div className="aspect-video bg-gradient-to-br from-violet-500/10 via-primary/5 to-pink-500/10 rounded-xl flex items-center justify-center mb-4 border border-primary/20 overflow-hidden">
              {result ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-4">
                  {avatar?.image_url ? (
                    <img src={avatar.image_url} alt={`${avatar.name} avatar reacting`} className="w-20 h-20 rounded-full object-cover mx-auto mb-2 border border-primary/30" />
                  ) : active ? (
                    <active.icon className={`w-14 h-14 ${active.color} mx-auto mb-2`} />
                  ) : (
                    <Sparkles className="w-14 h-14 text-primary mx-auto mb-2" />
                  )}
                  <p className="text-sm text-foreground font-medium">{result.avatarReaction}</p>
                </motion.div>
              ) : (
                <p className="text-sm text-muted-foreground px-4 text-center">Start the camera and run a scan to see your avatar react</p>
              )}
            </div>
            {result && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-semibold">{result.confidence}%</span>
                  </div>
                  <Progress value={result.confidence} className="h-2" />
                </div>
                {result.facialCues && <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Facial cues: </span>{result.facialCues}</p>}
                {result.suggestion && <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Tip: </span>{result.suggestion}</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Emotion palette + history */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold mb-4">Emotion Palette</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {EMOTIONS.map((emotion, i) => (
              <motion.div key={emotion.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`${emotion.bg} rounded-xl p-3 text-center border ${result?.emotion === emotion.name ? "border-primary" : "border-border/40"}`}>
                <emotion.icon className={`w-6 h-6 ${emotion.color} mx-auto mb-1`} />
                <p className="text-xs font-medium">{emotion.name}</p>
              </motion.div>
            ))}
          </div>

          {history.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-sm mb-2">Recent scans</h4>
              <div className="flex flex-wrap gap-2">
                {history.map((h, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{h.emotion} · {h.at}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
};
