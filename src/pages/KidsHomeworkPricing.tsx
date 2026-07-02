import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useHomeworkCredits, HOMEWORK_CREDITS_PER_QUESTION } from "@/hooks/useHomeworkCredits";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_KIDSHOMEWORKPRICING_STEPS = [
  { title: 'Pick a pack', desc: 'Packs bundle credits at a lower per-use price.' },
  { title: 'Pay securely', desc: 'Stripe checkout — parent-approved via parental gate.' },
  { title: 'Credits appear instantly', desc: 'Credits are usable in Homework Helper right away.' }
];
const __HIW_KIDSHOMEWORKPRICING = { title: 'Homework Helper Pricing', intro: 'Choose a pack for Kids Homework Helper.', steps: __HIW_KIDSHOMEWORKPRICING_STEPS };


const PACKS = [
  { credits: 15, label: "Starter", description: "5 questions", popular: false },
  { credits: 30, label: "Explorer", description: "10 questions", popular: true },
  { credits: 75, label: "Scholar", description: "25 questions", popular: false },
  { credits: 150, label: "Genius", description: "50 questions", popular: false },
];

const KidsHomeworkPricing = () => {
  const navigate = useNavigate();
  const { credits_remaining, purchaseCredits } = useHomeworkCredits();
  const [loadingPack, setLoadingPack] = useState<number | null>(null);

  const handleBuy = async (credits: number) => {
    setLoadingPack(credits);
    try {
      const url = await purchaseCredits(credits);
      if (url) {
        { const __w = window.open(url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = url; }
      } else {
        toast.error("Could not start checkout. Please try again.");
      }
    } finally {
      setLoadingPack(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <FloatingHowItWorks title={__HIW_KIDSHOMEWORKPRICING.title} intro={__HIW_KIDSHOMEWORKPRICING.intro} steps={__HIW_KIDSHOMEWORKPRICING.steps} />
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Homework Helper Credits</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Buy credits and use them anytime. Each AI question costs{" "}
              <strong>{HOMEWORK_CREDITS_PER_QUESTION} credits</strong>. No subscription, no expiry.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Your balance: <strong>{credits_remaining} credits</strong>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PACKS.map((pack) => {
              const priceCents = Math.max(99, pack.credits * 50); // €0.50 / credit
              const priceEur = (priceCents / 100).toFixed(2);
              return (
                <Card
                  key={pack.credits}
                  className={`relative transition-all hover:shadow-lg ${
                    pack.popular ? "border-2 border-primary scale-105" : ""
                  }`}
                >
                  {pack.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl">{pack.label}</CardTitle>
                    <CardDescription>{pack.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div>
                      <p className="text-4xl font-black text-primary">€{priceEur}</p>
                      <p className="text-sm text-muted-foreground">{pack.credits} credits</p>
                    </div>
                    <ul className="space-y-1 text-sm text-left">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{Math.floor(pack.credits / HOMEWORK_CREDITS_PER_QUESTION)} AI questions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Step-by-step explanations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Never expire</span>
                      </li>
                    </ul>
                    <Button
                      onClick={() => handleBuy(pack.credits)}
                      disabled={loadingPack === pack.credits}
                      className="w-full"
                      variant={pack.popular ? "default" : "outline"}
                    >
                      {loadingPack === pack.credits ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Buy Now"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Button variant="ghost" onClick={() => navigate("/kids-homework")}>
              ← Back to Homework Helper
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default KidsHomeworkPricing;
