import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldAlert,
  Siren,
  Store,
  Briefcase,
  TrendingUp,
  MessageSquareWarning,
  CreditCard,
  Phone,
  KeyRound,
  LifeBuoy,
  CheckCircle2,
  XCircle,
  Home,
} from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { SpotTheScamQuiz } from "@/components/security/SpotTheScamQuiz";
import { AiScamDetector } from "@/components/security/AiScamDetector";
import securityHeroVideo from "@/assets/security-center-hero.mp4.asset.json";

/**
 * ScamProtectionCenter — fully isolated page (route /security-center).
 * Uses unique "spc-" scoped classes; shares UI primitives only as-is.
 */

const SPC_CATEGORIES = [
  {
    icon: Store,
    title: "Marketplace Scams",
    tagline: "Fake courier links, off-platform payments",
    redFlags: [
      "A buyer or seller pushes you to pay outside Unique (bank transfer, gift cards, crypto)",
      "A \u201Ccourier company\u201D link asks for a small \u201Cdelivery fee\u201D before you receive the item",
      "Price is far below market value and the seller pressures you to decide fast",
      "Screenshots of \u201Cpayment done\u201D instead of a real in-app confirmation",
    ],
    protect: [
      "Always pay and message inside Unique so escrow and dispute protection apply",
      "Never open courier or payment links sent in chat",
      "Check the seller's profile rating, reviews and account age first",
    ],
  },
  {
    icon: Briefcase,
    title: "Job & Task Scams",
    tagline: "Paying for training, fake recruiters",
    redFlags: [
      "\u201CYou got the job!\u201D without a real interview",
      "You must first pay for training, software, equipment or an \u201Caccount activation\u201D",
      "Recruiter contacts you from a personal chat account with a corporate-looking profile picture",
      "They ask for your bank card \u201Cto receive salary\u201D or your ID before any contract",
    ],
    protect: [
      "A real employer never asks you to pay — any upfront payment is a scam",
      "Verify the company website and contact them through official channels",
      "Never share card numbers, CVV or full ID scans in chat",
    ],
  },
  {
    icon: TrendingUp,
    title: "Crypto & AI Investment Scams",
    tagline: "Get-rich-quick bots, fake tokens",
    redFlags: [
      "\u201CAI trading bot\u201D guarantees daily or weekly profit — guaranteed profit does not exist",
      "Someone shows fake profit screenshots and invites you to a \u201C VIP signal group \u201D",
      "You are asked to send crypto to a wallet address — crypto transfers are irreversible",
      "A \u201Cmentor\u201D helps you invest, but withdrawals suddenly require a \u201Cfee\u201D or \u201Ctax\u201D",
    ],
    protect: [
      "Never send money to strangers promising returns — uniqueapp.fun never runs investment schemes",
      "Be suspicious of anyone who found you online and talks about easy money",
      "Once crypto leaves your wallet, it is almost impossible to recover",
    ],
  },
  {
    icon: MessageSquareWarning,
    title: "Phishing & Fake Support",
    tagline: "Impersonating a bank or Unique support",
    redFlags: [
      "An account claims to be \u201CUnique Support\u201D and asks for your password or card details",
      "A message creates urgency: \u201Cyour account will be deleted in 24 hours\u201D",
      "Links that look almost right — uniqueapp-fun.support.com, uniqueapp.fun-team.io",
      "QR codes or files sent by strangers \u201Cto verify your account\u201D",
    ],
    protect: [
      "Real Unique support NEVER asks for your password, card number or verification codes",
      "Official support is reachable only via the Contact page on uniqueapp.fun",
      "Type website addresses yourself instead of clicking links from messages",
    ],
  },
];

const SPC_PANIC_STEPS = [
  {
    icon: CreditCard,
    title: "1. Block your bank cards",
    desc: "Open your banking app right now and lock/block every card. If money was already sent, block the account if possible. Speed matters — the first minutes are critical.",
  },
  {
    icon: Phone,
    title: "2. Call your bank hotline",
    desc: "Call the number printed on the back of your card (not a number the scammer gave you). Report the fraud and ask for a chargeback and a new card.",
  },
  {
    icon: KeyRound,
    title: "3. Change your passwords",
    desc: "Change the password of your email first, then Unique and your bank. Enable two-factor authentication everywhere. Never reuse passwords.",
  },
  {
    icon: LifeBuoy,
    title: "4. Report to Unique support",
    desc: "Send us the scammer's profile link and screenshots via our Contact page so we can block the account and warn others. Also report to the police in your country.",
  },
];

