import { useCallback, useEffect, useState } from "react";
import { Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GiftShopSheet } from "./GiftShopSheet";
import { GiftVisual } from "./GiftVisual";

interface PostGiftRow {
  gift_id: string;
  created_at: string;
  gift_catalog: {
    slug: string;
    name: string;
    animation: string;
    image_url: string | null;
  } | null;
}

interface PostGiftProps {
  postId: string;
  authorId: string;
  authorName?: string;
  currentUserId?: string | null;
}

function usePostGifts(postId: string) {
  const [gifts, setGifts] = useState<PostGiftRow[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("gift_transactions")
      .select("gift_id, created_at, gift_catalog(slug, name, animation, image_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(12);
    setGifts((data as unknown as PostGiftRow[]) || []);
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  return { gifts, reload: load };
}

/** Small strip of the 3D gifts a post has received. */
export function PostGiftStrip({ postId }: PostGiftProps) {
  const { gifts } = usePostGifts(postId);
  if (gifts.length === 0) return null;

  return (
    <div className="flex items-center gap-1 pt-3">
      {gifts.slice(0, 6).map((g, i) => (
        <GiftVisual
          key={`${g.gift_id}-${i}`}
          slug={g.gift_catalog?.slug || ""}
          name={g.gift_catalog?.name || "Gift"}
          image_url={g.gift_catalog?.image_url ?? null}
          animation={g.gift_catalog?.animation || "float"}
          size={26}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">
        {gifts.length} gift{gifts.length === 1 ? "" : "s"}
      </span>
    </div>
  );
}

/**
 * Post-level gift action: same credit-based Unique Gifts catalog as chat.
 * The post author receives 50% of the gift value in credits.
 */
export function PostGiftAction({ postId, authorId, authorName, currentUserId }: PostGiftProps) {
  const { gifts, reload } = usePostGifts(postId);
  const isOwnPost = !!currentUserId && currentUserId === authorId;

  if (isOwnPost) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className="w-full gap-1 px-1 sm:px-3 opacity-70"
        title="You cannot send gifts to your own post"
      >
        <Gift className="h-4 w-4 text-primary shrink-0" />
        <span className="text-xs font-medium">
          {gifts.length > 0 ? gifts.length : <span className="hidden sm:inline">Gifts</span>}
        </span>
      </Button>
    );
  }

  return (
    <GiftShopSheet
      postId={postId}
      recipientName={authorName}
      onSent={reload}
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-1 px-1 sm:px-3 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
          title="Send a gift"
        >
          <Gift className="h-4 w-4 text-primary shrink-0" />
          <span className="text-xs font-medium">
            {gifts.length > 0 ? gifts.length : <span className="hidden sm:inline">Gift</span>}
          </span>
        </Button>
      }
    />
  );
}
