import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef } from "react";

interface GameDistributionWrapperProps {
  gameId: string;
  title: string;
  width?: number;
  height?: number;
  onBack: () => void;
}

export const GameDistributionWrapper = ({ 
  gameId, 
  title, 
  width = 800, 
  height = 600,
  onBack 
}: GameDistributionWrapperProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate aspect ratio
  const aspectRatio = (height / width) * 100;
  
  // GameDistribution embed URL
  const embedUrl = `https://embed.gamedistribution.com/?url=https://html5.gamedistribution.com/${gameId}/&width=${width}&height=${height}&language=sk&gdpr-tracking=1&gdpr-targeting=1&gd_sdk_referrer_url=${encodeURIComponent(window.location.href)}`;
  
  useEffect(() => {
    // Scroll to top when game loads
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Button 
          onClick={onBack} 
          variant="secondary"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to games
        </Button>
        
        <h1 className="text-2xl font-bold mb-6">{title}</h1>
        
        <div 
          ref={containerRef}
          className="w-full max-w-5xl mx-auto"
        >
          <div 
            className="relative overflow-hidden rounded-lg shadow-elegant bg-muted"
            style={{ paddingTop: `${aspectRatio}%` }}
          >
            <iframe
              src={embedUrl}
              className="absolute top-0 left-0 w-full h-full border-0"
              title={title}
              allowFullScreen
              allow="autoplay"
              scrolling="no"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
