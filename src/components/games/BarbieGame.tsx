import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { NailSalonGame } from "./NailSalonGame";

interface BarbieGameProps {
  onBack: () => void;
}

export const BarbieGame = ({ onBack }: BarbieGameProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-20 left-4 z-50">
        <Button onClick={onBack} variant="secondary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Späť na hry
        </Button>
      </div>
      <NailSalonGame />
    </div>
  );
};