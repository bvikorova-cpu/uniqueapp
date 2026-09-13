import { useState, type ReactNode } from "react";
import { Sticker } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StickerPicker } from "@/components/messenger/StickerPicker";
import type { UniqueSticker } from "@/data/stickers";

interface StickerButtonProps {
  /** Called with the picked sticker; popover closes automatically. */
  onSelect: (sticker: UniqueSticker) => void;
  /** Optional custom trigger (defaults to a small ghost icon button). */
  trigger?: ReactNode;
  className?: string;
}

/** Reusable Unique sticker picker trigger for posts, comments and chats. */
export const StickerButton = ({ onSelect, trigger, className }: StickerButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger ?? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Stickers"
            className={className ?? "h-8 w-8 text-pink-500 hover:bg-pink-50"}
          >
            <Sticker className="h-4 w-4" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3">
        <StickerPicker
          onSelect={(s) => {
            onSelect(s);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
