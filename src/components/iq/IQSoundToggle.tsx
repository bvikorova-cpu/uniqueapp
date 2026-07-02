import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Volume2 } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_sound_enabled";

export default function IQSoundToggle() {
  const [on, setOn] = useState(true);
  useEffect(() => { setOn(localStorage.getItem(KEY) !== "0"); }, []);
  const toggle = (v: boolean) => {
    setOn(v);
    localStorage.setItem(KEY, v ? "1" : "0");
  };
  return (
    <>
      <FloatingHowItWorks title="How IQSound Toggle works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Volume2 className="w-5 h-5" />Sound Effects</CardTitle></CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className="text-sm">{on ? "Enabled" : "Muted"}</span>
        <Switch checked={on} onCheckedChange={toggle} />
      </CardContent>
    </Card>
    </>
    );
}
