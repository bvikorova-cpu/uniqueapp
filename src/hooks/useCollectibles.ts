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
        .from('mystery_boxes')
        .select('*')
        .order('price');

      if (error) throw error;
      return data;
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
    onError: (error: Error) => {
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
    onError: (error: Error) => {
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

// Disney Castle specific collectibles
export const useRoomCollectibles = (roomId: string) => {
  return useQuery({
    queryKey: ["room-collectibles", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("castle_room_collectibles")
        .select(`
          *,
          collectible:fairy_collectibles(*)
        `)
        .eq("room_id", roomId);

      if (error) throw error;
      return data;
    },
    enabled: !!roomId,
  });
};

export const useUserDisneyCollectibles = () => {
  return useQuery({
    queryKey: ["user-disney-collectibles"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_collectibles")
        .select(`
          *,
          collectible:fairy_collectibles(*),
          castle:fairy_castles(name),
          room:fairy_castle_rooms(room_name)
        `)
        .eq("user_id", user.id)
        .order("found_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useCollectDisneyItem = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      collectibleId,
      castleId,
      roomId,
    }: {
      collectibleId: string;
      castleId: string;
      roomId: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to collect items");

      // Check if already collected
      const { data: existing } = await supabase
        .from("user_collectibles")
        .select("*")
        .eq("user_id", user.id)
        .eq("collectible_id", collectibleId)
        .single();

      if (existing) {
        throw new Error("already_collected");
      }

      // Get collectible details
      const { data: collectible } = await supabase
        .from("fairy_collectibles")
        .select("*")
        .eq("id", collectibleId)
        .single();

      const { data, error } = await supabase
        .from("user_collectibles")
        .insert({
          user_id: user.id,
          collectible_id: collectibleId,
          castle_id: castleId,
          room_id: roomId,
          acquired_method: 'found',
        } as any)
        .select()
        .single();

      if (error) throw error;
      
      return { data, collectible };
    },
    onSuccess: ({ collectible }) => {
      queryClient.invalidateQueries({ queryKey: ["user-disney-collectibles"] });
      
      const rarityEmoji = {
        common: "⭐",
        rare: "💎",
        epic: "👑",
        legendary: "🌟",
      }[collectible?.rarity || "common"];

      toast({
        title: `${rarityEmoji} Found ${collectible?.name}!`,
        description: `${collectible?.description} (+${collectible?.points} points)`,
      });
    },
    onError: (error: Error) => {
      if (error.message !== "already_collected") {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    },
  });
};

export const useDisneyCollectionStats = () => {
  return useQuery({
    queryKey: ["disney-collection-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { total: 0, collected: 0, points: 0 };

      // Get total collectibles
      const { count: total } = await supabase
        .from("fairy_collectibles")
        .select("*", { count: "exact", head: true });

      // Get user's collected items with points
      const { data: collected, error } = await supabase
        .from("user_collectibles")
        .select(`
          *,
          collectible:fairy_collectibles(points)
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      const points = collected?.reduce(
        (sum, item) => sum + ((item.collectible as { points?: number })?.points || 0),
        0
      ) || 0;

      return {
        total: total || 0,
        collected: collected?.length || 0,
        points,
      };
    },
  });
};