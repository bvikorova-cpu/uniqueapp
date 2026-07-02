import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const BANNERS = [
  { id: "aurora", name: "Aurora", bg: "linear-gradient(135deg, hsl(270 91% 60%), hsl(330 100% 60%))" },
  { id: "ocean", name: "Ocean", bg: "linear-gradient(135deg, hsl(210 90% 50%), hsl(190 95% 55%))" },
  { id: "sunset", name: "Sunset", bg: "linear-gradient(135deg, hsl(30 100% 55%), hsl(350 80% 55%))" },
  { id: "forest", name: "Forest", bg: "linear-gradient(135deg, hsl(150 70% 40%), hsl(90 60% 45%))" },
  { id: "cosmic", name: "Cosmic", bg: "linear-gradient(135deg, hsl(260 80% 30%), hsl(200 90% 45%))" },
  { id: "mono", name: "Mono", bg: "linear-gradient(135deg, hsl(0 0% 15%), hsl(0 0% 35%))" },
];

const KEY = "iq_banner";

export default function IQProfileBanner() {
  const [picked, setPicked] = useState("aurora");
  useEffect(() => { setPicked(localStorage.getItem(KEY) || "aurora"); }, []);

  const choose = (id: string) => {
    setPicked(id);
    localStorage.setItem(KEY, id);
  };

  const current = BANNERS.find(b => b.id === picked) || BANNERS[0];

  return (
    <>
      <FloatingHowItWorks title={"I Q Profile Banner - How it works"} steps={[{ title: 'Open', desc: 'Access the I Q Profile Banner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in I Q Profile Banner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Image className="h-4 w-4 text-primary" /> Profile Banner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-20 rounded-md" style={{ background: current.bg }} />
        <div className="grid grid-cols-3 gap-2">
          {BANNERS.map((b) => (
            <button
              key={b.id}
              onClick={() => choose(b.id)}
              className={`h-10 rounded-md border-2 ${picked === b.id ? "border-primary" : "border-transparent"}`}
              style={{ background: b.bg }}
              title={b.name}
            />
          ))}
        </div>
      </CardContent>
    </Card>
    </>
  );
}
