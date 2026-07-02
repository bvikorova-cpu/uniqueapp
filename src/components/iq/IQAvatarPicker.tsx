import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const AVATARS = ["🧠", "🦊", "🐺", "🦉", "🐉", "🦅", "🐸", "🦄", "🐲", "🤖", "👾", "🦾"];
const KEY = "iq_avatar";

export default function IQAvatarPicker() {
  const [picked, setPicked] = useState("🧠");
  useEffect(() => { setPicked(localStorage.getItem(KEY) || "🧠"); }, []);

  const choose = (a: string) => {
    setPicked(a);
    localStorage.setItem(KEY, a);
  };

  return (
    <>
      <FloatingHowItWorks title="How IQAvatar Picker works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4 text-primary" /> Avatar Picker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => choose(a)}
              className={`text-2xl p-2 rounded-md border ${picked === a ? "border-primary bg-primary/20" : "border-border/40 hover:border-primary/50"}`}
            >
              {a}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
    );
}
