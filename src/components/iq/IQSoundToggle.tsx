import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Volume2 } from "lucide-react";

const KEY = "iq_sound_enabled";

export default function IQSoundToggle() => {
  const [on, setOn] = useState(true);
  useEffect(() => { setOn(localStorage.getItem(KEY) !== "0"); }, []);
  const toggle = (v: boolean) => {
    setOn(v);
    localStorage.setItem(KEY, v ? "1" : "0");
  };
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Volume2 className="w-5 h-5" />Sound Effects</CardTitle></CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className="text-sm">{on ? "Enabled" : "Muted"}</span>
        <Switch checked={on} onCheckedChange={toggle} />
      </CardContent>
    </Card>
  );
}
