import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Gamepad2, PawPrint, Trophy } from "lucide-react";
import SEO from "@/components/SEO";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function PetsHub() {
  return (
    <>
      <FloatingHowItWorks title="How Pets Hub works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <SEO
        title="Pets Hub – AI Translator & Virtual Pet | Unique"
        description="Choose your pet experience: decode your real pet's voice with AI, or raise a virtual companion."
      />
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex w-16 h-16 rounded-full bg-primary/15 items-center justify-center mb-4">
            <PawPrint className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-3">Pets Hub</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Two worlds for pet lovers — pick your adventure. Active in both? Unlock the
            <Trophy className="w-4 h-4 inline mx-1 text-amber-400" /> <strong>Pet Lover</strong> achievement.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <Card className="p-6 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent hover:border-primary transition-all">
            <Sparkles className="w-10 h-10 text-primary mb-3" />
            <h2 className="text-2xl font-bold mb-2">AI Pet Translator</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Decode barks, meows and body language. AI emotion + health insights, training tips,
              breed ID, video analysis and more for your real pet.
            </p>
            <Link to="/pet-translator"><Button className="w-full">Open Translator</Button></Link>
          </Card>

          <Card className="p-6 border-accent/30 bg-gradient-to-br from-accent/10 to-transparent hover:border-accent transition-all">
            <Gamepad2 className="w-10 h-10 text-accent mb-3" />
            <h2 className="text-2xl font-bold mb-2">Virtual Pet</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Adopt, feed, train, battle and breed a digital companion. Mini-games, customization,
              trading and AI-powered coaching.
            </p>
            <Link to="/virtual-pet"><Button variant="secondary" className="w-full">Open Virtual Pet</Button></Link>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link to="/pets/achievements">
            <Button variant="outline" size="lg">
              <Trophy className="w-4 h-4 mr-2 text-amber-400" />
              My Achievements & Activity
            </Button>
          </Link>
        </div>
      </div>
    </div>
    </>
    );
}
