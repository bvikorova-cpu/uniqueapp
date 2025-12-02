import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Loader2 } from "lucide-react";

interface PastLifeFormProps {
  onSubmit: (data: any) => void;
  isAnalyzing: boolean;
}

export const PastLifeForm = ({ onSubmit, isAnalyzing }: PastLifeFormProps) => {
  const [birthDate, setBirthDate] = useState("");
  const [dreamsDejavu, setDreamsDejavu] = useState("");
  const [talentsPhobias, setTalentsPhobias] = useState("");
  const [readingType, setReadingType] = useState("full");
  const [partnerBirthDate, setPartnerBirthDate] = useState("");
  const [partnerInfo, setPartnerInfo] = useState("");

  const handleSubmit = () => {
    if (!birthDate) return;
    
    onSubmit({
      birthDate,
      dreamsDejavu: dreamsDejavu || undefined,
      talentsPhobias: talentsPhobias || undefined,
      readingType,
      partnerBirthDate: readingType === 'soulmate' ? partnerBirthDate : undefined,
      partnerInfo: readingType === 'soulmate' ? partnerInfo : undefined,
    });
  };

  const readingTypes = [
    {
      value: "basic",
      label: "Basic Reading",
      cost: 5,
      description: "1 past life story with karmic lessons",
    },
    {
      value: "full",
      label: "Full Reading",
      cost: 15,
      description: "3 past lives with AI illustrations",
    },
    {
      value: "soulmate",
      label: "Soul Mate Connection",
      cost: 20,
      description: "Partner analysis + past life connections",
    },
  ];

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">Discover Your Past Lives</h2>

      <div className="space-y-6">
        <div>
          <Label htmlFor="birthDate">Your Birth Date *</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="dreams">Dreams & Déjà Vu Experiences (Optional)</Label>
          <Textarea
            id="dreams"
            placeholder="Describe any recurring dreams, vivid historical visions, or strong déjà vu moments..."
            value={dreamsDejavu}
            onChange={(e) => setDreamsDejavu(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="talents">Unusual Talents or Phobias (Optional)</Label>
          <Textarea
            id="talents"
            placeholder="Any unexplained skills, natural talents, or irrational fears..."
            value={talentsPhobias}
            onChange={(e) => setTalentsPhobias(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label className="mb-3 block">Reading Type</Label>
          <RadioGroup value={readingType} onValueChange={setReadingType}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {readingTypes.map((type) => (
                <Card
                  key={type.value}
                  className={`p-4 cursor-pointer transition-all ${
                    readingType === type.value
                      ? "border-indigo-500 border-2"
                      : ""
                  }`}
                  onClick={() => setReadingType(type.value)}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <div className="flex-1">
                      <Label htmlFor={type.value} className="cursor-pointer">
                        <div className="font-semibold text-sm">{type.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {type.description}
                        </div>
                        <div className="text-sm font-bold text-indigo-500 mt-2">
                          {type.cost} Credits
                        </div>
                      </Label>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </RadioGroup>
        </div>

        {readingType === 'soulmate' && (
          <>
            <div>
              <Label htmlFor="partnerBirthDate">Partner's Birth Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="partnerBirthDate"
                  type="date"
                  value={partnerBirthDate}
                  onChange={(e) => setPartnerBirthDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="partnerInfo">About Your Partner (Optional)</Label>
              <Textarea
                id="partnerInfo"
                placeholder="Any details about your partner's personality, interests, or relationship dynamics..."
                value={partnerInfo}
                onChange={(e) => setPartnerInfo(e.target.value)}
                rows={3}
              />
            </div>
          </>
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
              Unveiling Your Past...
            </>
          ) : (
            "Reveal My Past Lives"
          )}
        </Button>
      </div>
    </Card>
  );
};