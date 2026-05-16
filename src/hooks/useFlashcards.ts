import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { eduCall } from "./useEducationRouter";
import { toast } from "sonner";

export interface FlashcardDeck {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  subject: string | null;
  is_public: boolean;
  card_count: number;
  created_at: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  hint: string | null;
  image_url: string | null;
  order_index: number;
}

export const useFlashcardDecks = () => {
  return useQuery({
    queryKey: ["flashcard-decks"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("education_flashcard_decks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FlashcardDeck[];
    },
  });
};

export const useDeckCards = (deckId: string | undefined) => {
  return useQuery({
    queryKey: ["flashcards", deckId],
    queryFn: async () => {
      if (!deckId) return [];
      const { data, error } = await supabase
        .from("education_flashcards")
        .select("*")
        .eq("deck_id", deckId)
        .order("order_index");
      if (error) throw error;
      return (data ?? []) as Flashcard[];
    },
    enabled: !!deckId,
  });
};

export const useCreateDeck = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (deck: Partial<FlashcardDeck>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("education_flashcard_decks")
        .insert({
          user_id: user.id,
          title: deck.title ?? "Untitled deck",
          description: deck.description ?? null,
          subject: deck.subject ?? null,
          is_public: deck.is_public ?? false,
        })
        .select()
        .single();
      if (error) throw error;
      return data as FlashcardDeck;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flashcard-decks"] }),
  });
};

export const useAddCard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (card: Partial<Flashcard> & { deck_id: string; front: string; back: string }) => {
      const { data, error } = await supabase
        .from("education_flashcards")
        .insert(card)
        .select()
        .single();
      if (error) throw error;
      // bump count
      await supabase.rpc("increment", { x: 1 }).then(() => {}).catch(() => {});
      const { data: cnt } = await supabase
        .from("education_flashcards")
        .select("id", { count: "exact", head: true })
        .eq("deck_id", card.deck_id);
      await supabase.from("education_flashcard_decks").update({ card_count: (cnt as any)?.length ?? 0 }).eq("id", card.deck_id);
      return data as Flashcard;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["flashcards", vars.deck_id] });
      qc.invalidateQueries({ queryKey: ["flashcard-decks"] });
    },
  });
};

export const useAIGenerateCards = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ deckId, topic, count }: { deckId: string; topic: string; count?: number }) => {
      const { cards } = await eduCall<{ cards: any[] }>("deck.ai_generate", { topic, count: count ?? 10 });
      if (!cards?.length) throw new Error("AI returned no cards");
      const rows = cards.map((c: any, i: number) => ({
        deck_id: deckId,
        front: String(c.front ?? "").slice(0, 500),
        back: String(c.back ?? "").slice(0, 1000),
        hint: c.hint ? String(c.hint).slice(0, 200) : null,
        order_index: i,
      }));
      const { error } = await supabase.from("education_flashcards").insert(rows);
      if (error) throw error;
      await supabase.from("education_flashcard_decks").update({ card_count: rows.length }).eq("id", deckId);
      return rows.length;
    },
    onSuccess: (n, vars) => {
      qc.invalidateQueries({ queryKey: ["flashcards", vars.deckId] });
      qc.invalidateQueries({ queryKey: ["flashcard-decks"] });
      toast.success(`Generated ${n} flashcards`);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to generate"),
  });
};

export const useSRSQueue = (deckId?: string) => {
  return useQuery({
    queryKey: ["srs-queue", deckId],
    queryFn: async () => {
      const { cards } = await eduCall<{ cards: any[] }>("srs.due", { limit: 20 });
      // optional client-side filter by deck
      const filtered = deckId
        ? cards.filter((c: any) => c.education_flashcards?.deck_id === deckId)
        : cards;
      return filtered;
    },
  });
};

export const useReviewCard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ cardId, quality }: { cardId: string; quality: number }) => {
      return eduCall("srs.review", { card_id: cardId, quality });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["srs-queue"] }),
  });
};
