import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Y8GameWrapperProps {
  slug: string;
  title: string;
  onBack: () => void;
}

export const Y8GameWrapper = ({ slug, title, onBack }: Y8GameWrapperProps) => {
  // Y8 embed URL format
  const embedUrl = `https://storage.y8.com/y8-studio/html5/fabboxstudios/${slug}/?key=y8&value=default`;
  
  return (
    <div className="fixed inset-0 bg-background">
      <div className="absolute top-4 left-4 z-50">
        <Button onClick={onBack} variant="secondary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to games
        </Button>
      </div>
      <iframe
        src={embedUrl}
        className="w-full h-full border-0"
        title={title}
        allowFullScreen
        allow="autoplay"
      />
    </div>
  );
};