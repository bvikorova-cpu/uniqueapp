import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollText } from "lucide-react";
import { toast } from "sonner";

const KEY = "iq_bio";

export default function IQBioEditor() {
  const [bio, setBio] = useState("");
  useEffect(() { setBio(localStorage.getItem(KEY) || ""); }, []);
  const save = () {
    localStorage.setItem(KEY, bio.slice(0, 200));
    toast.success("Bio saved");
  };
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><ScrollText className="w-5 h-5" />Profile Bio</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about your IQ journey..." maxLength={200} rows={3} />
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{bio.length}/200</span>
          <Button size="sm" onClick={save}>Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}
