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
  // Main
  { id: "1", title: "Home", category: "Main", path: "/" },
  { id: "2", title: "Wall", category: "Social", path: "/wall" },
  { id: "3", title: "Messenger", category: "Communication", path: "/messenger" },
  
  // Social & Dating
  { id: "4", title: "Dating", category: "Social", path: "/dating" },
  { id: "5", title: "Anonymous Date", category: "Social", path: "/anonymous-date" },
  
  // Games & Entertainment
  { id: "6", title: "Games", category: "Entertainment", path: "/games" },
  { id: "7", title: "Brain Duel", category: "Games", path: "/brain-duel" },
  { id: "8", title: "Virtual Pet", category: "Entertainment", path: "/virtual-pet" },
  { id: "9", title: "Pet Translator", category: "Entertainment", path: "/pet-translator" },
  
  // AI Services
  { id: "10", title: "AI Generator", category: "AI", path: "/ai-generation" },
  { id: "11", title: "AI Best Friend", category: "AI", path: "/best-friend" },
  { id: "12", title: "AI Mentor", category: "AI", path: "/ai-mentor" },
  { id: "13", title: "AI Companions", category: "AI", path: "/companions" },
  { id: "14", title: "AI Clone", category: "AI", path: "/ai-clone" },
  { id: "15", title: "Beauty Studio", category: "AI", path: "/beauty-studio" },
  { id: "16", title: "AI Music Producer", category: "AI", path: "/ai-music-producer" },
  { id: "17", title: "AI Tattoo Designer", category: "AI", path: "/ai-tattoo" },
  { id: "18", title: "AI Chef", category: "Food", path: "/cooking-ai" },
  { id: "19", title: "Lie Detector", category: "AI", path: "/lie-detector" },
  { id: "20", title: "AI Image Analyzer", category: "AI", path: "/analyzer" },
  
  // Food & Cooking
  { id: "21", title: "Cooking", category: "Food", path: "/cooking" },
  { id: "22", title: "Meal Planner", category: "Food", path: "/meal-planner" },
  
  // Education & Learning
  { id: "23", title: "Education", category: "Education", path: "/education" },
  { id: "24", title: "Courses Hub", category: "Education", path: "/courses-hub" },
  { id: "25", title: "Learning", category: "Education", path: "/learning" },
  
  // Work & Career
  { id: "26", title: "Jobs", category: "Career", path: "/jobs" },
  { id: "27", title: "Work", category: "Career", path: "/work" },
  { id: "28", title: "Fundraising", category: "Career", path: "/fundraising" },
  
  // Marketplace & Commerce
  { id: "29", title: "Marketplace", category: "Commerce", path: "/marketplace" },
  { id: "30", title: "Bazaar", category: "Commerce", path: "/bazaar" },
  { id: "31", title: "Auctions", category: "Commerce", path: "/auction" },
  { id: "32", title: "Secret Santa", category: "Commerce", path: "/secret-santa" },
  
  // Talent & Influencer
  { id: "33", title: "InfluKing", category: "Influencer", path: "/influ-king" },
  { id: "34", title: "Megatalent", category: "Talent", path: "/megatalent" },
  
  // Health & Wellness
  { id: "35", title: "Psychologist", category: "Health", path: "/psychologist" },
  { id: "36", title: "First Aid", category: "Health", path: "/first-aid" },
  { id: "37", title: "Fit & Slim", category: "Health", path: "/fit-slim" },
  { id: "38", title: "Wellness", category: "Health", path: "/wellness" },
  { id: "39", title: "Nutrition Hub", category: "Health", path: "/nutrition-hub" },
  
  // Travel
  { id: "40", title: "Vacationer", category: "Travel", path: "/vacationer" },
  
  // Kids
  { id: "41", title: "Kids Channel", category: "Kids", path: "/kids-channel" },
  { id: "42", title: "Kids Homework", category: "Kids", path: "/kids-homework" },
  { id: "43", title: "Kids Story Creator", category: "Kids", path: "/kids-story-creator" },
  { id: "44", title: "Coloring Pages", category: "Kids", path: "/coloring-pages" },
  
  // Mystical
  { id: "45", title: "Astrology", category: "Mystical", path: "/astrology" },
  { id: "46", title: "Dream Journal", category: "Mystical", path: "/dream-journal" },
  { id: "47", title: "Past Life", category: "Mystical", path: "/past-life" },
  { id: "48", title: "Ancestor Twin", category: "Mystical", path: "/ancestor-twin" },
  
  // Community
  { id: "49", title: "Plant Care", category: "Community", path: "/plant-care" },
  { id: "50", title: "Coffee", category: "Community", path: "/coffee" },
  { id: "51", title: "Skill Swap", category: "Community", path: "/skill-swap" },
  
  // Rewards & Account
  { id: "52", title: "Referral", category: "Rewards", path: "/referral" },
  { id: "53", title: "Rewards", category: "Rewards", path: "/rewards" },
  { id: "54", title: "Settings", category: "Account", path: "/settings" },
  { id: "55", title: "Profile", category: "Account", path: "/profile" },
  { id: "56", title: "Subscription", category: "Account", path: "/subscription" },
  { id: "57", title: "Premium", category: "Account", path: "/premium" },
  
  // Other Services
  { id: "58", title: "Antiques", category: "Commerce", path: "/antiques" },
  { id: "59", title: "Home Decor", category: "Commerce", path: "/home-decor" },
  { id: "60", title: "Confessions", category: "Social", path: "/confessions" },
  { id: "61", title: "Comedy Club", category: "Entertainment", path: "/comedy-club" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Main": "bg-primary/10 text-primary",
  "Social": "bg-pink-500/10 text-pink-500",
  "Communication": "bg-blue-500/10 text-blue-500",
  "Entertainment": "bg-yellow-500/10 text-yellow-500",
  "Games": "bg-amber-500/10 text-amber-500",
  "AI": "bg-purple-500/10 text-purple-500",
  "Food": "bg-orange-500/10 text-orange-500",
  "Education": "bg-green-500/10 text-green-500",
  "Commerce": "bg-emerald-500/10 text-emerald-500",
  "Career": "bg-indigo-500/10 text-indigo-500",
  "Influencer": "bg-rose-500/10 text-rose-500",
  "Talent": "bg-amber-500/10 text-amber-500",
  "Health": "bg-teal-500/10 text-teal-500",
  "Travel": "bg-cyan-500/10 text-cyan-500",
  "Kids": "bg-lime-500/10 text-lime-500",
  "Mystical": "bg-violet-500/10 text-violet-500",
  "Community": "bg-sky-500/10 text-sky-500",
  "Rewards": "bg-fuchsia-500/10 text-fuchsia-500",
  "Account": "bg-slate-500/10 text-slate-500",
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
          aria-label="Search"
        >
          <Search className="h-4 w-4 xl:mr-2" aria-hidden="true" />
          <span className="hidden xl:inline-flex">Search...</span>
          <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[600px]">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search pages, features..."
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground border-0 focus-visible:ring-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            aria-label="Search query"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setQuery("")}
              aria-label="Clear search"
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
            All
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
              No results for "{query}"
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
          <span>{results.length} results</span>
          <div className="flex gap-2">
            <kbd className="rounded border bg-muted px-1.5 py-0.5">↑↓</kbd>
            <span>navigate</span>
            <kbd className="rounded border bg-muted px-1.5 py-0.5">↵</kbd>
            <span>select</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GlobalSearch;
