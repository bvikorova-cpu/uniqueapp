import { Link } from "react-router-dom";
import { Puzzle as PuzzleIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { KidsModuleCreditNote } from "@/components/kids/KidsModuleCreditNote";
import { KidsCollectibles } from "@/components/kids/academy/KidsCollectibles";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_KIDSACADEMY_STEPS = [
  { title: 'Open a card set', desc: 'Choose from 16 magical kids collectible themes.' },
  { title: 'Watch the hero video', desc: 'A short cinematic intro sets the mood.' },
  { title: 'Watch & earn', desc: 'Earn rewards while browsing.' },
  { title: 'Draw a card', desc: 'Spend 1 credit to reveal a random cartoon card.' },
  { title: 'Collect them all', desc: '2,400 cards across 16 sets — can you complete every album?' }
];
const __HIW_KIDSACADEMY = { title: 'Kids Collectibles', intro: 'Collectible cartoon cards for young explorers.', steps: __HIW_KIDSACADEMY_STEPS };

const KidsAcademy = () => {
  return (
    <div className="min-h-screen bg-background">
      <FloatingHowItWorks title={__HIW_KIDSACADEMY.title} intro={__HIW_KIDSACADEMY.intro} steps={__HIW_KIDSACADEMY.steps} />
      <Navbar />
      <main className="container mx-auto px-4 pb-10 pt-4 mt-16">
        <div className="max-w-6xl mx-auto space-y-6">
          <KidsCollectibles />
          <div className="grid gap-4 md:grid-cols-2 md:items-start">
            <KidsModuleCreditNote module="academy" />
            <Button asChild variant="outline" className="gap-2 w-full md:w-auto justify-center">
              <Link to="/kids-puzzles">
                <PuzzleIcon className="h-4 w-4" /> Kids Puzzles — collect pieces for 1 credit
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default KidsAcademy;
