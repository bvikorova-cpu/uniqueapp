import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";

const EMOJIS = [
  "😀","😂","🥰","😍","😘","😎","🤔","😏","😴","😅",
  "🥺","😭","😡","🤯","🥳","😇","🤩","😋","😜","🤗",
  "❤️","🧡","💛","💚","💙","💜","🖤","🤍","💔","💖",
  "💕","💞","💋","🌹","🔥","✨","⭐","💯","👀","👋",
  "👍","👎","👏","🙏","💪","🤝","💃","🕺","🍷","🥂",
  "🍕","🍔","☕","🍫","🍿","🎉","🎁","🎵","📸","🌙",
];

export const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Smile className="h-5 w-5" /></Button>
    </PopoverTrigger>
    <PopoverContent align="end" className="w-72 p-2 bg-background z-50">
      <div className="grid grid-cols-10 gap-1 text-xl">
        {EMOJIS.map((e) => (
          <button key={e} type="button" onClick={() => onSelect(e)} className="hover:bg-muted rounded p-1 transition-colors">{e}</button>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);
