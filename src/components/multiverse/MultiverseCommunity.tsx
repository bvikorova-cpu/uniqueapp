import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, MessageSquare, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface MultiverseCommunityProps {
  onBack: () => void;
}

const mockExplorers = [
  { name: "QuantumDrifter", universes: 12, bestScore: 94, specialty: "Career Paths" },
  { name: "ParallelPioneer", universes: 8, bestScore: 88, specialty: "Relationships" },
  { name: "RealityWeaver", universes: 15, bestScore: 91, specialty: "Adventure Lives" },
  { name: "DimensionHopper", universes: 6, bestScore: 79, specialty: "Creative Arts" },
  { name: "CosmicNavigator", universes: 20, bestScore: 97, specialty: "Technology" },
  { name: "TimelineShifter", universes: 10, bestScore: 85, specialty: "Business" },
];

const MultiverseCommunity = ({ onBack }: MultiverseCommunityProps) => {
  return (
    <>
      <FloatingHowItWorks
        title='Multiverse Community'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Multiverse Community panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub</Button>

      <Card className="border-violet-500/20 bg-gradient-to-br from-violet-950/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Users className="w-6 h-6 text-violet-400" />
            Multiverse Community
          </CardTitle>
          <CardDescription>Connect with other multiverse explorers and share discoveries</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        {mockExplorers.map((explorer, i) => (
          <Card key={i} className="border-border/40 hover:border-violet-500/40 transition-all">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">{explorer.name}</h3>
                <Badge variant="outline" className="text-xs"><Star className="w-3 h-3 mr-1" />{explorer.bestScore}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{explorer.universes} universes · {explorer.specialty}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs h-7" onClick={() => {
                  const followed = JSON.parse(localStorage.getItem("multiverse_followed") || "[]");
                  if (followed.includes(explorer.name)) { toast.info(`You are already following ${explorer.name}`); return; }
                  followed.push(explorer.name);
                  localStorage.setItem("multiverse_followed", JSON.stringify(followed));
                  toast.success(`You are following ${explorer.name}!`);
                }}>
                  <Users className="w-3 h-3 mr-1" /> Follow
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs h-7" onClick={() => { window.location.href = `/messenger?to=${encodeURIComponent(explorer.name)}`; }}>
                  <MessageSquare className="w-3 h-3 mr-1" /> Message
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </>
  );
};

export default MultiverseCommunity;
