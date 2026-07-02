import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, Play, Trash2, Loader2 } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props {
  profileId: string;
  userId: string;
  url: string | null;
  duration: number | null;
  onChange: (url: string | null, duration: number | null) => void;
}

const MAX_SECONDS = 30;

export const VoiceIntroRecorder = ({ profileId, userId, url, duration, onChange }: Props) => {
  const { toast } = useToast();
  const { isRecording, isUploading, duration: recDur, start, stopAndUpload, cancel } =
    useVoiceRecorder(userId);
  const [saving, setSaving] = useState(false);

  const handleStop = async () => {
    setSaving(true);
    const newUrl = await stopAndUpload();
    if (newUrl) {
      const finalDur = Math.min(recDur, MAX_SECONDS);
      const { error } = await supabase
        .from("dating_profiles")
        .update({ voice_intro_url: newUrl, voice_intro_duration: finalDur })
        .eq("id", profileId);
      if (error) {
        toast({ title: "Save failed", description: error.message, variant: "destructive" });
      } else {
        onChange(newUrl, finalDur);
        toast({ title: "Voice intro saved" });
      }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from("dating_profiles")
      .update({ voice_intro_url: null, voice_intro_duration: null })
      .eq("id", profileId);
    if (!error) onChange(null, null);
  };

  // Auto-stop at MAX_SECONDS
  if (isRecording && recDur >= MAX_SECONDS) {
    handleStop();
  }

  return (
    <Card className="p-5">
      <FloatingHowItWorks
        title={"Voice Intro Recorder"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Mic className="h-4 w-4 text-primary" />
          Voice Intro
        </h3>
        <span className="text-[10px] text-muted-foreground">Max 30s</span>
      </div>
      {url ? (
        <div className="flex items-center gap-2">
          <audio src={url} controls className="flex-1 h-9" />
          <Button size="icon" variant="ghost" onClick={handleDelete} className="h-9 w-9 text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : isRecording ? (
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-mono">{recDur}s / {MAX_SECONDS}s</span>
          </div>
          <Button size="sm" variant="outline" onClick={cancel}>Cancel</Button>
          <Button size="sm" onClick={handleStop} disabled={saving || isUploading} className="gap-1.5">
            {saving || isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Square className="h-3.5 w-3.5" />}
            Stop
          </Button>
        </div>
      ) : (
        <Button onClick={start} variant="outline" className="w-full gap-2">
          <Mic className="h-4 w-4" /> Record voice intro
        </Button>
      )}
      <p className="text-xs text-muted-foreground mt-2">
        Say hi, share what you love — voice profiles get 3× more matches.
      </p>
    </Card>
  );
};
