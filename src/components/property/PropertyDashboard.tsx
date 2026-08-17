import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Video, Eye, Calendar, Loader2, Trash2, MessageCircle, Crown } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PropertyConversationsDialog } from "./PropertyConversationsDialog";
import { PropertyTopDialog } from "./PropertyTopDialog";
import { usePropertyUnread } from "@/hooks/usePropertyUnread";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Property {
  id: string;
  title: string;
  price: number;
  city: string;
  status: string;
  views_count: number;
  virtual_tour_url: string | null;
  listing_expires_at: string | null;
  is_featured?: boolean | null;
  featured_until?: string | null;
  property_images: Array<{
    image_url: string;
  }>;
}

export function PropertyDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [topTarget, setTopTarget] = useState<Property | null>(null);
  const { totalUnread } = usePropertyUnread({ notifyToasts: false });
  const { toast } = useToast();

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) { toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please sign in to view your properties." });
        return;
      }

      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          price,
          city,
          status,
          views_count,
          virtual_tour_url,
          listing_expires_at,
          is_featured,
          featured_until,

          property_images (image_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) { console.error('Error loading properties:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load properties." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in again.");

      await supabase.from('property_images').delete().eq('property_id', deleteTarget.id);

      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', deleteTarget.id)
        .eq('user_id', user.id);
      if (error) throw error;

      setProperties((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast({ title: "Listing deleted", description: "Your listing was removed. Credits already spent are not refunded." });
      setDeleteTarget(null);
    } catch (error: any) {
      console.error('Error deleting property:', error);
      toast({ variant: "destructive", title: "Delete failed", description: error?.message || "Could not delete this listing." });
    } finally {
      setDeleting(false);
    }
  };



  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"Property Dashboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Property Dashboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Property Dashboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    </>
  );
  }

  if (properties.length === 0) {
    return (
      <>
      <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div>
          <p className="font-bold text-sm">Buyer messages</p>
          <p className="text-xs text-muted-foreground">Read and reply to buyers who contacted you about your listings.</p>
        </div>
        <Button onClick={() => setInboxOpen(true)} className="relative shrink-0">
          <MessageCircle className="h-4 w-4 mr-2" /> Messages
          {totalUnread > 0 && (
            <span className="ml-2 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </Button>
      </div>
      <PropertyConversationsDialog open={inboxOpen} onOpenChange={setInboxOpen} />
      <Card>
        <CardHeader>
          <CardTitle>No Properties Yet</CardTitle>
          <CardDescription>
            You haven't listed any properties yet. Create your first listing to get started!
          </CardDescription>
        </CardHeader>
      </Card>
      </>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div>
          <p className="font-bold text-sm">Buyer messages</p>
          <p className="text-xs text-muted-foreground">Read and reply to buyers who contacted you about your listings.</p>
        </div>
        <Button onClick={() => setInboxOpen(true)} className="relative shrink-0">
          <MessageCircle className="h-4 w-4 mr-2" /> Messages
          {totalUnread > 0 && (
            <span className="ml-2 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </Button>
      </div>
      <PropertyConversationsDialog open={inboxOpen} onOpenChange={setInboxOpen} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden">
            <div className="relative h-48">
              <img
                src={property.property_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <Badge 
                className="absolute top-2 right-2"
                variant={property.status === 'active' ? 'default' : 'secondary'}
              >
                {property.status}
              </Badge>
            </div>

            <CardHeader>
              <CardTitle className="text-lg">{property.title}</CardTitle>
              <CardDescription>{property.city}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  {property.views_count} views
                </div>
                <div className="font-bold text-primary">
                  €{property.price.toLocaleString()}
                </div>
              </div>

              {property.listing_expires_at && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Expires: {new Date(property.listing_expires_at).toLocaleDateString()}
                </div>
              )}

              {property.virtual_tour_url && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Video className="h-4 w-4" />
                  Virtual tour active
                </div>
              )}



              {property.featured_until && new Date(property.featured_until) > new Date() ? (
                <div className="flex items-center gap-2 text-sm font-bold text-amber-600">
                  <Crown className="h-4 w-4" />
                  TOP until {new Date(property.featured_until).toLocaleDateString()}
                </div>
              ) : null}

              <Button
                variant="outline"
                size="sm"
                className="w-full border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                onClick={() => setTopTarget(property)}
              >
                <Crown className="h-4 w-4 mr-2" />
                {property.featured_until && new Date(property.featured_until) > new Date() ? "Extend TOP" : "Top this listing"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteTarget(property)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete listing
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <PropertyTopDialog
        open={!!topTarget}
        onOpenChange={(o) => !o && setTopTarget(null)}
        propertyId={topTarget?.id ?? null}
        propertyTitle={topTarget?.title}
        featuredUntil={topTarget?.featured_until ?? null}
        onSuccess={() => loadProperties()}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" will be permanently removed along with its photos.
              Credits already spent on publishing are not refunded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </>
  );
}
