import { Badge } from "@/components/ui/badge";
import { Music, Instagram, ShieldCheck, Volume2, Video } from "lucide-react";
import type { Prompt } from "./PromptsEditor";
import type { VideoPrompt } from "./VideoPromptRecorder";

interface Props {
  prompts?: Prompt[] | null;
  voiceUrl?: string | null;
  voiceDuration?: number | null;
  spotifyUrl?: string | null;
  instagramUrl?: string | null;
  verified?: boolean;
  videoPrompts?: VideoPrompt[] | null;
}

/**
 * Renders Hinge-style prompts, voice intro player, and social embeds
 * on a viewable dating profile card (used on swipe view / match preview).
 */
export const ProfileExtrasDisplay = ({
  prompts,
  voiceUrl,
  voiceDuration,
  spotifyUrl,
  instagramUrl,
  verified,
  videoPrompts,
}: Props) => {
  const hasAnything =
    (prompts && prompts.length) || voiceUrl || spotifyUrl || instagramUrl || verified || (videoPrompts && videoPrompts.length);
  if (!hasAnything) return null;

  return (
    <div className="px-5 py-3 space-y-3 border-b border-border/50">
      {verified && (
        <Badge className="bg-emerald-500 text-white gap-1 w-fit">
          <ShieldCheck className="h-3 w-3" /> Verified
        </Badge>
      )}

      {voiceUrl && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Volume2 className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">Voice intro {voiceDuration ? `· ${voiceDuration}s` : ""}</span>
          </div>
          <audio src={voiceUrl} controls className="w-full h-9" />
        </div>
      )}

      {prompts?.map((p, i) => (
        <div key={i} className="rounded-lg bg-muted/40 p-3">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{p.q}</p>
          <p className="text-sm font-medium mt-1">{p.a}</p>
        </div>
      ))}

      {(spotifyUrl || instagramUrl) && (
        <div className="flex gap-2 flex-wrap">
          {spotifyUrl && (
            <a
              href={spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
            >
              <Music className="h-3.5 w-3.5" /> Spotify
            </a>
          )}
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 px-3 py-1.5 text-xs font-medium hover:bg-pink-500/20 transition-colors"
            >
              <Instagram className="h-3.5 w-3.5" /> Instagram
            </a>
          )}
        </div>
      )}
    </div>
  );
};