export const ScamProtectionCenter = () => {
  const [panicOpen, setPanicOpen] = useState(false);

  const spcScopedStyles = `
.spc-root .spc-hero-glow {
  background:
    radial-gradient(60% 80% at 15% 0%, hsl(var(--primary) / 0.12), transparent 60%),
    radial-gradient(50% 70% at 90% 10%, hsl(var(--accent) / 0.10), transparent 60%);
  pointer-events: none;
}
.spc-root .spc-hero-video { object-fit: cover; object-position: center; }
.spc-root .spc-hero-shade { background: linear-gradient(90deg, hsl(var(--background) / 0.96) 0%, hsl(var(--background) / 0.82) 48%, hsl(var(--background) / 0.35) 100%); }
.spc-root .spc-title {
  background: linear-gradient(120deg, hsl(var(--foreground)) 20%, hsl(var(--primary)) 70%, hsl(var(--accent)) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.spc-root .spc-panic-btn {
  background: linear-gradient(135deg, hsl(var(--destructive)) 0%, hsl(var(--destructive) / 0.85) 100%);
}
.spc-root .spc-panic-shadow { box-shadow: 0 10px 30px -10px hsl(var(--destructive) / 0.55); }
.spc-root .spc-panic-hover:hover { transform: translateY(-1px); box-shadow: 0 14px 36px -10px hsl(var(--destructive) / 0.65); }
.spc-root .spc-rules { background: hsl(var(--card) / 0.7); backdrop-filter: blur(12px); }
.spc-root .spc-card { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
.spc-root .spc-card[open] { border-color: hsl(var(--primary) / 0.4); box-shadow: 0 12px 40px -18px hsl(var(--primary) / 0.35); }
.spc-root .spc-card-icon { background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%); box-shadow: 0 8px 20px -8px hsl(var(--primary) / 0.5); }
.spc-root .spc-chevron::after { content: "▾"; }
.spc-root .spc-card[open] .spc-chevron::after { content: "▴"; }
.spc-root .spc-step-icon { background: linear-gradient(135deg, hsl(var(--destructive) / 0.15), hsl(var(--destructive) / 0.08)); color: hsl(var(--destructive)); }
@media (prefers-reduced-motion: reduce) {
  .spc-root .spc-panic-hover:hover { transform: none; }
}
`;


  return (
    <div className="spc-root min-h-screen">
      <style>{spcScopedStyles}</style>
      <FloatingHowItWorks
        title="Security & Scam Protection Center - How it works"
        steps={[
          { title: "Learn", desc: "Read the four scam categories and their red flags." },
          { title: "Recognize", desc: "Compare any suspicious message against the listed warning signs." },
          { title: "Act", desc: "If something feels wrong, stop paying and messaging the stranger." },
          { title: "Report", desc: "Use the Panic button for emergency steps, then report to Unique support." },
        ]}
      />

      {/* Hero */}
      <section className="spc-hero relative overflow-hidden border-b border-border/60">
        <video
          className="spc-hero-video absolute inset-0 h-full w-full"
          src={securityHeroVideo.url}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <div className="spc-hero-shade absolute inset-0" aria-hidden="true" />
        <div className="absolute inset-0 spc-hero-glow" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-8 sm:pt-14 sm:pb-10">
          <nav className="mb-4">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            <div className="space-y-3 min-w-0">
              <Badge variant="secondary" className="gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-primary" />
                Safety education
              </Badge>
              <h1 className="spc-title text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
                Security &amp; Scam Protection Center
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
                Learn how to spot scammers and protect your money, jobs, and digital assets.
              </p>
            </div>

            {/* Panic button */}
            <button
              type="button"
              onClick={() => setPanicOpen(true)}
              className="spc-panic-btn shrink-0 inline-flex items-center gap-3 rounded-2xl px-5 py-4 text-left font-bold text-white shadow-lg spc-panic-shadow transition-transform hover:spc-panic-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/60"
              aria-haspopup="dialog"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                <Siren className="h-6 w-6" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm uppercase tracking-widest opacity-90">Emergency</span>
                <span className="block text-base sm:text-lg">I got scammed</span>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Golden rules strip */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="spc-rules rounded-2xl border border-border/60 p-4 sm:p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Golden rules</h2>
          <ul className="grid sm:grid-cols-3 gap-2.5 text-sm">
            {[
              "Never pay anyone outside Unique.",
              "No real job, bank or support asks for your password, card or codes.",
              "Urgency and guaranteed profit are the two biggest scam signals.",
            ].map((rule) => (
              <li key={rule} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Category cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Know the main scam types</h2>
        <p className="text-muted-foreground mb-6">Tap a card to see red flags and how to protect yourself.</p>
        <div className="grid gap-5 md:grid-cols-2">
          {SPC_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <details key={cat.title} className="spc-card group rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl overflow-hidden">
                <summary className="flex items-start gap-4 p-5 sm:p-6 cursor-pointer list-none">
                  <span className="spc-card-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-lg leading-snug">{cat.title}</span>
                    <span className="block text-sm text-muted-foreground mt-0.5">{cat.tagline}</span>
                    <span className="spc-chevron mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      Show red flags &amp; protection
                    </span>
                  </span>
                </summary>
                <div className="px-5 sm:px-6 pb-6 space-y-4 border-t border-border/40 pt-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-destructive mb-2">Red flags</h3>
                    <ul className="space-y-1.5 text-sm">
                      {cat.redFlags.map((flag) => (
                        <li key={flag} className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">How to protect yourself</h3>
                    <ul className="space-y-1.5 text-sm">
                      {cat.protect.map((tip) => (
                        <li key={tip} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </section>

      {/* Spot the Scam quiz */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Spot the Scam — test yourself</h2>
        <p className="text-muted-foreground mb-6">
          Real-looking messages, your call. Answer and learn the red flags instantly.
        </p>
        <SpotTheScamQuiz />
      </section>

      {/* Simulated AI Scam Detector */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Simulated AI Scam Detector</h2>
        <p className="text-muted-foreground mb-6">
          Paste any suspicious message, email or job offer and see which scam patterns it matches.
        </p>
        <AiScamDetector />
      </section>

      {/* Bottom CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
        <Card className="border-border/60 bg-card/70 backdrop-blur-xl">
          <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Not sure if it's a scam?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                If a message, job offer or payment request feels wrong — stop, don't send anything, and report it.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Button onClick={() => setPanicOpen(true)} variant="destructive" className="gap-2">
                <Siren className="h-4 w-4" />
                Panic: I got scammed
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link to="/contact">
                  <LifeBuoy className="h-4 w-4" />
                  Contact support
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Panic modal */}
      <Dialog open={panicOpen} onOpenChange={setPanicOpen}>
        <DialogContent className="spc-panic-modal max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Siren className="h-5 w-5" />
              Emergency: I got scammed
            </DialogTitle>
            <DialogDescription>
              Do these 4 steps in order. The first minutes decide whether money can still be saved.
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-3">
            {SPC_PANIC_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="flex items-start gap-3 rounded-xl border border-border/60 p-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg spc-step-icon">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{step.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
                    {step.title.startsWith("3.") && (
                      <Button asChild variant="outline" size="sm" className="mt-2">
                        <Link to="/settings/security">Enable two-factor authentication</Link>
                      </Button>
                    )}
                    {step.title.startsWith("4.") && (
                      <Button asChild size="sm" className="mt-2 gap-1.5">
                        <Link to="/contact">
                          <LifeBuoy className="h-3.5 w-3.5" />
                          Report to Unique support
                        </Link>
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="text-xs text-muted-foreground">
            You are not alone — scammers are professionals. Reporting quickly protects you and the whole Unique community.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScamProtectionCenter;
