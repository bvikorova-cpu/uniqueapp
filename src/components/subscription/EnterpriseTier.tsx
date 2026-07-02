import { motion } from "framer-motion";
import { Building2, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
    <>
      <FloatingHowItWorks title={"Enterprise Tier - How it works"} steps={[{ title: 'Open', desc: 'Access the Enterprise Tier section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Enterprise Tier.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-10 max-w-6xl mx-auto"
    >
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/40 p-8 sm:p-10">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-amber-500/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/25 border border-amber-400/50 mb-4">
              <Sparkles className="h-3 w-3 text-amber-300" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">For organizations</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/40 to-orange-500/30">
                <Building2 className="h-7 w-7 text-amber-300" />
              </div>
              <div>
                <h3 className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg">Enterprise</h3>
                <p className="text-sm text-zinc-300">Tailored for teams of 50+</p>
              </div>
            </div>
            <div className="mt-4 mb-6">
              <span className="text-4xl font-black bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent drop-shadow">
                Custom pricing
              </span>
              <p className="text-sm text-zinc-300 mt-1">
                Built around your scale, security, and compliance needs.
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleContact}
              className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-400/90 hover:to-orange-500/90 text-black font-bold shadow-lg shadow-amber-500/40"
            >
              Talk to Sales →
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm text-zinc-100">
                <div className="mt-0.5 p-0.5 rounded-full bg-amber-500/30 flex-shrink-0">
                  <Check className="h-3.5 w-3.5 text-amber-300" strokeWidth={3} />
                </div>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
};
