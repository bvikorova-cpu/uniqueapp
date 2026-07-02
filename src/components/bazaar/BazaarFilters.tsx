import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Bell, BellOff, SlidersHorizontal, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export type SortOption = "newest" | "price_asc" | "price_desc" | "oldest";

export interface BazaarFilterState {
  searchTerm: string;
  category: string;
  condition: string; // "all" or one of the conditions
  minPrice: string;
  maxPrice: string;
  location: string;
  sort: SortOption;
  brand: string; // free-text contains
  size: string;  // "all" or specific
  shippingMethod: string; // "all" | personal | post | packeta | courier
}

export const defaultFilters: BazaarFilterState = {
  searchTerm: "",
  category: "all",
  condition: "all",
  minPrice: "",
  maxPrice: "",
  location: "",
  sort: "newest",
  brand: "",
  size: "all",
  shippingMethod: "all",
};

export const SHIPPING_METHODS = [
  { id: "personal", name: "Personal pickup" },
  { id: "post", name: "Post" },
  { id: "packeta", name: "Packeta / Z-Box" },
  { id: "courier", name: "Courier" },
] as const;

export const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "34", "36", "38", "40", "42", "44"];

interface SavedSearch {
  id: string;
  name: string;
  search_term: string | null;
  category: string | null;
  condition: string | null;
  min_price: number | null;
  max_price: number | null;
  location: string | null;
  notify: boolean;
}

interface Props {
  filters: BazaarFilterState;
  onChange: (next: BazaarFilterState) => void;
  conditions: string[];
  currentUserId: string | null;
}

export const BazaarFilters = ({ filters, onChange, conditions, currentUserId }: Props) => {
  const [saveOpen, setSaveOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [notify, setNotify] = useState(true);
  const [saved, setSaved] = useState<SavedSearch[]>([]);

  const loadSaved = async () => {
    if (!currentUserId) return;
    const { data } = await supabase
      .from("bazaar_saved_searches")
      .select("*")
      .order("created_at", { ascending: false });
    setSaved((data as SavedSearch[]) || []);
  };

  useEffect(() => {
    loadSaved();
  }, [currentUserId]);

  const set = <K extends keyof BazaarFilterState>(key: K, value: BazaarFilterState[K]) =>
    onChange({ ...filters, [key]: value });

  const handleSave = async () => {
    if (!currentUserId) {
      toast.error("Sign in to save searches");
      return;
    }
    if (!searchName.trim()) {
      toast.error("Name is required");
      return;
    }
    const { error } = await supabase.from("bazaar_saved_searches").insert({
      user_id: currentUserId,
      name: searchName.trim(),
      search_term: filters.searchTerm || null,
      category: filters.category === "all" ? null : filters.category,
      condition: filters.condition === "all" ? null : filters.condition,
      min_price: filters.minPrice ? Number(filters.minPrice) : null,
      max_price: filters.maxPrice ? Number(filters.maxPrice) : null,
      location: filters.location || null,
      notify,
    });
    if (error) {
      toast.error("Failed to save search");
      return;
    }
    toast.success("Search saved");
    setSaveOpen(false);
    setSearchName("");
    loadSaved();
  };

  const applySaved = (s: SavedSearch) => {
    onChange({
      ...filters,
      searchTerm: s.search_term ?? "",
      category: s.category ?? "all",
      condition: s.condition ?? "all",
      minPrice: s.min_price?.toString() ?? "",
      maxPrice: s.max_price?.toString() ?? "",
      location: s.location ?? "",
    });
    toast.success(`Loaded: ${s.name}`);
  };

  const deleteSaved = async (id: string) => {
    const { error } = await supabase.from("bazaar_saved_searches").delete().eq("id", id);
    if (error) {
      toast.error("Failed");
      return;
    }
    loadSaved();
  };

  const toggleNotify = async (s: SavedSearch) => {
    await supabase.from("bazaar_saved_searches").update({ notify: !s.notify }).eq("id", s.id);
    loadSaved();
  };

  const activeCount =
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.condition !== "all" ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.brand ? 1 : 0) +
    (filters.size !== "all" ? 1 : 0) +
    (filters.shippingMethod !== "all" ? 1 : 0);

  const isClothing = filters.category === "clothing";

  return (
    <>
      <FloatingHowItWorks title="How Bazaar Filters works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <div className="flex flex-wrap items-center gap-2">
      {/* Sort */}
      <Select value={filters.sort} onValueChange={(v) => set("sort", v as SortOption)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest first</SelectItem>
          <SelectItem value="oldest">Oldest first</SelectItem>
          <SelectItem value="price_asc">Price: Low → High</SelectItem>
          <SelectItem value="price_desc">Price: High → Low</SelectItem>
        </SelectContent>
      </Select>

      {/* Advanced filters */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && <Badge variant="secondary">{activeCount}</Badge>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 space-y-3">
          <div>
            <label className="text-xs font-semibold mb-1 block">Price range (€)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => set("minPrice", e.target.value)}
              />
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => set("maxPrice", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block">Condition</label>
            <Select value={filters.condition} onValueChange={(v) => set("condition", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any condition</SelectItem>
                {conditions.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block">Location contains</label>
            <Input
              placeholder="e.g. Berlin"
              value={filters.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block">Shipping</label>
            <Select value={filters.shippingMethod} onValueChange={(v) => set("shippingMethod", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any method</SelectItem>
                {SHIPPING_METHODS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isClothing && (
            <>
              <div>
                <label className="text-xs font-semibold mb-1 block">Brand contains</label>
                <Input
                  placeholder="e.g. Nike, Zara"
                  value={filters.brand}
                  onChange={(e) => set("brand", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">Size</label>
                <Select value={filters.size} onValueChange={(v) => set("size", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any size</SelectItem>
                    {CLOTHING_SIZES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() =>
              onChange({ ...defaultFilters, searchTerm: filters.searchTerm, category: filters.category, sort: filters.sort })
            }
          >
            Clear filters
          </Button>
        </PopoverContent>
      </Popover>

      {/* Saved searches */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Saved
            {saved.length > 0 && <Badge variant="secondary">{saved.length}</Badge>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 space-y-2">
          {saved.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No saved searches yet.</p>
          ) : (
            saved.map((s) => (
              <div key={s.id} className="flex items-center gap-2 border border-border/50 rounded-lg p-2">
                <button onClick={() => applySaved(s)} className="flex-1 text-left">
                  <div className="text-sm font-semibold">{s.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {[s.search_term, s.category, s.condition, s.location].filter(Boolean).join(" · ") || "Any"}
                  </div>
                </button>
                <Button size="icon" variant="ghost" onClick={() => toggleNotify(s)} title={s.notify ? "Mute" : "Notify"}>
                  {s.notify ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => deleteSaved(s.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </PopoverContent>
      </Popover>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary" className="gap-2">
            <Bookmark className="h-4 w-4" /> Save search
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save current search</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="Name (e.g. iPhone Berlin ≤ 500€)" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
              Notify me when new matching items appear
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
    );
};

export default BazaarFilters;
