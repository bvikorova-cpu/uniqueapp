import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ReferralCardProps {
  userId?: string;
}

/**
 * Refer-a-friend program: both sides get 1 month free Premium.
 * Uses a deterministic short code derived from the userId.
 */
export const ReferralCard = ({ userId }: ReferralCardProps) => {
  const [copied, setCopied] = useState(false);

  const code = userId ? `UNIQ-${userId.slice(0, 6).toUpperCase()}` : "UNIQ-FRIEND";
  const link = `${typeof window !== "undefined" ? window.location.origin : "https://uniqueapp.fun"}/auth?ref=${code}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on Unique",
          text: "Get 1 month of Premium free with my code!",
          url: link,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Referral Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Referral Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Referral Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-20 max-w-3xl mx-auto"
    >
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 p-8 sm:p-10">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-center">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 mx-auto sm:mx-0">
            <Gift className="h-10 w-10 text-emerald-400" />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-black mb-1">Give 1 month, Get 1 month</h3>
            <p className="text-sm text-muted-foreground">
              Share your code. When a friend subscribes, you both get <strong>1 month of Premium FREE</strong>.
            </p>
          </div>
        </div>

        <div className="relative mt-6 flex flex-col sm:flex-row gap-2">
          <Input
            value={link}
            readOnly
            className="flex-1 font-mono text-sm bg-background/60"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button onClick={handleCopy} variant="outline" className="gap-2">
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button onClick={handleShare} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        <div className="relative mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-muted-foreground">
          <span>Your code: <strong className="text-emerald-400 font-mono">{code}</strong></span>
          <span>•</span>
          <span>Unlimited referrals</span>
          <span>•</span>
          <span>Auto-applied at checkout</span>
        </div>
      </div>
    </motion.div>
    </>
  );
};
