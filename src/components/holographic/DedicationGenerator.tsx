import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Loader2, Sparkles, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DedicationGenerator = () => {
  const [artistName, setArtistName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setCheckingAccess(false);
        return;
      }

      const { data, error } = await supabase.rpc('has_holographic_access', {
        user_id_param: session.user.id,
        service_type_param: 'ai_dedication'
      });

      if (!error) setHasAccess(data);
    } catch (error) {
      console.error('Error checking access:', error);
    } finally {
      setCheckingAccess(false);
    }
  };

  const handleGenerate = async () => {
    if (!artistName || !recipientName || !message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setGenerating(true);

      const { data, error } = await supabase.functions.invoke('generate-ai-dedication', {
        body: { artistName, recipientName, message }
      });

      if (error) throw error;

      toast({
        title: "Dedication Generated! 🎤",
        description: "Your personalized dedication is ready",
      });

      setArtistName("");
      setRecipientName("");
      setMessage("");
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Generation Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  if (checkingAccess) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-950/10 to-background">
        <CardContent className="py-12 text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto" />
          <h3 className="text-xl font-semibold">Access Required</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Purchase "AI Personalized Dedication" to generate custom messages
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-950/10 to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <MessageSquare className="w-6 h-6 text-purple-400" />
          AI Dedication Generator
        </CardTitle>
        <CardDescription>
          Get a personalized message from your favorite holographic artist
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="artist">Select Artist</Label>
          <Select value={artistName} onValueChange={setArtistName}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an artist" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Freddie Mercury">Freddie Mercury</SelectItem>
              <SelectItem value="Elvis Presley">Elvis Presley</SelectItem>
              <SelectItem value="Michael Jackson">Michael Jackson</SelectItem>
              <SelectItem value="Whitney Houston">Whitney Houston</SelectItem>
              <SelectItem value="John Lennon">John Lennon</SelectItem>
              <SelectItem value="David Bowie">David Bowie</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Name</Label>
          <Input
            id="recipient"
            placeholder="e.g., Sarah"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Your Message Context</Label>
          <Textarea
            id="message"
            placeholder="Tell us about the recipient and why this dedication is special... e.g., 'For my mom on her 60th birthday, she's been a huge fan since the 70s'"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </div>

        <Button 
          onClick={handleGenerate}
          disabled={generating}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Dedication
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DedicationGenerator;
