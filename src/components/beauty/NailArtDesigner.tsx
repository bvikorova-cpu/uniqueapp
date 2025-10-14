import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const NailArtDesigner = () => {
  const navigate = useNavigate();

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-pink-500" />
        Nail Art Designer
      </h2>
      <p className="text-muted-foreground mb-6">
        Design nails with different colors, patterns and decorations
      </p>

      <div className="text-center py-8">
        <p className="mb-4">Interactive nail art designer game</p>
        <Button onClick={() => navigate("/games")}>
          Go to Nail Salon Game
        </Button>
      </div>
    </Card>
  );
};
