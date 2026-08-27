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

interface PostGiftButtonProps {
  postId: string;
  authorId: string;
  authorName?: string;
  currentUserId?: string | null;
  /** Renders the received-gift strip above the action row. */
  showStrip?: boolean;
}

/**
 * Post-level gift action: same credit-based Unique Gifts catalog as chat,
 * but the author of the post receives 50% of the value in credits.
 */
export function PostGiftButton({
  postId,
  authorId,
  authorName,
  currentUserId,
  showStrip = true,
}: PostGiftButtonProps) {
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

  const isOwn = currentUserId === authorId;

  return (
    <>
      {showStrip && gifts.length > 0 && (
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
      )}

      {!isOwn && (
        <GiftShopSheet
          postId={postId}
          recipientName={authorName}
          onSent={load}
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 flex-1 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
              title="Send a gift"
            >
              <Gift className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">
                {gifts.length > 0 ? gifts.length : "Gift"}
              </span>
            </Button>
          }
        />
      )}
    </>
  );
}
