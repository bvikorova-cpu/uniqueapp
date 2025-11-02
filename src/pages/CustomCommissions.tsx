import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CustomCommissions = () => {
  const { toast } = useToast();
  const [serviceTitle, setServiceTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");

  const handleCreateService = () => {
    toast({
      title: "Service created!",
      description: "Your commission service is now live.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Palette className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Custom Commission Service</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Offer custom AI creations to clients. Platform takes 15% commission.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center">
            <Palette className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Your Service</h3>
            <p className="text-muted-foreground">Define what you offer</p>
          </Card>
          <Card className="p-6 text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Set Timeline</h3>
            <p className="text-muted-foreground">Choose delivery time</p>
          </Card>
          <Card className="p-6 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Get Paid</h3>
            <p className="text-muted-foreground">Earn 85% per project</p>
          </Card>
        </div>

        <Card className="p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Create Your Service</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Service Title</label>
              <Input
                value={serviceTitle}
                onChange={(e) => setServiceTitle(e.target.value)}
                placeholder="e.g., Custom AI Portrait"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you'll create"
                rows={4}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price ($)</label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Your price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Delivery Time (days)</label>
                <Input
                  type="number"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  placeholder="e.g., 3"
                />
              </div>
            </div>
            <Button onClick={handleCreateService} className="w-full">
              Create Service
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CustomCommissions;
