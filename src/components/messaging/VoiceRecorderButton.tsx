import { Button } from "@/components/ui/button";
import { Mic, Square, X } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useVoiceMessages } from "@/hooks/useVoiceMessages";
import { cn } from "@/lib/utils";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  receiverId: string;
  className?: string;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export const VoiceRecorderButton = ({ receiverId, className }: Props) => {
  const { isRecording, duration, start, stop, cancel } = useVoiceRecorder();
  const { sendVoice, isSending } = useVoiceMessages();

  const handleStop = async () => {
    const d = duration;
    const blob = await stop();
    if (blob && d > 0) await sendVoice({ receiverId, blob, duration: d });
  };

  if (!isRecording) {
    return (
    <>
      <FloatingHowItWorks title={"Voice Recorder Button - How it works"} steps={[{ title: 'Open', desc: 'Access the Voice Recorder Button section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Voice Recorder Button.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Button type="button" size="icon" variant="ghost" className={className} onClick={start} disabled={isSending}>
        <Mic className="h-4 w-4" />
      </Button>
    </>
  );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex h-2 w-2 rounded-full bg-destructive animate-pulse" />
      <span className="text-xs font-mono tabular-nums text-muted-foreground">{fmt(duration)}</span>
      <Button type="button" size="icon" variant="ghost" onClick={cancel}>
        <X className="h-4 w-4" />
      </Button>
      <Button type="button" size="icon" onClick={handleStop} disabled={isSending}>
        <Square className="h-4 w-4" />
      </Button>
    </div>
  );
};
