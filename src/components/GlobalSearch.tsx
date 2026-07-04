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
  { id: "4", title: "Groups", category: "Social", path: "/wall/groups" },
  { id: "5", title: "Pages", category: "Social", path: "/wall/pages" },
  { id: "6", title: "Stories", category: "Social", path: "/wall" },
  { id: "7", title: "Megaforum", category: "Social", path: "/megaforum" },
  
  // Social & Dating
  { id: "8", title: "Dating", category: "Social", path: "/dating" },
  { id: "9", title: "Anonymous Date", category: "Social", path: "/anonymous-date" },
  { id: "10", title: "Blockchain Confessions", category: "Social", path: "/blockchain-confessions" },
  
  // Games & Entertainment
  { id: "11", title: "Games", category: "Entertainment", path: "/games" },
  { id: "12", title: "Brain Duel", category: "Games", path: "/brain-duel" },
  { id: "13", title: "Virtual Pet", category: "Entertainment", path: "/virtual-pet" },
  { id: "14", title: "Pet Translator", category: "Entertainment", path: "/pet-translator" },
  { id: "15", title: "Character Arena", category: "Games", path: "/character-arena" },
  { id: "16", title: "Virtual Escape Room", category: "Games", path: "/virtual-escape-room" },
  { id: "17", title: "Horse Racing", category: "Games", path: "/horse-racing" },
  { id: "18", title: "GP Racing", category: "Games", path: "/gp-racing" },
  { id: "19", title: "Shadow Arena", category: "Games", path: "/shadow-arena" },
  { id: "20", title: "Comedy Club", category: "Entertainment", path: "/comedy-club" },
  { id: "21", title: "Live Concerts", category: "Entertainment", path: "/live-concerts" },
  { id: "22", title: "Live Stream", category: "Entertainment", path: "/livestream" },
  { id: "23", title: "Mystery Box", category: "Entertainment", path: "/mystery-box" },
  
  // AI Services
  { id: "24", title: "AI Generator", category: "AI", path: "/ai-generation" },
  { id: "25", title: "AI Best Friend", category: "AI", path: "/best-friend" },
  { id: "26", title: "AI Mentor", category: "AI", path: "/ai-mentor" },
  { id: "27", title: "AI Companions", category: "AI", path: "/companions" },
  { id: "28", title: "AI Clone", category: "AI", path: "/ai-clone" },
  { id: "29", title: "Beauty Studio", category: "AI", path: "/beauty-studio" },
  
  { id: "31", title: "AI Tattoo Designer", category: "AI", path: "/ai-tattoo" },
  { id: "32", title: "AI Chef", category: "Food", path: "/cooking-ai" },
  { id: "33", title: "Lie Detector", category: "AI", path: "/lie-detector" },
  { id: "34", title: "AI Image Analyzer", category: "AI", path: "/analyzer" },
  { id: "35", title: "AI Experiences", category: "AI", path: "/ai-experiences" },
  { id: "36", title: "Content Studio", category: "AI", path: "/content-studio" },
  { id: "37", title: "Fashion Studio", category: "AI", path: "/fashion-studio" },
  { id: "38", title: "Home Designer", category: "AI", path: "/home-designer" },
  { id: "39", title: "Photo Restoration", category: "AI", path: "/photo-restoration" },
  { id: "40", title: "Video Ad Generator", category: "AI", path: "/video-ad-generator" },
  { id: "41", title: "Handwriting", category: "AI", path: "/handwriting" },
  { id: "42", title: "Creative Forge", category: "AI", path: "/creative-forge" },
  { id: "43", title: "Recipe Generator", category: "Food", path: "/recipe-generator" },
  { id: "44", title: "Food Scanner", category: "Food", path: "/food-scanner" },
  { id: "45", title: "Restaurant Analyzer", category: "Food", path: "/restaurant-analyzer" },
  { id: "46", title: "Chef Chat", category: "Food", path: "/chef-chat" },
  { id: "47", title: "Wine Pairing", category: "Food", path: "/wine-pairing" },
  { id: "48", title: "IQ Platform", category: "AI", path: "/iq-platform" },
  
  // Food & Cooking
  { id: "49", title: "Cooking", category: "Food", path: "/cooking" },
  { id: "50", title: "Meal Planner", category: "Food", path: "/meal-planner" },
  { id: "51", title: "KitchenStars", category: "Food", path: "/masterchef-subscription" },
  
  // Education & Learning
  { id: "52", title: "Education", category: "Education", path: "/education" },
  { id: "53", title: "Courses Hub", category: "Education", path: "/courses-hub" },
  { id: "54", title: "Premium Courses", category: "Education", path: "/premium-courses" },
  { id: "55", title: "ProClasses", category: "Education", path: "/proclasses" },
  { id: "56", title: "Interactive Workshops", category: "Education", path: "/interactive-workshops" },
  { id: "57", title: "Certification Programs", category: "Education", path: "/certification-programs" },
  { id: "58", title: "Language Learning", category: "Education", path: "/language-learning" },
  { id: "59", title: "Fitness & Wellness", category: "Education", path: "/fitness-wellness" },
  { id: "60", title: "Digital Marketing", category: "Education", path: "/digital-marketing" },
  { id: "61", title: "Photography", category: "Education", path: "/photography" },
  { id: "62", title: "Culinary Arts", category: "Education", path: "/culinary-arts" },
  { id: "63", title: "Music Production", category: "Education", path: "/music-production" },
  { id: "64", title: "Graphic Design", category: "Education", path: "/graphic-design" },
  { id: "65", title: "Public Speaking", category: "Education", path: "/public-speaking" },
  { id: "66", title: "Financial Investment", category: "Education", path: "/financial-investment" },
  { id: "67", title: "Creative Writing", category: "Education", path: "/creative-writing" },
  { id: "68", title: "Tutorial Platform", category: "Education", path: "/tutorial-platform" },
  { id: "69", title: "Generate Courses", category: "Education", path: "/generate-courses" },
  { id: "70", title: "Quiz", category: "Education", path: "/quiz" },
  
  // Work & Career
  { id: "71", title: "Jobs", category: "Career", path: "/jobs" },
  { id: "72", title: "Fundraising", category: "Career", path: "/fundraising" },
  { id: "73", title: "Brand Builder", category: "Career", path: "/brand-builder" },
  { id: "74", title: "Brand Battle", category: "Career", path: "/brand-battle" },
  { id: "75", title: "Sports Predictor", category: "Career", path: "/sports-predictor" },
  { id: "76", title: "Lottery AI", category: "Career", path: "/lottery-ai" },
  { id: "77", title: "Monetization Ideas", category: "Career", path: "/monetization-ideas" },
  
  // Marketplace & Commerce
  { id: "78", title: "Marketplace", category: "Commerce", path: "/marketplace" },
  { id: "79", title: "Bazaar", category: "Commerce", path: "/bazaar" },
  { id: "80", title: "Auctions", category: "Commerce", path: "/auction" },
  { id: "81", title: "Secret Santa", category: "Commerce", path: "/secret-santa" },
  { id: "82", title: "Antique Appraisal", category: "Commerce", path: "/antique-appraisal" },
  { id: "83", title: "Home Decor", category: "Commerce", path: "/home-decor-subscription" },
  { id: "84", title: "Property Marketplace", category: "Commerce", path: "/property-marketplace" },
  { id: "85", title: "Stock Content Library", category: "Commerce", path: "/stock-content-library" },
  { id: "86", title: "Coupon Marketplace", category: "Commerce", path: "/coupon-marketplace" },
  { id: "87", title: "Shop", category: "Commerce", path: "/shop" },
  { id: "88", title: "Collectibles", category: "Commerce", path: "/collectibles" },
  { id: "89", title: "Crystal Marketplace", category: "Commerce", path: "/crystal-marketplace" },
  
  // Talent & Influencer
  { id: "90", title: "InfluKing", category: "Influencer", path: "/influ-king" },
  { id: "91", title: "Megatalent", category: "Talent", path: "/megatalent" },
  { id: "92", title: "Virtual Influencer Agency", category: "Influencer", path: "/virtual-influencer-agency" },
  { id: "93", title: "Membership Community", category: "Influencer", path: "/membership-community" },
  { id: "94", title: "Discover Creators", category: "Influencer", path: "/discover-creators" },
  { id: "95", title: "Become Creator", category: "Influencer", path: "/become-creator" },
  
  // Health & Wellness
  { id: "96", title: "Psychologist", category: "Health", path: "/psychologist" },
  { id: "97", title: "Online Psychologist", category: "Health", path: "/online-psychologist" },
  { id: "98", title: "First Aid", category: "Health", path: "/first-aid" },
  { id: "99", title: "Fit & Slim", category: "Health", path: "/fit-slim" },
  { id: "100", title: "Wellness", category: "Health", path: "/wellness" },
  { id: "101", title: "Nutrition Hub", category: "Health", path: "/nutrition-hub" },
  { id: "102", title: "Safety Prevention", category: "Health", path: "/safety-prevention" },
  
  // Travel
  { id: "103", title: "Vacationer", category: "Travel", path: "/vacationer" },
  
  // Kids
  { id: "104", title: "Kids Channel", category: "Kids", path: "/kids-channel" },
  { id: "105", title: "Kids Homework", category: "Kids", path: "/kids-homework" },
  { id: "106", title: "Kids Story Creator", category: "Kids", path: "/kids-story-creator" },
  { id: "107", title: "Coloring Pages", category: "Kids", path: "/coloring-pages" },
  { id: "108", title: "Kids Science Lab", category: "Kids", path: "/kids-science-lab" },
  { id: "109", title: "Kids Drawing Buddy", category: "Kids", path: "/kids-drawing-buddy" },
  { id: "110", title: "Kids Reading Companion", category: "Kids", path: "/kids-reading-companion" },
  { id: "111", title: "Teen Career Counselor", category: "Kids", path: "/teen-career-counselor" },
  { id: "112", title: "Choose Adventure", category: "Kids", path: "/choose-adventure" },
  { id: "113", title: "Kids Voice Chat", category: "Kids", path: "/kids-voice-chat" },
  { id: "114", title: "Create Character", category: "Kids", path: "/create-character" },
  { id: "115", title: "Character Gallery", category: "Kids", path: "/character-gallery" },
  { id: "116", title: "Character Battle", category: "Kids", path: "/kids-stories/battle" },
  { id: "117", title: "Educational Stories", category: "Kids", path: "/educational-stories" },
  { id: "118", title: "Bedtime Stories", category: "Kids", path: "/bedtime-stories" },
  { id: "119", title: "Story Games", category: "Kids", path: "/story-games" },
  { id: "120", title: "Fairy Castles", category: "Kids", path: "/kids-channel/fairy-castles" },
  
  // Mystical
  { id: "121", title: "Astrology", category: "Mystical", path: "/astrology" },
  { id: "122", title: "Dream Journal", category: "Mystical", path: "/dream-journal" },
  { id: "123", title: "Past Life", category: "Mystical", path: "/past-life" },
  
  { id: "125", title: "Future Face", category: "Mystical", path: "/future-face" },
  
  { id: "127", title: "Reincarnation Social", category: "Mystical", path: "/reincarnation-social" },
  { id: "128", title: "DNA Memory Network", category: "Mystical", path: "/dna-memory-network" },
  { id: "129", title: "Crystal Energy Network", category: "Mystical", path: "/crystal-energy-network" },
  { id: "130", title: "Holographic Avatars", category: "Mystical", path: "/holographic-avatars" },
  { id: "131", title: "Quantum Social", category: "Mystical", path: "/quantum-social" },
  { id: "132", title: "Emotion Economy", category: "Mystical", path: "/emotion-economy" },
  { id: "133", title: "Phobia Trading", category: "Mystical", path: "/phobia-trading" },
  { id: "134", title: "Multiverse Network", category: "Mystical", path: "/multiverse-network" },
  { id: "135", title: "Time Capsule", category: "Mystical", path: "/time-capsule" },
  { id: "136", title: "Time Reversal", category: "Mystical", path: "/time-reversal" },
  
  // Community
  { id: "137", title: "Plant Care", category: "Community", path: "/plant-care" },
  { id: "138", title: "Coffee", category: "Community", path: "/coffee" },
  { id: "139", title: "Skill Swap", category: "Community", path: "/skill-swap" },
  
  // Rewards & Account
  { id: "140", title: "Referral", category: "Rewards", path: "/referral" },
  { id: "141", title: "Rewards", category: "Rewards", path: "/rewards" },
  { id: "142", title: "Earnings", category: "Rewards", path: "/earnings" },
  { id: "143", title: "Settings", category: "Account", path: "/settings" },
  { id: "144", title: "Profile", category: "Account", path: "/profile" },
  { id: "145", title: "Subscription", category: "Account", path: "/subscription" },
  { id: "146", title: "Premium Store", category: "Account", path: "/premium-store" },
  { id: "147", title: "AI Credits Store", category: "Account", path: "/ai-credits-store" },
  { id: "148", title: "Contact", category: "Account", path: "/contact" },
  { id: "149", title: "Terms", category: "Account", path: "/terms" },
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
          variant="ghost" 
          className="relative h-9 w-9 p-0 xl:h-9 xl:w-56 xl:justify-start xl:px-3 xl:py-2 bg-muted/50 hover:bg-muted/80 border border-border/50 rounded-full transition-all duration-200 group"
          aria-label="Search"
        >
          <Search className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors xl:mr-2" aria-hidden="true" />
          <span className="hidden xl:inline-flex text-muted-foreground group-hover:text-foreground transition-colors text-sm">Search services...</span>
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-0.5 rounded-md bg-background/80 border border-border/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground xl:flex shadow-sm">
            <span className="text-[10px]">⌘</span>K
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
