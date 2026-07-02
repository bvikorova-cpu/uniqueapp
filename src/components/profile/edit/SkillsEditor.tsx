import { useState } from "react";
import { Plus, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export interface Skill {
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
}

interface Props {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

export const SkillsEditor = ({ skills, onChange }: Props) => {
  const [name, setName] = useState("");
  const [level, setLevel] = useState<Skill["level"]>(3);

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...skills, { name: trimmed, level }]);
    setName("");
    setLevel(3);
  };

  const remove = (n: string) => onChange(skills.filter((s) => s.name !== n));
  const setSkillLevel = (n: string, l: Skill["level"]) =>
    onChange(skills.map((s) => (s.name === n ? { ...s, level: l } : s)));

  return (
    <>
      <FloatingHowItWorks title={"Skills Editor - How it works"} steps={[{ title: 'Open', desc: 'Access the Skills Editor section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Skills Editor.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-3">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Label className="text-xs">Skill</Label>
          <Input
            placeholder="e.g. Photography, Public speaking..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && add()}
          />
        </div>
        <div>
          <Label className="text-xs">Level</Label>
          <div className="flex gap-0.5 h-10 items-center px-2 rounded-md border border-input bg-background">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setLevel(n as Skill["level"])}
                className={`p-0.5 transition-colors ${n <= level ? "text-amber-400" : "text-muted-foreground/40"}`}
              >
                <Star className="h-4 w-4" fill={n <= level ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </div>
        <Button onClick={add} size="icon" variant="outline">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {skills.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No skills yet — add one to showcase your expertise.</p>
        )}
        {skills.map((s) => (
          <div key={s.name} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-muted/20 border border-border/40">
            <span className="text-sm font-medium truncate">{s.name}</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSkillLevel(s.name, n as Skill["level"])}
                  className={`transition-colors ${n <= s.level ? "text-amber-400" : "text-muted-foreground/30"}`}
                >
                  <Star className="h-3.5 w-3.5" fill={n <= s.level ? "currentColor" : "none"} />
                </button>
              ))}
              <Button size="icon" variant="ghost" className="h-7 w-7 ml-1" onClick={() => remove(s.name)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};
