import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { videoFrame } from "@/lib/videoFrameStyles";

interface Props {
  slug?: string | null;
  children: ReactNode;
  className?: string;
}

/** Wraps a video (or preview box) with the purchased decorative frame. */
export default function VideoFrame({ slug, children, className }: Props) {
  const frame = videoFrame(slug);
  const active = frame.slug !== "vframe_none";

  if (!active) return <div className={className}>{children}</div>;

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-2xl",
        frame.wrapper,
        frame.decor,
        className,
      )}
    >
      <div className={cn("relative z-10 overflow-hidden", frame.inner)}>{children}</div>
    </div>
  );
}
