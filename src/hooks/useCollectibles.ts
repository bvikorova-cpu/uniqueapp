import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCollectibles = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's collectibles
  const { data: myCollectibles, isLoading: isLoadingMy } = useQuery({
    queryKey: ['my-collectibles', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_collectibles')
        .select('*')
        .eq('user_id', userId)
        .order('acquired_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['collectible-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collectible_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  // Fetch rarities
  const { data: rarities } = useQuery({
    queryKey: ['collectible-rarities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collectible_rarities')
        .select('*')
        .order('level');

      if (error) throw error;
      return data;
    }
  });

  // Fetch mystery boxes
  const { data: mysteryBoxes } = useQuery({
    queryKey: ['mystery-boxes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mystery_boxes' as any)
        .select('*')
        .order('price');

      if (error) throw error;
      return data as any[];
    }
  });

  // Generate collectible
  const generateCollectible = useMutation({
    mutationFn: async ({ prompt, categoryId, rarityLevel }: { 
      prompt: string; 
      categoryId: string;
      rarityLevel?: number;
    }) => {
      const { data, error } = await supabase.functions.invoke('generate-collectible', {
        body: { prompt, categoryId, rarityLevel }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-collectibles'] });
      queryClient.invalidateQueries({ queryKey: ['ai-credits'] });
      toast({
        title: "Collectible generated!",
        description: "New item has been added to your collection"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate collectible",
        variant: "destructive"
      });
    }
  });

  // Open mystery box
  const openMysteryBox = useMutation({
    mutationFn: async (boxId: string) => {
      const { data, error } = await supabase.functions.invoke('open-mystery-box', {
        body: { boxId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-collectibles'] });
      queryClient.invalidateQueries({ queryKey: ['ai-credits'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to open mystery box",
        variant: "destructive"
      });
    }
  });

  return {
    myCollectibles,
    categories,
    rarities,
    mysteryBoxes,
    isLoadingMy,
    generateCollectible,
    openMysteryBox
  };
};