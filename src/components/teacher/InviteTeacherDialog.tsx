import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InviteTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  onSuccess: () => void;
}

export default function InviteTeacherDialog({ 
  open, 
  onOpenChange, 
  schoolId,
  onSuccess 
}: InviteTeacherDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "teacher"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // Check if email already exists in the team
      const { data: existing } = await supabase
        .from("school_team_members")
        .select("id")
        .eq("school_id", schoolId)
        .eq("email", formData.email)
        .maybeSingle();

      if (existing) {
        toast.error("This email is already part of your team");
        setLoading(false);
        return;
      }

      // Get current user to use as temporary user_id (they will join later)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("school_team_members")
        .insert({
          school_id: schoolId,
          user_id: user.id, // Temporary - will be updated when they join
          name: formData.name,
          email: formData.email,
          role: formData.role
        });

      if (error) throw error;

      toast.success("Teacher invited successfully!");
      setFormData({ name: "", email: "", role: "teacher" });
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error inviting teacher:", error);
      toast.error(error.message || "Failed to invite teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Teacher</DialogTitle>
          <DialogDescription>
            Send an invitation to a teacher to join your team
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Teacher Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Jane Smith"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="teacher@school.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g., Primary Teacher"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Inviting..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}