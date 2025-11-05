import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Edit2, Save, X, Music } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VoiceClone {
  id: string;
  voice_id: string;
  name: string;
  description: string;
  created_at: string;
}

export function VoiceCloneManager() {
  const [voiceClones, setVoiceClones] = useState<VoiceClone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadVoiceClones();
  }, []);

  const loadVoiceClones = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('list-voice-clones', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.success) {
        setVoiceClones(data.voiceClones);
      }
    } catch (error: any) {
      toast({
        title: "Loading error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (clone: VoiceClone) => {
    setEditingId(clone.id);
    setEditForm({ name: clone.name, description: clone.description || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', description: '' });
  };

  const handleUpdate = async (voiceCloneId: string) => {
    if (!editForm.name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) throw new Error('No session');

      const { data, error } = await supabase.functions.invoke('update-voice-clone', {
        body: {
          voiceCloneId,
          name: editForm.name,
          description: editForm.description,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: "Voice updated",
        });
        setEditingId(null);
        loadVoiceClones();
      }
    } catch (error: any) {
      toast({
        title: "Update error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (voiceCloneId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) throw new Error('No session');

      const { data, error } = await supabase.functions.invoke('delete-voice-clone', {
        body: { voiceCloneId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: "Voice deleted",
        });
        setDeleteDialogId(null);
        loadVoiceClones();
      }
    } catch (error: any) {
      toast({
        title: "Deletion error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Voice Clone Management</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Voice Clone Management
          </CardTitle>
          <CardDescription>
            Manage your cloned voices - edit names, descriptions or delete unused ones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {voiceClones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>You don't have any cloned voices yet</p>
              <p className="text-sm mt-2">Upload your first audio file above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {voiceClones.map((clone) => (
                <Card key={clone.id} className="border-2">
                  <CardContent className="pt-6">
                    {editingId === clone.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Name</label>
                          <Input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            placeholder="Voice name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            placeholder="Voice description (optional)"
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleUpdate(clone.id)} size="sm">
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button onClick={cancelEdit} variant="outline" size="sm">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{clone.name}</h3>
                            {clone.description && (
                              <p className="text-sm text-muted-foreground mt-1">{clone.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Created: {formatDate(clone.created_at)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Voice ID: {clone.voice_id}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => startEdit(clone)}
                              variant="outline"
                              size="sm"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => setDeleteDialogId(clone.id)}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogId !== null} onOpenChange={() => setDeleteDialogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this voice?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The voice will be permanently deleted from your account and ElevenLabs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialogId && handleDelete(deleteDialogId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
