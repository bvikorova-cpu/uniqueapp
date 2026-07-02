import { Heart, Lock, Shield, Users, MessageCircle, Sparkles, Eye, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface AccessPaymentGateProps {
  onPayAccess: () => void;
  loading: boolean;
}

export function AccessPaymentGate({ onPayAccess, loading }: AccessPaymentGateProps) {
  const steps = [
    { icon: Shield, title: "Create Anonymous Profile", desc: "Set up your hidden identity with interests and traits", gradient: "from-pink-500 to-rose-500" },
    { icon: Users, title: "Find Your Match", desc: "Algorithm pairs you based on compatibility (5 credits)", gradient: "from-primary to-accent" },
    { icon: MessageCircle, title: "Chat Anonymously (7 Days)", desc: "Text (1 cr) or voice messages (3 cr) to connect", gradient: "from-amber-500 to-orange-500" },
    { icon: Eye, title: "Identity Reveal", desc: "Free after 7 days, or 15 credits for early reveal", gradient: "from-emerald-500 to-teal-500" },
  ];

  const included = [
    "Full platform access",
    "Anonymous profile creation",
    "Interest-based matching",
    "Secure messaging system",
    "7-day mystery period",
    "Match history & archive",
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <FloatingHowItWorks
        title={"Access Payment Gate"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="max-w-3xl w-full space-y-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-500 text-xs font-medium">
            <Heart className="h-3 w-3" />
            Anonymous Date
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-foreground via-pink-500 to-accent bg-clip-text text-transparent">
            Welcome to Anonymous Date
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            A unique anonymous dating experience for users aged 16 and over (16+).
            Connect based on personality, not appearance.
          </p>
        </motion.div>

        {/* Subscription Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="overflow-hidden bg-card/80 backdrop-blur-xl border-border/50">
            <div className="h-1.5 bg-gradient-to-r from-pink-500 to-accent" />
            <div className="p-6 sm:p-8 text-center space-y-4">
              <div className="p-3 rounded-xl bg-pink-500/10 inline-flex">
                <Lock className="h-8 w-8 text-pink-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black">Monthly Subscription</h2>
                <div className="text-4xl font-black text-pink-500 mt-2">€1<span className="text-base font-medium text-muted-foreground">/month</span></div>
              </div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Safe, quality environment with verified users. Cancel anytime.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-left max-w-md mx-auto">
                {included.map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-pink-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <Button
                onClick={onPayAccess}
                disabled={loading}
                size="lg"
                className="w-full max-w-md"
              >
                {loading ? "Processing..." : "Subscribe for €1/month & Start Dating"}
              </Button>
              <p className="text-[10px] text-muted-foreground">
                Secure payment via Stripe. By subscribing, you confirm you are 16+.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* How It Works */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <Card className="overflow-hidden bg-card/80 backdrop-blur-xl border-border/50 h-full">
                <div className={`h-1 bg-gradient-to-r ${step.gradient}`} />
                <div className="p-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-pink-500/10 flex-shrink-0">
                    <step.icon className="h-4 w-4 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Step {i + 1}: {step.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Premium Features */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-pink-500" />
              Premium Features
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: "💡", label: "Hints", cost: "5 cr", desc: "Clues about match" },
                { icon: "🎁", label: "Gifts", cost: "10 cr", desc: "Show affection" },
                { icon: "🎤", label: "Voice", cost: "3 cr", desc: "Personal touch" },
                { icon: "👀", label: "Early Reveal", cost: "15 cr", desc: "Can't wait?" },
              ].map((f) => (
                <div key={f.label} className="text-center p-3 rounded-xl bg-muted/20 border border-border/30">
                  <span className="text-xl">{f.icon}</span>
                  <p className="text-xs font-medium mt-1">{f.label}</p>
                  <Badge variant="secondary" className="text-[10px] mt-1">{f.cost}</Badge>
                  <p className="text-[10px] text-muted-foreground mt-1">{f.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
