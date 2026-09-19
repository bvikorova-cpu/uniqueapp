import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Store,
  Smartphone,
  Mail,
  Users,
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

const STS_SCENARIO_POOL: StsScenario[] = [
  {
    id: "sts-sms-customs-fee",
    category: "SMS Scam",
    categoryIcon: Smartphone,
    sender: "SMS · Unknown number",
    senderBadge: "Unsolicited text · spoofed brand name",
    message:
      "DHL: Your package has a pending customs fee of $2.99. To clear delivery, please update your details immediately at: dhl-dispatch-tracking.com",
    correct: "scam",
    explanation:
      "SCAM. Red flag: urgent demands for money and a suspicious non-official URL domain. Real couriers never collect customs fees through random links in text messages — check the tracking in the official DHL app or website instead.",
  },
  {
    id: "sts-whatsapp-verification-code",
    category: "Social Media Scam",
    categoryIcon: Users,
    sender: "WhatsApp · Unknown number (friend's profile photo)",
    senderBadge: "Hijacked photo · number not in your contacts",
    message:
      "Hey! I'm locked out of my account. I sent a verification code to your phone by mistake, can you please copy and paste it back to me here?",
    correct: "scam",
    explanation:
      "SCAM. Red flag: verification code harvesting / account takeover attempt. The code is for YOUR account — anyone who asks you to forward it can steal your profile. Always verify with your friend through another channel first.",
  },
  {
    id: "sts-email-suspension",
    category: "Email Scam",
    categoryIcon: Mail,
    sender: "Email · \"security@amazon-support-alert.net\"",
    senderBadge: "Unofficial domain · fear tactics",
    message:
      "Subject: Urgent: Unauthorized login attempt detected. Your account will be permanently suspended in 24 hours. Verify now: [Link]",
    correct: "scam",
    explanation:
      "SCAM. Red flag: high urgency and fear tactics plus an unofficial email domain. Real companies don't threaten suspension within 24 hours — open the official app or type the website address yourself instead of clicking the link.",
  },
  {
    id: "sts-marketplace-card-details",
    category: "Marketplace Scam",
    categoryIcon: Store,
    sender: "Marketplace message · eager buyer",
    senderBadge: "Pushes off-platform payment · private 'courier'",
    message:
      "I love the item! I will pay via PayPal right now, but I will send a private courier to pick it up. Please click this link to confirm your bank card details to receive the funds.",
    correct: "scam",
    explanation:
      "SCAM. Red flag: real marketplaces or couriers never require your full card details, CVV, or expiration date to send you money. Keep payments on the platform and never enter card data through links sent in chat.",
  },
  {
    id: "sts-sms-toll",
    category: "SMS Scam",
    categoryIcon: Smartphone,
    sender: "SMS · \"RoadToll Services\"",
    senderBadge: "Threat of fines · link to pay",
    message:
      "FINAL NOTICE: You have an unpaid toll of $11.40. Pay now to avoid a $150 late penalty: pay-roadtoll-secure.info",
    correct: "scam",
    explanation:
      "SCAM. Red flag: threatening fines plus a lookalike domain ending in .info. Toll operators bill through your official account, not urgent texts with payment links. Type the official site yourself if you're unsure.",
  },
  {
    id: "sts-email-netflix",
    category: "Email Scam",
    categoryIcon: Mail,
    sender: "Email · \"billing@netflix-update.co\"",
    senderBadge: "Lookalike domain · payment failure story",
    message:
      "Subject: Your payment method was declined. Update your card within 12 hours or your membership ends: [Link]",
    correct: "scam",
    explanation:
      "SCAM. Red flag: a short deadline and a domain that isn't the official one. Streaming services let you fix billing inside the app — never through links in emails. Log in directly to check your account status.",
  },
  {
    id: "sts-telegram-crypto",
    category: "Social Media Scam",
    categoryIcon: Users,
    sender: "Telegram · \"Official Giveaway Bot\"",
    senderBadge: "Too-good-to-be-true · send first",
    message:
      "🎉 Celebrating our 10M users! Send 0.05 ETH to the address below and receive 0.5 ETH back within 10 minutes. Limited to the first 50 participants!",
    correct: "scam",
    explanation:
      "SCAM. Red flag: classic 'send money to get more money' — the coins are gone the moment you send them. No legitimate company doubles deposits, especially not through DMs or bots.",
  },
  {
    id: "sts-marketplace-cheap-gift",
    category: "Marketplace Scam",
    categoryIcon: Store,
    sender: "Marketplace message · 'seller'",
    senderBadge: "Price too low · refuses to meet",
    message:
      "iPhone listed at $120 (worth $800). I'm abroad, but I'll ship it today — just pay the shipping fee of $25 via a gift card and send me the code.",
    correct: "scam",
    explanation:
      "SCAM. Red flag: a price far below market value plus a demand for gift card codes. Gift cards are untraceable — that's why scammers love them. Never pay for anything with a gift card code.",
  },
  {
    id: "sts-sms-delivery-real",
    category: "SMS Scam",
    categoryIcon: Smartphone,
    sender: "SMS · Your courier app",
    senderBadge: "Standard tracking notification",
    message:
      "Your package from order #48213 is out for delivery today, 2:00 PM – 6:00 PM. Track it in the app you ordered from. No reply needed.",
    correct: "safe",
    explanation:
      "SAFE. Red flags are missing: no payment request, no urgent link, no request for personal data, and it refers you to the app you already use. Scammers push you to act fast — legitimate messages just inform you.",
  },
  {
    id: "sts-email-security-real",
    category: "Email Scam",
    categoryIcon: Mail,
    sender: "Email · no-reply@officialplatform.com",
    senderBadge: "Known domain · informational only",
    message:
      "Subject: New sign-in to your account from a new device. If this was you, no action is needed. If not, review your devices in Settings after logging in directly at the official site.",
    correct: "safe",
    explanation:
      "SAFE. It doesn't ask you to click a link, enter data, or rush. It even tells you to navigate to the site yourself. Scam emails always contain a link or a deadline — real security alerts ask you to check inside the app.",
  },
  {
    id: "sts-marketplace-real",
    category: "Marketplace Scam",
    categoryIcon: Store,
    sender: "Marketplace message · local buyer",
    senderBadge: "Normal questions · public meeting",
    message:
      "Hi, is the bike still available? Could I see it tomorrow afternoon and pay cash when we meet at the agreed public spot? Thanks!",
    correct: "safe",
    explanation:
      "SAFE. Normal marketplace behavior: asks about availability, wants to see the item, pays in person in cash at a public place. Be suspicious when someone insists on unusual payment methods, gift cards, or private 'couriers'.",
  },
  {
    id: "sts-social-real",
    category: "Social Media Scam",
    categoryIcon: Users,
    sender: "Instagram DM · your real friend",
    senderBadge: "Account you already chat with · no requests",
    message:
      "Happy birthday!! 🎂 Hope you have an amazing day — see you at the party on Saturday!",
    correct: "safe",
    explanation:
      "SAFE. A personal message from a friend with no link, no urgent request, and nothing to click. Impersonation scams copy a friend's photo but come from a NEW unknown number — always check whether the account is the one you already know.",
  },
];

const STS_QUESTIONS_PER_ROUND = 4;

const stsShuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const stsPickRound = (): StsScenario[] => {
  // Fresh mix every round: mostly scams, sometimes one "safe" decoy, order shuffled.
  const scams = stsShuffle(STS_SCENARIO_POOL.filter((s) => s.correct === "scam"));
  const safes = stsShuffle(STS_SCENARIO_POOL.filter((s) => s.correct === "safe"));
  const safeCount = Math.random() < 0.5 ? 1 : 0;
  return stsShuffle([...scams.slice(0, STS_QUESTIONS_PER_ROUND - safeCount), ...safes.slice(0, safeCount)]);
};

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
              SMS, email, social media and marketplace scams.
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
