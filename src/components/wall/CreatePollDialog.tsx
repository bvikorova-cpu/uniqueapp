import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Plus, X } from "lucide-react";

interface CreatePollDialogProps {
  onCreatePoll: (question: string, options: string[], endsAt: Date) => void;
}

export const CreatePollDialog = ({ onCreatePoll }: CreatePollDialogProps) => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [duration, setDuration] = useState(24);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = () => {
    const validOptions = options.filter(o => o.trim());
    if (question.trim() && validOptions.length >= 2) {
      const endsAt = new Date();
      endsAt.setHours(endsAt.getHours() + duration);
      onCreatePoll(question, validOptions, endsAt);
      setOpen(false);
      setQuestion("");
      setOptions(["", ""]);
      setDuration(24);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BarChart3 className="w-4 h-4 mr-2" />
          Add Poll
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Poll</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Question</Label>
            <Input
              placeholder="What's your question?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Options</Label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                />
                {options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <Button
                variant="outline"
                size="sm"
                onClick={addOption}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            )}
          </div>

          <div>
            <Label>Duration (hours)</Label>
            <Input
              type="number"
              min={1}
              max={168}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>

          <Button onClick={handleCreate} className="w-full">
            Create Poll
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
