import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { WishlistButton } from "@/components/marketplace/WishlistButton";

interface ProductCardProps {
  productId: string;
  title: string;
  price: number;
  imageUrl: string | null;
  condition?: string;
  compact?: boolean;
}

export const ProductCard = ({ 
  productId, 
  title, 
  price, 
  imageUrl, 
  condition,
  compact = false 
}: ProductCardProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/bazaar?item=${productId}`);
  };

  const handleCardClick = () => {
    navigate(`/bazaar?item=${productId}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={cn(
        "group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300",
        "bg-background/60 backdrop-blur-xl border border-white/10",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-purple-500/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        compact ? "p-3" : "p-4"
      )}
    >
      <div className={cn("flex gap-3", compact ? "items-center" : "flex-col sm:flex-row sm:items-start")}>
        {/* Product Image */}
        <div className={cn(
          "relative overflow-hidden rounded-lg bg-secondary/50 flex-shrink-0",
          compact ? "w-16 h-16" : "w-full sm:w-24 h-24"
        )}>
          {imageUrl && !imageError ? (
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-muted-foreground/50" />
            </div>
          )}
          {condition && (
            <Badge 
              variant="secondary" 
              className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0 bg-background/80 backdrop-blur-sm"
            >
              {condition}
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <h4 className={cn(
            "font-semibold truncate text-foreground group-hover:text-primary transition-colors",
            compact ? "text-sm" : "text-base"
          )}>
            {title}
          </h4>
          <p className={cn(
            "font-bold",
            price === 0 ? "text-green-500" : "text-primary",
            compact ? "text-base" : "text-lg"
          )}>
            {price === 0 ? "FREE" : `€${price.toFixed(2)}`}
          </p>
        </div>

        {/* Buy Button */}
        <Button 
          onClick={handleBuyNow}
          size={compact ? "sm" : "default"}
          className={cn(
            "gap-2",
            price === 0 
              ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              : "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90",
            "shadow-md hover:shadow-lg transition-all",
            compact ? "px-3" : "px-4"
          )}
        >
          <ShoppingCart className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
          <span className={compact ? "text-xs" : "text-sm"}>
            {price === 0 ? "Get" : "Buy"}
          </span>
          <ExternalLink className={cn(compact ? "h-3 w-3" : "h-3.5 w-3.5", "opacity-50")} />
        </Button>
      </div>
    </div>
  );
};
