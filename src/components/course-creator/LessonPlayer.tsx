import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, X, ExternalLink } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface LessonPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  videoUrl: string;
  description?: string;
}

export function LessonPlayer({
  isOpen,
  onClose,
  lessonTitle,
  videoUrl,
  description,
}: LessonPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string>("");
  const [videoType, setVideoType] = useState<"youtube" | "vimeo" | "direct">("direct");

  useEffect(() => {
    if (videoUrl) {
      processVideoUrl(videoUrl);
    }
  }, [videoUrl]);

  const processVideoUrl = (url: string) => {
    // YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let videoId = "";
      
      if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1].split("?")[0];
      } else if (url.includes("watch?v=")) {
        videoId = url.split("watch?v=")[1].split("&")[0];
      } else if (url.includes("embed/")) {
        videoId = url.split("embed/")[1].split("?")[0];
      }

      if (videoId) {
        setEmbedUrl(`https://www.youtube.com/embed/${videoId}`);
        setVideoType("youtube");
        return;
      }
    }

    // Vimeo
    if (url.includes("vimeo.com")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      if (videoId) {
        setEmbedUrl(`https://player.vimeo.com/video/${videoId}`);
        setVideoType("vimeo");
        return;
      }
    }

    // Direct video link
    setEmbedUrl(url);
    setVideoType("direct");
  };

  return (
    <>
      <FloatingHowItWorks title="How Lesson Player works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{lessonTitle}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Player */}
          {embedUrl && (
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              {videoType === "direct" ? (
                <video
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  controls
                  controlsList="nodownload"
                >
                  <source src={embedUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src={embedUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={lessonTitle}
                />
              )}
            </div>
          )}

          {!embedUrl && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Play className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Unable to load video player
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.open(videoUrl, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Video in New Tab
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {description && (
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">About this lesson</h4>
                <p className="text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
    );
}
