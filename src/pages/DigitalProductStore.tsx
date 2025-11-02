import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Sparkles, TrendingUp, Zap } from "lucide-react";

const DigitalProductStore = () => {
  const products = [
    { name: "AI Prompt Pack", price: "$29", sales: 156, rating: "4.8" },
    { name: "Filter Presets", price: "$19", sales: 234, rating: "4.9" },
    { name: "Template Bundle", price: "$39", sales: 98, rating: "4.7" },
    { name: "Workflow Guide", price: "$15", sales: 312, rating: "5.0" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Digital Product Store</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sell presets, filters, templates and more. Platform takes 15% per sale.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Create Once</h3>
            <p className="text-muted-foreground">Build your product</p>
          </Card>
          <Card className="p-6 text-center">
            <Zap className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Sell Forever</h3>
            <p className="text-muted-foreground">Unlimited copies</p>
          </Card>
          <Card className="p-6 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Passive Income</h3>
            <p className="text-muted-foreground">Earn 85% per sale</p>
          </Card>
        </div>

        <div className="mb-8">
          <Button size="lg" className="w-full md:w-auto">
            <Sparkles className="w-4 h-4 mr-2" />
            Create Digital Product
          </Button>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Popular Products</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {products.map((product, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">★ {product.rating}</Badge>
                      <span className="text-sm text-muted-foreground">{product.sales} sales</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-primary">{product.price}</p>
                </div>
                <Button variant="outline" className="w-full">View Details</Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalProductStore;
