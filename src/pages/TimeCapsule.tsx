import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Mail, Video, FileText, Calendar, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function TimeCapsule() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [capsules, setCapsules] = useState<any[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [capsuleType, setCapsuleType] = useState<"text" | "video" | "letter">("text");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");

  useEffect(() => {
    checkAuth();
    handlePaymentSuccess();
    loadCapsules();
  }, [searchParams]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    if (!session) {
      navigate("/auth");
    }
  };

  const handlePaymentSuccess = () => {
    const success = searchParams.get('success');
    const premiumSuccess = searchParams.get('premium_success');

    if (success === 'true') {
      toast({
        title: "Payment Successful!",
        description: "You can now create your time capsule.",
      });
    } else if (premiumSuccess === 'true') {
      toast({
        title: "Premium Activated!",
        description: "Your Premium subscription is now active.",
      });
    }
  };

  const loadCapsules = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("time_capsules")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCapsules(data || []);
    } catch (error) {
      console.error("Error loading capsules:", error);
    }
  };

  const calculateDuration = (deliveryDate: string) => {
    const now = new Date();
    const delivery = new Date(deliveryDate);
    const years = Math.floor((delivery.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365));
    return years;
  };

  const handleSubmit = async () => {
    if (!title || !deliveryDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in title and delivery date.",
        variant: "destructive",
      });
      return;
    }

    const durationYears = calculateDuration(deliveryDate);
    if (durationYears < 0) {
      toast({
        title: "Invalid Date",
        description: "Delivery date must be in the future.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // For now, save as pending payment
      const { error } = await supabase.functions.invoke("save-time-capsule", {
        body: {
          title,
          message,
          capsuleType,
          deliveryDate,
          recipientEmail,
          recipientName,
          durationYears,
          pricePaid: null,
          stripePaymentId: null,
        },
      });

      if (error) throw error;

      toast({
        title: "Time Capsule Created!",
        description: `Your message will be delivered on ${new Date(deliveryDate).toLocaleDateString()}.`,
      });

      // Reset form
      setTitle("");
      setMessage("");
      setDeliveryDate("");
      setRecipientEmail("");
      setRecipientName("");
      
      loadCapsules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create time capsule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500/10 via-background to-cyan-500/10">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 pt-16 sm:pt-12">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block p-2 sm:p-3 bg-blue-500/10 rounded-full mb-3 sm:mb-4">
            <Clock className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Create Your Time Capsule
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Write a message to your future self or loved ones
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Create Capsule Form */}
          <Card>
            <CardHeader>
              <CardTitle>New Time Capsule</CardTitle>
              <CardDescription>
                Create a message that will be delivered in the future
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Capsule Title</Label>
                <Input
                  id="title"
                  placeholder="E.g., Letter to my 30-year-old self"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <Tabs value={capsuleType} onValueChange={(v) => setCapsuleType(v as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="text" className="text-xs sm:text-sm">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="video" className="text-xs sm:text-sm">
                    <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Video
                  </TabsTrigger>
                  <TabsTrigger value="letter" className="text-xs sm:text-sm">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Letter
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="message">Your Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Write your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="video" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Upload Video</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Video upload coming soon</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="letter" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="letter">Write Your Letter</Label>
                    <Textarea
                      id="letter"
                      placeholder="Dear future me..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={8}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label htmlFor="delivery-date">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Delivery Date
                </Label>
                <Input
                  id="delivery-date"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient-name">Recipient Name (Optional)</Label>
                <Input
                  id="recipient-name"
                  placeholder="Who should receive this?"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient-email">Recipient Email (Optional)</Label>
                <Input
                  id="recipient-email"
                  type="email"
                  placeholder="their@email.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Create Time Capsule
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* My Capsules */}
          <Card>
            <CardHeader>
              <CardTitle>My Time Capsules</CardTitle>
              <CardDescription>
                Your messages waiting to be delivered
              </CardDescription>
            </CardHeader>
            <CardContent>
              {capsules.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No time capsules yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Create your first one to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {capsules.map((capsule) => (
                    <Card key={capsule.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{capsule.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded ${
                            capsule.is_delivered 
                              ? 'bg-green-500/20 text-green-600' 
                              : 'bg-blue-500/20 text-blue-600'
                          }`}>
                            {capsule.is_delivered ? 'Delivered' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {capsule.message?.substring(0, 100)}
                          {capsule.message?.length > 100 && "..."}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Delivery: {formatDate(capsule.delivery_date)}
                        </div>
                        {capsule.recipient_name && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Mail className="h-3 w-3" />
                            To: {capsule.recipient_name}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" onClick={() => navigate("/time-capsule-subscription")}>
            View All Plans
          </Button>
        </div>
      </div>
    </div>
  );
}
