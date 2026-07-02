import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Brain, Calendar, Trophy, Swords } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const SHORTCUTS = [
  { id: "test",   label: "IQ Test",        icon: Brain,    color: "from-purple-500 to-pink-500", path: "/iq" },
  { id: "daily",  label: "Daily",          icon: Calendar, color: "from-amber-500 to-orange-500", path: "/iq" },
  { id: "leaderboard", label: "Leaders",   icon: Trophy,   color: "from-yellow-400 to-amber-500", path: "/iq/leaderboard" },
  { id: "friends", label: "1v1 Duels",     icon: Swords,   color: "from-blue-500 to-cyan-500", path: "/iq" },
];

/**
 * Compact in-app mirror of the PWA shortcuts defined in manifest.webmanifest.
 * Also handles ?action= deep-links opened from a homescreen shortcut by
 * scrolling to the matching section.
 */
export default function IQQuickLauncher() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const action = params.get("action");
    if (!action) return;
    const map: Record<string, string> = {
      test: "iq-test-section",
      daily: "iq-daily-section",
      friends: "iq-friends-section",
    };
    const id = map[action];
    if (!id) return;
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [params]);

  return (
    <>
      <FloatingHowItWorks title="How IQQuick Launcher works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="grid grid-cols-4 gap-2 mb-6">
      {SHORTCUTS.map((s) => (
        <Card
          key={s.id}
          role="button"
          tabIndex={0}
          onClick={() => navigate(s.path + (s.path === "/iq" ? `?action=${s.id}` : ""))}
          onKeyDown={(e) => { if (e.key === "Enter") navigate(s.path); }}
          className={`cursor-pointer p-3 flex flex-col items-center justify-center gap-1 bg-gradient-to-br ${s.color} text-white border-0 hover:scale-105 transition-transform`}
        >
          <s.icon className="h-5 w-5" />
          <span className="text-[10px] font-bold leading-tight text-center">{s.label}</span>
        </Card>
      ))}
    </div>
    </>
    );
}
