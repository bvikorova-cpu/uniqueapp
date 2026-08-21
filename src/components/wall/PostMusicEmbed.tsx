import { Music, ExternalLink } from "lucide-react";

export interface ParsedMusic {
  url: string;
  platform: "spotify" | "apple" | "youtube" | "soundcloud";
}

const URL_RE = /(https?:\/\/[^\s]+)/gi;

const isMusicUrl = (url: string) =>
  /(open\.spotify\.com|music\.apple\.com|youtube\.com\/watch|youtu\.be\/|soundcloud\.com)/i.test(url);

const detect = (url: string): ParsedMusic["platform"] => {
  if (/spotify/i.test(url)) return "spotify";
  if (/music\.apple/i.test(url)) return "apple";
  if (/soundcloud/i.test(url)) return "soundcloud";
  return "youtube";
};

/** Returns parsed music info for a supported music URL, otherwise null. */
export const parseMusicUrl = (url?: string | null): ParsedMusic | null => {
  const clean = (url ?? "").trim();
  if (!clean || !isMusicUrl(clean)) return null;
  return { url: clean, platform: detect(clean) };
};

export const buildMusicEmbedUrl = (
  music: ParsedMusic,
  opts: { start?: number; end?: number | null; autoplay?: boolean } = {},
): string | undefined => {
  const { start = 0, end = null, autoplay = false } = opts;
  try {
    const u = new URL(music.url);
    if (music.platform === "youtube") {
      const id = u.hostname.includes("youtu.be") ? u.pathname.slice(1) : u.searchParams.get("v");
      if (!id) return undefined;
      const p = new URLSearchParams();
      if (start > 0) p.set("start", String(start));
      if (end && end > start) p.set("end", String(end));
      if (autoplay) p.set("autoplay", "1");
      p.set("rel", "0");
      return `https://www.youtube.com/embed/${id}?${p.toString()}`;
    }
    if (music.platform === "spotify") {
      return `https://open.spotify.com/embed${u.pathname}`;
    }
    if (music.platform === "apple") {
      return `https://embed.music.apple.com${u.pathname}`;
    }
    if (music.platform === "soundcloud") {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(music.url)}&color=%23a855f7${
        autoplay ? "&auto_play=true" : ""
      }`;
    }
  } catch {
    return undefined;
  }
  return undefined;
};

/** Extracts the first music link from post text and returns the cleaned text. */
export const extractMusic = (content: string): { text: string; music: ParsedMusic | null } => {
  const matches = content.match(URL_RE) ?? [];
  const found = matches.find((m) => isMusicUrl(m));
  if (!found) return { text: content, music: null };
  const text = content
    .replace(found, "")
    .replace(/🎵\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { text, music: { url: found, platform: detect(found) } };
};

interface PostMusicEmbedProps {
  music: ParsedMusic;
  startSeconds?: number;
  endSeconds?: number | null;
  /** Compact bar shown under post media. */
  compact?: boolean;
}

export const PostMusicEmbed = ({ music, startSeconds = 0, endSeconds = null, compact = false }: PostMusicEmbedProps) => {
  const embedUrl = buildMusicEmbedUrl(music, { start: startSeconds, end: endSeconds });
  const isYouTube = music.platform === "youtube";

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mb-4 rounded-2xl overflow-hidden border border-border/60 bg-accent/10"
    >
      {embedUrl ? (
        <>
          <iframe
            src={embedUrl}
            title="Music player"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className={`w-full border-0 ${
              isYouTube ? (compact ? "h-[80px]" : "aspect-video") : "h-[152px]"
            }`}
          />
          {(startSeconds > 0 || endSeconds) && (
            <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] text-muted-foreground">
              <Music className="w-3 h-3 text-primary" />
              Plays {startSeconds}s{endSeconds ? ` – ${endSeconds}s` : " onwards"}
            </div>
          )}
        </>
      ) : (
        <a
          href={music.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 text-sm hover:bg-accent/20 transition-colors"
        >
          <Music className="w-5 h-5 text-primary" />
          <span className="flex-1 truncate">{music.url}</span>
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </a>
      )}
    </div>
  );
};
