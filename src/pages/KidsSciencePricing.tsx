import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, FlaskConical } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useScienceCredits, SCIENCE_CREDITS_PER_RUN } from "@/hooks/useScienceCredits";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_KIDSSCIENCEPRICING_STEPS = [
  { title: 'Pick a pack', desc: 'Packs bundle credits at a lower per-use price.' },
  { title: 'Pay securely', desc: 'Stripe checkout — parent-approved via parental gate.' },
  { title: 'Credits appear instantly', desc: 'Credits are usable in Science Lab right away.' }
];
const __HIW_KIDSSCIENCEPRICING = { title: 'Science Lab Pricing', intro: 'Choose a pack for Kids Science Lab.', steps: __HIW_KIDSSCIENCEPRICING_STEPS };


const PACKS = [
  { credits: 10, price: 5, label: "Starter", subtitle: `~${Math.floor(10 / SCIENCE_CREDITS_PER_RUN)} analyses` },
  { credits: 25, price: 12, label: "Explorer", subtitle: `~${Math.floor(25 / SCIENCE_CREDITS_PER_RUN)} analyses`, popular: true },
  { credits: 50, price: 22, label: "Researcher", subtitle: `~${Math.floor(50 / SCIENCE_CREDITS_PER_RUN)} analyses` },
  { credits: 100, price: 39, label: "Scientist", subtitle: `~${Math.floor(100 / SCIENCE_CREDITS_PER_RUN)} analyses` },
];

const KidsSciencePricing = () => {
  const navigate = useNavigate();
  const credits = useScienceCredits();
  const [busy, setBusy] = useState<number | null>(null);

  const buy = async (amount: number) => {
    setBusy(amount);
    try {
      const url = await credits.purchaseCredits(amount);
      if (url) {
        { const __w = window.open(url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = url; }
      } else {
        toast.error("Could not start checkout. Try again.");
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <FloatingHowItWorks title={__HIW_KIDSSCIENCEPRICING.title} intro={__HIW_KIDSSCIENCEPRICING.intro} steps={__HIW_KIDSSCIENCEPRICING.steps} />
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Science Credit Packs
            </h1>
            <p className="text-muted-foreground text-lg">
              Pay only for what you use. Each AI experiment analysis costs{" "}
              <strong>{SCIENCE_CREDITS_PER_RUN}</strong> credits.
            </p>
            {!credits.loading && (
              <p className="mt-3 text-sm text-emerald-600 font-medium">
                You currently have {credits.credits_remaining} credits.
              </p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PACKS.map((pack) => (
              <Card
                key={pack.credits}
                className={`relative ${pack.popular ? "border-2 border-emerald-500 shadow-lg" : ""}`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-emerald-500" />
                    {pack.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-3xl font-black">€{pack.price}</div>
                    <p className="text-sm text-muted-foreground">
                      {pack.credits} credits · {pack.subtitle}
                    </p>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                    onClick={() => buy(pack.credits)}
                    disabled={busy !== null}
                  >
                    {busy === pack.credits ? (
                      "Opening checkout…"
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Buy {pack.credits} credits
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button variant="ghost" onClick={() => navigate("/kids-science-lab")}>
              ← Back to Science Lab
            </Button>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  How credits work
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Credits never expire. Use them whenever your child wants to analyze a new
                experiment. Each AI analysis deducts {SCIENCE_CREDITS_PER_RUN} credits.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Safe & age-appropriate
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Explanations are tailored for ages 6–12 with clear language and analogies.
                Real experiments should always be done with adult supervision.
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default KidsSciencePricing;
