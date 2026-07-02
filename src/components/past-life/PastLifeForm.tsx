import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2, Sparkles, Clock, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface PastLifeFormProps {
  onSubmit: (data: any) => void;
  isAnalyzing: boolean;
  defaultReadingType?: string;
}

const readingTypes = [
  {
    value: "basic",
    label: "Basic Reading",
    cost: 5,
    description: "1 past life story with karmic lessons",
    icon: Clock,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    value: "full",
    label: "Full Reading",
    cost: 15,
    description: "3 past lives with AI illustrations",
    icon: Sparkles,
    gradient: "from-primary to-accent",
  },
  {
    value: "soulmate",
    label: "Soul Mate Connection",
    cost: 20,
    description: "Partner analysis + past life connections",
    icon: Heart,
    gradient: "from-pink-500 to-rose-500",
  },
];

const examplePrompts = [
  "I often dream of medieval castles and knights...",
  "I have an unexplained fear of deep water since childhood...",
  "I feel an inexplicable connection to ancient Japanese culture...",
];

export const PastLifeForm = ({ onSubmit, isAnalyzing, defaultReadingType }: PastLifeFormProps) => {
  const [birthDate, setBirthDate] = useState("");
  const [dreamsDejavu, setDreamsDejavu] = useState("");
  const [talentsPhobias, setTalentsPhobias] = useState("");
  const [readingType, setReadingType] = useState(defaultReadingType || "full");
  const [partnerBirthDate, setPartnerBirthDate] = useState("");
  const [partnerInfo, setPartnerInfo] = useState("");

  const handleSubmit = () => {
    if (!birthDate) return;
    onSubmit({
      birthDate,
      dreamsDejavu: dreamsDejavu || undefined,
      talentsPhobias: talentsPhobias || undefined,
      readingType,
      partnerBirthDate: readingType === "soulmate" ? partnerBirthDate : undefined,
      partnerInfo: readingType === "soulmate" ? partnerInfo : undefined,
    });
  };

  const selectedType = readingTypes.find(t => t.value === readingType);

  return (
    <>
      <FloatingHowItWorks
        title='Past Life Form'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Past Life Form panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden bg-gradient-to-br from-card/90 via-card/80 to-primary/5 backdrop-blur-xl border-border/50 relative">
        {/* Mystical decorative orbs */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className={`h-1.5 bg-gradient-to-r ${selectedType?.gradient || "from-primary to-accent"}`} />
        <div className="p-5 sm:p-8 space-y-6 relative">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-wider uppercase mb-2">
              ✨ Soul Reading Portal
            </div>
            <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Discover Your Past Lives
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Fill in your details to unlock the mysteries of your soul's journey
            </p>
          </div>

          {/* Reading Type Selector */}
          <div>
            <Label className="mb-3 block text-sm font-semibold">Reading Type</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {readingTypes.map((type) => (
                <div
                  key={type.value}
                  onClick={() => setReadingType(type.value)}
                  className={`relative p-4 rounded-xl cursor-pointer transition-all border ${
                    readingType === type.value
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-border/50 bg-muted/10 hover:border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <type.icon className={`h-4 w-4 ${readingType === type.value ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-semibold text-sm">{type.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                  <Badge variant="secondary" className="mt-2 text-[10px]">{type.cost} Credits</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Birth Date */}
          <div>
            <Label htmlFor="birthDate" className="text-sm font-semibold">Your Birth Date *</Label>
            <div className="relative mt-1.5">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="pl-10 bg-muted/10 border-border/50"
                required
              />
            </div>
          </div>

          {/* Dreams */}
          <div>
            <Label htmlFor="dreams" className="text-sm font-semibold">Dreams & Déjà Vu Experiences</Label>
            <p className="text-xs text-muted-foreground mb-2">Optional — helps create more accurate readings</p>
            <Textarea
              id="dreams"
              placeholder="Describe any recurring dreams, vivid historical visions, or strong déjà vu moments..."
              value={dreamsDejavu}
              onChange={(e) => setDreamsDejavu(e.target.value)}
              rows={3}
              className="bg-muted/10 border-border/50"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {examplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setDreamsDejavu(p)}
                  className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {p.slice(0, 40)}...
                </button>
              ))}
            </div>
          </div>

          {/* Talents */}
          <div>
            <Label htmlFor="talents" className="text-sm font-semibold">Unusual Talents or Phobias</Label>
            <p className="text-xs text-muted-foreground mb-2">Optional — unexplained skills or irrational fears</p>
            <Textarea
              id="talents"
              placeholder="Any unexplained skills, natural talents, or irrational fears..."
              value={talentsPhobias}
              onChange={(e) => setTalentsPhobias(e.target.value)}
              rows={3}
              className="bg-muted/10 border-border/50"
            />
          </div>

          {/* Soulmate Fields */}
          {readingType === "soulmate" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 p-4 rounded-xl bg-pink-500/5 border border-pink-500/20"
            >
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500" />
                Partner Details
              </h3>
              <div>
                <Label htmlFor="partnerBirthDate" className="text-sm">Partner's Birth Date</Label>
                <div className="relative mt-1.5">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="partnerBirthDate"
                    type="date"
                    value={partnerBirthDate}
                    onChange={(e) => setPartnerBirthDate(e.target.value)}
                    className="pl-10 bg-muted/10 border-border/50"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="partnerInfo" className="text-sm">About Your Partner (Optional)</Label>
                <Textarea
                  id="partnerInfo"
                  placeholder="Personality, interests, or relationship dynamics..."
                  value={partnerInfo}
                  onChange={(e) => setPartnerInfo(e.target.value)}
                  rows={3}
                  className="bg-muted/10 border-border/50"
                />
              </div>
            </motion.div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!birthDate || isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Unveiling Your Past Lives...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Reveal My Past Lives — {selectedType?.cost || 15} Credits
              </>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
    </>
  );
};
