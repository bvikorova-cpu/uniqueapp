import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { EnhancedCreatePost } from "@/components/wall/EnhancedCreatePost";

interface WallComposerProps {
  onPostCreated: () => void;
  userProfile: any;
}

/**
 * Mobile floating action button + bottom sheet for creating new posts.
 * Hidden on lg+ where the sidebar composer is used instead.
 */
const WallComposer = ({ onPostCreated, userProfile }: WallComposerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="lg:hidden fixed bottom-[calc(14rem+env(safe-area-inset-bottom))] right-4 z-50 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
        >
          <span className="text-2xl font-bold">+</span>
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
