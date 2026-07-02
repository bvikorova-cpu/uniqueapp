import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  autoPlay?: boolean;
}

export function VideoPlayer({ videoUrl, title, autoPlay = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && autoPlay) {
      videoRef.current.play().catch((error) => {
        console.error("Autoplay failed:", error);
      });
    }
  }, [autoPlay, videoUrl]);

  return (
    <>
      <FloatingHowItWorks title={"Video Player - How it works"} steps={[{ title: 'Open', desc: 'Access the Video Player section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Video Player.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="overflow-hidden">
      {title && (
        <div className="p-4 border-b">
          <h3 className="font-bold text-lg">{title}</h3>
        </div>
      )}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          playsInline
          src={videoUrl}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </Card>
    </>
  );
}
