import { useState } from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover,
  PopoverContent,
  PopoverTrigger } from "@/components/ui/popover";
import { MOOD_OPTIONS } from "@/hooks/usePostMood";

interface MoodSelectorProps {
  onSelect: (mood: string, emoji: string) => void;
  selectedMood?: string;
}

export const MoodSelector = ({ onSelect, selectedMood }: MoodSelectorProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (mood: string, emoji: string) => {
    onSelect(mood, emoji);
    setOpen(false);
  };

  const selected = MOOD_OPTIONS.find((m) => m.value === selectedMood);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          {selected ? (
            <>
              <span className="mr-2">{selected.emoji}</span>
              Feeling {selected.label}
            </>
          ) : (
            <>
              <Smile className="w-4 h-4 mr-2" />
              Add Mood
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid grid-cols-2 gap-2">
          {MOOD_OPTIONS.map((mood) => (
            <Button
              key={mood.value}
              variant={selectedMood === mood.value ? "default" : "ghost"}
              className="justify-start"
              onClick={() => handleSelect(mood.value, mood.emoji)}
            >
              <span className="text-2xl mr-2">{mood.emoji}</span>
              {mood.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
