import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ShoppingBag, Star } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Product {
  name: string; brand: string; price: string; rating: number; concern: string; url: string; emoji: string;
}

const PRODUCTS: Product[] = [
  { name: "Vitamin C Serum 15%", brand: "SkinCeuticals", price: "€89", rating: 4.8, concern: "Brightening", url: "https://www.amazon.com/s?k=skinceuticals+vitamin+c+serum&tag=lovable-20", emoji: "🍊" },
  { name: "Retinol 0.5%", brand: "Paula's Choice", price: "€48", rating: 4.7, concern: "Anti-aging", url: "https://www.amazon.com/s?k=paulas+choice+retinol&tag=lovable-20", emoji: "✨" },
  { name: "Hyaluronic Acid", brand: "The Ordinary", price: "€8", rating: 4.6, concern: "Hydration", url: "https://www.amazon.com/s?k=ordinary+hyaluronic+acid&tag=lovable-20", emoji: "💧" },
  { name: "SPF 50 Mineral", brand: "EltaMD", price: "€34", rating: 4.9, concern: "Sun protection", url: "https://www.amazon.com/s?k=eltamd+spf+50&tag=lovable-20", emoji: "☀️" },
  { name: "Niacinamide 10%", brand: "The Ordinary", price: "€7", rating: 4.5, concern: "Pore minimizing", url: "https://www.amazon.com/s?k=ordinary+niacinamide&tag=lovable-20", emoji: "🧴" },
  { name: "Bakuchiol Treatment", brand: "Herbivore", price: "€56", rating: 4.4, concern: "Gentle retinol alt", url: "https://www.amazon.com/s?k=bakuchiol+treatment&tag=lovable-20", emoji: "🌱" },
  { name: "Peptide Eye Cream", brand: "CeraVe", price: "€18", rating: 4.5, concern: "Dark circles", url: "https://www.amazon.com/s?k=cerave+eye+cream&tag=lovable-20", emoji: "👁️" },
  { name: "Glycolic Acid Toner", brand: "Pixi", price: "€16", rating: 4.6, concern: "Exfoliation", url: "https://www.amazon.com/s?k=pixi+glow+tonic&tag=lovable-20", emoji: "🌟" },
];

export default function FutureFaceShop() {
  return (
    <>
      <FloatingHowItWorks title={"Future Face Shop - How it works"} steps={[{ title: 'Open', desc: 'Access the Future Face Shop section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Future Face Shop.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black">🛍️ Skincare Picks</h2>
        <Badge variant="outline" className="text-[10px]">Affiliate</Badge>
      </div>
      <p className="text-xs text-muted-foreground">Curated science-backed picks. We may earn a commission on purchases — at no extra cost to you.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PRODUCTS.map(p => (
          <Card key={p.name} className="border-border/30 hover:border-cyan-500/40 transition-all group">
            <CardContent className="p-3 space-y-1.5">
              <div className="aspect-square rounded-lg bg-gradient-to-br from-cyan-500/10 to-purple-500/10 grid place-items-center text-5xl">
                {p.emoji}
              </div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">{p.brand}</p>
              <p className="text-xs font-bold leading-tight line-clamp-2">{p.name}</p>
              <div className="flex items-center gap-1 text-[10px]">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {p.rating}
                <Badge variant="outline" className="text-[8px] ml-auto">{p.concern}</Badge>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-black text-cyan-400">{p.price}</span>
                <Button asChild size="sm" variant="ghost" className="h-7 px-2">
                  <a href={p.url} target="_blank" rel="noreferrer noopener sponsored">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </>
  );
}
