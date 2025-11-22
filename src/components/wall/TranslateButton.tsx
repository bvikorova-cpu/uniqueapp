import { useState } from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslations, LANGUAGES } from "@/hooks/useTranslations";

interface TranslateButtonProps {
  postId: string;
  originalContent: string;
}

export const TranslateButton = ({ postId, originalContent }: TranslateButtonProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { translation, translatePost } = useTranslations(postId, selectedLanguage || undefined);

  const handleTranslate = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    translatePost({ postId, language: languageCode, content: originalContent });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <Languages className="w-4 h-4 mr-2" />
          {translation ? "Translated" : "Translate"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm mb-3">Translate to:</h4>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((lang) => (
              <Button
                key={lang.code}
                variant={selectedLanguage === lang.code ? "default" : "outline"}
                size="sm"
                onClick={() => handleTranslate(lang.code)}
              >
                {lang.name}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
