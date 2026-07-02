import { useEffect, useState } from "react";
import { Search, BookOpen, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export interface LegalSection {
  id: string;
  title: string;
  wordCount?: number;
}

interface LegalSidebarProps {
  sections: LegalSection[];
  totalWords: number;
}

export const LegalSidebar = ({ sections, totalWords }: LegalSidebarProps) => {
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const readMinutes = Math.max(1, Math.ceil(totalWords / 220));

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.round((window.scrollY / docHeight) * 100)) : 0;
      setProgress(pct);

      // scroll spy
      let current = "";
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 120) current = s.id;
      }
      if (current) setActiveId(current);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const filtered = search
    ? sections.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()))
    : sections;

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <aside className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] w-full lg:w-72 shrink-0">
      <div className="bg-card/80 backdrop-blur-md border border-amber-400/20 rounded-2xl p-4 shadow-xl shadow-amber-500/5 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-sm">Table of Contents</h3>
        </div>

        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>~{readMinutes} min read · {progress}% done</span>
        </div>

        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
          <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search sections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 h-8 text-xs bg-background/50 border-amber-400/20"
          />
        </div>

        <ScrollArea className="flex-1 -mr-2 pr-2">
          <ul className="space-y-1">
            {filtered.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => jump(s.id)}
                  className={`w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors ${
                    activeId === s.id
                      ? "bg-amber-500/15 text-amber-300 font-semibold border-l-2 border-amber-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {s.title}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="text-xs text-muted-foreground italic px-2 py-1">No matches.</li>
            )}
          </ul>
        </ScrollArea>
      </div>
    </aside>
  );
};
