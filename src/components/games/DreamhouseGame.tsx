import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface DreamhouseGameProps {
  onBack: () => void;
}

export const DreamhouseGame = ({ onBack }: DreamhouseGameProps) => {
  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Späť na hry
          </Button>
          <h1 className="text-2xl font-bold">Barbie Dreamhouse Adventures</h1>
        </div>

        <div className="w-full" style={{ height: 'calc(100vh - 200px)' }}>
          <iframe
            src="https://www.friv2online.com/sk/barbie-dreamhouse-adventures"
            className="w-full h-full rounded-lg border-2 border-border"
            title="Barbie Dreamhouse Adventures"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};