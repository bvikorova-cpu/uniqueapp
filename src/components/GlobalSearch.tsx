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

// All searchable pages in the app - only pages that exist in App.tsx routes
const SEARCHABLE_PAGES: SearchResult[] = [
  // Main
  { id: "1", title: "Home", category: "Main", path: "/" },
  { id: "2", title: "Wall", category: "Social", path: "/wall" },
  { id: "3", title: "Messenger", category: "Communication", path: "/messenger" },
  { id: "4", title: "Groups", category: "Social", path: "/wall/groups" },
  { id: "5", title: "Pages", category: "Social", path: "/wall/pages" },
  { id: "6", title: "Megaforum", category: "Social", path: "/megaforum" },
  
  // Social & Dating
  { id: "7", title: "Dating", category: "Social", path: "/dating" },
  { id: "8", title: "Anonymous Date", category: "Social", path: "/anonymous-date" },
  { id: "9", title: "Blockchain Confessions", category: "Social", path: "/blockchain-confessions" },
  
  // Games & Entertainment
  { id: "10", title: "Games", category: "Entertainment", path: "/games" },
  { id: "11", title: "Brain Duel", category: "Games", path: "/brain-duel" },
  { id: "12", title: "Virtual Pet", category: "Entertainment", path: "/virtual-pet" },
  { id: "13", title: "Pet Translator", category: "Entertainment", path: "/pet-translator" },
  { id: "14", title: "Character Arena", category: "Games", path: "/character-arena" },
  { id: "15", title: "Virtual Escape Room", category: "Games", path: "/virtual-escape-room" },
  { id: "16", title: "Horse Racing", category: "Games", path: "/horse-racing" },
  { id: "17", title: "F1 Racing", category: "Games", path: "/f1-racing" },
  { id: "18", title: "Shadow Arena", category: "Games", path: "/shadow-arena" },
  { id: "19", title: "Comedy Club", category: "Entertainment", path: "/comedy-club" },
  { id: "20", title: "Live Concerts", category: "Entertainment", path: "/live-concerts" },
  { id: "21", title: "Live Stream", category: "Entertainment", path: "/livestream" },
  { id: "22", title: "Mystery Box", category: "Entertainment", path: "/mystery-box" },
  
  // AI Services
  { id: "23", title: "AI Generator", category: "AI", path: "/ai-generation" },
  { id: "24", title: "AI Best Friend", category: "AI", path: "/best-friend" },
  { id: "25", title: "AI Mentor", category: "AI", path: "/ai-mentor" },
  { id: "26", title: "AI Companions", category: "AI", path: "/companions" },
  { id: "27", title: "AI Clone", category: "AI", path: "/ai-clone" },
  { id: "28", title: "Beauty Studio", category: "AI", path: "/beauty-studio" },
  { id: "29", title: "AI Music Producer", category: "AI", path: "/ai-music-producer" },
  { id: "30", title: "AI Tattoo Designer", category: "AI", path: "/ai-tattoo" },
  { id: "31", title: "AI Chef", category: "Food", path: "/cooking-ai" },
  { id: "32", title: "Lie Detector", category: "AI", path: "/lie-detector" },
  { id: "33", title: "AI Image Analyzer", category: "AI", path: "/analyzer" },
  { id: "34", title: "AI Experiences", category: "AI", path: "/ai-experiences" },
  { id: "35", title: "Content Studio", category: "AI", path: "/content-studio" },
  { id: "36", title: "Fashion Studio", category: "AI", path: "/fashion-studio" },
  { id: "37", title: "Home Designer", category: "AI", path: "/home-designer" },
  { id: "38", title: "Photo Restoration", category: "AI", path: "/photo-restoration" },
  { id: "39", title: "Video Ad Generator", category: "AI", path: "/video-ad-generator" },
  { id: "40", title: "Handwriting", category: "AI", path: "/handwriting" },
  { id: "41", title: "Creative Forge", category: "AI", path: "/creative-forge" },
  { id: "42", title: "Recipe Generator", category: "Food", path: "/recipe-generator" },
  { id: "43", title: "Food Scanner", category: "Food", path: "/food-scanner" },
  { id: "44", title: "Restaurant Analyzer", category: "Food", path: "/restaurant-analyzer" },
  { id: "45", title: "Chef Chat", category: "Food", path: "/chef-chat" },
  { id: "46", title: "Wine Pairing", category: "Food", path: "/wine-pairing" },
  { id: "47", title: "IQ Platform", category: "AI", path: "/iq-platform" },
  
  // Food & Cooking
  { id: "48", title: "Cooking", category: "Food", path: "/cooking" },
  { id: "49", title: "Meal Planner", category: "Food", path: "/meal-planner" },
  { id: "50", title: "MasterChef", category: "Food", path: "/masterchef-subscription" },
  
  // Education & Learning
  { id: "51", title: "Education", category: "Education", path: "/education" },
  { id: "52", title: "Premium Courses", category: "Education", path: "/premium-courses" },
  { id: "53", title: "Masterclasses", category: "Education", path: "/masterclasses" },
  { id: "54", title: "Interactive Workshops", category: "Education", path: "/interactive-workshops" },
  { id: "55", title: "Certification Programs", category: "Education", path: "/certification-programs" },
  { id: "56", title: "Language Learning", category: "Education", path: "/language-learning" },
  { id: "57", title: "Fitness & Wellness", category: "Education", path: "/fitness-wellness" },
  { id: "58", title: "Digital Marketing", category: "Education", path: "/digital-marketing" },
  { id: "59", title: "Photography", category: "Education", path: "/photography" },
  { id: "60", title: "Culinary Arts", category: "Education", path: "/culinary-arts" },
  { id: "61", title: "Music Production", category: "Education", path: "/music-production" },
  { id: "62", title: "Graphic Design", category: "Education", path: "/graphic-design" },
  { id: "63", title: "Public Speaking", category: "Education", path: "/public-speaking" },
  { id: "64", title: "Financial Investment", category: "Education", path: "/financial-investment" },
  { id: "65", title: "Creative Writing", category: "Education", path: "/creative-writing" },
  { id: "66", title: "Tutorial Platform", category: "Education", path: "/tutorial-platform" },
  { id: "67", title: "Generate Courses", category: "Education", path: "/generate-courses" },
  { id: "68", title: "Quiz", category: "Education", path: "/quiz" },
  
  // Work & Career
  { id: "69", title: "Jobs", category: "Career", path: "/jobs" },
  { id: "70", title: "Fundraising", category: "Career", path: "/fundraising" },
  { id: "71", title: "Brand Builder", category: "Career", path: "/brand-builder" },
  { id: "72", title: "Brand Battle", category: "Career", path: "/brand-battle" },
  { id: "73", title: "Lottery AI", category: "Career", path: "/lottery-ai" },
  { id: "74", title: "Monetization Ideas", category: "Career", path: "/monetization-ideas" },
  
  // Marketplace & Commerce
  { id: "75", title: "Marketplace", category: "Commerce", path: "/marketplace" },
  { id: "76", title: "Bazaar", category: "Commerce", path: "/bazaar" },
  { id: "77", title: "Auctions", category: "Commerce", path: "/auction" },
  { id: "78", title: "Secret Santa", category: "Commerce", path: "/secret-santa" },
  { id: "79", title: "Antique Appraisal", category: "Commerce", path: "/antique-appraisal" },
  { id: "80", title: "Home Decor", category: "Commerce", path: "/home-decor-subscription" },
  { id: "81", title: "Property Marketplace", category: "Commerce", path: "/property-marketplace" },
  { id: "82", title: "Stock Content Library", category: "Commerce", path: "/stock-content-library" },
  { id: "83", title: "Coupon Marketplace", category: "Commerce", path: "/coupon-marketplace" },
  { id: "84", title: "Shop", category: "Commerce", path: "/shop" },
  { id: "85", title: "Collectibles", category: "Commerce", path: "/collectibles" },
  { id: "86", title: "Crystal Marketplace", category: "Commerce", path: "/crystal-marketplace" },
  
  // Talent & Influencer
  { id: "87", title: "InfluKing", category: "Influencer", path: "/influ-king" },
  { id: "88", title: "Megatalent", category: "Talent", path: "/megatalent" },
  { id: "89", title: "Virtual Influencer Agency", category: "Influencer", path: "/virtual-influencer-agency" },
  { id: "90", title: "Membership Community", category: "Influencer", path: "/membership-community" },
  { id: "91", title: "Discover Creators", category: "Influencer", path: "/discover-creators" },
  { id: "92", title: "Become Creator", category: "Influencer", path: "/become-creator" },
  
  // Health & Wellness
  { id: "93", title: "Psychologist", category: "Health", path: "/psychologist" },
  { id: "94", title: "First Aid", category: "Health", path: "/first-aid" },
  { id: "95", title: "Fit & Slim", category: "Health", path: "/fit-slim" },
  { id: "96", title: "Wellness", category: "Health", path: "/wellness" },
  { id: "97", title: "Nutrition Hub", category: "Health", path: "/nutrition-hub" },
  { id: "98", title: "Safety Prevention", category: "Health", path: "/safety-prevention" },
  
  // Travel
  { id: "99", title: "Vacationer", category: "Travel", path: "/vacationer" },
  
  // Kids
  { id: "100", title: "Kids Channel", category: "Kids", path: "/kids-channel" },
  { id: "101", title: "Kids Homework", category: "Kids", path: "/kids-homework" },
  { id: "102", title: "Kids Story Creator", category: "Kids", path: "/kids-story-creator" },
  { id: "103", title: "Coloring Pages", category: "Kids", path: "/coloring-pages" },
  { id: "104", title: "Kids Science Lab", category: "Kids", path: "/kids-science-lab" },
  { id: "105", title: "Kids Drawing Buddy", category: "Kids", path: "/kids-drawing-buddy" },
  { id: "106", title: "Kids Reading Companion", category: "Kids", path: "/kids-reading-companion" },
  { id: "107", title: "Teen Career Counselor", category: "Kids", path: "/teen-career-counselor" },
  { id: "108", title: "Choose Adventure", category: "Kids", path: "/choose-adventure" },
  { id: "109", title: "Kids Voice Chat", category: "Kids", path: "/kids-voice-chat" },
  { id: "110", title: "Create Character", category: "Kids", path: "/create-character" },
  { id: "111", title: "Character Gallery", category: "Kids", path: "/character-gallery" },
  { id: "112", title: "Character Battle", category: "Kids", path: "/kids-stories/battle" },
  { id: "113", title: "Educational Stories", category: "Kids", path: "/educational-stories" },
  { id: "114", title: "Bedtime Stories", category: "Kids", path: "/bedtime-stories" },
  { id: "115", title: "Story Games", category: "Kids", path: "/story-games" },
  { id: "116", title: "Disney Castles", category: "Kids", path: "/kids-channel/disney-castles" },
  
  // Mystical
  { id: "117", title: "Astrology", category: "Mystical", path: "/astrology" },
  { id: "118", title: "Dream Journal", category: "Mystical", path: "/dream-journal" },
  { id: "119", title: "Past Life", category: "Mystical", path: "/past-life" },
  { id: "120", title: "Ancestor Twin", category: "Mystical", path: "/ancestor-twin" },
  { id: "121", title: "Future Face", category: "Mystical", path: "/future-face" },
  { id: "122", title: "Parallel Lives", category: "Mystical", path: "/parallel-lives" },
  { id: "123", title: "Reincarnation Social", category: "Mystical", path: "/reincarnation-social" },
  { id: "124", title: "DNA Memory Network", category: "Mystical", path: "/dna-memory-network" },
  { id: "125", title: "Crystal Energy Network", category: "Mystical", path: "/crystal-energy-network" },
  { id: "126", title: "Holographic Avatars", category: "Mystical", path: "/holographic-avatars" },
  { id: "127", title: "Quantum Social", category: "Mystical", path: "/quantum-social" },
  { id: "128", title: "Emotion Economy", category: "Mystical", path: "/emotion-economy" },
  { id: "129", title: "Phobia Trading", category: "Mystical", path: "/phobia-trading" },
  { id: "130", title: "Multiverse Network", category: "Mystical", path: "/multiverse-network" },
  { id: "131", title: "Time Capsule", category: "Mystical", path: "/time-capsule" },
  { id: "132", title: "Time Reversal", category: "Mystical", path: "/time-reversal-subscription" },
  
  // Community
  { id: "133", title: "Plant Care", category: "Community", path: "/plant-care" },
  { id: "134", title: "Coffee", category: "Community", path: "/coffee" },
  { id: "135", title: "Skill Swap", category: "Community", path: "/skill-swap" },
  
  // Rewards & Account
  { id: "136", title: "Referral", category: "Rewards", path: "/referral" },
  { id: "137", title: "Rewards", category: "Rewards", path: "/rewards" },
  { id: "138", title: "Earnings", category: "Rewards", path: "/earnings" },
  { id: "139", title: "Settings", category: "Account", path: "/settings" },
  { id: "140", title: "Subscription", category: "Account", path: "/subscription" },
  { id: "141", title: "Premium Store", category: "Account", path: "/premium-store" },
  { id: "142", title: "AI Credits Store", category: "Account", path: "/ai-credits-store" },
  { id: "143", title: "Contact", category: "Account", path: "/contact" },
  { id: "144", title: "Terms", category: "Account", path: "/terms" },
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
