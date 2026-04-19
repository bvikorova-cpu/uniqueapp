import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

interface Props {
  userId: string | null;
  onUploaded: (url: string) => void;
}

export const VoiceRecorderButton = ({ userId, onUploaded }: Props) => {
  const { isRecording, isUploading, duration, start, stopAndUpload, cancel } = useVoiceRecorder(userId);

  const handleStop = async () => {
    const url = await stopAndUpload();
    if (url) onUploaded(url);
  };

  if (isUploading) {
    return (
      <Button size="icon" disabled variant="ghost" className="rounded-full">
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, x: 10, width: 0 }}
            animate={{ opacity: 1, x: 0, width: "auto" }}
            exit={{ opacity: 0, x: 10, width: 0 }}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/40 overflow-hidden"
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-xs font-mono">{Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}</span>
            <button onClick={cancel} className="text-muted-foreground hover:text-red-500">
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
      >
        {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
    </div>
  );
};
