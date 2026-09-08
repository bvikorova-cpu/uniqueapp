import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Heart, Brain, Smile, Activity, Baby, Building2, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

// Healthcare use runs on the unified AI credits wallet — no separate subscriptions.
const packs = [
  { id: "pediatric_mini", name: "Pediatric Mini", credits: 3, icon: Baby, description: "For small practices (1-2 doctors)", features: ["10 therapeutic pages", "Child-friendly themes", "Print-ready PDF format"] },
  { id: "pediatric_standard", name: "Pediatric Standard", credits: 5, icon: Smile, description: "Perfect for pediatricians", features: ["20 therapeutic pages", "All child-friendly themes", "Anxiety-reducing content"] },
  { id: "therapy_professional", name: "Art Therapy Professional", credits: 15, icon: Brain, description: "For psychologists with multiple clients", features: ["60 therapeutic pages", "Trauma-informed designs", "ADHD & autism specialized", "Session tracking"] },
  { id: "clinic_premium", name: "Clinic Premium", credits: 25, icon: Building2, description: "Complete solution for clinics", features: ["120 therapeutic pages", "Multi-location friendly", "Custom content requests", "Priority generation"] },
];

export function HealthcareTab() {
  const navigate = useNavigate();

  return (
    <>
      <FloatingHowItWorks title={"Healthcare - How it works"} steps={[{ title: 'Get credits', desc: 'Top up your credits once at AI Credits.' }, { title: 'Pick a pack', desc: 'Each pack costs credits, no subscription.' }, { title: 'Generate', desc: 'Therapeutic coloring pages are created for your practice.' }, { title: 'Print', desc: 'Download print-ready PDFs for your patients.' }]} />
      <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <Badge className="mb-4" variant="secondary"><Heart className="w-4 h-4 mr-2" />For Healthcare & Therapy Professionals</Badge>
        <h2 className="text-4xl font-bold mb-4">Healthcare Coloring Solutions</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
          Therapeutic coloring pages designed to reduce anxiety and support mental health in clinical settings.
          Everything runs on credits — no subscription needed.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button onClick={() => navigate('/ai-credits')}>
            <Coins className="w-4 h-4 mr-2" /> Get credits
          </Button>
          <Button variant="outline" onClick={() => navigate('/healthcare-provider-dashboard')}>
            <Activity className="w-4 h-4 mr-2" /> Provider Dashboard
          </Button>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packs.map((plan, i) => (
          <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={`backdrop-blur-xl bg-card/80 hover:shadow-lg hover:shadow-primary/5 transition-all hover:-translate-y-1 ${
              plan.id === "therapy_professional" ? "border-2 border-primary" : "border-border/30 hover:border-primary/30"
            }`}>
              <CardHeader>
                {plan.id === "therapy_professional" && <Badge className="w-fit mb-2">Most Popular</Badge>}
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-2">
                  <plan.icon className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold flex items-center gap-2"><Coins className="w-6 h-6 text-primary" />{plan.credits}</p>
                  <p className="text-sm text-muted-foreground">credits per pack</p>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
}
