import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Play } from "lucide-react";

interface Segment { path: string; seconds?: number }

/**
 * Plays a chained AI clip: Veo renders max 8s per call, so longer clips are
 * stored as ordered parts and played back-to-back as one video.
 */
export const AIVideoClipPlayer = ({ segments }: { segments: Segment[] }) => {
  const [urls, setUrls] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const signed = await Promise.all(
        segments.map(async (s) => {
          const { data } = await supabase.storage
            .from("ai-video-creator")
            .createSignedUrl(s.path, 60 * 60 * 6);
          return data?.signedUrl ?? "";
        }),
      );
      if (!alive) return;
      setUrls(signed.filter(Boolean));
      setIndex(0);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [segments]);

  const handleEnded = () => {
    if (index < urls.length - 1) {
      setIndex((i) => i + 1);
      requestAnimationFrame(() => videoRef.current?.play().catch(() => {}));
    }
  };

  if (loading) {
    return (
      <div className="flex aspect-[9/16] max-h-[520px] w-full items-center justify-center rounded-2xl border border-border bg-muted/40">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!urls.length) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-border bg-muted/40 text-sm text-muted-foreground">
        Video is not available.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <video
        ref={videoRef}
        key={urls[index]}
        src={urls[index]}
        controls
        playsInline
        autoPlay={index > 0}
        onEnded={handleEnded}
        className="max-h-[520px] w-full rounded-2xl border border-border bg-black/90 object-contain"
      />
      <div className="flex flex-wrap items-center gap-2">
        {urls.length > 1 && (
          <span className="text-xs font-semibold text-muted-foreground">
            Part {index + 1} / {urls.length} — plays automatically as one clip
          </span>
        )}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => { setIndex(0); requestAnimationFrame(() => videoRef.current?.play().catch(() => {})); }}
        >
          <Play className="mr-1 h-3.5 w-3.5" /> Play from start
        </Button>
        {urls.map((u, i) => (
          <Button key={u} size="sm" variant="outline" asChild>
            <a href={u} download={`unique-ai-video-part-${i + 1}.mp4`} target="_blank" rel="noreferrer">
              <Download className="mr-1 h-3.5 w-3.5" /> {urls.length > 1 ? `Part ${i + 1}` : "Download MP4"}
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
};
