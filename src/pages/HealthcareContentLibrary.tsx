import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useHealthcareSubscriptionLimits } from '@/hooks/useHealthcareSubscriptionLimits';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Lock, Plus, Loader2 } from 'lucide-react';

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface LibraryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  tier_required: string;
}

interface Collection {
  id: string;
  name: string;
  page_count: number;
}

export default function HealthcareContentLibrary() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { limits, isSubscribed } = useHealthcareSubscriptionLimits();
  
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load library items
      const { data: items, error: itemsError } = await supabase
        .from('healthcare_library_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (itemsError) throw itemsError;
      
      // Load user's collections
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: cols, error: colsError } = await supabase
          .from('healthcare_collections')
          .select('id, name, page_count')
          .eq('provider_id', session.user.id)
          .order('created_at', { ascending: false });
        
        if (colsError) throw colsError;
        setCollections(cols || []);
      }
      
      setLibraryItems(items || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load library items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(libraryItems.map(item => item.category))];
  
  const filteredItems = selectedCategory === 'all' 
    ? libraryItems 
    : libraryItems.filter(item => item.category === selectedCategory);

  const canAccessItem = (item: LibraryItem) => {
    const tierOrder = ['free', 'basic', 'professional'];
    const userTierIndex = tierOrder.indexOf(limits.libraryAccessLevel);
    const itemTierIndex = tierOrder.indexOf(item.tier_required);
    return userTierIndex >= itemTierIndex;
  };

  const handleAddToCollection = (item: LibraryItem) => {
    if (!isSubscribed) {
      toast({
        title: 'Subscription Required',
        description: 'Please subscribe to add items to your collections',
        variant: 'destructive',
      });
      navigate('/healthcare');
      return;
    }

    if (!canAccessItem(item)) {
      toast({
        title: 'Upgrade Required',
        description: `This item requires a ${item.tier_required} subscription`,
        variant: 'destructive',
      });
      return;
    }

    setSelectedItem(item);
    setAddDialogOpen(true);
  };

  const handleConfirmAdd = async () => {
    if (!selectedItem || !selectedCollection) return;

    try {
      setAdding(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const collection = collections.find(c => c.id === selectedCollection);
      if (!collection) return;

      // Check collection limit
      if (collection.page_count >= limits.maxPagesPerCollection) {
        toast({
          title: 'Collection Limit Reached',
          description: `Your subscription allows up to ${limits.maxPagesPerCollection} pages per collection`,
          variant: 'destructive',
        });
        return;
      }

      // Add the item to the collection
      const { error } = await supabase
        .from('healthcare_coloring_pages')
        .insert({
          collection_id: selectedCollection,
          created_by: session.user.id,
          title: selectedItem.title,
          description: selectedItem.description,
          image_url: selectedItem.image_url,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Item added to collection',
      });

      setAddDialogOpen(false);
      setSelectedItem(null);
      setSelectedCollection('');
      loadData();
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to collection',
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      free: 'bg-secondary',
      basic: 'bg-primary',
      professional: 'bg-accent',
    };
    return <Badge className={colors[tier as keyof typeof colors]}>{tier}</Badge>;
  };

  return (
    <>
      <FloatingHowItWorks
        title="How Healthcare Library works"
        steps={[
          { title: 'Browse content', description: 'Medically reviewed articles and videos.' },
          { title: 'Filter by topic', description: 'Narrow by specialty or condition.' },
          { title: 'Save favorites', description: 'Bookmark items for later reference.' },
          { title: 'Follow providers', description: 'Get updates from verified healthcare creators.' },
        ]}
      />
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/healthcare-dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold">Content Library</h1>
            <p className="text-muted-foreground mt-2">
              Browse and add pre-made therapeutic coloring pages to your collections
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Your Tier</p>
            <p className="text-2xl font-bold">{limits.name}</p>
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category === 'all' ? 'All Categories' : category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => {
              const accessible = canAccessItem(item);
              
              return (
                <Card key={item.id} className={!accessible ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      {getTierBadge(item.tier_required)}
                    </div>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {!accessible && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                          <Lock className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handleAddToCollection(item)}
                      disabled={!accessible}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add to Collection
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Collection</DialogTitle>
            <DialogDescription>
              Select a collection to add "{selectedItem?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
              <SelectTrigger>
                <SelectValue placeholder="Select a collection" />
              </SelectTrigger>
              <SelectContent>
                {collections.map(collection => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name} ({collection.page_count}/{limits.maxPagesPerCollection} pages)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAdd} 
              disabled={!selectedCollection || adding}
            >
              {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add to Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
    </>
  );
}
