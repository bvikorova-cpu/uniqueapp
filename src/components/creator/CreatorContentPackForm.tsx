import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2 } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CreatorContentPackFormProps {
  creatorId: string;
  onSuccess: () => void;
}

export function CreatorContentPackForm({ creatorId, onSuccess }: CreatorContentPackFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content_count: 5,
    content_type: "photos",
    price: 3.00,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('creator_content_packs')
        .insert({
          creator_id: creatorId,
          ...formData,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content pack created successfully",
      });

      setFormData({
        title: "",
        description: "",
        content_count: 5,
        content_type: "photos",
        price: 3.00,
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error creating pack:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create content pack",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Creator Content Pack Form - How it works"} steps={[{ title: 'Open', desc: 'Access the Creator Content Pack Form section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Creator Content Pack Form.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
      <CardHeader>
        <CardTitle>Create Content Pack</CardTitle>
        <CardDescription>
          Offer custom content bundles with your own pricing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Pack Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., 5 Exclusive Photos"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what buyers will get..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="content_type">Content Type</Label>
              <Select
                value={formData.content_type}
                onValueChange={(value) => setFormData({ ...formData, content_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photos">Photos</SelectItem>
                  <SelectItem value="videos">Videos</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="content_count">Content Count</Label>
              <Input
                id="content_count"
                type="number"
                min="1"
                value={formData.content_count}
                onChange={(e) => setFormData({ ...formData, content_count: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="price">Price (€)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0.50"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              You'll receive 90% (€{(formData.price * 0.9).toFixed(2)})
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Content Pack
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
    </>
  );
}
