import { Helmet } from "react-helmet-async";
import TikTokFeed from "@/components/feed/TikTokFeed";
import VideoUploadDialog from "@/components/wall/VideoUploadDialog";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function WallVideos() {
  const qc = useQueryClient();
  return (
    <>
      <Helmet>
        <title>Videos — Unique</title>
        <meta name="description" content="TikTok-style vertikálny video feed od kreatorov Unique." />
      </Helmet>
      <TikTokFeed
        topOverlay={
          <div className="flex items-center gap-6 text-white text-base font-semibold drop-shadow-lg">
            <Link to="/wall" className="absolute left-4 top-3"><ArrowLeft className="w-6 h-6" /></Link>
            <span className="opacity-60">Sleduješ</span>
            <span className="relative">
              Pre teba
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white" />
            </span>
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
