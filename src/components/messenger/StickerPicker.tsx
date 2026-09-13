import { UNIQUE_STICKERS, type UniqueSticker } from "@/data/stickers";

interface StickerPickerProps {
  onSelect: (sticker: UniqueSticker) => void;
}

/** Grid of original Unique stickers for chat. */
export const StickerPicker = ({ onSelect }: StickerPickerProps) => {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        Unique Stickers
      </p>
      <div className="grid grid-cols-4 gap-1">
        {UNIQUE_STICKERS.map((s) => (
          <button
            key={s.id}
            type="button"
            title={s.name}
            onClick={() => onSelect(s)}
            className="p-1 rounded-xl hover:bg-muted transition-colors active:scale-95"
          >
            <img
              src={s.url}
              alt={s.name}
              loading="lazy"
              className="w-14 h-14 object-contain mx-auto"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
