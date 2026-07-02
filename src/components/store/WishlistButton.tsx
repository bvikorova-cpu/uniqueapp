import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface WishlistButtonProps {
  itemType: string;
  itemId: string;
  itemName: string;
  itemIcon?: string;
  creditCost: number;
  levelRequired?: number;
  size?: "sm" | "icon";
}

/** Add/remove item from personal wishlist. Notifies when level is reached (via useWishlistNotifications). */
export const WishlistButton = ({
  itemType, itemId, itemName, itemIcon, creditCost, levelRequired = 1, size = "icon",
}: WishlistButtonProps) => {
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("premium_store_wishlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("item_type", itemType)
        .eq("item_id", itemId)
        .maybeSingle();
      setSaved(!!data);
    };
    check();
  }, [itemType, itemId]);

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Sign in required", description: "Sign in to save items to your wishlist." });
        return;
      }
      if (saved) {
        await supabase.from("premium_store_wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("item_type", itemType)
          .eq("item_id", itemId);
        setSaved(false);
        toast({ title: "Removed from wishlist" });
      } else {
        await supabase.from("premium_store_wishlist").insert({
          user_id: user.id,
          item_type: itemType,
          item_id: itemId,
          item_name: itemName,
          item_icon: itemIcon,
          credit_cost: creditCost,
          level_required: levelRequired,
        });
        setSaved(true);
        toast({ title: "Saved to wishlist", description: `We'll notify you when ${itemName} is unlocked.` });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Could not update wishlist", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Wishlist Button works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Button
      onClick={toggle}
      disabled={loading}
      size={size}
      variant="ghost"
      className={`shrink-0 ${saved ? "text-rose-500 hover:text-rose-600" : "text-muted-foreground hover:text-rose-500"}`}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={`h-4 w-4 ${saved ? "fill-rose-500" : ""}`} />
    </Button>
    </>
    );
};
