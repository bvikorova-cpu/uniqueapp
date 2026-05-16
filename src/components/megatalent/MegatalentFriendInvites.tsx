import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserPlus, Copy, Check, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function MegatalentFriendInvites({ userId }: { userId: string | null }) {
  const [copied, setCopied] = useState(false);
  if (!userId) return null;

  const code = userId.slice(0, 8).toUpperCase();
  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${code}`;
  const invited = parseInt(localStorage.getItem(`mt_invited_${userId}`) || "0", 10);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const share = async () => {
    const text = `Join me on Unique and discover amazing talents! Use my code: ${code}`;
    try {
      if (navigator.share) await navigator.share({ text, url: link, title: "Join Unique" });
      else await copy();
    } catch {}
  };

  const milestones = [
    { n: 1, reward: "+100 XP" },
    { n: 5, reward: "Boost x1" },
    { n: 10, reward: "Premium 1d" },
    { n: 25, reward: "Premium 7d" },
  ];

  return (
    <Card className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="h-5 w-5 text-emerald-500" />
          Invite Friends
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {invited} invited
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Earn rewards when friends join and upload their first talent.
        </p>
        <div className="flex gap-2">
          <Input value={link} readOnly className="text-xs font-mono" />
          <Button size="icon" variant="outline" onClick={copy}>
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button size="icon" onClick={share}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/30">
          {milestones.map((m) => (
            <Badge
              key={m.n}
              variant={invited >= m.n ? "default" : "outline"}
              className="text-[10px]"
            >
              {m.n} friend{m.n > 1 ? "s" : ""}: {m.reward}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
