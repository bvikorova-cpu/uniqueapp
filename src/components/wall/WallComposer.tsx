import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { EnhancedCreatePost } from "@/components/wall/EnhancedCreatePost";
import { Plus } from "lucide-react";

interface WallComposerProps {
  onPostCreated: () => void;
  userProfile: any;
  variant?: "floating" | "inline";
}

/**
 * Mobile composer for creating new posts.
 * - floating: legacy FAB above bottom nav (default)
 * - inline: compact purple button meant to sit in a toolbar row
 * Hidden on lg+ where the sidebar composer is used instead.
 */
const WallComposer = ({ onPostCreated, userProfile, variant = "floating" }: WallComposerProps) => {
  const [open, setOpen] = useState(false);

  const isFloating = variant === "floating";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          title="New post"
          aria-label="New post"
          className={
            isFloating
              ? "lg:hidden fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 z-50 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
              : "lg:hidden h-10 w-10 rounded-full shadow-md bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shrink-0"
          }
        >
          <Plus className={isFloating ? "h-7 w-7" : "h-5 w-5"} strokeWidth={2.5} />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[80vh] rounded-t-3xl overflow-y-auto"
      >
        <div className="py-4">
          <EnhancedCreatePost
            onPostCreated={() => {
              onPostCreated();
              setOpen(false);
            }}
            userProfile={userProfile}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WallComposer;
