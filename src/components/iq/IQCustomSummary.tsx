import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function IQCustomSummary() {
  const [data, setData] = useState({ avatar: "", theme: "", title: "", banner: "", frame: "", nick: "", bio: "", sound: true });
  useEffect(() => {
    setData({
      avatar: localStorage.getItem("iq_avatar") || "—",
      theme: localStorage.getItem("iq_theme_accent") || "—",
      title: localStorage.getItem("iq_title") || "—",
      banner: localStorage.getItem("iq_banner") || "—",
      frame: localStorage.getItem("iq_frame") || "none",
      nick: localStorage.getItem("iq_nickname") || "—",
      bio: localStorage.getItem("iq_bio") || "—",
      sound: localStorage.getItem("iq_sound_enabled") !== "0",
    });
  }, []);
  const items = [
    ["Avatar", data.avatar], ["Theme", data.theme], ["Title", data.title],
    ["Banner", data.banner], ["Frame", data.frame], ["Nickname", data.nick],
    ["Bio", data.bio.slice(0, 30) + (data.bio.length > 30 ? "..." : "")], ["Sound", data.sound ? "On" : "Off"],
  ];
  return (
    <>
      <FloatingHowItWorks title="How IQCustom Summary works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5" />Customization Summary</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {items.map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-border/40 py-1">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-medium truncate ml-2">{v}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
    );
}
