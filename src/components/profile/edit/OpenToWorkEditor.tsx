import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OpenToWorkDetails } from "@/components/profile/OpenToWork";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const OpenToWorkEditor = ({
  enabled,
  details,
  onChange,
}: {
  enabled: boolean;
  details: OpenToWorkDetails;
  onChange: (enabled: boolean, details: OpenToWorkDetails) => void;
}) => {
  const [newRole, setNewRole] = useState("");
  const roles = details.roles || [];

  const addRole = () => {
    const r = newRole.trim();
    if (!r || roles.includes(r)) return;
    onChange(enabled, { ...details, roles: [...roles, r] });
    setNewRole("");
  };

  return (
    <>
      <FloatingHowItWorks title={"Open To Work Editor - How it works"} steps={[{ title: 'Open', desc: 'Access the Open To Work Editor section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Open To Work Editor.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-5 mb-6 bg-gradient-to-br from-emerald-500/10 to-card/40 border-emerald-500/30">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-emerald-400" />
          <Label className="font-semibold">Open to work</Label>
        </div>
        <Switch checked={enabled} onCheckedChange={(v) => onChange(v, details)} />
      </div>

      {enabled && (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Looking for roles</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="e.g. Frontend Developer"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addRole()}
              />
              <Button type="button" variant="outline" onClick={addRole}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {roles.map((r) => (
                <Badge
                  key={r}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => onChange(enabled, { ...details, roles: roles.filter((x) => x !== r) })}
                >
                  {r} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Remote OK</Label>
            <Switch
              checked={!!details.remote}
              onCheckedChange={(v) => onChange(enabled, { ...details, remote: v })}
            />
          </div>

          <div>
            <Label className="text-xs">Short note</Label>
            <Textarea
              rows={2}
              maxLength={140}
              placeholder="What you're looking for..."
              value={details.note || ""}
              onChange={(e) => onChange(enabled, { ...details, note: e.target.value })}
            />
          </div>
        </div>
      )}
    </Card>
    </>
  );
};
