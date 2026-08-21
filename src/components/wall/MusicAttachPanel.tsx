import { useMemo, useState } from "react";
import { Music, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseMusicUrl, buildMusicEmbedUrl, type ParsedMusic } from "./PostMusicEmbed";

export interface MusicAttachment {
  url: string;
  startSeconds: number;
  endSeconds: number | null;
}

interface Props {
  value: MusicAttachment | null;
  onChange: (value: MusicAttachment | null) => void;
  /** Preview backdrop: first selected image/video of the post (object URL). */
  previewMediaUrl?: string | null;
  previewMediaType?: "image" | "video" | null;
}

const toSeconds = (raw: string): number => {
  const v = raw.trim();
  if (!v) return 0;
  if (v.includes(":")) {
    const [m, s] = v.split(":");
    return Math.max(0, (parseInt(m || "0", 10) || 0) * 60 + (parseInt(s || "0", 10) || 0));
  }
  return Math.max(0, parseInt(v, 10) || 0);
};

export const MusicAttachPanel = ({ value, onChange, previewMediaUrl, previewMediaType }: Props) => {
  const [url, setUrl] = useState(value?.url ?? "");
  const [start, setStart] = useState(value ? String(value.startSeconds) : "0");
  const [end, setEnd] = useState(value?.endSeconds ? String(value.endSeconds) : "");
  const [showPreview, setShowPreview] = useState(false);

  const parsed: ParsedMusic | null = useMemo(() => parseMusicUrl(url), [url]);
  const startSeconds = toSeconds(start);
  const endSecondsRaw = end.trim() ? toSeconds(end) : null;
  const endSeconds = endSecondsRaw && endSecondsRaw > startSeconds ? endSecondsRaw : null;

  const previewEmbed = parsed
    ? buildMusicEmbedUrl(parsed, { start: startSeconds, end: endSeconds, autoplay: true })
    : undefined;

  const apply = () => {
    if (!parsed) return;
    onChange({ url: parsed.url, startSeconds, endSeconds });
  };

  return (
    <div className="rounded-xl border border-border/60 bg-accent/10 p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Music className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Add music to this post</span>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto h-7 text-xs"
            onClick={() => {
              onChange(null);
              setUrl("");
              setShowPreview(false);
            }}
          >
            <X className="w-3 h-3 mr-1" /> Remove
          </Button>
        )}
      </div>

      <Input
        type="url"
        placeholder="Paste a link (YouTube, Spotify, Apple Music, SoundCloud)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="text-sm"
      />

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Start (sec or m:ss)</Label>
          <Input value={start} onChange={(e) => setStart(e.target.value)} placeholder="0" className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">End (optional)</Label>
          <Input value={end} onChange={(e) => setEnd(e.target.value)} placeholder="e.g. 0:30" className="h-8 text-sm" />
        </div>
      </div>

      {parsed && parsed.platform !== "youtube" && (
        <p className="text-[11px] text-muted-foreground">
          Exact start/end trimming works on YouTube links. Other platforms play the track from the beginning.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-8 text-xs"
          disabled={!parsed}
          onClick={() => setShowPreview((s) => !s)}
        >
          <Play className="w-3 h-3 mr-1" /> {showPreview ? "Hide preview" : "Preview"}
        </Button>
        <Button type="button" size="sm" className="h-8 text-xs" disabled={!parsed} onClick={apply}>
          {value ? "Update music" : "Attach music"}
        </Button>
      </div>

      {showPreview && previewEmbed && (
        <div className="space-y-2">
          <div className="relative rounded-xl overflow-hidden border border-border/60 bg-black">
            {previewMediaUrl ? (
              previewMediaType === "video" ? (
                <video src={previewMediaUrl} muted autoPlay loop playsInline className="w-full max-h-64 object-contain" />
              ) : (
                <img src={previewMediaUrl} alt="Music preview backdrop" className="w-full max-h-64 object-contain" />
              )
            ) : (
              <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">
                Add a photo or video to see the full preview
              </div>
            )}
            <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur">
              <Music className="w-3 h-3" />
              <span className="truncate">
                {parsed?.platform} · {startSeconds}s{endSeconds ? ` – ${endSeconds}s` : ""}
              </span>
            </div>
          </div>
          <iframe
            src={previewEmbed}
            title="Music preview"
            allow="autoplay; encrypted-media"
            className={`w-full border-0 rounded-lg ${parsed?.platform === "youtube" ? "h-[80px]" : "h-[152px]"}`}
          />
          <p className="text-[11px] text-muted-foreground">
            This is how the track will play alongside your media. Your video plays muted while the music runs.
          </p>
        </div>
      )}
    </div>
  );
};
