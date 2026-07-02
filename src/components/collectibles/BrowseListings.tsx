import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShoppingBag, ArrowLeftRight, Eye, Plus, Coins } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface BrowseListingsProps {
  userId: string;
}

export default function BrowseListings({ userId }: BrowseListingsProps) {
  const [listings, setListings] = useState<any[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [userCollectibles, setUserCollectibles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [sendingOffer, setSendingOffer] = useState(false);
  const [newListing, setNewListing] = useState({
    collectibleId: "",
    listingType: "sale",
    priceCredits: "",
    description: ""
  });
  const [offer, setOffer] = useState({
    offeredCollectibleId: "",
    offeredCredits: "",
    message: ""
  });

  useEffect(() => {
    fetchListings();
    fetchMyListings();
    fetchUserCollectibles();
  }, [userId]);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('collectible_listings')
        .select('*')
        .eq('is_active', true)
        .neq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyListings = async () => {
    try {
      const { data, error } = await supabase
        .from('collectible_listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyListings(data || []);
    } catch (error) {
      console.error('Error fetching my listings:', error);
    }
  };

  const fetchUserCollectibles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_collectibles')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setUserCollectibles(data || []);
    } catch (error) {
      console.error('Error fetching collectibles:', error);
    }
  };

  const handleCreateListing = async () => {
    if (!newListing.collectibleId) {
      toast.error("Please select a collectible");
      return;
    }

    if (newListing.listingType === 'sale' && !newListing.priceCredits) {
      toast.error("Please set a price for sale listings");
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('collectible_listings')
        .insert({
          user_id: userId,
          user_collectible_id: newListing.collectibleId,
          listing_type: newListing.listingType,
          price_credits: newListing.priceCredits ? parseInt(newListing.priceCredits) : null,
          description: newListing.description || null,
          is_active: true
        });

      if (error) throw error;

      toast.success("Listing created successfully!");
      setNewListing({ collectibleId: "", listingType: "sale", priceCredits: "", description: "" });
      fetchMyListings();
      fetchUserCollectibles();
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error("Failed to create listing");
    } finally {
      setIsCreating(false);
    }
  };

  const handleBuyDirect = async (listing: any) => {
    if (listing.listing_type !== 'sale' && listing.listing_type !== 'both') {
      toast.error("This listing is only for trade");
      return;
    }
    if (listing.user_id === userId) {
      toast.error("You cannot buy your own listing");
      return;
    }
    if (buyingId) return;
    setBuyingId(listing.id);
    try {
      const { data: creditsData, error: creditsError } = await supabase
        .from('ai_credits')
        .select('credits_remaining')
        .eq('user_id', userId)
        .maybeSingle();

      if (creditsError) throw creditsError;

      if (!creditsData || creditsData.credits_remaining < listing.price_credits) {
        toast.error("Not enough credits");
        return;
      }

      const { error: tradeError } = await supabase
        .from('collectible_trades')
        .insert({
          sender_id: userId,
          receiver_id: listing.user_id,
          offered_credits: listing.price_credits,
          requested_badge_id: listing.user_collectible_id,
          message: `Direct purchase from marketplace listing`,
          status: 'pending'
        });

      if (tradeError) throw tradeError;

      toast.success("Purchase offer sent! Waiting for seller confirmation.");
      setSelectedListing(null);
    } catch (error) {
      console.error('Error buying:', error);
      toast.error("Failed to buy");
    } finally {
      setBuyingId(null);
    }
  };

  const handleMakeOffer = async () => {
    if (!selectedListing) return;
    if (selectedListing.user_id === userId) {
      toast.error("You cannot make an offer on your own listing");
      return;
    }
    const offeredCreditsNum = offer.offeredCredits ? parseInt(offer.offeredCredits, 10) : null;
    if (!offer.offeredCollectibleId && !offeredCreditsNum) {
      toast.error("Please offer something");
      return;
    }
    if (offeredCreditsNum !== null && (!Number.isFinite(offeredCreditsNum) || offeredCreditsNum <= 0 || offeredCreditsNum > 100_000_000)) {
      toast.error("Invalid credit amount");
      return;
    }
    const message = (offer.message || "").trim().slice(0, 1000);
    if (sendingOffer) return;
    setSendingOffer(true);
    try {
      const { error } = await supabase
        .from('collectible_trades')
        .insert({
          sender_id: userId,
          receiver_id: selectedListing.user_id,
          offered_badge_id: offer.offeredCollectibleId || null,
          offered_credits: offeredCreditsNum,
          requested_badge_id: selectedListing.user_collectible_id,
          message: message || `Trade offer for your marketplace listing`,
          status: 'pending'
        });

      if (error) throw error;

      toast.success("Trade offer sent!");
      setOffer({ offeredCollectibleId: "", offeredCredits: "", message: "" });
      setShowOfferDialog(false);
      setSelectedListing(null);
    } catch (error) {
      console.error('Error making offer:', error);
      toast.error("Failed to send offer");
    } finally {
      setSendingOffer(false);
    }
  };

  const handleDeactivateListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('collectible_listings')
        .update({ is_active: false })
        .eq('id', listingId);

      if (error) throw error;

      toast.success("Listing deactivated");
      fetchMyListings();
    } catch (error) {
      console.error('Error deactivating listing:', error);
      toast.error("Failed to deactivate listing");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading listings...</div>;
  }

  return (
    <>
      <FloatingHowItWorks title={"Browse Listings - How it works"} steps={[{ title: 'Open', desc: 'Access the Browse Listings section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Browse Listings.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Tabs defaultValue="browse" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="browse">Browse Offers</TabsTrigger>
        <TabsTrigger value="my-listings">My Listings</TabsTrigger>
      </TabsList>

      <TabsContent value="browse" className="space-y-4">
        {listings.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No listings available at the moment
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Card key={listing.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Collectible #{listing.user_collectible_id.slice(0, 8)}</CardTitle>
                    <Badge variant={listing.listing_type === 'sale' ? 'default' : listing.listing_type === 'trade' ? 'secondary' : 'outline'}>
                      {listing.listing_type === 'sale' ? 'For Sale' : listing.listing_type === 'trade' ? 'For Trade' : 'Sale/Trade'}
                    </Badge>
                  </div>
                  {listing.price_credits && (
                    <CardDescription className="flex items-center gap-1">
                      <Coins className="h-4 w-4" />
                      {listing.price_credits} Credits
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {listing.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => setSelectedListing(listing)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Listing Details</DialogTitle>
                        <DialogDescription>
                          Make an offer or buy directly
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedListing && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-muted-foreground">Type</Label>
                              <Badge className="mt-1">
                                {selectedListing.listing_type === 'sale' ? 'For Sale' : selectedListing.listing_type === 'trade' ? 'For Trade' : 'Sale/Trade'}
                              </Badge>
                            </div>
                            {selectedListing.price_credits && (
                              <div>
                                <Label className="text-muted-foreground">Price</Label>
                                <p className="flex items-center gap-1 font-semibold mt-1">
                                  <Coins className="h-4 w-4" />
                                  {selectedListing.price_credits} Credits
                                </p>
                              </div>
                            )}
                          </div>

                          {selectedListing.description && (
                            <div>
                              <Label className="text-muted-foreground">Description</Label>
                              <p className="mt-1">{selectedListing.description}</p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            {(selectedListing.listing_type === 'sale' || selectedListing.listing_type === 'both') && (
                              <Button 
                                className="flex-1"
                                onClick={() => handleBuyDirect(selectedListing)}
                                disabled={buyingId === selectedListing?.id}
                              >
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                {buyingId === selectedListing?.id ? "Processing..." : "Buy Now"}
                              </Button>
                            )}
                            {(selectedListing.listing_type === 'trade' || selectedListing.listing_type === 'both') && (
                              <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" className="flex-1">
                                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                                    Make Offer
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Make Trade Offer</DialogTitle>
                                    <DialogDescription>
                                      Offer your collectibles or credits
                                    </DialogDescription>
                                  </DialogHeader>

                                  <div className="space-y-4">
                                    <div>
                                      <Label>Offer Collectible (Optional)</Label>
                                      <Select value={offer.offeredCollectibleId} onValueChange={(value) => setOffer({ ...offer, offeredCollectibleId: value })}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select collectible" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {userCollectibles.map((col) => (
                                            <SelectItem key={col.id} value={col.id}>
                                              Collectible #{col.id.slice(0, 8)}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div>
                                      <Label>Offer Credits (Optional)</Label>
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        value={offer.offeredCredits}
                                        onChange={(e) => setOffer({ ...offer, offeredCredits: e.target.value })}
                                      />
                                    </div>

                                    <div>
                                      <Label>Message</Label>
                                      <Textarea
                                        placeholder="Add a message to your offer..."
                                        value={offer.message}
                                        onChange={(e) => setOffer({ ...offer, message: e.target.value.slice(0, 1000) })}
                                        maxLength={1000}
                                      />
                                    </div>

                                    <Button className="w-full" onClick={handleMakeOffer} disabled={sendingOffer}>
                                      {sendingOffer ? "Sending..." : "Send Offer"}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="my-listings" className="space-y-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Listing
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Listing</DialogTitle>
              <DialogDescription>
                List your collectible for sale or trade
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Select Collectible</Label>
                <Select value={newListing.collectibleId} onValueChange={(value) => setNewListing({ ...newListing, collectibleId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose collectible" />
                  </SelectTrigger>
                  <SelectContent>
                    {userCollectibles.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        Collectible #{col.id.slice(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Listing Type</Label>
                <Select value={newListing.listingType} onValueChange={(value) => setNewListing({ ...newListing, listingType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">For Sale Only</SelectItem>
                    <SelectItem value="trade">For Trade Only</SelectItem>
                    <SelectItem value="both">Sale or Trade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(newListing.listingType === 'sale' || newListing.listingType === 'both') && (
                <div>
                  <Label>Price (Credits)</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={newListing.priceCredits}
                    onChange={(e) => setNewListing({ ...newListing, priceCredits: e.target.value })}
                  />
                </div>
              )}

              <div>
                <Label>Description (Optional)</Label>
                <Textarea
                  placeholder="Describe your collectible..."
                  value={newListing.description}
                  onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                />
              </div>

              <Button className="w-full" onClick={handleCreateListing} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Listing"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {myListings.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              You don't have any listings yet
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {myListings.map((listing) => (
              <Card key={listing.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Collectible #{listing.user_collectible_id.slice(0, 8)}</CardTitle>
                    <Badge variant={listing.is_active ? 'default' : 'secondary'}>
                      {listing.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {listing.price_credits && (
                    <CardDescription className="flex items-center gap-1">
                      <Coins className="h-4 w-4" />
                      {listing.price_credits} Credits
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Badge className="mb-3">
                    {listing.listing_type === 'sale' ? 'For Sale' : listing.listing_type === 'trade' ? 'For Trade' : 'Sale/Trade'}
                  </Badge>
                  {listing.description && (
                    <p className="text-sm text-muted-foreground mb-3">{listing.description}</p>
                  )}
                  {listing.is_active && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleDeactivateListing(listing.id)}
                    >
                      Deactivate
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
    </>
  );
}
