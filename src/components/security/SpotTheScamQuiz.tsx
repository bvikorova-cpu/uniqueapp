import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Store,
  Briefcase,
  TrendingUp,
  MessageSquareWarning,
  Award,
  RotateCcw,
  MessageCircle,
} from "lucide-react";

/**
 * SpotTheScamQuiz — fully isolated mini-game for the Scam Protection section.
 * Unique "sts-" prefixed classes; no shared component sources are modified.
 */

type StsAnswer = "safe" | "scam";

interface StsScenario {
  id: string;
  category: string;
  categoryIcon: typeof Store;
  sender: string;
  senderBadge: string;
  message: string;
  correct: StsAnswer;
  explanation: string;
}

const STS_SCENARIOS: StsScenario[] = [
  {
    id: "sts-marketplace-courier",
    category: "Marketplace",
    categoryIcon: Store,
    sender: "Buyer · @martin_k",
    senderBadge: "New account · 0 reviews",
    message:
      "Hi! I bought your item on the marketplace. Click this link to accept the payment via Packeta: packeta-delivery-fee.info/pay — you just need to confirm a small €2 delivery fee first, then the money is released.",
    correct: "scam",
    explanation:
      "Classic courier scam. Bazaar, Skills Marketplace, Auctions, Property Marketplace and some Tutorials may use the seller's or provider's stated account, but never enter card or banking details through a courier link sent in chat.",
  },
  {
    id: "sts-marketplace-legit",
    category: "Marketplace",
    categoryIcon: Store,
    sender: "Buyer · @jana_v",
    senderBadge: "Member since 2023 · 27 reviews ⭐ 4.9",
    message:
      "Hello, is the bike still available? Could you tell me the frame size? If everything is fine, please send me the final agreed price and the bank account where you want me to transfer it.",
    correct: "safe",
    explanation:
      "This looks reasonable for a service that supports direct deals: the buyer asks normal questions and requests the seller's payment details without sending a payment link. Verify the account holder and agreed amount before paying.",
  },
  {
    id: "sts-job-training",
    category: "Job & Task",
    categoryIcon: Briefcase,
    sender: "HR Manager · @recruit_pro",
    senderBadge: "Corporate-looking profile · personal chat account",
    message:
      "Congratulations! You were selected for the remote data-entry position (€35/hour) without an interview. To activate your work account, please pay a one-time €49 software & training fee. Send it and we ship your laptop today.",
    correct: "scam",
    explanation:
      "A real employer NEVER asks you to pay. 'Pay first, work later' is always a scam — job, training, equipment or 'account activation' fees included.",
  },
  {
    id: "sts-support-phish",
    category: "Fake Support",
    categoryIcon: MessageSquareWarning,
    sender: "Unique Support ✔️ · @unique_support_team",
    senderBadge: "Unverified account · copycat username",
    message:
      "⚠️ SECURITY ALERT: Your account will be permanently deleted in 24 hours due to suspicious activity. Reply with your password and the 6-digit verification code from your authenticator app so we can confirm your identity and stop the deletion.",
    correct: "scam",
    explanation:
      "Real Unique support NEVER asks for your password or verification codes, and never threatens deletion within 24 hours. Support is reachable only via the Contact page on uniqueapp.fun.",
  },
  {
    id: "sts-crypto-bot",
    category: "Investment",
    categoryIcon: TrendingUp,
    sender: "Mentor · @crypto_ai_profits",
    senderBadge: "New account · profit screenshots in gallery",
    message:
      "My AI trading bot made me €4,200 last week — guaranteed 15% daily profit! Join my VIP signal group for free, just send your first deposit in crypto to this wallet address and I'll set everything up for you.",
    correct: "scam",
    explanation:
      "Guaranteed profit does not exist, and crypto transfers to strangers are irreversible. Fake screenshots + 'VIP group' + wallet address = scam.",
  },
];

type StsPhase = "playing" | "revealed" | "finished";

