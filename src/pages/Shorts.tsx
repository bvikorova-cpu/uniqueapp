import { Helmet } from "react-helmet-async";
import TikTokFeed from "@/components/feed/TikTokFeed";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Shorts() {
  return (
    <>
      <Helmet>
        <title>Shorts — Unique</title>
        <meta name="description" content="Krátke vertikálne videá od kreatorov na Unique." />
      </Helmet>
      <TikTokFeed
        topOverlay={
          <div className="flex items-center gap-6 text-white text-base font-semibold drop-shadow-lg">
            <Link to="/" className="absolute left-4 top-3"><ArrowLeft className="w-6 h-6" /></Link>
            <span className="opacity-60">Following</span>
            <span className="relative">
              For You
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white" />
            </span>
          </div>
        }
      />
    </>
  );
}
