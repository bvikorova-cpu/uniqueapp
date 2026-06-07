import PostCard from "@/components/feed/PostCard";
import RepostCard from "@/components/feed/RepostCard";
import MonetagInFeedAd from "@/components/ads/MonetagInFeedAd";

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  reposts_count: number;
  feeling?: string | null;
  location?: string | null;
  media: Array<{ id: string; file_url: string; file_type: string }>;
  profiles: { id: string; full_name: string | null; avatar_url: string | null };
}

interface Repost {
  id: string;
  user_id: string;
  comment: string;
  created_at: string;
  original_post: Post;
  profiles: { id: string; full_name: string | null; avatar_url: string | null };
}

export type FeedItem =
  | { type: "post"; data: Post }
  | { type: "repost"; data: Repost };

interface WallPostProps {
  item: FeedItem;
  index: number;
  onDelete: () => void;
}

/**
 * Single feed row: renders a PostCard or RepostCard and an
 * interstitial Monetag ad every 20 items.
 */
const WallPost = ({ item, index, onDelete }: WallPostProps) => {
  return (
    <div className="pb-3 sm:pb-4">
      {item.type === "post" ? (
        <PostCard post={item.data} onDelete={onDelete} />
      ) : (
        <RepostCard repost={item.data} onDelete={onDelete} />
      )}
      {(index + 1) % 20 === 0 && (
        <div className="mt-3 sm:mt-4">
          <MonetagInFeedAd slotIndex={Math.floor((index + 1) / 20)} />
        </div>
      )}
    </div>
  );
};

export default WallPost;
export type { Post, Repost };
