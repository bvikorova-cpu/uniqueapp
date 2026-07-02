import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ExternalLink } from "lucide-react";
import { useAntiqueCredits } from "@/hooks/useAntiqueCredits";
import {
  AlertDialog, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const packages = [
  { credits: 10, price: 5, label: null },
  { credits: 25, price: 10, label: "POPULAR" },
  { credits: 60, price: 20, label: null },
  { credits: 150, price: 40, label: "BEST VALUE" },
];

export const AntiqueCreditsShop = () => {
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);
  const { credits, purchaseCredits } = useAntiqueCredits();

  return (
    <>
      <FloatingHowItWorks title="How Antique Credits Shop works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <>
      <AlertDialog open={!!stripeUrl} onOpenChange={() => setStripeUrl(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Payment Ready
            </AlertDialogTitle>
            <AlertDialogDescription>Click the button below to complete your payment via Stripe:</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2">
            <Button onClick={() => { if (stripeUrl) window.open(stripeUrl, '_blank'); }} className="w-full gap-2">
              <ExternalLink className="h-4 w-4" /> Open Stripe Payment
            </Button>
            <Button variant="outline" onClick={() => setStripeUrl(null)} className="w-full">Cancel</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Buy Credits</CardTitle>
          <CardDescription>Current balance: <span className="font-bold text-primary">{credits?.credits_remaining || 0}</span> credits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {packages.map((pkg, i) => (
              <motion.div key={pkg.credits} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring" }}>
                <div className={`border rounded-lg p-4 text-center ${pkg.label === 'POPULAR' ? 'border-2 border-primary' : ''}`}>
                  {pkg.label && (
                    <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full inline-block mb-2">{pkg.label}</div>
                  )}
                  <p className="text-2xl font-black mb-2">{pkg.credits} credits</p>
                  <p className="text-3xl font-bold text-primary mb-4">€{pkg.price}</p>
                  <Button variant={pkg.label === 'POPULAR' ? 'default' : 'outline'} className="w-full" onClick={async () => {
                    const url = await purchaseCredits(pkg.credits);
                    if (url) setStripeUrl(url);
                  }}>Buy Now</Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
    </>
    );
};
