import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BarbieGameProps {
  onBack: () => void;
}

export const BarbieGame = ({ onBack }: BarbieGameProps) => {
  return (
    <div className="fixed inset-0 bg-background">
      <div className="absolute top-4 left-4 z-50">
        <Button onClick={onBack} variant="secondary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Späť na hry
        </Button>
      </div>
      <iframe
        src="https://storage.y8.com/y8-studio/html5/fabboxstudios/barbee_summer_nails/?key=y8&value=default"
        className="w-full h-full border-0"
        title="Barbie Summer Nails"
        allowFullScreen
        allow="autoplay"
      />
    </div>
  );
};