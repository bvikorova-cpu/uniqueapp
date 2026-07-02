import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useKidsReadingCredits, KIDS_READING_CREDIT_COST } from "@/hooks/useKidsReadingCredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_KIDSREADINGPRICING_STEPS = [
  { title: 'Pick a pack', desc: 'Packs bundle credits at a lower per-use price.' },
  { title: 'Pay securely', desc: 'Stripe checkout — parent-approved via parental gate.' },
  { title: 'Credits appear instantly', desc: 'Credits are usable in Reading Companion right away.' }
];
const __HIW_KIDSREADINGPRICING = { title: 'Reading Companion Pricing', intro: 'Choose a pack for Kids Reading Companion.', steps: __HIW_KIDSREADINGPRICING_STEPS };


const PACKS = [
  { credits: 10, price: "€4.99", label: "Starter", description: "5 reading sessions" },
  { credits: 30, price: "€12.99", label: "Reader", description: "15 reading sessions", popular: true },
  { credits: 80, price: "€29.99", label: "Bookworm", description: "40 reading sessions" },
];

const KidsReadingPricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, purchase } = useKidsReadingCredits();

  const handleBuy = async (credits: number) => {
    if (!user) {
      toast.error("Please sign in first");
      navigate("/auth");
      return;
    }
    const url = await purchase(credits);
    if (url) { const __w = window.open(url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = url; }
  };

  return (
    <div className="min-h-screen bg-background">
      <FloatingHowItWorks title={__HIW_KIDSREADINGPRICING.title} intro={__HIW_KIDSREADINGPRICING.intro} steps={__HIW_KIDSREADINGPRICING.steps} />
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Reading Companion Credits
            </h1>
            <p className="text-muted-foreground text-lg">
              Pay only for what you use • {KIDS_READING_CREDIT_COST} credits per AI reading analysis
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Current balance: <span className="font-bold text-primary">{balance} credits</span>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {PACKS.map((pack) => (
              <Card key={pack.credits} className={`relative ${pack.popular ? "border-primary shadow-lg scale-105" : ""}`}>
                {pack.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Crown className="h-4 w-4" /> Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{pack.label}</CardTitle>
                  <CardDescription>{pack.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{pack.price}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{pack.credits} credits</p>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => handleBuy(pack.credits)} className="w-full" variant={pack.popular ? "default" : "outline"}>
                    Buy {pack.credits} Credits
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-br from-primary/5 to-accent/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> What credits unlock
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-1" /><span className="text-sm">AI reading comprehension analysis</span></div>
              <div className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-1" /><span className="text-sm">Personalized quizzes from any book</span></div>
              <div className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-1" /><span className="text-sm">Vocabulary building and explanations</span></div>
              <div className="flex items-start gap-2"><Sparkles className="h-4 w-4 text-primary mt-1" /><span className="text-sm">Progress tracking — included free</span></div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default KidsReadingPricing;
