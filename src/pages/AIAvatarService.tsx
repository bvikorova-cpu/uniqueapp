import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Briefcase, Linkedin, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const AIAvatarService = () => {
  const { toast } = useToast();
  const [clientName, setClientName] = useState("");
  const [style, setStyle] = useState("");

  const packages = [
    { name: "Basic", price: "€25", features: ["1 Avatar", "2 Revisions", "24h Delivery"], earn: "€18.75" },
    { name: "Professional", price: "€50", features: ["3 Avatars", "5 Revisions", "12h Delivery"], earn: "€37.50" },
    { name: "Premium", price: "€100", features: ["10 Avatars", "Unlimited Revisions", "6h Delivery"], earn: "€75.00" },
  ];

  const handleCreateOrder = () => {
    toast({
      title: "Order created!",
      description: "Client will be notified and you can start working.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <User className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">AI Avatar Creation Service</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create professional avatars for clients. Earn 75% per order.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center">
            <Camera className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">AI Generation</h3>
            <p className="text-muted-foreground">Create stunning avatars</p>
          </Card>
          <Card className="p-6 text-center">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Professional Use</h3>
            <p className="text-muted-foreground">Perfect for LinkedIn</p>
          </Card>
          <Card className="p-6 text-center">
            <Linkedin className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">High Demand</h3>
            <p className="text-muted-foreground">Everyone needs one</p>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {packages.map((pkg, idx) => (
            <Card key={idx} className="p-6">
              <h3 className="text-2xl font-bold mb-4">{pkg.name}</h3>
              <p className="text-3xl font-bold text-primary mb-4">{pkg.price}</p>
              <p className="text-sm text-muted-foreground mb-4">You earn: <span className="font-bold text-foreground">{pkg.earn}</span></p>
              <ul className="space-y-2 mb-6">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="text-sm">✓ {feature}</li>
                ))}
              </ul>
              <Button className="w-full">Offer This Package</Button>
            </Card>
          ))}
        </div>

        <Card className="p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Create Client Order</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Client Name</label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter client name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Avatar Style</label>
              <Input
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="e.g., Professional, Creative, Modern"
              />
            </div>
            <Button onClick={handleCreateOrder} className="w-full">
              Create Order
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIAvatarService;
