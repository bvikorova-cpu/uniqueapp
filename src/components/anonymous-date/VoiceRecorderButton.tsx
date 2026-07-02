import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props {
  userId: string | null;
  onUploaded: (url: string) => void;
  /** Hard cap in seconds. Default 60. */
  maxDuration?: number;
}

export const VoiceRecorderButton = ({ userId, onUploaded, maxDuration = 60 }: Props) => {
  const { isRecording, isUploading, duration, start, stopAndUpload, cancel } =
    useVoiceRecorder(userId, maxDuration);

  const handleStop = async () => {
    const url = await stopAndUpload();
    if (url) onUploaded(url);
  };

  if (isUploading) {
    return (
      <Button size="icon" disabled variant="ghost" className="rounded-full">
      <FloatingHowItWorks
        title={"Voice Recorder Button"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  const remaining = Math.max(0, maxDuration - duration);
  const nearCap = isRecording && remaining <= 10;

  return (
    <div className="flex items-center gap-1">
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, x: 10, width: 0 }}
            animate={{ opacity: 1, x: 0, width: "auto" }}
            exit={{ opacity: 0, x: 10, width: 0 }}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border overflow-hidden ${
              nearCap ? "bg-red-500/25 border-red-500/60" : "bg-red-500/15 border-red-500/40"
            }`}
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-xs font-mono">
              {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}
              <span className="opacity-60"> / {Math.floor(maxDuration / 60)}:{String(maxDuration % 60).padStart(2, "0")}</span>
            </span>
            <button onClick={cancel} className="text-muted-foreground hover:text-red-500" aria-label="Cancel recording">
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        type="button"
        size="icon"
        variant={isRecording ? "destructive" : "ghost"}
        onClick={isRecording ? handleStop : start}
        className="rounded-full"
        aria-label={isRecording ? "Stop recording" : "Start voice message"}
      >
        {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
    </div>
  );
};
