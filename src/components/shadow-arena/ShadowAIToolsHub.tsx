import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skull, Volume2, Sparkles, Wand2, Loader2, Image as ImageIcon, BookOpen, User as UserIcon } from "lucide-react";
import { useShadowAITools, useShadowArenaCredits, SHADOW_AI_COSTS } from "@/hooks/useShadowArenaAI";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";


const TONES = ["Cosmic dread", "Slasher", "Gothic", "Psychological", "Folk horror", "Body horror"];
const LENGTHS = ["short", "medium", "long"];
const VOICES = [
  { id: "kPtEHAvRnjUJFv7SK9WI", label: "Glitch (whispered horror)" },
  { id: "MDLAMJ0jxkpYkjXbmG4t", label: "Deep narrator" },
  { id: "EXAVITQu4vr4xnSDxMaL", label: "Sarah (haunted female)" },
  { id: "iP95p4xoKVk53GoZ742B", label: "Chris (dark male)" },
];
const AVATAR_STYLES = ["Demonic", "Vampire", "Zombie", "Possessed", "Wraith", "Cursed doll"];

export function ShadowAIToolsHub() {
  const { generateStory, narrate, generateAvatar } = useShadowAITools();
  const { credits } = useShadowArenaCredits();
  const balance = credits?.credits_remaining ?? 0;

  // Story state
  const [storyPrompt, setStoryPrompt] = useState("");
  const [storyTone, setStoryTone] = useState(TONES[0]);
  const [storyLength, setStoryLength] = useState("medium");
  const [storyImage, setStoryImage] = useState(true);
  const [storyResult, setStoryResult] = useState<any>(null);

  // Narrator state
  const [narratorText, setNarratorText] = useState("");
  const [narratorVoice, setNarratorVoice] = useState(VOICES[0].id);
  const [narratorAudio, setNarratorAudio] = useState<string | null>(null);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarStyle, setAvatarStyle] = useState(AVATAR_STYLES[0]);
  const [avatarResult, setAvatarResult] = useState<string | null>(null);

  const requireCredits = (need: number) => {
    if (balance < need) {
      toast.error(`Need ${need} credits — you have ${balance}. Buy more above.`);
      return false;
    }
    return true;
  };

  return (
    <><FloatingHowItWorks title="ShadowAIToolsHub — How it works" steps={[{title:"Open this section",desc:"Access ShadowAIToolsHub from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<Card className="p-5 mb-8 bg-gradient-to-br from-card/80 via-[hsl(280,20%,7%)] to-[hsl(0,15%,5%)] border-red-900/30">
      <div className="flex items-center gap-3 mb-5">
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-red-900 flex items-center justify-center shadow-[0_0_20px_rgba(127,29,29,0.5)]"
        >
          <Wand2 className="w-5 h-5 text-purple-100" />
        </motion.div>
        <div>
          <h2 className="text-xl font-black bg-gradient-to-r from-purple-200 to-red-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            {"Shadow AI Studio"}
          </h2>
          <p className="text-xs text-red-100/90 font-medium">{"Forge horror with premium AI tools"}</p>
        </div>
      </div>

      <Tabs defaultValue="story">
        <TabsList className="grid grid-cols-3 w-full bg-black/60 border border-red-800/50">
          <TabsTrigger value="story" className="text-red-100 data-[state=active]:bg-red-800/60 data-[state=active]:text-white">
            <BookOpen className="w-3.5 h-3.5 mr-1" /> {"Story"}
          </TabsTrigger>
          <TabsTrigger value="narrator" className="text-red-100 data-[state=active]:bg-red-800/60 data-[state=active]:text-white">
            <Volume2 className="w-3.5 h-3.5 mr-1" /> {"Voice"}
          </TabsTrigger>
          <TabsTrigger value="avatar" className="text-red-100 data-[state=active]:bg-red-800/60 data-[state=active]:text-white">
            <UserIcon className="w-3.5 h-3.5 mr-1" /> {"Avatar"}
          </TabsTrigger>
        </TabsList>

        {/* AI HORROR STORY GENERATOR */}
        <TabsContent value="story" className="mt-4 space-y-3">
          <Textarea
            value={storyPrompt}
            onChange={(e) => setStoryPrompt(e.target.value)}
            rows={3}
            placeholder={"A few words... 'abandoned doll factory at midnight'"}
            className="bg-black/60 border-red-800/50 text-red-50 placeholder:text-red-200/50 font-serif"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={storyTone}
              onChange={(e) => setStoryTone(e.target.value)}
              className="bg-black/60 border border-red-800/50 text-red-50 rounded-md px-3 py-2 text-sm"
            >
              {TONES.map((tone) => <option key={tone} value={tone} className="bg-black text-red-50">{tone}</option>)}
            </select>
            <select
              value={storyLength}
              onChange={(e) => setStoryLength(e.target.value)}
              className="bg-black/60 border border-red-800/50 text-red-50 rounded-md px-3 py-2 text-sm"
            >
              {LENGTHS.map((l) => <option key={l} value={l} className="bg-black text-red-50">{l}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs text-red-100 font-medium">
            <input type="checkbox" checked={storyImage} onChange={(e) => setStoryImage(e.target.checked)} />
            {"Include AI horror illustration"}
          </label>
          <Button
            onClick={() => {
              if (!storyPrompt.trim()) { toast.error("Enter a prompt"); return; }
              if (!requireCredits(SHADOW_AI_COSTS.story)) return;
              generateStory.mutate(
                { prompt: storyPrompt, tone: storyTone, length: storyLength, generateImage: storyImage },
                { onSuccess: (data) => setStoryResult(data) }
              );
            }}
            disabled={generateStory.isPending}
            className="w-full bg-gradient-to-r from-red-700 to-purple-800 hover:from-red-800 hover:to-purple-900"
          >
            {generateStory.isPending
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {"Conjuring horror..."}</>
              : <><Sparkles className="w-4 h-4 mr-2" /> {"Generate Story"} ({SHADOW_AI_COSTS.story} {"cr"})</>}
          </Button>
          {storyResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-4 rounded-xl bg-black/40 border border-red-900/30 space-y-3"
            >
              {storyResult.title && <h3 className="font-bold text-red-300 text-lg">{storyResult.title}</h3>}
              {storyResult.imageUrl && (
                <img src={storyResult.imageUrl} alt="Generated horror" className="w-full rounded-lg border border-red-900/30" />
              )}
              <p className="text-sm whitespace-pre-wrap text-foreground/90 font-serif leading-relaxed max-h-80 overflow-y-auto">
                {storyResult.story || storyResult.content}
              </p>
            </motion.div>
          )}
        </TabsContent>

        {/* AI VOICE NARRATOR */}
        <TabsContent value="narrator" className="mt-4 space-y-3">
          <Textarea
            value={narratorText}
            onChange={(e) => setNarratorText(e.target.value)}
            rows={5}
            placeholder={"Paste the horror text to be narrated by a chilling AI voice..."}
            className="bg-black/60 border-red-800/50 text-red-50 placeholder:text-red-200/50 font-serif"
          />
          <select
            value={narratorVoice}
            onChange={(e) => setNarratorVoice(e.target.value)}
            className="bg-black/60 border border-red-800/50 text-red-50 rounded-md px-3 py-2 text-sm w-full"
          >
            {VOICES.map((v) => <option key={v.id} value={v.id} className="bg-black text-red-50">{v.label}</option>)}
          </select>
          <Button
            onClick={() => {
              if (!narratorText.trim()) { toast.error("Enter text to narrate"); return; }
              if (narratorText.length > 2500) { toast.error("Max 2500 chars"); return; }
              if (!requireCredits(SHADOW_AI_COSTS.narrator)) return;
              narrate.mutate(
                { text: narratorText, voiceId: narratorVoice, voiceLabel: VOICES.find(v => v.id === narratorVoice)?.label },
                { onSuccess: (data) => setNarratorAudio(data.audioUrl || data.audio_url) }
              );
            }}
            disabled={narrate.isPending}
            className="w-full bg-gradient-to-r from-purple-700 to-red-800 hover:from-purple-800 hover:to-red-900"
          >
            {narrate.isPending
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {"Summoning voice..."}</>
              : <><Volume2 className="w-4 h-4 mr-2" /> {"Narrate"} ({SHADOW_AI_COSTS.narrator} {"cr"})</>}
          </Button>
          {narratorAudio && (
            <audio controls src={narratorAudio} className="w-full mt-3" />
          )}
        </TabsContent>

        {/* NIGHTMARE AVATAR */}
        <TabsContent value="avatar" className="mt-4 space-y-3">
          <Input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder={"Public image URL (selfie or photo)"}
            className="bg-black/60 border-red-800/50 text-red-50 placeholder:text-red-200/50"
          />
          <select
            value={avatarStyle}
            onChange={(e) => setAvatarStyle(e.target.value)}
            className="bg-black/60 border border-red-800/50 text-red-50 rounded-md px-3 py-2 text-sm w-full"
          >
            {AVATAR_STYLES.map((s) => <option key={s} value={s} className="bg-black text-red-50">{s}</option>)}
          </select>
          <Button
            onClick={() => {
              if (!avatarUrl.trim()) { toast.error("Enter image URL"); return; }
              if (!requireCredits(SHADOW_AI_COSTS.avatar)) return;
              generateAvatar.mutate(
                { sourceImageUrl: avatarUrl, style: avatarStyle },
                { onSuccess: (data) => setAvatarResult(data.avatarUrl || data.avatar_url) }
              );
            }}
            disabled={generateAvatar.isPending}
            className="w-full bg-gradient-to-r from-red-700 to-purple-800 hover:from-red-800 hover:to-purple-900"
          >
            {generateAvatar.isPending
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {"Twisting reality..."}</>
              : <><Skull className="w-4 h-4 mr-2" /> {"Create Nightmare"} ({SHADOW_AI_COSTS.avatar} {"cr"})</>}
          </Button>
          {avatarResult && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <img src={avatarResult} alt="Nightmare avatar" className="w-full rounded-xl border border-red-900/30 mt-3" />
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  </>
  );
}
