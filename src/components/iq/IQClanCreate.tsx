import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";
import { toast } from "sonner";

const KEY = "iq_clan_name";

export default function IQClanCreate() {
  const [name, setName] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => { setSaved(localStorage.getItem(KEY)); }, []);

  const create = () => {
    if (name.trim().length < 3) return toast.error("Min 3 characters");
    localStorage.setItem(KEY, name.trim());
    setSaved(name.trim());
    setName("");
    toast.success(`Clan "${name.trim()}" created!`);
  };

  const leave = () => {
    localStorage.removeItem(KEY);
    setSaved(null);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-4 w-4 text-primary" /> Clan Create
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {saved ? (
          <div className="space-y-2">
            <div className="text-sm">Your clan: <span className="text-primary font-semibold">{saved}</span></div>
            <Button onClick={leave} variant="outline" size="sm" className="w-full">Leave Clan</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Clan name" />
            <Button onClick={create}>Create</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
