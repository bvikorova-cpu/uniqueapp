import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shirt, Coffee, Smartphone, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PrintOnDemand = () => {
  const { toast } = useToast();
  const [design, setDesign] = useState("");

  const products = [
    { icon: Shirt, name: "T-Shirts", profit: "$8-15" },
    { icon: Coffee, name: "Mugs", profit: "$5-10" },
    { icon: Smartphone, name: "Phone Cases", profit: "$6-12" },
    { icon: Package, name: "Posters", profit: "$4-8" },
  ];

  const handleCreateProduct = () => {
    toast({
      title: "Product created!",
      description: "Your design is now available for sale.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Print on Demand</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Design products with AI and earn 60-70% profit on each sale.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {products.map((product, idx) => (
            <Card key={idx} className="p-6 text-center hover:shadow-lg transition-shadow">
              <product.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-muted-foreground">Profit: {product.profit}</p>
            </Card>
          ))}
        </div>

        <Card className="p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Create Your Product</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Design Prompt</label>
              <Input
                value={design}
                onChange={(e) => setDesign(e.target.value)}
                placeholder="Describe your design idea"
              />
            </div>
            <Button onClick={handleCreateProduct} className="w-full">
              Generate & Create Product
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              We handle production, shipping, and customer service. You just design!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrintOnDemand;
