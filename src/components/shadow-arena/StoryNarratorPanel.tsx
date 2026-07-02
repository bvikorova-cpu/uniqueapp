import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, Loader2 } from "lucide-react";
import { useShadowAITools, useShadowArenaCredits, SHADOW_AI_COSTS } from "@/hooks/useShadowArenaAI";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const VOICES = [
  { id: "kPtEHAvRnjUJFv7SK9WI", label: "Glitch (whispered)" },
  { id: "MDLAMJ0jxkpYkjXbmG4t", label: "Deep narrator" },
  { id: "EXAVITQu4vr4xnSDxMaL", label: "Haunted female" },
  { id: "iP95p4xoKVk53GoZ742B", label: "Dark male" },
];

interface Props {
  text: string;
  storyId?: string;
  existingAudioUrl?: string | null;
}

export function StoryNarratorPanel({ text, storyId, existingAudioUrl }: Props) {
  const { narrate } = useShadowAITools();
  const { credits } = useShadowArenaCredits();
  const balance = credits?.credits_remaining ?? 0;
  const [voice, setVoice] = useState(VOICES[0].id);
  const [audio, setAudio] = useState<string | null>(existingAudioUrl ?? null);

  const handleNarrate = () => {
    if (balance < SHADOW_AI_COSTS.narrator) {
      toast.error(`Need ${SHADOW_AI_COSTS.narrator} credits`);
      return;
    }
    const trimmed = text.slice(0, 2500);
    narrate.mutate(
      { text: trimmed, voiceId: voice, voiceLabel: VOICES.find(v => v.id === voice)?.label, storyId: storyId ?? null },
      { onSuccess: (data) => setAudio(data.audioUrl || data.audio_url) }
    );
  };

  return (
    <><FloatingHowItWorks title="StoryNarratorPanel — How it works" steps={[{title:"Open this section",desc:"Access StoryNarratorPanel from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<Card className="p-5 mb-6 bg-gradient-to-br from-purple-950/20 via-card/60 to-red-950/15 border-purple-900/30">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-700 to-red-900 flex items-center justify-center"
          >
            <Volume2 className="w-4 h-4 text-purple-100" />
          </motion.div>
          <div>
            <h3 className="font-bold text-purple-200 text-sm">AI Voice Narrator</h3>
            <p className="text-[11px] text-muted-foreground">Hear this story whispered by AI</p>
          </div>
        </div>
        <select
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
          className="bg-background/50 border border-purple-900/30 rounded-md px-2 py-1.5 text-xs"
        >
          {VOICES.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
        </select>
      </div>

      <Button
        onClick={handleNarrate}
        disabled={narrate.isPending}
        size="sm"
        className="w-full bg-gradient-to-r from-purple-700 to-red-800 hover:from-purple-800 hover:to-red-900"
      >
        {narrate.isPending
          ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Generating voice...</>
          : <><Volume2 className="w-3.5 h-3.5 mr-1.5" /> Narrate Story ({SHADOW_AI_COSTS.narrator} credits)</>}
      </Button>

      {audio && (
        <audio controls src={audio} className="w-full mt-3" />
      )}
    </Card>
  </>
  );
}
