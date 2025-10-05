import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface FashionDesignerGameProps {
  onBack: () => void;
}

export const FashionDesignerGame = ({ onBack }: FashionDesignerGameProps) => {
  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Späť na hry
          </Button>
          <h1 className="text-2xl font-bold">Fashion Designer Gala</h1>
        </div>

        <div className="w-full" style={{ height: 'calc(100vh - 200px)' }}>
          <iframe
            src="https://www.superhry.cz/hra/16693-fashion-designer-gala"
            className="w-full h-full rounded-lg border-2 border-border"
            title="Fashion Designer Gala"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};