import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Euro, ImageIcon, ArrowLeft, Filter, ShieldCheck, ShieldAlert, FolderHeart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PurchaseOptionsDialog } from "../PurchaseOptionsDialog";
import { LightboxManagerDialog } from "../LightboxManagerDialog";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface BrowseLibraryViewProps {
  onBack: () => void;
}

export function BrowseLibraryView({ onBack }: BrowseLibraryViewProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [contentType, setContentType] = useState("all");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [lightboxItemId, setLightboxItemId] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stock_content_items')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (!error) setItems(data || []);
    setLoading(false);
  };

  const openLicenseDialog = (item: any) => {
    setSelectedItem(item);
    setPurchaseDialogOpen(true);
  };

  const handlePurchaseConfirmed = async (sel: {
    licenseType: "standard" | "extended" | "editorial";
    resolution: string;
    licenseFeeEur: number;
    assetPriceEur: number;
    totalEur: number;
  }) => {
    if (!selectedItem) return;
    setPurchaseDialogOpen(false);
    try {
      const amountCents = Math.round(sel.totalEur * 100);
      const { data, error } = await supabase.functions.invoke('create-one-off-payment', {
        body: {
          productKey: 'stock_content_purchase',
          amount: amountCents,
          name: `${selectedItem.title} — ${sel.licenseType} license + asset`,
          description: `Platform license (${sel.licenseType}) €${sel.licenseFeeEur.toFixed(2)} + Asset €${sel.assetPriceEur.toFixed(2)}`,
          metadata: {
            content_id: String(selectedItem.id),
            license_type: sel.licenseType,
            resolution: sel.resolution,
            license_fee_eur: String(sel.licenseFeeEur),
            asset_price_eur: String(sel.assetPriceEur),
            total_eur: String(sel.totalEur),
          },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) window.open(data.url, '_blank');
      else throw new Error('Checkout URL not returned');

    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to initiate purchase", variant: "destructive" });
    }
  };

  const filtered = items.filter(item => {
    const matchSearch = !searchQuery || item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = category === "all" || item.category === category;
    const matchType = contentType === "all" || item.content_type === contentType;
    return matchSearch && matchCategory && matchType;
  });

  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];

  return (
    <>
      <FloatingHowItWorks title={"Browse Library View - How it works"} steps={[{ title: 'Open', desc: 'Access the Browse Library View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Browse Library View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <h2 className="text-2xl font-bold">Browse Library</h2>
        <Badge variant="secondary">{filtered.length} assets</Badge>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search assets..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger className="flex-1 md:w-[150px] md:flex-none"><Filter className="w-3 h-3 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="3d_model">3D Models</SelectItem>
            </SelectContent>
          </Select>
          {categories.length > 0 && (
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="flex-1 md:w-[150px] md:flex-none"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>

      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading content...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No content found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(item => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
              <div
                role="button"
                tabIndex={0}
                onClick={() => openLicenseDialog(item)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLicenseDialog(item); } }}
                className="relative h-40 bg-secondary/20 cursor-pointer"
              >
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-muted-foreground" /></div>
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="transform rotate-[-25deg] opacity-30 text-3xl font-bold text-white tracking-widest select-none" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>UNIQUE</span>
                </div>
                <Badge className="absolute top-2 right-2" variant="secondary">{item.content_type}</Badge>
                {item.requires_release && (
                  <Badge
                    className={`absolute top-2 left-2 text-[10px] ${item.releases_verified ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'}`}
                  >
                    {item.releases_verified ? <ShieldCheck className="w-3 h-3 mr-0.5" /> : <ShieldAlert className="w-3 h-3 mr-0.5" />}
                    {item.releases_verified ? 'Released' : 'Release pending'}
                  </Badge>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm mb-1 line-clamp-1 cursor-pointer hover:text-primary" onClick={() => openLicenseDialog(item)}>{item.title}</h3>
                {item.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>}
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">{item.category}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Download className="w-3 h-3" />{item.total_downloads}</span>
                </div>
                {item.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.tags.slice(0, 3).map((tag: string, i: number) => (
                      <span key={i} className="text-[10px] bg-secondary/50 px-1.5 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-sm flex items-center gap-1">
                    <Euro className="w-3.5 h-3.5" />
                    {item.price_eur?.toFixed(2)}
                    <span className="text-[10px] font-normal text-muted-foreground">+ license</span>
                  </span>
                  <div className="flex items-center gap-1 w-full">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 shrink-0" title="Add to Lightbox" onClick={() => setLightboxItemId(item.id)}>
                      <FolderHeart className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" className="h-8 flex-1 min-w-0 px-2 text-xs" onClick={() => openLicenseDialog(item)}><Download className="w-3 h-3 mr-1 shrink-0" />Buy</Button>
                  </div>
                </div>

              </div>
            </Card>
          ))}
        </div>
      )}

      <PurchaseOptionsDialog
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
        item={selectedItem}
        onConfirm={handlePurchaseConfirmed}
      />

      <LightboxManagerDialog
        open={!!lightboxItemId}
        onOpenChange={(o) => { if (!o) setLightboxItemId(null); }}
        contentItemId={lightboxItemId ?? undefined}
      />
    </div>
    </>
  );
}
