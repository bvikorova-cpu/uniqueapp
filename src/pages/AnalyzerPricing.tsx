import { Check, Sparkles, Zap, Crown, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAnalyzerCredits } from "@/hooks/useAnalyzerCredits";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const PRICING_TIERS = [
  { id: 'basic', name: 'Basic', price: '€4.99', period: '/month', icon: Sparkles, gradient: 'from-cyan-600 to-blue-600', popular: false,
    features: ['10 analyses per month', 'Detailed analysis', 'Unlimited text extraction', 'Translation support', 'Shopping links', '30-day history', 'PDF export', 'No watermark'] },
  { id: 'pro', name: 'Pro', price: '€9.99', period: '/month', icon: Zap, gradient: 'from-blue-600 to-indigo-600', popular: true,
    features: ['50 analyses per month', 'Everything in Basic +', 'AI chat follow-up', 'Batch upload', 'API access', 'Priority processing', 'Compare mode', 'Custom reports', '1-year history'] },
  { id: 'expert', name: 'Expert', price: '€19.99', period: '/month', icon: Crown, gradient: 'from-indigo-600 to-purple-600', popular: false,
    features: ['Unlimited analyses', 'Everything in Pro +', 'Expert AI model', 'White-label reports', 'Team collaboration', 'Custom AI training', 'Priority support', 'Commercial use'] },
];

const CREDIT_PACKS = [
  { credits: 20, price: '€8', perAnalysis: '€0.40' },
  { credits: 50, price: '€18', perAnalysis: '€0.36', popular: true },
  { credits: 100, price: '€30', perAnalysis: '€0.30' },
];

export default function AnalyzerPricing() {
  const navigate = useNavigate();
  const { credits } = useAnalyzerCredits();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <FloatingHowItWorks
        title="Analyzer Pricing"
        intro="Buy credit packs for AI analyses."
        steps={[
          { title: "Pick a pack", desc: "Bigger packs = better price per credit." },
          { title: "Pay in EUR", desc: "Secure Stripe checkout." },
          { title: "Credits added instantly", desc: "Balance updates in seconds." },
          { title: "Spend on any tool", desc: "Credits work across all AI tools." },
          { title: "Free monthly top-up", desc: "+10 credits on the 1st of every month." }
        ]}
      />
      <div className="max-w-7xl mx-auto space-y-12">
        <Button variant="ghost" onClick={() => navigate('/analyzer')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Analyzer
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Pricing Plans</Badge>
          <h1 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock the full power of AI-powered image analysis
          </p>
          {credits && (
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20">
              <span className="text-sm text-muted-foreground">Current tier:</span>
              <Badge className="capitalize bg-cyan-500/20 text-cyan-400">{credits.tier}</Badge>
              <span className="text-sm text-muted-foreground">• {credits.credits_remaining} credits</span>
            </div>
          )}
        </motion.div>

        <div>
          <h2 className="text-2xl font-black mb-6 text-center">Monthly Subscriptions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier, i) => {
              const Icon = tier.icon;
              return (
                <motion.div key={tier.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className={`relative p-6 border-cyan-500/20 hover:border-cyan-400/40 transition-all ${tier.popular ? 'border-cyan-400 shadow-lg shadow-cyan-500/20 scale-105' : ''}`}>
                    {tier.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500">Most Popular</Badge>}
                    <div className="space-y-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-black">{tier.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black">{tier.price}</span>
                        <span className="text-muted-foreground">{tier.period}</span>
                      </div>
                      <ul className="space-y-3 min-h-[250px]">
                        {tier.features.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className={`w-full ${tier.popular ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'border-cyan-500/20'}`}
                        variant={tier.popular ? 'default' : 'outline'}
                        onClick={async () => {
                          try {
                            const { data, error } = await supabase.functions.invoke('create-analyzer-subscription', { body: { tier: tier.id } });
                            if (error) throw error;
                            if (data?.url) { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = data.url; } }
                          } catch (error: any) { toast.error(`Error: ${error.message}`); }
                        }}>
                        Upgrade Now
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-black mb-6 text-center">Pay-Per-Use Credit Packs</h2>
          <p className="text-center text-muted-foreground mb-8">Perfect for occasional use</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {CREDIT_PACKS.map((pack, i) => (
              <motion.div key={pack.credits} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className={`p-6 text-center border-cyan-500/20 hover:border-cyan-400/40 transition-all relative ${pack.popular ? 'border-cyan-400 shadow-lg shadow-cyan-500/20' : ''}`}>
                  {pack.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500">Best Value</Badge>}
                  <div className="space-y-4">
                    <div className="text-5xl font-black text-cyan-400">{pack.credits}</div>
                    <div className="text-sm text-muted-foreground">Credits</div>
                    <div className="text-3xl font-black">{pack.price}</div>
                    <div className="text-sm text-muted-foreground">{pack.perAnalysis} per analysis</div>
                    <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
                      onClick={async () => {
                        try {
                          const { data, error } = await supabase.functions.invoke('create-analyzer-credits-payment', { body: { credits: pack.credits } });
                          if (error) throw error;
                          if (data?.url) { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = data.url; } }
                        } catch (error: any) { toast.error(`Error: ${error.message}`); }
                      }}>
                      Buy Credits
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center space-y-4 py-12">
          <h2 className="text-3xl font-black">Ready to get started?</h2>
          <p className="text-muted-foreground">Unlock the power of AI vision analysis</p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-600" onClick={() => navigate('/analyzer')}>Start Analyzing</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
