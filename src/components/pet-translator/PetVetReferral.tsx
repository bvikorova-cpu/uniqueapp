import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Stethoscope, ExternalLink } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const VETS = [
  { name: "Pawp 24/7 Vet Chat", url: "https://pawp.com", note: "$24/mo unlimited chat" },
  { name: "Vetster", url: "https://vetster.com", note: "Video consults from $30" },
  { name: "AskVet", url: "https://askvet.app", note: "$9.99/mo, instant answers" },
  { name: "PetCoach (free Q&A)", url: "https://petcoach.co", note: "Free community + paid pro" },
];

export default function PetVetReferral({ onBack }: { onBack: () => void }) {
  return (
    <>
      <FloatingHowItWorks title="How Pet Vet Referral works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <Card className="p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-2"><Stethoscope className="w-5 h-5 text-primary" /> Talk to a Real Vet</h2>
        <p className="text-sm text-muted-foreground mb-4">⚠️ Our AI is not a replacement for a veterinarian. For urgent or persistent symptoms, contact a professional immediately.</p>
        <div className="space-y-3">
          {VETS.map((v) => (
            <a key={v.url} href={v.url} target="_blank" rel="noreferrer noopener" className="block p-4 rounded-lg border border-border/40 hover:border-primary/40 transition-all">
              <div className="flex items-center justify-between">
                <div><div className="font-bold">{v.name}</div><div className="text-xs text-muted-foreground">{v.note}</div></div>
                <ExternalLink className="w-4 h-4" />
              </div>
            </a>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">Affiliate disclosure: we may earn a small commission from referrals at no extra cost to you.</p>
      </Card>
    </div>
    </>
    );
}
