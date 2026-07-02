import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, GitBranch } from "lucide-react";
import { useMultiPersonProfile } from "@/hooks/useLieDetectorTuning";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type Person = { name: string; messages: string };

export const MultiPersonProfileCard = () => {
  const [title, setTitle] = useState("");
  const [people, setPeople] = useState<Person[]>([
    { name: "Person A", messages: "" },
    { name: "Person B", messages: "" },
  ]);
  const mp = useMultiPersonProfile();
  const r = mp.data?.results;

  const addPerson = () => people.length < 3 && setPeople([...people, { name: `Person ${String.fromCharCode(65 + people.length)}`, messages: "" }]);
  const removePerson = (i: number) => people.length > 2 && setPeople(people.filter((_, idx) => idx !== i));
  const update = (i: number, key: keyof Person, val: string) =>
    setPeople(people.map((p, idx) => (idx === i ? { ...p, [key]: val } : p)));

  const submit = () => {
    const payload = people.map((p) => ({
      name: p.name.trim() || "Unknown",
      messages: p.messages.split("\n").map((m) => m.trim()).filter(Boolean),
    }));
    if (payload.some((p) => p.messages.length === 0)) return;
    mp.mutate({ title: title || undefined, people: payload });
  };

  return (
    <>
      <FloatingHowItWorks title={"Multi Person Profile Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Multi Person Profile Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Multi Person Profile Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-br from-purple-950/40 via-card/80 to-red-950/30 border-purple-500/30 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-300" />
          Multi-Person Profile
          <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/40 text-[10px]">20 cr</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">Compare deception across 2-3 people. Get a relationship map.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Map title (optional)"
          className="bg-background/40 border-purple-500/20"
        />
        {people.map((p, i) => (
          <div key={i} className="p-2 rounded-lg bg-background/30 border border-purple-500/20 space-y-2">
            <div className="flex gap-2 items-center">
              <Input
                value={p.name}
                onChange={(e) => update(i, "name", e.target.value)}
                placeholder="Name"
                className="h-8 bg-background/50 border-purple-500/20 text-sm"
              />
              {people.length > 2 && (
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removePerson(i)}>
                  <Trash2 className="w-3 h-3 text-red-400" />
                </Button>
              )}
            </div>
            <Textarea
              value={p.messages}
              onChange={(e) => update(i, "messages", e.target.value)}
              placeholder="One message per line..."
              className="min-h-[70px] bg-background/50 border-purple-500/20 text-xs font-mono"
            />
          </div>
        ))}
        {people.length < 3 && (
          <Button variant="outline" size="sm" onClick={addPerson} className="w-full border-purple-500/30 text-purple-200">
            <Plus className="w-3 h-3 mr-1" /> Add 3rd Person
          </Button>
        )}
        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700"
          disabled={mp.isPending}
          onClick={submit}
        >
          <GitBranch className="w-4 h-4 mr-2" />
          {mp.isPending ? "Mapping..." : "Generate Relationship Map"}
        </Button>

        {r && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 pt-2 border-t border-purple-500/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {r.people_scores?.map((p: any, i: number) => (
                <div key={i} className="p-2 rounded bg-purple-500/10 border border-purple-500/30">
                  <p className="text-xs font-bold text-purple-100">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">Trust: {p.truthfulness}/100 · Manip: {p.manipulation}/100</p>
                  <p className="text-[10px] text-amber-300 mt-1">{p.dominant_trait}</p>
                </div>
              ))}
            </div>
            {r.most_likely_lying && (
              <div className="text-xs p-2 rounded bg-red-500/10 border border-red-500/30">
                <span className="text-red-300 font-mono uppercase text-[10px]">Most Likely Lying:</span> <span className="text-red-100 font-bold">{r.most_likely_lying}</span>
              </div>
            )}
            {r.most_trustworthy && (
              <div className="text-xs p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-emerald-300 font-mono uppercase text-[10px]">Most Trustworthy:</span> <span className="text-emerald-100 font-bold">{r.most_trustworthy}</span>
              </div>
            )}
            {r.relationship_dynamics && (
              <p className="text-xs text-muted-foreground italic">{r.relationship_dynamics}</p>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
