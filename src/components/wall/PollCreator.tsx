import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { usePostPolls } from "@/hooks/usePostPolls";

interface PollCreatorProps {
  postId: string;
  onClose: () => void;
}

export const PollCreator = ({ postId, onClose }: PollCreatorProps) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const { createPoll } = usePostPolls();

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
    const validOptions = options.filter(opt => opt.trim() !== "");
    if (question.trim() && validOptions.length >= 2) {
      createPoll({ postId, question, options: validOptions });
      onClose();
    }
  };

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-background">
      <div>
        <Label htmlFor="question">Poll Question</Label>
        <Input
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
        />
      </div>

      <div className="space-y-2">
        <Label>Options</Label>
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
            {options.length > 2 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeOption(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {options.length < 6 && (
          <Button type="button" variant="outline" onClick={addOption} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleCreate} className="flex-1">Create Poll</Button>
        <Button onClick={onClose} variant="outline">Cancel</Button>
      </div>
    </div>
  );
};
