import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Maximize2, Minimize2, Loader2 } from "lucide-react";

interface PokiGameWrapperProps {
  slug: string;
  title: string;
  onBack?: () => void;
}

export const PokiGameWrapper = ({ slug, title, onBack }: PokiGameWrapperProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Poki SDK if available
    if (window.PokiSDK) {
      window.PokiSDK.init().then(() => {
        console.log("Poki SDK initialized");
        setLoading(false);
      }).catch((error: any) => {
        console.error("Poki SDK initialization failed:", error);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return () => {
      // Cleanup on unmount
      if (window.PokiSDK) {
        window.PokiSDK.destroyAd?.();
      }
    };
  }, []);

  const toggleFullscreen = () => {
    const iframe = document.getElementById("poki-game-iframe");
    if (!iframe) return;

    if (!isFullscreen) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const gameUrl = `https://poki.com/en/g/${slug}`;

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <Card className="overflow-hidden glassmorphism">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="hover:bg-primary/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div>
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-sm text-muted-foreground">Powered by Poki</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="hover:bg-primary/10"
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Game Container */}
          <div className="relative bg-black" style={{ paddingTop: "56.25%" }}>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading game...</p>
                </div>
              </div>
            )}
            <iframe
              id="poki-game-iframe"
              src={gameUrl}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              scrolling="no"
              allowFullScreen
              allow="gamepad; autoplay; fullscreen"
              onLoad={() => setLoading(false)}
            />
          </div>

          {/* Footer Info */}
          <div className="p-4 bg-card/50 backdrop-blur-xl border-t">
            <p className="text-sm text-muted-foreground text-center">
              Use arrow keys, WASD or touch controls to play. Press ESC to exit fullscreen.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Extend window interface for Poki SDK
declare global {
  interface Window {
    PokiSDK?: {
      init: () => Promise<void>;
      destroyAd?: () => void;
      gameLoadingStart?: () => void;
      gameLoadingFinished?: () => void;
      commercialBreak?: () => Promise<void>;
      rewardedBreak?: () => Promise<boolean>;
    };
  }
}
