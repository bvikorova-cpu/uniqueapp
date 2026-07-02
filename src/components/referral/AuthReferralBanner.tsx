import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Gift, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface ReferrerInfo {
  found: boolean;
  full_name?: string;
  avatar_url?: string | null;
}

export function AuthReferralBanner() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("ref");
  const [info, setInfo] = useState<ReferrerInfo | null>(null);

  useEffect(() => {
    if (!code) return;
    // Fire-and-forget click tracking
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      fetch(`https://${projectId}.supabase.co/functions/v1/track-referral-click?code=${encodeURIComponent(code)}`, {
        method: "POST",
        headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      }).catch(() => {});
    } catch { /* ignore */ }
    (async () => {
      try {
        const { data } = await supabase.functions.invoke("get-referrer-info", {
          method: "GET" as any,
          // @ts-expect-error querystring is not part of typed invoke options
          query: { code },
        });
        // Fallback: invoke doesn't support query — fetch directly via URL
        if (!data) throw new Error("retry");
        setInfo(data as ReferrerInfo);
      } catch {
        try {
          const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
          const url = `https://${projectId}.supabase.co/functions/v1/get-referrer-info?code=${encodeURIComponent(code)}`;
          const res = await fetch(url, {
            headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          });
          if (res.ok) setInfo(await res.json());
        } catch {
          /* silent */
        }
      }
    })();
  }, [code]);

  if (!code || !info?.found) return null;

  const initial = info.full_name?.charAt(0)?.toUpperCase() || "?";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-2xl border-2 border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-transparent p-4 backdrop-blur-md"
    >
      <FloatingHowItWorks
        title={"Auth Referral Banner"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border-2 border-yellow-500/50">
          {info.avatar_url && <AvatarImage src={info.avatar_url} alt={info.full_name} />}
          <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-amber-600 text-black font-bold">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-yellow-500" /> You were invited by
          </p>
          <p className="font-bold truncate">{info.full_name}</p>
        </div>
        <div className="text-right shrink-0">
          <Gift className="h-6 w-6 text-yellow-500 mx-auto" />
          <p className="text-xs font-bold text-yellow-500 mt-1">€10,000<br />prize</p>
        </div>
      </div>
    </motion.div>
  );
}
