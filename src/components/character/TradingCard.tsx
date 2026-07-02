import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface TradingCardProps {
  characterName: string;
  imageUrl: string;
  hairColor: string;
  eyeColor: string;
  superpower: string;
  costumeColor: string;
  ageGroup: string;
  personality: string;
  gender: string;
  story?: string;
}

export const TradingCard = ({
  characterName,
  imageUrl,
  hairColor,
  eyeColor,
  superpower,
  costumeColor,
  ageGroup,
  personality,
  gender,
  story
}: TradingCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const downloadCard = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false
      });

      const link = document.createElement('a');
      link.download = `${characterName}-trading-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({
        title: "Card Downloaded! 🎉",
        description: "Your trading card has been saved!"
      });
    } catch (error) {
      console.error('Error generating card:', error);
      toast({
        title: "Download Failed",
        description: "Could not download the card",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Trading Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Trading Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Trading Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <div 
        ref={cardRef}
        className="w-full max-w-md mx-auto bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 rounded-3xl p-6 shadow-2xl border-4 border-yellow-400"
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-white mb-1 text-shadow-lg">
            {characterName}
          </h2>
          <p className="text-yellow-300 text-sm font-semibold uppercase tracking-wide">
            {gender} • {ageGroup}
          </p>
        </div>

        {/* Character Image */}
        <div className="rounded-2xl overflow-hidden border-4 border-yellow-400 mb-4 shadow-xl">
          <img 
            src={imageUrl} 
            alt={characterName} 
            className="w-full h-auto"
          />
        </div>

        {/* Attributes Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 border border-white/30">
            <p className="text-xs text-yellow-200 font-semibold">Hair</p>
            <p className="text-white text-sm font-bold capitalize">{hairColor}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 border border-white/30">
            <p className="text-xs text-yellow-200 font-semibold">Eyes</p>
            <p className="text-white text-sm font-bold capitalize">{eyeColor}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 border border-white/30">
            <p className="text-xs text-yellow-200 font-semibold">Power</p>
            <p className="text-white text-sm font-bold capitalize">{superpower}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 border border-white/30">
            <p className="text-xs text-yellow-200 font-semibold">Style</p>
            <p className="text-white text-sm font-bold capitalize">{costumeColor}</p>
          </div>
        </div>

        {/* Personality Badge */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full px-4 py-2 mb-4 text-center">
          <p className="text-purple-900 font-bold text-sm uppercase tracking-wide">
            {personality} Hero
          </p>
        </div>

        {/* Story Section */}
        {story && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <p className="text-xs text-yellow-200 font-semibold mb-1">Origin Story</p>
            <p className="text-white text-xs leading-relaxed line-clamp-6">
              {story}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-yellow-300 text-xs font-bold">⭐ LEGENDARY HERO CARD ⭐</p>
        </div>
      </div>

      {/* Download Button */}
      <div className="text-center">
        <Button
          onClick={downloadCard}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold px-8 py-6 text-lg shadow-xl"
        >
          <Download className="mr-2 h-5 w-5" />
          Download Trading Card
        </Button>
      </div>
    </div>
    </>
  );
};
