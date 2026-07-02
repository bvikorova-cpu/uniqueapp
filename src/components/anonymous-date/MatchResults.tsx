import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnonymousAvatar } from "./AnonymousAvatar";
import { Heart, MapPin, Languages, Target, Sparkles, Loader2, ArrowLeft, RefreshCw, Lock } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export interface MatchCandidate {
  user_id: string;
  anonymous_name: string;
  age_range: string | null;
  location: string | null;
  interests: string[];
  personality_traits: string[];
  compatibility: number;
  breakdown: {
    shared_interests: string[];
    shared_languages: string[];
    shared_traits: string[];
    same_goal: boolean;
    same_location: boolean;
  };
}

interface Props {
  candidates: MatchCandidate[];
  loading: boolean;
  matching: boolean;
  matchingUserId: string | null;
  credits: number;
  cost: number;
  onBack: () => void;
  onRefresh: () => void;
  onSelect: (userId: string) => void;
}

function scoreColor(score: number) {
  if (score >= 80) return "from-emerald-500 to-teal-500";
  if (score >= 60) return "from-pink-500 to-rose-500";
  if (score >= 40) return "from-primary to-pink-500";
  return "from-violet-500 to-primary";
}

function scoreLabel(score: number) {
  if (score >= 80) return "Exceptional";
  if (score >= 60) return "Strong";
  if (score >= 40) return "Good";
  if (score >= 20) return "Light";
  return "Weak";
}

export function MatchResults({
  candidates,
  loading,
  matching,
  matchingUserId,
  credits,
  cost,
  onBack,
  onRefresh,
  onSelect,
}: Props) {
  const insufficient = credits < cost;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 max-w-4xl mx-auto"
    >
      <FloatingHowItWorks
        title={"Match Results"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-pink-500 via-primary to-accent bg-clip-text text-transparent">
            Top Compatible Matches
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Ranked by interests, languages, traits, goal & location alignment. Pick one to start chatting.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Filters
          </Button>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      <Card className="p-3 bg-card/60 backdrop-blur-sm border border-border/50 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-muted-foreground">
            Cost per match: <strong className="text-foreground">{cost} credits</strong>
          </span>
        </div>
        <Badge variant={insufficient ? "destructive" : "secondary"} className="text-[10px]">
          {credits} credits available
        </Badge>
      </Card>

      {loading ? (
        <Card className="p-16 text-center bg-card/60 border border-border/40">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-3">Scoring candidates…</p>
        </Card>
      ) : candidates.length === 0 ? (
        <Card className="p-16 text-center bg-card/60 border border-border/40">
          <Heart className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-bold mb-1">No candidates right now</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try relaxing your filters — switch gender to "Any", remove location, or lower minimum shared interests.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map((c, i) => {
            const isMatching = matching && matchingUserId === c.user_id;
            const disabled = matching || insufficient;
            return (
              <motion.div
                key={c.user_id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden bg-card/80 backdrop-blur-xl border border-border/50 group hover:border-primary/40 transition-all">
                  <div className={`h-1 bg-gradient-to-r ${scoreColor(c.compatibility)}`} />
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <AnonymousAvatar seed={c.anonymous_name} size={48} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-base leading-tight truncate">{c.anonymous_name}</h3>
                          {i === 0 && (
                            <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30 text-[9px]">
                              TOP PICK
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {c.age_range ?? "—"}
                          {c.location && (
                            <>
                              {" · "}
                              <span className="inline-flex items-center gap-0.5">
                                <MapPin className="h-2.5 w-2.5" /> {c.location}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                          Compatibility
                        </span>
                        <span
                          className={`text-sm font-black bg-gradient-to-r ${scoreColor(c.compatibility)} bg-clip-text text-transparent`}
                        >
                          {c.compatibility}% · {scoreLabel(c.compatibility)}
                        </span>
                      </div>
                      <Progress value={c.compatibility} className="h-1.5" />
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="p-1.5 rounded-lg bg-muted/30 border border-border/30">
                        <Heart className="h-3 w-3 mx-auto text-pink-500 mb-0.5" />
                        <p className="text-[9px] text-muted-foreground">Interests</p>
                        <p className="text-xs font-bold">{c.breakdown.shared_interests.length}</p>
                      </div>
                      <div className="p-1.5 rounded-lg bg-muted/30 border border-border/30">
                        <Languages className="h-3 w-3 mx-auto text-cyan-500 mb-0.5" />
                        <p className="text-[9px] text-muted-foreground">Languages</p>
                        <p className="text-xs font-bold">{c.breakdown.shared_languages.length}</p>
                      </div>
                      <div className="p-1.5 rounded-lg bg-muted/30 border border-border/30">
                        <Target className="h-3 w-3 mx-auto text-amber-500 mb-0.5" />
                        <p className="text-[9px] text-muted-foreground">Traits</p>
                        <p className="text-xs font-bold">{c.breakdown.shared_traits.length}</p>
                      </div>
                    </div>

                    {c.breakdown.shared_interests.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {c.breakdown.shared_interests.slice(0, 5).map((i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20"
                          >
                            {i}
                          </span>
                        ))}
                        {c.breakdown.shared_interests.length > 5 && (
                          <span className="text-[10px] text-muted-foreground self-center">
                            +{c.breakdown.shared_interests.length - 5}
                          </span>
                        )}
                      </div>
                    )}

                    {(c.breakdown.same_goal || c.breakdown.same_location) && (
                      <div className="flex flex-wrap gap-1 pt-1 border-t border-border/30">
                        {c.breakdown.same_goal && (
                          <Badge variant="secondary" className="text-[9px]">
                            <Target className="h-2.5 w-2.5 mr-1" /> Same goal
                          </Badge>
                        )}
                        {c.breakdown.same_location && (
                          <Badge variant="secondary" className="text-[9px]">
                            <MapPin className="h-2.5 w-2.5 mr-1" /> Local
                          </Badge>
                        )}
                      </div>
                    )}

                    <Button
                      onClick={() => onSelect(c.user_id)}
                      disabled={disabled}
                      size="sm"
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-90 text-white font-bold"
                    >
                      {isMatching ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Matching…
                        </>
                      ) : insufficient ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" /> Need {cost} credits
                        </>
                      ) : (
                        <>
                          <Heart className="h-4 w-4 mr-2" /> Open chat ({cost} cr)
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
