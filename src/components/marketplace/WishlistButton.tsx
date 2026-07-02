import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props {
  productId: string;
  size?: "sm" | "default" | "icon";
}

export const WishlistButton = ({ productId, size = "icon" }: Props) => {
  const { has, add, remove } = useWishlist();
  const active = has(productId);

  return (
    <>
      <FloatingHowItWorks title="How Wishlist Button works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Button
      size={size}
      variant={active ? "default" : "outline"}
      onClick={() => (active ? remove(productId) : add({ productId }))}
      className={cn(active && "bg-pink-500 hover:bg-pink-600 border-pink-500")}
    >
      <Heart className={cn("h-4 w-4", active && "fill-white")} />
      {size !== "icon" && <span className="ml-2">{active ? "Saved" : "Save"}</span>}
    </Button>
    </>
    );
};
