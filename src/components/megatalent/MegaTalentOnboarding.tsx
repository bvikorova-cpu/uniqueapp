import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Upload, Heart, Award, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY_PREFIX = "megatalent_onboarding_done_";

const steps = [
  {
    icon: Trophy,
    title: "Vitaj v MegaTalent súťaži 🏆",
    description:
      "Zúčastňuj sa mesačných súťaží naprieč 35+ kategóriami — od spevu cez tanec až po umenie. Najlepšie talenty získavajú peňažné ceny, viditeľnosť a TOP Premium odznak.",
    bullets: [
      "Mesačné kolá s vyhlásením víťazov",
      "Hlasujú reálni používatelia + AI Performance Score",
      "Fair-play: jeden účet = jeden hlas denne",
    ],
  },
  {
    icon: Upload,
    title: "Ako nahrať fotku alebo video 📸",
    description:
      "V kategórii klikni na tlačidlo „Upload\" a vyber súbor zo zariadenia. Prijímame fotky (JPG, PNG, WEBP do 10 MB) a videá (MP4, MOV do 100 MB / max. 60 sekúnd).",
    bullets: [
      "Vyber správnu kategóriu (zmeniť ju neskôr nejde)",
      "Pridaj krátky popis a hashtagy — pomáha to algoritmu",
      "Tvár musí byť tvoja — žiadne kradnuté zábery",
    ],
  },
  {
    icon: Heart,
    title: "Hlasovanie a boost ❤️",
    description:
      "Tvoji fanúšikovia hlasujú srdcom. Premium predplatitelia dostávajú 2× váhu hlasu, TOP Premium až 3× a denný vote-boost.",
    bullets: [
      "Zdieľaj svoj príspevok cez Share — pozve to viac hlasov",
      "Použi AI Talent Coach na zlepšenie performance",
      "Sleduj Live Leaderboard pre real-time poradie",
    ],
  },
  {
    icon: Award,
    title: "Pravidlá súťaže ⚖️",
    description:
      "Aby bola súťaž férová, dodržuj prosím tieto pravidlá. Porušenie znamená diskvalifikáciu bez nároku na vrátenie predplatného.",
    bullets: [
      "Žiadny nahý obsah, násilie, nenávisť ani spam",
      "Žiadne kupovanie hlasov ani fake účty",
      "Obsah musí byť tvoja vlastná tvorba (alebo so súhlasom)",
      "Vek 13+ (mladší len so súhlasom rodiča)",
    ],
  },
];

export const MegaTalentOnboarding = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user) return;
    const key = STORAGE_KEY_PREFIX + user.id;
    const done = localStorage.getItem(key);
    if (!done) {
      // Small delay so it doesn't pop instantly on mount
      const t = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, [user]);

  const finish = () => {
    if (user) localStorage.setItem(STORAGE_KEY_PREFIX + user.id, "1");
    setOpen(false);
  };

  const isLast = step === steps.length - 1;
  const current = steps[step];
  const Icon = current.icon;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) finish(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mb-2">
            <Icon className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">{current.title}</DialogTitle>
          <DialogDescription className="text-center">{current.description}</DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 my-2">
          {current.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 my-2">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-primary" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          {step > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Späť
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={finish}>
              Preskočiť
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => (isLast ? finish() : setStep(step + 1))}
          >
            {isLast ? "Začať súťažiť 🚀" : (
              <>Ďalej <ChevronRight className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
