import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Clock, Eye, Heart, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface ActiveMatchesProps {
  matches: any[];
  onOpenChat: (matchId: string) => void;
  onFindMatch?: () => void;
}

export function ActiveMatches({ matches, onOpenChat, onFindMatch }: ActiveMatchesProps) {
  if (matches.length === 0) {
    return (
      <Card className="p-10 sm:p-14 text-center bg-anon-date-gradient-soft border-anon-date relative overflow-hidden">
      <FloatingHowItWorks
        title={"Active Matches"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, -8, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-anon-date-gradient shadow-2xl mb-4"
        >
          <Heart className="h-8 w-8 text-white" />
        </motion.div>
        <h3 className="font-black text-xl mb-2">No matches yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-5">
          Your anonymous love story is one match away. Tap below to find someone who shares your vibe.
        </p>
        {onFindMatch && (
          <Button onClick={onFindMatch} className="bg-anon-date-gradient text-white hover:opacity-90">
            <Sparkles className="h-4 w-4 mr-2" /> Find your match
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-pink-500 to-accent bg-clip-text text-transparent">
        Your Matches
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((match, i) => {
          const partner = match.partner_profile;
          const expiresAt = match.expires_at ? new Date(match.expires_at).getTime() : null;
          const daysLeft = expiresAt
            ? Math.max(0, Math.ceil((expiresAt - Date.now()) / (1000 * 60 * 60 * 24)))
            : 0;

          return (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="overflow-hidden bg-card/80 backdrop-blur-xl border-border/50 group">
                <div className={`h-1 bg-gradient-to-r ${match.status === "revealed" ? "from-emerald-500 to-teal-500" : "from-pink-500 to-rose-500"}`} />
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold">{partner?.anonymous_name ?? "Anonymous Match"}</h3>
                      <p className="text-xs text-muted-foreground">{partner?.age_range ?? "—"}</p>
                    </div>
                    {match.status === "revealed" ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                        <Eye className="h-3 w-3 mr-1" /> Revealed
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        <Clock className="h-3 w-3 mr-1" /> {daysLeft}d left
                      </Badge>
                    )}
                  </div>

                  {partner?.interests && partner.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {partner.interests.slice(0, 4).map((interest: string) => (
                        <span key={interest} className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20">
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                    {match.status === "revealed" && match.revealed_at
                      ? <span>Revealed {formatDistanceToNow(new Date(match.revealed_at))} ago</span>
                      : <span>{daysLeft} days until reveal</span>
                    }
                  </div>

                  <Button onClick={() => onOpenChat(match.id)} className="w-full" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Open Chat
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
