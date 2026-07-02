import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Square, CheckCircle2 } from "lucide-react";
import { useVoiceClone } from "@/hooks/useShadowArenaFeatures";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function VoiceCloneCard() {
  const { clone, cloneVoice } = useVoiceClone();
  const [recording, setRecording] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [voiceName, setVoiceName] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const buf = await blob.arrayBuffer();
        const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
        setAudioBase64(b64);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setTimeout(() => recorder.state === "recording" && stop(), 30000);
    } catch {
      toast.error("Microphone access denied");
    }
  };
  const stop = () => { recorderRef.current?.stop(); setRecording(false); };

  if (clone) {
    return (
      <><FloatingHowItWorks title="VoiceCloneCard — How it works" steps={[{title:"Open this section",desc:"Access VoiceCloneCard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<Card className="p-5 bg-gradient-to-br from-[hsl(280,30%,8%)] to-[hsl(0,0%,4%)] border-red-900/30 mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
          <div>
            <h3 className="font-bold text-red-100">Voice Clone Ready</h3>
            <p className="text-xs text-red-200/60">"{clone.voice_name}" — narrate your stories with your own voice</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 bg-gradient-to-br from-[hsl(0,30%,8%)] to-[hsl(280,25%,7%)] border-red-900/30 mb-6">
      <h3 className="text-xl font-black text-red-100 flex items-center gap-2 mb-1">
        <Mic className="w-5 h-5 text-pink-400" />
        Clone Your Voice
      </h3>
      <p className="text-xs text-red-200/60 mb-4">Record 20-30s of clear speech. Cost: 25 credits.</p>

      <div className="space-y-3">
        <Input placeholder="Name your voice (e.g. The Whisperer)" value={voiceName} onChange={(e) => setVoiceName(e.target.value)} />
        {!audioBase64 ? (
          <Button
            onClick={recording ? stop : start}
            className={`w-full ${recording ? "bg-red-600 animate-pulse" : "bg-gradient-to-r from-pink-700 to-red-700"}`}
          >
            {recording ? <><Square className="w-4 h-4 mr-2" /> Stop Recording</> : <><Mic className="w-4 h-4 mr-2" /> Start Recording (max 30s)</>}
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-green-400 text-center">✓ Sample recorded</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setAudioBase64(null)}>Re-record</Button>
              <Button
                disabled={!voiceName || cloneVoice.isPending}
                onClick={() => cloneVoice.mutate({ audioBase64, voiceName })}
                className="bg-gradient-to-r from-pink-700 to-red-700"
              >
                {cloneVoice.isPending ? "Cloning..." : "Clone Voice (25 cr)"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  </>
  );
}
