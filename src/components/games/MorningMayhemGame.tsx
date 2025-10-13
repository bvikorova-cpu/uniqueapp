import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface MorningMayhemGameProps {
  onBack: () => void;
}

export const MorningMayhemGame = ({ onBack }: MorningMayhemGameProps) => {
  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to games
          </Button>
          <h1 className="text-2xl font-bold">Morning Mayhem</h1>
        </div>

        <div className="w-full" style={{ height: 'calc(100vh - 200px)' }}>
          <iframe
            src="https://games.gombis.com/morning-mayhem"
            className="w-full h-full rounded-lg border-2 border-border"
            title="Morning Mayhem"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};