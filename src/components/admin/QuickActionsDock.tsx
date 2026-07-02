import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Megaphone,
  Download,
  ShieldCheck,
  Banknote,
  Users,
  Sparkles,
  ChevronRight,
  Zap,
} from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const QuickActionsDock = () => {
  const nav = useNavigate();
  const [open, setOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );

  const actions = [
    { icon: ShieldCheck, label: "Verifications", path: "/admin/verifications", color: "from-emerald-500 to-teal-500" },
    { icon: Banknote, label: "Withdrawals", path: "/admin/withdrawals", color: "from-amber-500 to-orange-500" },
    { icon: Megaphone, label: "Broadcast", path: "#broadcast-center", color: "from-fuchsia-500 to-pink-500" },
    { icon: Users, label: "Users", path: "/admin/users", color: "from-cyan-500 to-blue-500" },
    { icon: Download, label: "Earnings", path: "/admin/platform-earnings", color: "from-violet-500 to-indigo-500" },
  ];

  const go = (path: string) => {
    if (path.startsWith("#")) {
      document.querySelector(path)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      nav(path);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Quick Actions Dock - How it works"} steps={[{ title: 'Open', desc: 'Access the Quick Actions Dock section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Quick Actions Dock.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="fixed right-3 bottom-6 z-40 flex flex-col items-end gap-2">
      {open && (
        <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={() => go(a.path)}
              className="group flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-card/90 backdrop-blur-xl border border-primary/30 shadow-xl hover:scale-105 transition-all"
            >
              <span className={`p-1.5 rounded-full bg-gradient-to-br ${a.color}`}>
                <a.icon className="h-3.5 w-3.5 text-white" />
              </span>
              <span className="text-xs font-medium">{a.label}</span>
              <ChevronRight className="h-3 w-3 opacity-50 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-3 rounded-full bg-gradient-to-br from-primary via-purple-500 to-cyan-500 text-white shadow-2xl shadow-primary/40 hover:scale-110 transition-transform"
        aria-label="Quick actions"
      >
        {open ? <Sparkles className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
      </button>
    </div>
    </>
  );
};
