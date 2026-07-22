import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Link as LinkIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VirtualTourUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  onSuccess: () => void;
}

export function VirtualTourUploader({ 
  open, 
  onOpenChange, 
  propertyId,
  onSuccess 
}: VirtualTourUploaderProps) {
  const [tourUrl, setTourUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) { toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please sign in to add virtual tours." });
        return;
      }

      // Update property with virtual tour URL
      const { error } = await supabase
        .from('properties')
        .update({ virtual_tour_url: tourUrl })
        .eq('id', propertyId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({ title: "Virtual tour added!",
        description: "Your 3D tour has been successfully linked to the property." });

      setTourUrl("");
      onOpenChange(false);
      onSuccess();
    } catch (error) { console.error('Error adding virtual tour:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add virtual tour. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Virtual Tour</DialogTitle>
          <DialogDescription>
            Add a 3D virtual tour to your property listing
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">
              <LinkIcon className="h-4 w-4 mr-2" />
              URL Link
            </TabsTrigger>
            <TabsTrigger value="embed">
              <Upload className="h-4 w-4 mr-2" />
              Embed Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tourUrl">Virtual Tour URL</Label>
                <Input
                  id="tourUrl"
                  value={tourUrl}
                  onChange={(e) => setTourUrl(e.target.value)}
                  required
                  placeholder="https://your-360-tour-provider.com/tour/..."
                  type="url"
                />
                <p className="text-xs text-muted-foreground">
                  Supported platforms: Matterport, Kuula, 360.net, Roundme, or any iframe-compatible 3D tour
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Virtual Tour
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="embed">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="embedCode">Embed Code or URL</Label>
                <Input
                  id="embedCode"
                  value={tourUrl}
                  onChange={(e) => setTourUrl(e.target.value)}
                  required
                  placeholder="Paste embed code or URL..."
                />
                <p className="text-xs text-muted-foreground">
                  Paste the embed code from your 3D tour provider, or just the URL
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Virtual Tour
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
