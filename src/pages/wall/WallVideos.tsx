import { useState } from "react";
import { Helmet } from "react-helmet-async";
import TikTokFeed, { FeedFilter } from "@/components/feed/TikTokFeed";
import VideoUploadDialog from "@/components/wall/VideoUploadDialog";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function WallVideos() {
  const qc = useQueryClient();
  const [mode, setMode] = useState<FeedFilter>("videos");

  const tabClass = (active: boolean) =>
    `relative text-white text-base font-semibold drop-shadow-lg cursor-pointer select-none transition-opacity ${active ? "opacity-100" : "opacity-60"}`;

  return (
    <>
      <Helmet>
        <title>Videos — Unique</title>
        <meta name="description" content="TikTok-style vertikálny video feed od kreatorov Unique." />
      </Helmet>
      <TikTokFeed
        filter={mode}
        topOverlay={
          <div className="flex items-center gap-6">
            <Link to="/wall" className="absolute left-4 top-3 text-white drop-shadow-lg"><ArrowLeft className="w-6 h-6" /></Link>
            <button onClick={() => setMode("videos")} className={tabClass(mode === "videos")}>
              Videos
              {mode === "videos" && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white" />
              )}
            </button>
            <button onClick={() => setMode("stories")} className={tabClass(mode === "stories")}>
              Stories
              {mode === "stories" && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white" />
              )}
            </button>
          </div>
        }
        fabOverlay={
          <div className="[&_button]:bg-pink-500 [&_button]:hover:bg-pink-600 [&_button]:text-white [&_button]:rounded-full [&_button]:shadow-2xl">
            <VideoUploadDialog onUploadSuccess={() => qc.invalidateQueries({ queryKey: ["tiktok-feed"] })} />
          </div>
        }
      />
    </>
  );
}
