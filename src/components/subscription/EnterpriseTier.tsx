import { motion } from "framer-motion";
import { Building2, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnterpriseTierProps {
  onContact?: () => void;
}

/**
 * High-anchor "Enterprise" tier shown below the main plans grid.
 * Anchoring effect: makes Premium/Business feel like a steal.
 */
export const EnterpriseTier = ({ onContact }: EnterpriseTierProps) => {
  const features = [
    "Custom AI model training",
    "White-label branding",
    "SLA 99.99% uptime",
    "Dedicated infrastructure",
    "Priority engineering support",
    "Custom integrations & API limits",
    "On-premise deployment option",
    "Quarterly business reviews",
  ];

  const handleContact = () => {
    if (onContact) onContact();
    else window.location.href = "mailto:enterprise@uniqueapp.fun?subject=Enterprise%20Plan%20Inquiry";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-10 max-w-6xl mx-auto"
    >
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-slate-900/80 via-slate-800/60 to-amber-900/30 p-8 sm:p-10">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">For organizations</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/20">
                <Building2 className="h-7 w-7 text-amber-400" />
              </div>
              <div>
                <h3 className="text-3xl sm:text-4xl font-black">Enterprise</h3>
                <p className="text-sm text-muted-foreground">Tailored for teams of 50+</p>
              </div>
            </div>
            <div className="mt-4 mb-6">
              <span className="text-4xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Custom pricing
              </span>
              <p className="text-sm text-muted-foreground mt-1">
                Built around your scale, security, and compliance needs.
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleContact}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-500/90 hover:to-orange-500/90 text-black font-bold shadow-lg shadow-amber-500/30"
            >
              Talk to Sales →
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm">
                <div className="mt-0.5 p-0.5 rounded-full bg-amber-500/20 flex-shrink-0">
                  <Check className="h-3.5 w-3.5 text-amber-400" strokeWidth={3} />
                </div>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
