import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CharacterInventory } from "@/components/character/CharacterInventory";

const CharacterInventoryPage = () => {
  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="container mx-auto max-w-7xl pt-20 pb-28 md:pb-8">
        <Button asChild variant="ghost" className="mb-4 gap-2 text-muted-foreground hover:text-foreground">
          <Link to="/character-arena">
            <ArrowLeft className="h-4 w-4" /> Character Arena
          </Link>
        </Button>
        <CharacterInventory />
      </div>
    </div>
  );
};

export default CharacterInventoryPage;
