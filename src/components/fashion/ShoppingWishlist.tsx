import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, CheckCircle } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const ShoppingWishlist = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    item_name: "",
    category: "tops",
    price_range: "",
    affiliate_link: ""
  });

  const queryClient = useQueryClient();

  const { data: items } = useQuery({
    queryKey: ['shopping-wishlist'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopping_wishlist')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const addItemMutation = useMutation({
    mutationFn: async (newItem: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('shopping_wishlist')
        .insert([{
          ...newItem,
          category: newItem.category as any,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-wishlist'] });
      toast.success('Item added to wishlist');
      setIsOpen(false);
      setFormData({ item_name: "", category: "tops", price_range: "", affiliate_link: "" });
    }
  });

  const togglePurchasedMutation = useMutation({
    mutationFn: async ({ id, isPurchased }: { id: string; isPurchased: boolean }) => {
      const { error } = await supabase
        .from('shopping_wishlist')
        .update({ is_purchased: !isPurchased })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-wishlist'] });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shopping_wishlist')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-wishlist'] });
      toast.success('Item removed from wishlist');
    }
  });

  return (
    <>
      <FloatingHowItWorks title="How Shopping Wishlist works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Shopping Wishlist</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Wishlist</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addItemMutation.mutate(formData); }} className="space-y-4">
              <div>
                <Label htmlFor="item_name">Item Name</Label>
                <Input
                  id="item_name"
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tops">Tops</SelectItem>
                    <SelectItem value="bottoms">Bottoms</SelectItem>
                    <SelectItem value="dresses">Dresses</SelectItem>
                    <SelectItem value="outerwear">Outerwear</SelectItem>
                    <SelectItem value="shoes">Shoes</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="bags">Bags</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price_range">Price Range</Label>
                <Input
                  id="price_range"
                  value={formData.price_range}
                  onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                  placeholder="E.g., €50-100"
                />
              </div>

              <div>
                <Label htmlFor="affiliate_link">Shopping Link</Label>
                <Input
                  id="affiliate_link"
                  type="url"
                  value={formData.affiliate_link}
                  onChange={(e) => setFormData({ ...formData, affiliate_link: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <Button type="submit" className="w-full" disabled={addItemMutation.isPending}>
                Add to Wishlist
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items?.map((item) => (
          <Card key={item.id} className={`p-4 space-y-3 ${item.is_purchased ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold">{item.item_name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteItemMutation.mutate(item.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            {item.price_range && (
              <p className="text-sm"><span className="font-medium">Price:</span> {item.price_range}</p>
            )}

            <div className="flex gap-2">
              <Button
                variant={item.is_purchased ? "default" : "outline"}
                size="sm"
                className="flex-1 gap-2"
                onClick={() => togglePurchasedMutation.mutate({ id: item.id, isPurchased: item.is_purchased })}
              >
                <CheckCircle className="h-4 w-4" />
                {item.is_purchased ? 'Purchased' : 'Mark as Purchased'}
              </Button>
              
              {item.affiliate_link && (
                <Button
                  variant="secondary"
                  size="sm"
                  asChild
                >
                  <a href={item.affiliate_link} target="_blank" rel="noopener noreferrer">
                    Shop
                  </a>
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {(!items || items.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Your wishlist is empty.</p>
          <p className="text-sm">Add items you want to shop for!</p>
        </div>
      )}
    </div>
    </>
    );
};