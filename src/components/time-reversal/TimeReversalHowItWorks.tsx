import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, TrendingDown, Share, Users, Swords, Film, BookOpen, CreditCard, Brain } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function TimeReversalHowItWorks({ onBack }: Props) {
  return (
    <>
      <FloatingHowItWorks title={"Time Reversal How It Works - How it works"} steps={[{ title: 'Open', desc: 'Access the Time Reversal How It Works section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Time Reversal How It Works.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">How It Works</h2>
          <p className="text-sm text-muted-foreground">Complete guide to Time Reversal Social</p>
        </div>
      </div>

      {/* What Is It */}
      <Card className="border-purple-500/30 bg-gradient-to-br from-purple-950/30 to-background">
        <CardContent className="pt-6">
          <h3 className="text-xl font-black text-purple-400 mb-4">What is Time Reversal Social?</h3>
          <p className="text-sm leading-relaxed text-muted-foreground mb-4">
            Time Reversal Social is a revolutionary social platform where you experience life in reverse. Instead of aging forward, you start as an 80-year-old version of yourself and get younger every day through AI-powered age transformation. Your followers watch your unique journey backwards through time.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            It's a creative, entertaining way to share your life story and connect with others through the lens of reverse chronology. Upload photos, create posts from any "age," and battle other users with your transformations.
          </p>
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: Upload, title: "1. Upload Your Photo", desc: "Start by uploading a current photo. Our AI transforms it into your 80-year-old self to begin the reverse journey." },
          { icon: TrendingDown, title: "2. Daily Age Transformation", desc: "Every day, AI automatically makes you younger. Watch wrinkles disappear as you travel back through time." },
          { icon: Share, title: "3. Share Posts from Any Age", desc: "Create content from different points in your reverse timeline. Post memories and thoughts as if you're living that age." },
          { icon: Users, title: "4. Build Your Following", desc: "Connect with others who appreciate your unique journey. Follow other users and watch their reverse transformations." },
          { icon: Swords, title: "5. Battle Other Users", desc: "Enter the Age Battle Arena to compare transformations. Vote on the most impressive reverse-aging results." },
          { icon: Film, title: "6. Create Time-Lapses", desc: "Generate stunning reverse-aging timelapse videos from your photos to share with friends." },
          { icon: BookOpen, title: "7. Generate Your Story", desc: "Let AI write your complete reverse biography — from wise elder back to innocent child." },
          { icon: CreditCard, title: "8. Unlock Premium Features", desc: "Speed up aging reversal, lock at your perfect age, preview future selves, or create time paradox posts." },
        ].map((step, i) => (
          <Card key={i} className="border-border/40 hover:border-purple-500/30 transition-all">
            <CardContent className="pt-4 flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <step.icon className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">{step.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tips */}
      <Card className="border-amber-500/30">
        <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-amber-400" /> Tips for an Amazing Experience</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            {[
              "Upload a high-quality, well-lit face photo for the best AI transformations",
              "Post consistently to build your following — daily updates perform best",
              "Use the Time-Lapse Creator to make shareable content for other social media",
              "Enter Battle Arena regularly — top performers get featured on the homepage",
              "Set your aging speed to 2x or higher for more dramatic daily changes",
              "Generate your Reverse Life Story and share chapters with your followers",
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold text-xs mt-0.5">💡</span>
                <span className="text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
