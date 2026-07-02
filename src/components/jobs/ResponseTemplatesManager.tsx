import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Pencil, Trash2 } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  template_type: string;
  is_default: boolean;
}

export const ResponseTemplatesManager = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    template_type: "general",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('job_response_templates')
        .select('*')
        .eq('employer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load templates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingTemplate) {
        const { error } = await supabase
          .from('job_response_templates')
          .update(formData)
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast({ title: "Template updated" });
      } else {
        const { error } = await supabase
          .from('job_response_templates')
          .insert({
            ...formData,
            employer_id: user.id,
          });

        if (error) throw error;
        toast({ title: "Template created" });
      }

      setOpen(false);
      resetForm();
      loadTemplates();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const { error } = await supabase
        .from('job_response_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Template deleted" });
      loadTemplates();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      template_type: template.template_type,
    });
    setOpen(true);
  };

  const resetForm = () => {
    setEditingTemplate(null);
    setFormData({
      name: "",
      subject: "",
      body: "",
      template_type: "general",
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'accepted': return 'Acceptance';
      case 'rejected': return 'Rejection';
      case 'interview': return 'Interview';
      default: return 'General';
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Response Templates Manager works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Response Templates</h2>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'New Template'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Interview Invitation"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Template Type</Label>
                <select
                  id="type"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.template_type}
                  onChange={(e) => setFormData({ ...formData, template_type: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="accepted">Application Accepted</option>
                  <option value="rejected">Application Rejected</option>
                  <option value="interview">Interview Invitation</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Message subject"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Message Content</Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Message text..."
                  rows={10}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  You can use variables: {'{{job_title}}'}, {'{{company_name}}'}
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTemplate ? 'Save' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">You don't have any templates yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">
                        {getTypeLabel(template.template_type)}
                      </Badge>
                      {template.is_default && (
                        <Badge variant="outline">Default</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(template)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {!template.is_default && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-semibold">Subject:</p>
                    <p className="text-sm text-muted-foreground">{template.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Content:</p>
                    <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                      {template.body}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </>
    );
};