export const SpotTheScamQuiz = () => {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<StsPhase>("playing");
  const [picked, setPicked] = useState<StsAnswer | null>(null);
  const [streak, setStreak] = useState(0);

  const scenario = STS_SCENARIOS[index];
  const total = STS_SCENARIOS.length;
  const isLast = index === total - 1;
  const wasCorrect = picked !== null && picked === scenario.correct;

  const grade = useMemo(() => {
    const ratio = score / total;
    if (ratio === 1)
      return { title: "Scam Detective", desc: "Perfect score! You can spot every trick scammers use.", badge: "🛡️" };
    if (ratio >= 0.6)
      return { title: "Safety Trained", desc: "Great job — review the explanations for the ones you missed and you're bulletproof.", badge: "🎖️" };
    return { title: "Keep Learning", desc: "Read the scam categories above and try again — a few red flags will become second nature.", badge: "📚" };
  }, [score, total]);

  const answer = (choice: StsAnswer) => {
    if (phase !== "playing") return;
    setPicked(choice);
    setPhase("revealed");
    if (choice === scenario.correct) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    if (isLast) {
      setPhase("finished");
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
    setPhase("playing");
  };

  const restart = () => {
    setIndex(0);
    setScore(0);
    setPicked(null);
    setStreak(0);
    setPhase("playing");
  };

  const CategoryIcon = scenario.categoryIcon;

  return (
    <div className="sts-root">
      <style>{`
.sts-root .sts-message {
  background: hsl(var(--muted) / 0.5);
  border-left: 3px solid hsl(var(--primary) / 0.6);
  white-space: pre-wrap;
  word-break: break-word;
}
.sts-root .sts-btn-safe { border-color: hsl(142 76% 36% / 0.5); }
.sts-root .sts-btn-safe:not(:disabled):hover { background: hsl(142 76% 36% / 0.1); border-color: hsl(142 76% 36%); }
.sts-root .sts-btn-scam { border-color: hsl(var(--destructive) / 0.5); }
.sts-root .sts-btn-scam:not(:disabled):hover { background: hsl(var(--destructive) / 0.1); border-color: hsl(var(--destructive)); }
.sts-root .sts-correct { border-color: hsl(142 76% 36% / 0.7) !important; background: hsl(142 76% 36% / 0.12) !important; }
.sts-root .sts-wrong { border-color: hsl(var(--destructive) / 0.7) !important; background: hsl(var(--destructive) / 0.12) !important; }
.sts-root .sts-progress-fill { background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent))); transition: width 0.35s ease; }
.sts-root .sts-reveal { animation: sts-pop 0.25s ease-out; }
.sts-root .sts-finish { animation: sts-pop 0.35s ease-out; }
.sts-root .sts-cert-icon { background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%); box-shadow: 0 10px 26px -10px hsl(var(--primary) / 0.6); }
@keyframes sts-pop {
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .sts-root .sts-reveal, .sts-root .sts-finish { animation: none; }
}
`}</style>

      {phase !== "finished" ? (
        <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl overflow-hidden">
          {/* Header / progress */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 sm:px-6 pt-5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Question {index + 1} / {total}</span>
              {streak >= 2 && (
                <Badge variant="secondary" className="text-[10px]">🔥 {streak} in a row</Badge>
              )}
            </div>
            <span className="text-xs font-semibold text-muted-foreground">Score: {score}/{total}</span>
          </div>
          <div className="mx-5 sm:mx-6 mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="sts-progress-fill h-full rounded-full"
              style={{ width: `${((index + (phase === "revealed" ? 1 : 0)) / total) * 100}%` }}
            />
          </div>

          {/* Scenario card */}
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <CategoryIcon className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{scenario.category}</span>
            </div>

            <div className="rounded-2xl border border-border/60 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{scenario.sender}</p>
                  <p className="text-xs text-muted-foreground truncate">{scenario.senderBadge}</p>
                </div>
              </div>
              <p className="sts-message mt-3 rounded-lg p-3.5 text-sm leading-relaxed">
                {scenario.message}
              </p>
            </div>

            {/* Answer buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <button
                type="button"
                disabled={phase === "revealed"}
                onClick={() => answer("safe")}
                className={`sts-btn-safe flex items-center justify-center gap-2 rounded-xl border-2 bg-background px-4 py-4 text-base font-bold transition-colors disabled:cursor-default ${
                  phase === "revealed"
                    ? scenario.correct === "safe"
                      ? "sts-correct"
                      : picked === "safe"
                        ? "sts-wrong"
                        : "opacity-50"
                    : ""
                }`}
              >
                Looks Safe ✅
              </button>
              <button
                type="button"
                disabled={phase === "revealed"}
                onClick={() => answer("scam")}
                className={`sts-btn-scam flex items-center justify-center gap-2 rounded-xl border-2 bg-background px-4 py-4 text-base font-bold transition-colors disabled:cursor-default ${
                  phase === "revealed"
                    ? scenario.correct === "scam"
                      ? "sts-correct"
                      : picked === "scam"
                        ? "sts-wrong"
                        : "opacity-50"
                    : ""
                }`}
              >
                It's a Scam! 🚨
              </button>
            </div>

            {/* Reveal */}
            {phase === "revealed" && (
              <div className="sts-reveal mt-4 rounded-2xl border border-border/60 p-4" role="status">
                <div className="flex items-center gap-2">
                  {wasCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive shrink-0" />
                  )}
                  <p className={`font-black ${wasCorrect ? "text-green-600" : "text-destructive"}`}>
                    {wasCorrect ? "Correct!" : "Wrong — that's how people get tricked."}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{scenario.explanation}</p>
                <Button onClick={next} className="mt-4 w-full sm:w-auto gap-2">
                  {isLast ? "See my result" : "Next scenario"} →
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Final screen — certificate */
        <div className="sts-finish rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-6 sm:p-8 text-center">
          <span className="sts-cert-icon mx-auto flex h-20 w-20 items-center justify-center rounded-2xl">
            <Award className="h-10 w-10 text-primary-foreground" />
          </span>
          <p className="mt-4 text-5xl font-black">{grade.badge}</p>
          <h3 className="mt-2 text-2xl font-black">{grade.title}</h3>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            You scored {score}/{total} correct answers
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">{grade.desc}</p>

          <div className="mx-auto mt-5 max-w-sm rounded-xl border-2 border-dashed border-primary/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Certificate of completion</p>
            <p className="mt-1.5 text-sm leading-relaxed">
              This member completed the Unique <strong>Spot the Scam</strong> training and knows how to recognize
              marketplace, job, investment and fake-support scams.
            </p>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row justify-center gap-3">
            <Button onClick={restart} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Play again
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Share what you learned — every person who knows the red flags is one scammer short.
          </p>
        </div>
      )}
    </div>
  );
};

export default SpotTheScamQuiz;
