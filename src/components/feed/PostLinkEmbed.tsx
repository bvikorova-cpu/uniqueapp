import { ExternalLink } from "lucide-react";

const URL_RE = /(https?:\/\/[^\s]+)/gi;

/** Returns the first URL found in post text, or null. */
export const extractFirstUrl = (content: string): string | null => {
  const matches = content.match(URL_RE);
  return matches && matches.length > 0 ? matches[0].replace(/[),.]+$/, "") : null;
};

/** Extracts a YouTube video id from any common YouTube URL shape. */
export const getYouTubeId = (url: string): string | null => {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (!/(^|\.)youtube(-nocookie)?\.com$/.test(host)) return null;
    if (u.pathname === "/watch") return u.searchParams.get("v");
    const m = u.pathname.match(/^\/(embed|shorts|live)\/([^/?]+)/);
    return m ? m[2] : null;
  } catch {
    return null;
  }
};

interface PostLinkEmbedProps {
  content: string;
}

/**
 * Facebook-style link preview under a post: shows the clickable link and,
 * when it is a YouTube URL, an inline playable video below it.
 */
export const PostLinkEmbed = ({ content }: PostLinkEmbedProps) => {
  const url = extractFirstUrl(content || "");
  if (!url) return null;
  const videoId = getYouTubeId(url);
  if (!videoId) return null;

  return (
    <div className="mb-4" onClick={(e) => e.stopPropagation()}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline break-all mb-2"
      >
        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
        {url}
      </a>
      <div className="relative w-full overflow-hidden rounded-xl border border-border bg-black aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          title="YouTube video"
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
};

export default PostLinkEmbed;
