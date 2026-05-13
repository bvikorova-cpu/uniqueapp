import { useState } from "react";
import { ShoppingBag, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useShoppableTags } from "@/hooks/useShoppableTags";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  postId: string;
  postOwnerId?: string;
}

export function ShoppableTagsDialog({ postId, postOwnerId }: Props) {
  const [open, setOpen] = useState(false);
  const { tags, loading, addTag, removeTag } = useShoppableTags(open ? postId : undefined);
  const { user } = useAuth();
  const isOwner = user?.id === postOwnerId;
  const [form, setForm] = useState({ product_name: "", product_url: "", price_eur: "", image_url: "" });
  const [adding, setAdding] = useState(false);

  const submit = async () => {
    if (!form.product_name || !form.product_url) return;
    setAdding(true);
    await addTag({
      post_id: postId,
      product_name: form.product_name,
      product_url: form.product_url,
      price_eur: form.price_eur ? parseFloat(form.price_eur) : null,
      currency: "EUR",
      image_url: form.image_url || null,
      position_x: null,
      position_y: null,
    });
    setForm({ product_name: "", product_url: "", price_eur: "", image_url: "" });
    setAdding(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="gap-1 h-8">
          <ShoppingBag className="h-4 w-4" />
          {tags.length > 0 ? tags.length : "Shop"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Shoppable produkty</DialogTitle>
        </DialogHeader>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin mx-auto my-6" />
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {tags.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Žiadne produkty</p>
            )}
            {tags.map((t) => (
              <div key={t.id} className="flex items-center gap-2 rounded-lg border border-border/50 p-2">
                {t.image_url && (
                  <img src={t.image_url} alt={t.product_name} className="h-12 w-12 rounded object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.product_name}</p>
                  {t.price_eur != null && (
                    <p className="text-xs text-muted-foreground">€{Number(t.price_eur).toFixed(2)}</p>
                  )}
                </div>
                <a href={t.product_url} target="_blank" rel="noopener noreferrer">
                  <Button size="icon" variant="ghost"><ExternalLink className="h-4 w-4" /></Button>
                </a>
                {t.created_by === user?.id && (
                  <Button size="icon" variant="ghost" onClick={() => removeTag(t.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {isOwner && (
          <div className="space-y-2 border-t border-border/40 pt-3">
            <p className="text-sm font-semibold flex items-center gap-1">
              <Plus className="h-4 w-4" /> Pridať produkt
            </p>
            <Input
              placeholder="Názov produktu"
              value={form.product_name}
              onChange={(e) => setForm({ ...form, product_name: e.target.value })}
            />
            <Input
              placeholder="URL produktu"
              value={form.product_url}
              onChange={(e) => setForm({ ...form, product_url: e.target.value })}
            />
            <Input
              placeholder="Cena EUR (voliteľné)"
              type="number"
              step="0.01"
              value={form.price_eur}
              onChange={(e) => setForm({ ...form, price_eur: e.target.value })}
            />
            <Input
              placeholder="Obrázok URL (voliteľné)"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
            <Button onClick={submit} disabled={adding} className="w-full">
              {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Pridať
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
