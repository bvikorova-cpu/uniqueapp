import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    loadOwned();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const loadOwned = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { data } = await supabase
      .from('stock_content_sales')
      .select('content_id')
      .eq('buyer_id', auth.user.id);
    setOwnedIds(new Set((data || []).map((r: any) => r.content_id)));
  };

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

  const handleDownload = async (item: any) => {
    const url = item.file_url || item.preview_url;
    if (!url) {
      toast({ title: "File unavailable", description: "The original file is missing.", variant: "destructive" });
      return;
    }
    window.open(url, '_blank');
    // Count the real download (only buyers pass the server-side ownership check)
    const { data, error } = await (supabase as any).rpc("record_stock_content_download", { p_content_id: item.id });
    if (!error) {
      const total = typeof data === "number" ? data : (item.total_downloads ?? 0) + 1;
      setItems((prev) => prev.map((it: any) => (it.id === item.id ? { ...it, total_downloads: total } : it)));
      setPreviewItem((prev: any) => (prev && prev.id === item.id ? { ...prev, total_downloads: total } : prev));
    }
  };


  const openPreview = (item: any) => {
    setPreviewItem(item);
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
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          productName: `${selectedItem.title || 'Stock content'} — ${sel.licenseType} license`,
          amount: Math.round(sel.totalEur * 100),
          successUrl: `${window.location.origin}/stock-content-library?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/stock-content-library?purchase=cancelled`,
          metadata: {
            type: 'stock_content_purchase',
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
      const url = data?.url || data?.data?.url;
      if (url) window.open(url, '_blank');
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
                onClick={() => openPreview(item)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPreview(item); } }}
                className="relative h-40 bg-secondary/20 cursor-pointer"
              >
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-muted-foreground" /></div>
                )}
                {!ownedIds.has(item.id) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="transform rotate-[-25deg] opacity-30 text-3xl font-bold text-white tracking-widest select-none" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>UNIQUE</span>
                  </div>
                )}
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
                <h3 className="font-semibold text-sm mb-1 line-clamp-1 cursor-pointer hover:text-primary" onClick={() => openPreview(item)}>{item.title}</h3>
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
                    {ownedIds.has(item.id) ? (
                      <Button size="sm" variant="secondary" className="h-8 flex-1 min-w-0 px-2 text-xs" onClick={() => handleDownload(item)}><Download className="w-3 h-3 mr-1 shrink-0" />Download</Button>
                    ) : (
                      <Button size="sm" className="h-8 flex-1 min-w-0 px-2 text-xs" onClick={() => openLicenseDialog(item)}><Download className="w-3 h-3 mr-1 shrink-0" />Buy</Button>
                    )}
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

      <Dialog open={!!previewItem} onOpenChange={(o) => { if (!o) setPreviewItem(null); }}>
        <DialogContent className="max-w-2xl w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto overscroll-contain">
          <DialogHeader>
            <DialogTitle>{previewItem?.title}</DialogTitle>
            <DialogDescription>Preview only — no payment is taken here.</DialogDescription>
          </DialogHeader>
          {previewItem && (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden bg-secondary/20">
                {previewItem.thumbnail_url ? (
                  <img src={previewItem.thumbnail_url} alt={previewItem.title} className="w-full max-h-[45vh] object-contain" />
                ) : (
                  <div className="h-48 flex items-center justify-center"><ImageIcon className="w-10 h-10 text-muted-foreground" /></div>
                )}
                {!ownedIds.has(previewItem.id) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="transform rotate-[-25deg] opacity-30 text-4xl font-bold text-white tracking-widest select-none" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>UNIQUE</span>
                  </div>
                )}
              </div>
              {previewItem.description && <p className="text-sm text-muted-foreground">{previewItem.description}</p>}
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">{previewItem.category}</Badge>
                <Badge variant="secondary" className="text-xs">{previewItem.content_type}</Badge>
                {previewItem.tags?.slice(0, 6).map((t: string, i: number) => (
                  <span key={i} className="text-[10px] bg-secondary/50 px-1.5 py-0.5 rounded">{t}</span>
                ))}
              </div>
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="font-bold text-sm flex items-center gap-1">
                  <Euro className="w-3.5 h-3.5" />{previewItem.price_eur?.toFixed(2)}
                  <span className="text-[10px] font-normal text-muted-foreground">+ license</span>
                </span>
                {ownedIds.has(previewItem.id) ? (
                  <Button size="sm" variant="secondary" onClick={() => handleDownload(previewItem)}>
                    <Download className="w-3 h-3 mr-1" />Download
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => { const it = previewItem; setPreviewItem(null); openLicenseDialog(it); }}>
                    <Download className="w-3 h-3 mr-1" />Buy
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <LightboxManagerDialog
        open={!!lightboxItemId}
        onOpenChange={(o) => { if (!o) setLightboxItemId(null); }}
        contentItemId={lightboxItemId ?? undefined}
      />
    </div>
    </>
  );
}
