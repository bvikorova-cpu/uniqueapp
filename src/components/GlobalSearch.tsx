import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: string;
  path: string;
  icon?: string;
}

// Fuzzy search function
const fuzzyMatch = (text: string, query: string): boolean => {
  const pattern = query.toLowerCase().split("").reduce((acc, char) => {
    return acc + ".*" + char;
  }, "");
  const regex = new RegExp(pattern);
  return regex.test(text.toLowerCase());
};

// All searchable pages in the app
const SEARCHABLE_PAGES: SearchResult[] = [
  { id: "1", title: "Domov", category: "Hlavné", path: "/" },
  { id: "2", title: "Nástenka", category: "Sociálne", path: "/wall" },
  { id: "3", title: "Messenger", category: "Komunikácia", path: "/messenger" },
  { id: "4", title: "Dating", category: "Sociálne", path: "/dating" },
  { id: "5", title: "Anonymné rande", category: "Sociálne", path: "/anonymous-date" },
  { id: "6", title: "Hry", category: "Zábava", path: "/games" },
  { id: "7", title: "Brain Duel", category: "Hry", path: "/brain-duel" },
  { id: "8", title: "AI Generátor", category: "AI", path: "/ai-generation" },
  { id: "9", title: "AI Kamarát", category: "AI", path: "/best-friend" },
  { id: "10", title: "AI Mentor", category: "AI", path: "/ai-mentor" },
  { id: "11", title: "AI Spoločníci", category: "AI", path: "/companions" },
  { id: "12", title: "AI Klon", category: "AI", path: "/ai-clone" },
  { id: "13", title: "Beauty Štúdio", category: "AI", path: "/beauty-studio" },
  { id: "14", title: "AI Hudba", category: "AI", path: "/ai-music-producer" },
  { id: "15", title: "AI Tetovanie", category: "AI", path: "/ai-tattoo" },
  { id: "16", title: "Varenie", category: "Jedlo", path: "/cooking" },
  { id: "17", title: "AI Chef", category: "Jedlo", path: "/cooking-ai" },
  { id: "18", title: "Plánovač jedál", category: "Jedlo", path: "/meal-planner" },
  { id: "19", title: "Vzdelávanie", category: "Vzdelávanie", path: "/education" },
  { id: "20", title: "Kurzy", category: "Vzdelávanie", path: "/courses-hub" },
  { id: "21", title: "Marketplace", category: "Obchod", path: "/marketplace" },
  { id: "22", title: "Bazár", category: "Obchod", path: "/bazaar" },
  { id: "23", title: "Aukcie", category: "Obchod", path: "/auction" },
  { id: "24", title: "Práca", category: "Kariéra", path: "/jobs" },
  { id: "25", title: "InfluKing", category: "Influencer", path: "/influ-king" },
  { id: "26", title: "Megatalent", category: "Talent", path: "/megatalent" },
  { id: "27", title: "Psychológ", category: "Zdravie", path: "/psychologist" },
  { id: "28", title: "Prvá pomoc", category: "Zdravie", path: "/first-aid" },
  { id: "29", title: "Fit & Slim", category: "Zdravie", path: "/fit-slim" },
  { id: "30", title: "Wellness", category: "Zdravie", path: "/wellness" },
  { id: "31", title: "Výživa", category: "Zdravie", path: "/nutrition-hub" },
  { id: "32", title: "Dovolenka", category: "Cestovanie", path: "/vacationer" },
  { id: "33", title: "Detský kanál", category: "Deti", path: "/kids-channel" },
  { id: "34", title: "Domáce úlohy", category: "Deti", path: "/kids-homework" },
  { id: "35", title: "Príbehy pre deti", category: "Deti", path: "/kids-story-creator" },
  { id: "36", title: "Omaľovánky", category: "Deti", path: "/coloring-pages" },
  { id: "37", title: "Astrológia", category: "Mystika", path: "/astrology" },
  { id: "38", title: "Denník snov", category: "Mystika", path: "/dream-journal" },
  { id: "39", title: "Minulý život", category: "Mystika", path: "/past-life" },
  { id: "40", title: "Predok dvojča", category: "Mystika", path: "/ancestor-twin" },
  { id: "41", title: "Virtuálny miláčik", category: "Zábava", path: "/virtual-pet" },
  { id: "42", title: "Prekladač zvierat", category: "Zábava", path: "/pet-translator" },
  { id: "43", title: "Starostlivosť o rastliny", category: "Zábava", path: "/plant-care" },
  { id: "44", title: "Káva", category: "Komunita", path: "/coffee" },
  { id: "45", title: "Skill Swap", category: "Komunita", path: "/skill-swap" },
  { id: "46", title: "Referral", category: "Odmeny", path: "/referral" },
  { id: "47", title: "Odmeny", category: "Odmeny", path: "/rewards" },
  { id: "48", title: "Nastavenia", category: "Účet", path: "/settings" },
  { id: "49", title: "Profil", category: "Účet", path: "/profile" },
  { id: "50", title: "Predplatné", category: "Účet", path: "/subscription" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Hlavné": "bg-primary/10 text-primary",
  "Sociálne": "bg-pink-500/10 text-pink-500",
  "Komunikácia": "bg-blue-500/10 text-blue-500",
  "Zábava": "bg-yellow-500/10 text-yellow-500",
  "AI": "bg-purple-500/10 text-purple-500",
  "Jedlo": "bg-orange-500/10 text-orange-500",
  "Vzdelávanie": "bg-green-500/10 text-green-500",
  "Obchod": "bg-emerald-500/10 text-emerald-500",
  "Kariéra": "bg-indigo-500/10 text-indigo-500",
  "Influencer": "bg-rose-500/10 text-rose-500",
  "Talent": "bg-amber-500/10 text-amber-500",
  "Zdravie": "bg-teal-500/10 text-teal-500",
  "Cestovanie": "bg-cyan-500/10 text-cyan-500",
  "Deti": "bg-lime-500/10 text-lime-500",
  "Mystika": "bg-violet-500/10 text-violet-500",
  "Komunita": "bg-sky-500/10 text-sky-500",
  "Odmeny": "bg-fuchsia-500/10 text-fuchsia-500",
  "Účet": "bg-slate-500/10 text-slate-500",
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  // Debounced search
  const performSearch = useCallback((searchQuery: string, category: string | null) => {
    setIsSearching(true);
    
    setTimeout(() => {
      let filtered = SEARCHABLE_PAGES;
      
      if (searchQuery.trim()) {
        filtered = filtered.filter(page => 
          fuzzyMatch(page.title, searchQuery) || 
          fuzzyMatch(page.category, searchQuery) ||
          (page.description && fuzzyMatch(page.description, searchQuery))
        );
      }
      
      if (category) {
        filtered = filtered.filter(page => page.category === category);
      }
      
      setResults(filtered);
      setIsSearching(false);
    }, 150);
  }, []);

  useEffect(() => {
    performSearch(query, selectedCategory);
  }, [query, selectedCategory, performSearch]);

  // Keyboard shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleResultClick = (path: string) => {
    navigate(path);
    setOpen(false);
    setQuery("");
    setSelectedCategory(null);
  };

  const categories = Array.from(new Set(SEARCHABLE_PAGES.map(p => p.category)));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
          aria-label="Hľadať"
        >
          <Search className="h-4 w-4 xl:mr-2" aria-hidden="true" />
          <span className="hidden xl:inline-flex">Hľadať...</span>
          <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[600px]">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Hľadať stránky, funkcie..."
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground border-0 focus-visible:ring-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            aria-label="Vyhľadávací dopyt"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setQuery("")}
              aria-label="Vymazať hľadanie"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Category filters */}
        <div className="flex flex-wrap gap-1 p-2 border-b">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => setSelectedCategory(null)}
          >
            Všetko
          </Badge>
          {categories.slice(0, 8).map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className={cn(
                "cursor-pointer text-xs transition-colors",
                selectedCategory !== cat && CATEGORY_COLORS[cat]
              )}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>

        <ScrollArea className="max-h-[400px]">
          {isSearching ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Žiadne výsledky pre "{query}"
            </div>
          ) : (
            <div className="p-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-accent focus:bg-accent focus:outline-none"
                  onClick={() => handleResultClick(result.path)}
                >
                  <div className="flex-1">
                    <p className="font-medium">{result.title}</p>
                    {result.description && (
                      <p className="text-xs text-muted-foreground">{result.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className={cn("text-xs", CATEGORY_COLORS[result.category])}>
                    {result.category}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="flex items-center justify-between border-t p-2 text-xs text-muted-foreground">
          <span>{results.length} výsledkov</span>
          <div className="flex gap-2">
            <kbd className="rounded border bg-muted px-1.5 py-0.5">↑↓</kbd>
            <span>navigovať</span>
            <kbd className="rounded border bg-muted px-1.5 py-0.5">↵</kbd>
            <span>vybrať</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GlobalSearch;
