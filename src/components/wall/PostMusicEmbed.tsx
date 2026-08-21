import { Music, ExternalLink } from "lucide-react";

export interface ParsedMusic {
  url: string;
  platform: "spotify" | "apple" | "youtube" | "soundcloud";
  embedUrl?: string;
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

const buildEmbed = (url: string, platform: ParsedMusic["platform"]): string | undefined => {
  try {
    const u = new URL(url);
    if (platform === "youtube") {
      const id = u.hostname.includes("youtu.be")
        ? u.pathname.slice(1)
        : u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : undefined;
    }
    if (platform === "spotify") {
      return `https://open.spotify.com/embed${u.pathname}`;
    }
    if (platform === "apple") {
      return `https://embed.music.apple.com${u.pathname}`;
    }
    if (platform === "soundcloud") {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23a855f7`;
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
  const platform = detect(found);
  const text = content
    .replace(found, "")
    .replace(/🎵\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { text, music: { url: found, platform, embedUrl: buildEmbed(found, platform) } };
};

export const PostMusicEmbed = ({ music }: { music: ParsedMusic }) => {
  const isVideo = music.platform === "youtube";
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mb-4 rounded-2xl overflow-hidden border border-border/60 bg-accent/10"
    >
      {music.embedUrl ? (
        <iframe
          src={music.embedUrl}
          title="Music player"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className={`w-full border-0 ${isVideo ? "aspect-video" : "h-[152px]"}`}
        />
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
