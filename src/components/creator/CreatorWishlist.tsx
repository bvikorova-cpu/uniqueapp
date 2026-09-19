import { useState } from "react";
import { Gift, Plus, Trash2, ExternalLink, Lock, Loader2, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreatorWishlist } from "@/hooks/useCreatorWishlist";
import { useAuth } from "@/contexts/AuthContext";

export function CreatorWishlist({ creatorUserId }: { creatorUserId: string }) {
  const { user } = useAuth();
  const { items, isLoading, isOwn, totalEur, addItem, removeItem, fundItem } = useCreatorWishlist(creatorUserId);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [fundingId, setFundingId] = useState<string | null>(null);
  const [fundError, setFundError] = useState<string | null>(null);

  const submitAdd = () => {
    const p = parseFloat(price);
    if (!title.trim() || !p || p < 0.5) return;
    addItem({
      title: title.trim(),
      price_eur: p,
      description: description.trim() || undefined,
      image_url: imageUrl.trim() || undefined,
      link_url: linkUrl.trim() || undefined });
    setTitle(""); setPrice(""); setDescription(""); setImageUrl(""); setLinkUrl("");
    setShowForm(false);
  };

  const handleFund = async (itemId: string) => {
    setFundError(null);
    setFundingId(itemId);
    const res = await fundItem(itemId);
    if (!res.ok) setFundError(res.message || "Checkout failed");
    setFundingId(null);
  };

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Gift className="h-5 w-5 text-pink-500" />
          Wishlist
        </h3>
        {isOwn && (
          <Button size="sm" variant="outline" onClick={() => setShowForm((s) => !s)}>
            <Plus className="h-4 w-4 mr-1" /> Add item
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {isOwn
          ? `Fans can fund items from your list — you keep 85% of every gift. Wishlist total: €${totalEur.toFixed(2)}.`
          : "Fund something from the creator's wishlist — a personal gift they chose themselves."}
      </p>

      {isOwn && showForm && (
        <div className="rounded-xl border bg-muted/30 p-4 mb-4 space-y-2">
          <Input placeholder="Item title (e.g. New microphone)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="flex gap-2">
            <Input placeholder="Price in EUR (min 0.5)" type="number" min="0.5" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} />
            <Input placeholder="Link (optional)" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
          </div>
          <Input placeholder="Image URL (optional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <Input placeholder="Short description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="sm" onClick={submitAdd} disabled={!title.trim() || !parseFloat(price) || parseFloat(price) < 0.5}>
              Add
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1].map((i) => <div key={i} className="h-16 bg-muted/60 rounded-xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isOwn ? "No wishlist items yet — add something fans can gift you." : "This creator hasn't added wishlist items yet."}
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${item.is_funded ? "bg-emerald-500/5 border-emerald-500/30" : "bg-muted/30"}`}>
              {item.image_url ? (
                <img src={item.image_url} alt="" className="h-11 w-11 rounded-lg object-cover border" loading="lazy" />
              ) : (
                <div className="h-11 w-11 rounded-lg bg-muted flex items-center justify-center"><Gift className="h-5 w-5 text-muted-foreground" /></div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate flex items-center gap-1.5">
                  {item.title}
                  {item.is_funded && <BadgeCheck className="h-4 w-4 text-emerald-500" />}
                </p>
                {item.description && <p className="text-xs text-muted-foreground truncate">{item.description}</p>}
              </div>
              <span className="text-sm font-bold tabular-nums">€{Number(item.price_eur).toFixed(2)}</span>
              {isOwn ? (
                !item.is_funded && (
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => removeItem(item.id)} aria-label="Remove item">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )
              ) : item.is_funded ? (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <BadgeCheck className="h-4 w-4" /> Funded
                </span>
              ) : (
                <Button size="sm" onClick={() => handleFund(item.id)} disabled={fundingId === item.id}>
                  {fundingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    <>
                      <Lock className="h-3.5 w-3.5 mr-1" /> Fund
                    </>
                  )}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {fundError && <p className="mt-3 text-sm text-destructive">{fundError}</p>}

      {!isOwn && items.some((i) => i.link_url) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.filter((i) => i.link_url).map((i) => (
            <a key={i.id} href={i.link_url!} target="_blank" rel="noreferrer" className="text-xs inline-flex items-center gap-1 text-muted-foreground underline">
              <ExternalLink className="h-3 w-3" /> {i.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
