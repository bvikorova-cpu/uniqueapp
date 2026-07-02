import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, Globe, Heart, AlertTriangle, ExternalLink, Shield, Clock } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const HOTLINES = [
  { country: "International", name: "Crisis Text Line", contact: "Text HOME to 741741", type: "text", available: "24/7", url: "https://www.crisistextline.org" },
  { country: "USA", name: "National Suicide Prevention Lifeline", contact: "988", type: "phone", available: "24/7", url: "https://988lifeline.org" },
  { country: "USA", name: "SAMHSA Helpline", contact: "1-800-662-4357", type: "phone", available: "24/7", url: "https://www.samhsa.gov/find-help/national-helpline" },
  { country: "UK", name: "Samaritans", contact: "116 123", type: "phone", available: "24/7", url: "https://www.samaritans.org" },
  { country: "UK", name: "SHOUT", contact: "Text SHOUT to 85258", type: "text", available: "24/7", url: "https://giveusashout.org" },
  { country: "Canada", name: "Talk Suicide Canada", contact: "1-833-456-4566", type: "phone", available: "24/7", url: "https://talksuicide.ca" },
  { country: "Australia", name: "Lifeline", contact: "13 11 14", type: "phone", available: "24/7", url: "https://www.lifeline.org.au" },
  { country: "EU", name: "European Emergency", contact: "112", type: "phone", available: "24/7", url: "" },
  { country: "Germany", name: "Telefonseelsorge", contact: "0800 111 0 111", type: "phone", available: "24/7", url: "https://online.telefonseelsorge.de" },
  { country: "France", name: "SOS Amitié", contact: "09 72 39 40 50", type: "phone", available: "24/7", url: "https://www.sos-amitie.com" },
  { country: "India", name: "iCall", contact: "9152987821", type: "phone", available: "Mon-Sat 8am-10pm", url: "https://icallhelpline.org" },
  { country: "Japan", name: "TELL Lifeline", contact: "03-5774-0992", type: "phone", available: "24/7", url: "https://telljp.com" },
];

const RESOURCES = [
  { title: "Find a Therapist", desc: "Search for licensed therapists in your area", url: "https://www.psychologytoday.com/us/therapists", icon: Heart },
  { title: "BetterHelp Online Therapy", desc: "Access therapy from anywhere via video, phone, or chat", url: "https://www.betterhelp.com", icon: Globe },
  { title: "NAMI Resources", desc: "National Alliance on Mental Illness support and education", url: "https://www.nami.org", icon: Shield },
  { title: "Mental Health America", desc: "Screening tools and community resources", url: "https://www.mhanational.org", icon: Heart },
];

interface Props { onBack: () => void; }

export const CrisisResources = ({ onBack }: Props) => {
  const [filter, setFilter] = useState<string>("all");

  const countries = ["all", ...Array.from(new Set(HOTLINES.map(h => h.country)))];
  const filtered = filter === "all" ? HOTLINES : HOTLINES.filter(h => h.country === filter);

  return (
    <>
      <FloatingHowItWorks title={"Crisis Resources - How it works"} steps={[{ title: 'Open', desc: 'Access the Crisis Resources section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Crisis Resources.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
          Crisis Resources
        </h2>
        <p className="text-muted-foreground">Emergency hotlines and professional mental health resources worldwide.</p>
      </motion.div>

      {/* Emergency Banner */}
      <Card className="p-4 bg-destructive/10 border-destructive/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-destructive">If you are in immediate danger</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Please call your local emergency number (911, 112, 999) immediately. You are not alone, and help is available.
            </p>
          </div>
        </div>
      </Card>

      {/* Country Filter */}
      <div className="flex flex-wrap gap-2">
        {countries.map(c => (
          <Badge
            key={c}
            variant={filter === c ? "default" : "outline"}
            className="cursor-pointer capitalize"
            onClick={() => setFilter(c)}
          >{c}</Badge>
        ))}
      </div>

      {/* Hotlines */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" /> Crisis Hotlines
        </h3>
        {filtered.map((h, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold">{h.name}</span>
                    <Badge variant="outline" className="text-[10px]">{h.country}</Badge>
                  </div>
                  <p className="text-lg font-black text-primary mt-1">{h.contact}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <Clock className="h-3 w-3" /> {h.available}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] capitalize">{h.type}</Badge>
                  </div>
                </div>
                {h.url && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={h.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Professional Resources */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" /> Professional Resources
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {RESOURCES.map((r, i) => (
            <motion.div key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <a href={r.url} target="_blank" rel="noopener noreferrer">
                <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-colors h-full">
                  <r.icon className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-bold text-sm">{r.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
                </Card>
              </a>
            </motion.div>
          ))}
        </div>
      </div>

      <Card className="p-4 bg-muted/50 border-border/50 text-center">
        <p className="text-xs text-muted-foreground">
          ⚠️ This AI platform is not a substitute for professional mental health care.
          If you are experiencing a mental health crisis, please contact a professional immediately.
        </p>
      </Card>
    </div>
    </>
  );
};
