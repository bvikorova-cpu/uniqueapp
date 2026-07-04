import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Loader2, TrendingUp, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface MyPhobiasProps {
  onPhobiaListed?: () => void;
  onOpenPricing?: () => void;
}

const MyPhobias = ({ onPhobiaListed, onOpenPricing }: MyPhobiasProps) => {
  const [phobias, setPhobias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [listingPhobia, setListingPhobia] = useState<string | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPhobia, setSelectedPhobia] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setCheckingAccess(false);
        return;
      }

      const { data, error } = await supabase.rpc('has_phobia_access', {
        user_id_param: session.user.id,
        service_type_param: 'fear_marketplace'
      });

      if (!error) {
        setHasAccess(data);
      }
    } catch (error) {
      console.error('Error checking access:', error);
    } finally {
      setCheckingAccess(false);
    }
  };

  const loadPhobias = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('get-user-phobias');

      if (error) throw error;

      setPhobias(data.phobias || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhobias();
  }, []);

  const handleListForTrade = async () => {
    if (!selectedPhobia || price <= 0) {
      toast({
        title: "Invalid Data",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    try {
      setListingPhobia(selectedPhobia.id);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to list phobias",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.functions.invoke('trade-phobia', {
        body: { 
          action: 'list',
          phobiaId: selectedPhobia.id,
          price: price
        }
      });

      if (error) throw error;

      toast({
        title: "Listed for Trade",
        description: `${selectedPhobia.phobia_name} is now available in the marketplace`,
      });

      setOpenDialog(false);
      setSelectedPhobia(null);
      setPrice(0);
      loadPhobias();
      onPhobiaListed?.();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Listing Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setListingPhobia(null);
    }
  };

  if (checkingAccess) {
    return (
    <>
      <FloatingHowItWorks title={"My Phobias - How it works"} steps={[{ title: 'Open', desc: 'Access the My Phobias section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in My Phobias.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    </>
  );
  }

  if (!hasAccess) {
    return (
      <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-950/10 to-background">
        <CardContent className="py-12 text-center space-y-4">
          <TrendingUp className="w-16 h-16 text-yellow-400 mx-auto" />
          <h3 className="text-xl font-semibold text-foreground">Access Required</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            You need to purchase "Fear Marketplace" to manage and trade your phobias.
          </p>
          <Button 
            onClick={onOpenPricing}
            className="bg-gradient-to-r from-cyan-500 to-blue-500"
          >
            View Pricing Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-950/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Brain className="w-6 h-6 text-cyan-400" />
            My Phobias Collection
          </CardTitle>
          <CardDescription>
            View and manage your detected phobias
          </CardDescription>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      ) : phobias.length === 0 ? (
        <Card className="border-muted">
          <CardContent className="py-12 text-center text-muted-foreground">
            No phobias detected yet. Use the Detect Phobia tab to identify your fears.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {phobias.map((phobia) => (
            <Card key={phobia.id} className="border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg text-cyan-400">
                  {phobia.phobia_name}
                </CardTitle>
                <CardDescription>
                  {phobia.phobia_type}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {phobia.description}
                  </p>
                  <p className="text-sm font-medium">
                    Severity: {phobia.severity}/10
                  </p>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${phobia.severity * 10}%` }}
                    />
                  </div>
                </div>

                <Dialog open={openDialog && selectedPhobia?.id === phobia.id} onOpenChange={(open) => {
                  setOpenDialog(open);
                  if (!open) {
                    setSelectedPhobia(null);
                    setPrice(0);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      onClick={() => {
                        setSelectedPhobia(phobia);
                        setOpenDialog(true);
                      }}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      List for Trade
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>List {phobia.phobia_name} for Trade</DialogTitle>
                      <DialogDescription>
                        Set a price for your phobia in the marketplace
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (€)</Label>
                        <Input
                          id="price"
                          type="number"
                          min="1"
                          value={price}
                          onChange={(e) => setPrice(Number(e.target.value))}
                          placeholder="Enter price"
                        />
                      </div>
                      <Button
                        onClick={handleListForTrade}
                        disabled={listingPhobia === phobia.id}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      >
                        {listingPhobia === phobia.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Listing...
                          </>
                        ) : (
                          'Confirm Listing'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPhobias;
