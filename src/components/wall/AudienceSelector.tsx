import { Globe, Users, Heart, Lock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type PostAudience = "public" | "friends" | "close_friends" | "private";

interface Props {
  value: PostAudience;
  onChange: (v: PostAudience) => void;
}

export const AudienceSelector = ({ value, onChange }: Props) => {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as PostAudience)}>
      <SelectTrigger className="w-[180px] h-9">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="public">
          <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> Public</span>
        </SelectItem>
        <SelectItem value="friends">
          <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Friends</span>
        </SelectItem>
        <SelectItem value="close_friends">
          <span className="flex items-center gap-2"><Heart className="w-4 h-4 text-rose-500" /> Close friends</span>
        </SelectItem>
        <SelectItem value="private">
          <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> Only me</span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
