import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen } from "lucide-react";

const KEY = "iq_study_groups";

export default function IQStudyGroup() {
  const [name, setName] = useState("");
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    try { setGroups(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {}
  }, []);

  const join = () => {
    if (!name.trim() || groups.includes(name.trim())) return;
    const next = [...groups, name.trim()];
    setGroups(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setName("");
  };

  const leave = (g: string) => {
    const next = groups.filter(x => x !== g);
    setGroups(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-4 w-4 text-primary" /> Study Groups
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" />
          <Button onClick={join} size="sm">Join</Button>
        </div>
        {groups.map((g) => (
          <div key={g} className="flex justify-between items-center text-sm border-b border-border/40 pb-1">
            <span>{g}</span>
            <Button size="sm" variant="ghost" onClick={() => leave(g)}>Leave</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
