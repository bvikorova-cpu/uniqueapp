import { useState } from "react";
import { STICKER_PACKS, type UniqueSticker } from "@/data/stickers";

interface StickerPickerProps {
  onSelect: (sticker: UniqueSticker) => void;
}

/** Grid of original Unique stickers for chat, grouped into packs. */
export const StickerPicker = ({ onSelect }: StickerPickerProps) => {
  const [activePack, setActivePack] = useState(STICKER_PACKS[0].id);
  const pack = STICKER_PACKS.find((p) => p.id === activePack) ?? STICKER_PACKS[0];

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2 -mx-1 px-1">
        {STICKER_PACKS.map((p) => (
          <button
            key={p.id}
            type="button"
            title={p.name}
            onClick={() => setActivePack(p.id)}
            className={`shrink-0 h-8 w-8 rounded-full text-base transition-colors ${
              p.id === activePack ? "bg-primary/15 ring-1 ring-primary" : "hover:bg-muted"
            }`}
          >
            {p.emoji}
          </button>
        ))}
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        {pack.name}
      </p>

      <div className="grid grid-cols-4 gap-1 max-h-56 overflow-y-auto">
        {pack.stickers.map((s) => (
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
