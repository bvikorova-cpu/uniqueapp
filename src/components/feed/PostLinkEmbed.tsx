import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

interface LinkPreview {
  url: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  site_name: string | null;
}

const memoryCache = new Map<string, LinkPreview | null>();

interface PostLinkEmbedProps {
  content: string;
}

/**
 * Facebook-style link preview under a post: YouTube links play inline, any
 * other link renders a clickable card with image, title and description that
 * opens the original page in a new tab.
 */
export const PostLinkEmbed = ({ content }: PostLinkEmbedProps) => {
  const url = extractFirstUrl(content || "");
  const videoId = url ? getYouTubeId(url) : null;
  const [preview, setPreview] = useState<LinkPreview | null>(
    url && memoryCache.has(url) ? memoryCache.get(url)! : null,
  );

  useEffect(() => {
    if (!url || videoId) return;
    if (memoryCache.has(url)) {
      setPreview(memoryCache.get(url)!);
      return;
    }
    let alive = true;
    (async () => {
      const { data } = await supabase.functions.invoke("link-preview", { body: { url } });
      const result: LinkPreview | null = data && !data.error ? (data as LinkPreview) : null;
      memoryCache.set(url, result);
      if (alive) setPreview(result);
    })();
    return () => {
      alive = false;
    };
  }, [url, videoId]);

  if (!url) return null;

  if (videoId) {
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
  }

  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    host = url;
  }

  if (!preview) {
    return (
      <div className="mb-4" onClick={(e) => e.stopPropagation()}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline break-all"
        >
          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
          {url}
        </a>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="block mb-4 overflow-hidden rounded-xl border border-border bg-muted/30 transition-colors hover:bg-muted/60"
    >
      {preview.image_url && (
        <img
          src={preview.image_url}
          alt={preview.title || host}
          loading="lazy"
          className="w-full max-h-72 object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <div className="p-3 min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground truncate">
          {preview.site_name || host}
        </p>
        <p className="font-semibold text-sm leading-snug line-clamp-2 break-words">
          {preview.title || url}
        </p>
        {preview.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 break-words mt-1">
            {preview.description}
          </p>
        )}
      </div>
    </a>
  );
};

export default PostLinkEmbed;
