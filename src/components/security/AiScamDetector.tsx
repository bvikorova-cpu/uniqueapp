import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSpendCredits } from "@/hooks/useSpendCredits";
import {
  ScanSearch,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Link2,
  Banknote,
  Timer,
  KeyRound,
  TrendingUp,
  Wallet,
  UserX,
  Loader2,
  RotateCcw,
  Info,
} from "lucide-react";

/**
 * AiScamDetector — fully isolated simulated scam-text analyzer for the
 * Scam Protection section. Unique "asd-" prefixed classes; no shared
 * component sources are modified. Analysis is heuristic (pattern matching
 * on the pasted text, done locally in the browser) with a simulated
 * AI "analysis" delay — educational demo, not a real AI model.
 */

interface AsdPattern {
  id: string;
  label: string;
  detail: string;
  weight: number;
  icon: typeof AlertTriangle;
  regex: RegExp;
}

const ASD_PATTERNS: AsdPattern[] = [
  {
    id: "asd-urgency",
    label: "Urgency language",
    detail: "Pressure to act fast ('urgent', '24 hours', 'last chance', 'immediately') — a classic scam tactic to stop you from thinking.",
    weight: 18,
    icon: Timer,
    regex: /\b(urgent|urgently|immediately|right now|asap|last chance|expires?|expiring|24 ?hours?|48 ?hours?|final warning|act now|don'?t (wait|delay)|limited time)\b/i,
  },
  {
    id: "asd-offplatform",
    label: "High-risk or manipulated payment request",
    detail: "Requests hard-to-recover payment such as gift cards, crypto or money transfer, or pressures you to send a deposit. Direct bank payment is normal in supported services when it matches the agreed recipient and amount.",
    weight: 24,
    icon: Banknote,
    regex: /\b(gift ?cards?|itunes card|steam card|western union|money ?gram|paypal (friends|f&f)|crypto|bitcoin|btc|usdt|ethereum|wallet address|refundable deposit|security deposit)\b/i,
  },
  {
    id: "asd-suspicious-link",
    label: "Suspicious link pattern",
    detail: "A link that mimics a real site or uses a shady domain — check the exact spelling before you ever click.",
    weight: 20,
    icon: Link2,
    regex: /(https?:\/\/|www\.)[^\s]*|[\w-]+\.(info|xyz|top|club|online|site|click|support|team|pay|shop|loan)(\/|\b)/i,
  },
  {
    id: "asd-credentials",
    label: "Asking for password or codes",
    detail: "Requests for passwords, PINs, CVV or verification codes — no real service, bank or support will ever ask for these.",
    weight: 26,
    icon: KeyRound,
    regex: /\b(password|passcode|pass ?word|verification code|verify code|otp|one[- ]time code|\d[- ]digit code|cvv|cvc|card number|pin code|login details|credentials|authenticator)\b/i,
  },
  {
    id: "asd-guaranteed-profit",
    label: "Guaranteed profit / investment pitch",
    detail: "'Guaranteed returns', daily %, AI bots, VIP signal groups — guaranteed profit does not exist.",
    weight: 22,
    icon: TrendingUp,
    regex: /\b(guaranteed|risk[- ]free|no risk|daily (profit|income|return)|roi|\d{1,2}\s?%\s?(daily|weekly|per day|per week)|trading bot|ai bot|signal group|invest now|double your|passive income)\b/i,
  },
  {
    id: "asd-pay-first",
    label: "Pay first, receive later",
    detail: "Upfront fees for 'delivery', 'training', 'activation' or 'release' of money — real couriers and employers never charge you to receive something.",
    weight: 22,
    icon: Wallet,
    regex: /\b(delivery fee|shipping fee|courier fee|training fee|activation fee|release fee|processing fee|customs fee|insurance fee|refundable (deposit|fee)|pay (a |the )?(small )?fee|advance (payment|fee)|upfront)\b/i,
  },
  {
    id: "asd-impersonation",
    label: "Impersonating support or authority",
    detail: "Claims to be Unique support, a bank, police or admin — often with urgency and a request to 'verify' something.",
    weight: 16,
    icon: UserX,
    regex: /\b(support team|customer (support|service)|official (account|support)|administrator|admin team|bank (security|officer)|security (team|alert|department)|account (suspended|blocked|locked|delet)|verify your (account|identity)|identity verification)\b/i,
  },
];

interface AsdFlag {
  pattern: AsdPattern;
}

type AsdPhase = "idle" | "analyzing" | "result";

interface AsdResult {
  score: number;
  level: "Low" | "Medium" | "High";
  flags: AsdFlag[];
  textLength: number;
  scanTime: number;
}

const ASD_LEVEL_STYLE: Record<
  AsdResult["level"],
  { color: string; bg: string; ring: string; icon: typeof ShieldCheck }
> = {
  Low: {
    color: "hsl(142 76% 36%)",
    bg: "hsl(142 76% 36% / 0.12)",
    ring: "hsl(142 76% 36% / 0.5)",
    icon: ShieldCheck,
  },
  Medium: {
    color: "hsl(38 92% 50%)",
    bg: "hsl(38 92% 50% / 0.12)",
    ring: "hsl(38 92% 50% / 0.5)",
    icon: AlertTriangle,
  },
  High: {
    color: "hsl(var(--destructive))",
    bg: "hsl(var(--destructive) / 0.12)",
    ring: "hsl(var(--destructive) / 0.5)",
    icon: ShieldAlert,
  },
};

export const AiScamDetector = () => {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<AsdPhase>("idle");
  const [result, setResult] = useState<AsdResult | null>(null);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const { spend, costs } = useSpendCredits();

  const canAnalyze = text.trim().length >= 15;

  const analyze = async () => {
    if (!canAnalyze || phase === "analyzing") return;
    const paid = await spend("scam_ai_analysis", {
      description: "AI scam text analysis",
    });
    if (!paid) return;

    setPhase("analyzing");
    setResult(null);
    setProgress(0);

    // Simulated AI progress bar
    const started = Date.now();
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - started;
      setProgress(Math.min(96, (elapsed / 2000) * 100));
    }, 60);

    window.setTimeout(() => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      setProgress(100);

      const found = ASD_PATTERNS.filter((p) => p.regex.test(text));
      // Base score from matched weights, softened; grows with text scanned
      const raw = found.reduce((sum, f) => sum + f.weight, 0);
      const diminishing = 1 - (raw / 100) * 0.35; // diminishing returns
      const score = found.length === 0 ? Math.min(12, 3 + Math.round(text.length / 300)) : Math.max(30, Math.min(96, Math.round(raw * diminishing)));
      const level: AsdResult["level"] = score >= 65 ? "High" : score >= 35 ? "Medium" : "Low";

      setResult({
        score,
        level,
        flags: found.map((pattern) => ({ pattern })),
        textLength: text.length,
        scanTime: 1.8 + Math.random() * 0.5,
      });
      setPhase("result");
    }, 2000);
  };

  const reset = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setPhase("idle");
    setResult(null);
    setProgress(0);
  };

  const levelStyle = result ? ASD_LEVEL_STYLE[result.level] : null;
  const ringCircumference = 2 * Math.PI * 52;
  const ringOffset = result ? ringCircumference * (1 - result.score / 100) : ringCircumference;

  const scanningSteps = useMemo(
    () => [
      "Tokenizing message structure…",
      "Matching known scam patterns…",
      "Checking link reputation heuristics…",
      "Scoring risk…",
    ],
    []
  );
  const activeStep = Math.min(scanningSteps.length - 1, Math.floor((progress / 100) * scanningSteps.length));

  return (
    <div className="asd-root">
      <style>{`
.asd-root .asd-panel {
  background: hsl(var(--card) / 0.7);
  backdrop-filter: blur(12px);
}
.asd-root .asd-glow {
  background:
    radial-gradient(50% 70% at 20% 0%, hsl(var(--primary) / 0.10), transparent 60%),
    radial-gradient(40% 60% at 85% 20%, hsl(var(--accent) / 0.08), transparent 60%);
  pointer-events: none;
}
.asd-root .asd-analyze-btn {
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);
  box-shadow: 0 10px 28px -10px hsl(var(--primary) / 0.6);
}
.asd-root .asd-analyze-btn:not(:disabled):hover { filter: brightness(1.06); }
.asd-root .asd-analyze-btn:disabled { opacity: 0.55; }
.asd-root .asd-textarea {
  background: hsl(var(--muted) / 0.4);
  min-height: 140px;
  resize: vertical;
}
.asd-root .asd-textarea:focus { outline: 2px solid hsl(var(--primary) / 0.5); outline-offset: 1px; }
.asd-root .asd-scanline {
  background: linear-gradient(90deg, transparent, hsl(var(--primary) / 0.9), hsl(var(--accent) / 0.9), transparent);
  animation: asd-sweep 1.4s ease-in-out infinite;
}
@keyframes asd-sweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(220%); }
}
.asd-root .asd-flag { animation: asd-pop 0.3s ease-out both; }
.asd-root .asd-result { animation: asd-pop 0.35s ease-out; }
@keyframes asd-pop {
  from { opacity: 0; transform: translateY(8px) scale(0.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.asd-root .asd-ring-anim { transition: stroke-dashoffset 1s ease-out; }
@media (prefers-reduced-motion: reduce) {
  .asd-root .asd-scanline { animation: none; opacity: 0.4; }
  .asd-root .asd-flag, .asd-root .asd-result { animation: none; }
}
`}</style>

      <div className="asd-panel relative rounded-2xl border border-border/60 overflow-hidden">
        <div className="absolute inset-0 asd-glow" aria-hidden="true" />

        {/* Header */}
        <div className="relative flex flex-wrap items-center justify-between gap-2 px-5 sm:px-6 pt-5">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
              <ScanSearch className="h-5 w-5 text-primary" />
            </span>
            <div>
              <p className="font-bold leading-tight">Simulated AI Scam Detector</p>
              <p className="text-xs text-muted-foreground leading-tight">
                Paste a suspicious message, email or job offer
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1.5 text-[10px]">
            <Info className="h-3 w-3" />
            Simulation — educational demo
          </Badge>
        </div>

        {/* Textarea */}
        <div className="relative px-5 sm:px-6 pt-4">
          <div className="relative">
            <textarea
              className="asd-textarea w-full rounded-xl border border-border/60 p-4 text-sm leading-relaxed placeholder:text-muted-foreground/70"
              placeholder={'e.g. "Hi, I bought your item. Click this link to accept the payment — you just need to confirm a small delivery fee first…"'}
              value={text}
              maxLength={4000}
              onChange={(e) => setText(e.target.value)}
              disabled={phase === "analyzing"}
              aria-label="Suspicious message to analyze"
            />
            {phase === "analyzing" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-xl">
                <div className="asd-scanline h-full w-1/3" />
              </div>
            )}
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{text.length}/4000 characters</span>
            <span>Nothing is uploaded — analysis runs on your device.</span>
          </div>
        </div>

        {/* Analyze button */}
        <div className="relative px-5 sm:px-6 pt-3 pb-5 flex flex-wrap items-center gap-3">
          <Button
            onClick={analyze}
            disabled={!canAnalyze || phase === "analyzing"}
            className="asd-analyze-btn gap-2 font-bold"
            size="lg"
          >
            {phase === "analyzing" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                AI is analyzing the text patterns…
              </>
            ) : (
              <>
                <ScanSearch className="h-4 w-4" />
                Analyze with AI · {costs.scam_ai_analysis} credits
              </>
            )}
          </Button>
          {phase === "result" && (
            <Button variant="outline" onClick={reset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              New scan
            </Button>
          )}
          {!canAnalyze && phase === "idle" && (
            <span className="text-xs text-muted-foreground">Paste at least a sentence (15+ characters).</span>
          )}
        </div>

        {/* Analyzing state */}
        {phase === "analyzing" && (
          <div className="relative border-t border-border/60 px-5 sm:px-6 py-6" role="status" aria-live="polite">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))",
                  transition: "width 0.1s linear",
                }}
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground font-medium">
              {scanningSteps[activeStep]}
            </p>
          </div>
        )}

        {/* Result */}
        {phase === "result" && result && levelStyle && (
          <div className="asd-result relative border-t border-border/60">
            <div className="flex flex-col sm:flex-row items-center gap-5 px-5 sm:px-6 py-6">
              {/* Risk score ring */}
              <div className="relative shrink-0">
                <svg width="128" height="128" viewBox="0 0 120 120" aria-hidden="true">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="9" />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke={levelStyle.color}
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    transform="rotate(-90 60 60)"
                    className="asd-ring-anim"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black" style={{ color: levelStyle.color }}>
                    {result.score}%
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Risk score
                  </span>
                </div>
              </div>

              {/* Verdict */}
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  {(() => {
                    const LevelIcon = levelStyle.icon;
                    return <LevelIcon className="h-6 w-6" style={{ color: levelStyle.color }} />;
                  })()}
                  <span className="text-2xl font-black" style={{ color: levelStyle.color }}>
                    {result.level} Risk
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {result.level === "High" &&
                    "This message shows multiple classic scam signals. Do not pay, click or reply — report it to Unique support."
                  }
                  {result.level === "Medium" &&
                    "Some warning signs detected. Follow the payment flow shown by that service, verify the agreed recipient and amount, and never share passwords or codes."
                  }
                  {result.level === "Low" &&
                    "No obvious scam patterns found — but scammers evolve. Stay alert, and when in doubt, ask support."
                  }
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Analyzed {result.textLength} characters · {(result.scanTime).toFixed(1)}s · {ASD_PATTERNS.length} pattern groups
                </p>
              </div>
            </div>

            {/* Red flags */}
            <div className="border-t border-border/60 px-5 sm:px-6 py-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-destructive mb-3">
                Detected red flags {result.flags.length > 0 && `(${result.flags.length})`}
              </h3>
              {result.flags.length === 0 ? (
                <div className="flex items-start gap-2 rounded-xl border border-border/60 p-3.5">
                  <ShieldCheck className="h-5 w-5 mt-0.5 shrink-0" style={{ color: "hsl(142 76% 36%)" }} />
                  <p className="text-sm text-muted-foreground">
                    No red flags matched in this text. That's a good sign, but it's not a guarantee — always double-check
                    who you're talking to, follow the payment method shown by that service, and verify the recipient and amount.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {result.flags.map(({ pattern }, i) => {
                    const FlagIcon = pattern.icon;
                    return (
                      <li
                        key={pattern.id}
                        className="asd-flag flex items-start gap-3 rounded-xl border border-border/60 p-3.5"
                        style={{ animationDelay: `${i * 90}ms` }}
                      >
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: levelStyle.bg, color: levelStyle.color }}
                        >
                          <FlagIcon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-sm">{pattern.label}</p>
                          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{pattern.detail}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="mt-4 text-[11px] text-muted-foreground">
                This simulated detector is a training tool, not real fraud detection. It can miss scams or flag harmless
                messages. Trust your instincts: if it feels wrong, stop and report.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiScamDetector;
