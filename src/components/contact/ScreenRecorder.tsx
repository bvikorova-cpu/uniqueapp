import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Square, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  onRecorded: (blob: Blob) => void;
  maxSeconds?: number;
}

export const ScreenRecorder = ({ onRecorded, maxSeconds = 30 }: Props) => {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const start = async () => {
    try {
      const stream = await (navigator.mediaDevices as MediaDevices & { getDisplayMedia: (c: MediaStreamConstraints) => Promise<MediaStream> }).getDisplayMedia({ video: true, audio: false });
      const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordedUrl(URL.createObjectURL(blob));
        onRecorded(blob);
        stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      };
      rec.start();
      mediaRef.current = rec;
      setRecording(true);
      setSeconds(0);
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= maxSeconds) {
            stop();
            return maxSeconds;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      toast({ title: "Screen recording cancelled or unavailable", variant: "destructive" });
    }
  };

  const stop = () => {
    mediaRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  };

  const reset = () => {
    setRecordedUrl(null);
    setSeconds(0);
    chunksRef.current = [];
    onRecorded(new Blob());
  };

  return (
    <>
      <FloatingHowItWorks title={"Screen Recorder - How it works"} steps={[{ title: 'Open', desc: 'Access the Screen Recorder section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Screen Recorder.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center gap-2">
      {!recording && !recordedUrl && (
        <Button type="button" size="sm" variant="outline" onClick={start}>
          <Monitor className="h-3.5 w-3.5 mr-1.5" /> Record screen
        </Button>
      )}
      {recording && (
        <Button type="button" size="sm" variant="destructive" onClick={stop}>
          <Square className="h-3.5 w-3.5 mr-1.5" /> Stop ({maxSeconds - seconds}s)
        </Button>
      )}
      {recordedUrl && (
        <>
          <video src={recordedUrl} controls className="h-12 max-w-[180px] rounded" />
          <Button type="button" size="icon" variant="ghost" onClick={reset}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
    </>
  );
};
