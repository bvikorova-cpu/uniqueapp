import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPen } from "lucide-react";
import { toast } from "sonner";

const KEY = "iq_nickname";

export default function IQNicknameEditor() {
  const [name, setName] = useState("");
  const [current, setCurrent] = useState("");
  useEffect(() { setCurrent(localStorage.getItem(KEY) || ""); }, []);
  const save = () {
    const v = name.trim().slice(0, 20);
    if (!v) return;
    localStorage.setItem(KEY, v);
    setCurrent(v);
    setName("");
    toast.success("Nickname saved");
  };
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><UserPen className="w-5 h-5" />Nickname</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">Current: <strong>{current || "—"}</strong></p>
        <div className="flex gap-2">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="New nickname" maxLength={20} />
          <Button onClick={save}>Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}
