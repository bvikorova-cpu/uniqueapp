import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FolderOpen, ImageIcon, Package, Star } from "lucide-react";
import { toast } from "sonner";

interface CollectionsViewProps {
  onBack: () => void;
}

const mockCollections = [
  { id: "1", name: "Nature Essentials", items: 25, price: 29.99, discount: 40, category: "Nature", featured: true },
  { id: "2", name: "Business Pack Pro", items: 50, price: 49.99, discount: 55, category: "Business", featured: true },
  { id: "3", name: "Abstract Textures Vol.1", items: 30, price: 19.99, discount: 35, category: "Abstract", featured: false },
  { id: "4", name: "Tech & Innovation", items: 40, price: 39.99, discount: 45, category: "Technology", featured: false },
  { id: "5", name: "Food Photography Bundle", items: 20, price: 14.99, discount: 30, category: "Food", featured: false },
  { id: "6", name: "Travel Destinations", items: 35, price: 34.99, discount: 50, category: "Travel", featured: true },
];

export function CollectionsView({ onBack }: CollectionsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <h2 className="text-2xl font-bold flex items-center gap-2"><FolderOpen className="w-6 h-6 text-amber-500" /> Collections & Bundles</h2>
      </div>

      <Card className="p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <div className="flex items-center gap-3">
          <Package className="w-10 h-10 text-amber-500" />
          <div>
            <h3 className="text-lg font-bold">Save up to 55% with Bundles</h3>
            <p className="text-sm text-muted-foreground">Curated collections of premium content at discounted prices. Buy together and save!</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockCollections.map(col => (
          <Card key={col.id} className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="h-32 bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center relative">
              <FolderOpen className="w-16 h-16 text-amber-500/50" />
              {col.featured && (
                <Badge className="absolute top-2 left-2 bg-amber-500"><Star className="w-3 h-3 mr-1" /> Featured</Badge>
              )}
              <Badge className="absolute top-2 right-2 bg-green-500">{col.discount}% OFF</Badge>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{col.name}</h3>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">{col.category}</Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-0.5"><ImageIcon className="w-3 h-3" /> {col.items} items</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-black">€{col.price}</span>
                  <span className="text-sm text-muted-foreground line-through ml-2">€{(col.price / (1 - col.discount / 100)).toFixed(2)}</span>
                </div>
                <Button size="sm" onClick={() => toast.info("Buy Bundle — coming soon")}>Buy Bundle</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
