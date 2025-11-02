import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Store, Upload, DollarSign, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AIContentMarketplace = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const handleUpload = () => {
    toast({
      title: "Content uploaded!",
      description: "Your content is now available in the marketplace.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Store className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">AI Content Marketplace</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sell your AI-generated content and earn money. Platform takes 20% commission.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Upload Content</h3>
            <p className="text-muted-foreground">Share your AI creations</p>
          </Card>
          <Card className="p-6 text-center">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Set Your Price</h3>
            <p className="text-muted-foreground">You keep 80% of sales</p>
          </Card>
          <Card className="p-6 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Earn Money</h3>
            <p className="text-muted-foreground">Get paid instantly</p>
          </Card>
        </div>

        <Card className="p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Upload Your Content</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter content title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your content"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price ($)</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Set your price"
              />
            </div>
            <Button onClick={handleUpload} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Upload Content
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIContentMarketplace;
