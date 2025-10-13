import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Heart, MessageCircle, Share2, Upload, Video, Camera, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReferralProgram } from "@/components/megatalent/ReferralProgram";
import { useTranslation } from "react-i18next";

const categoryGroups = [
  {
    group: "🎨 Umenie & Kreativita",
    categories: [
      { value: "drawing", label: "🎨 Kreslenie" },
      { value: "painting", label: "🖌️ Maľovanie" },
      { value: "digital_art", label: "💻 Digitálne umenie" },
      { value: "sculpture", label: "🗿 Socha / Modelovanie" },
      { value: "photography", label: "📸 Fotografia" },
      { value: "handmade", label: "✂️ Handmade výrobky" },
      { value: "makeup_art", label: "💄 Makeup art" },
      { value: "tattoo", label: "⚡ Najlepšie tetovanie" },
    ]
  },
  {
    group: "🎤 Hudba",
    categories: [
      { value: "singing", label: "🎤 Spev" },
      { value: "instrument", label: "🎸 Hra na hudobný nástroj" },
      { value: "music_production", label: "🎧 Tvorba hudby / DJ" },
      { value: "beatbox", label: "🎵 Beatbox" },
      { value: "rap", label: "🎙️ Rap / Freestyle" },
    ]
  },
  {
    group: "💃 Tanec & Pohyb",
    categories: [
      { value: "dance", label: "💃 Tanec" },
      { value: "breakdance", label: "🕺 Breakdance" },
      { value: "gymnastics", label: "🤸 Gymnastika / Akrobacia" },
      { value: "parkour", label: "🏃 Parkour / Freerunning" },
    ]
  },
  {
    group: "💪 Šport & Fitness",
    categories: [
      { value: "training", label: "💪 Najlepší tréning" },
      { value: "yoga", label: "🧘 Jóga / Pilates" },
      { value: "martial_arts", label: "🥋 Bojové umenia" },
      { value: "extreme_sport", label: "🛹 Extrémne športy" },
      { value: "sport_trick", label: "⚽ Športové triky" },
    ]
  },
  {
    group: "😂 Zábava",
    categories: [
      { value: "funny_video", label: "😂 Najsmiešnejšie video" },
      { value: "standup", label: "🎭 Stand-up / Komediálne vystúpenie" },
      { value: "impressions", label: "🎪 Imitácie / Parodie" },
      { value: "magic", label: "🎩 Kúzla / Ilúzie" },
      { value: "pranks", label: "😜 Pranky / Skrytá kamera" },
    ]
  },
  {
    group: "💡 Vzdelávanie",
    categories: [
      { value: "life_advice", label: "💡 Najlepšia rada do života" },
      { value: "tutorial", label: "📚 Návod / Tutorial" },
      { value: "cooking", label: "👨‍🍳 Varenie / Pečenie" },
      { value: "diy", label: "🔧 DIY projekty" },
      { value: "science", label: "🔬 Veda / Experimenty" },
    ]
  },
  {
    group: "🌟 Ostatné",
    categories: [
      { value: "best_selfie", label: "🤳 Najlepšie selfie" },
      { value: "transformation", label: "✨ Transformácia (predtým/potom)" },
      { value: "pet_talent", label: "🐾 Talent domáceho miláčika" },
      { value: "other", label: "🌟 Iné talenty" },
    ]
  },
];

const Megatalent = () => {
  const { t } = useTranslation();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<'premium' | 'top_premium' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("drawing");
  const [loading, setLoading] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState("");
  const [cancelingSubscription, setCancelingSubscription] = useState(false);

  useEffect(() => {
    checkSubscription();
    fetchSubmissions();
  }, [selectedCategory]);

  useEffect(() => {
    if (isSubscribed) {
      fetchTotalVotes();
    }
  }, [isSubscribed, submissions]);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('megatalent_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      setIsSubscribed(!!data);
      setSubscriptionTier(data?.tier || null);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalVotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('talent_submissions')
        .select('votes_count')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      const total = data?.reduce((sum, submission) => sum + (submission.votes_count || 0), 0) || 0;
      
      // Add bonus 100,000 votes for TOP Premium users
      const bonusVotes = subscriptionTier === 'top_premium' ? 100000 : 0;
      setTotalVotes(total + bonusVotes);
    } catch (error) {
      console.error('Error fetching total votes:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('talent_submissions')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('category', selectedCategory as any)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleSubscribe = async (tier: 'premium' | 'top_premium') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('megatalent.login_required'),
          description: t('megatalent.login_required_desc'),
          variant: "destructive",
        });
        return;
      }

      // Check if user already has or had any subscription (active, expired, or cancelled)
      const { data: existingSub } = await supabase
        .from("megatalent_subscriptions")
        .select("id, status")
        .eq("user_id", user.id)
        .maybeSingle();

      // Validate and get referrer if referral code is provided
      let referrerId = null;
      if (referralCode.trim()) {
        // Only new users can use referral codes
        if (existingSub) {
          toast({
            title: t('megatalent.code_invalid'),
            description: t('megatalent.code_invalid_desc'),
            variant: "destructive",
          });
          return;
        }

        const { data: referralData } = await supabase
          .from("megatalent_referral_codes")
          .select("user_id")
          .eq("code", referralCode.trim().toUpperCase())
          .maybeSingle();

        if (!referralData) {
          toast({
            title: t('megatalent.invalid_code'),
            description: t('megatalent.invalid_code_desc'),
            variant: "destructive",
          });
          return;
        }

        if (referralData.user_id === user.id) {
          toast({
            title: t('megatalent.error'),
            description: t('megatalent.own_code_error'),
            variant: "destructive",
          });
          return;
        }

        referrerId = referralData.user_id;
      } else if (existingSub && existingSub.status === 'active') {
        // User already has active subscription, just inform them
        toast({
          title: t('megatalent.already_subscribed'),
          description: t('megatalent.already_subscribed_desc'),
          variant: "destructive",
        });
        return;
      }

      const price = tier === 'premium' ? 10 : 15;
      const bonusVotes = tier === 'top_premium' ? 100000 : 0;
      const winChanceBoost = tier === 'top_premium' ? 50 : 0;

      const { error } = await supabase
        .from('megatalent_subscriptions')
        .insert({
          user_id: user.id,
          tier,
          price,
          bonus_votes: bonusVotes,
          win_chance_boost: winChanceBoost,
          status: 'active',
          referred_by: referrerId,
        });

      if (error) throw error;

      toast({
        title: t('megatalent.successfully_activated'),
        description: tier === 'premium' ? t('megatalent.premium_activated') : t('megatalent.top_premium_activated'),
      });

      setIsSubscribed(true);
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: t('megatalent.error'),
        description: t('megatalent.activation_error'),
        variant: "destructive",
      });
    }
  };

  const handleCancelSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setCancelingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { subscriptionType: 'megatalent' }
      });

      if (error) throw error;

      toast({
        title: t('megatalent.subscription_cancelled'),
        description: data.message || t('megatalent.subscription_cancelled_desc'),
      });

      await checkSubscription();
    } catch (error) {
      console.error('Cancellation error:', error);
      toast({
        title: t('megatalent.error'),
        description: t('megatalent.cancel_error'),
        variant: "destructive",
      });
    } finally {
      setCancelingSubscription(false);
    }
  };

  const handleVote = (type: 'like' | 'dislike') => {
    toast({
      title: t('megatalent.voting'),
      description: `${type === 'like' ? t('megatalent.like') : t('megatalent.dislike')} ${t('megatalent.voting_desc')}`,
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: t('megatalent.login_required'),
        description: t('megatalent.upload_required_login'),
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const bucket = type === 'image' ? 'media' : 'videos';

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setUploadedFile({ url: publicUrl, type });
      
      toast({
        title: t('megatalent.successfully_uploaded'),
        description: type === 'image' ? t('megatalent.photo_uploaded') : t('megatalent.video_uploaded'),
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa nahrať súbor.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: t('megatalent.error'),
        description: t('megatalent.title_required'),
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: t('megatalent.error'),
        description: t('megatalent.description_required'),
        variant: "destructive",
      });
      return;
    }

    if (!uploadedFile) {
      toast({
        title: t('megatalent.error'),
        description: t('megatalent.media_required'),
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: t('megatalent.login_required'),
        description: t('megatalent.publish_required_login'),
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('talent_submissions')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          category: selectedCategory as any,
          media_url: uploadedFile.url,
          media_type: uploadedFile.type,
        });

      if (error) throw error;

      toast({
        title: t('megatalent.successfully_published'),
        description: t('megatalent.submission_added'),
      });

      // Reset form
      setTitle("");
      setDescription("");
      setUploadedFile(null);
      
      // Refresh submissions
      fetchSubmissions();
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: t('megatalent.error'),
        description: t('megatalent.publish_error'),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 flex items-center justify-center">
        <p className="text-lg">{t('megatalent.loading')}</p>
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <Badge className="bg-gold text-gold-foreground animate-glow">
                {t('megatalent.monthly_prize')}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {t('megatalent.enter_megatalent')}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('megatalent.subtitle')}
              </p>
            </div>

            <div className="mb-8 max-w-2xl mx-auto">
              <div className="p-4 bg-muted rounded-lg">
                <label className="text-sm font-medium mb-2 block">
                  {t('megatalent.referral_title')}
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  {t('megatalent.referral_description')}
                </p>
                <Input
                  type="text"
                  placeholder={t('megatalent.referral_placeholder')}
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  className="text-center tracking-wider font-mono text-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Premium Tier */}
              <Card className="bg-gradient-secondary border-border/50">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{t('megatalent.premium_title')}</CardTitle>
                  <div className="text-4xl font-bold text-gold">10 €<span className="text-lg">{t('megatalent.price_month')}</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span>{t('megatalent.access_contest')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{t('megatalent.chance_win')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{t('megatalent.upload_media')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{t('megatalent.voting_comments')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{t('megatalent.referral_5')}</span>
                    </div>
                  </div>
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full"
                    onClick={() => handleSubscribe('premium')}
                  >
                    {t('megatalent.activate_premium')}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    {t('megatalent.monthly_renews')}
                  </p>
                </CardContent>
              </Card>

              {/* TOP Premium Tier */}
              <Card className="bg-gradient-primary border-gold/50 relative overflow-hidden">
                <Badge className="absolute top-4 right-4 bg-gold text-gold-foreground">
                  {t('megatalent.recommended')}
                </Badge>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{t('megatalent.top_premium_title')}</CardTitle>
                  <div className="text-4xl font-bold text-gold">15 €<span className="text-lg">{t('megatalent.price_month')}</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gold">{t('megatalent.all_from_premium')}</p>
                    <div className="flex items-center gap-2">
                      <span>{t('megatalent.boost_win')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{t('megatalent.auto_votes')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{t('megatalent.priority_display')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{t('megatalent.exclusive_badge_item')}</span>
                    </div>
                  </div>
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full bg-gold hover:bg-gold/90"
                    onClick={() => handleSubscribe('top_premium')}
                  >
                    {t('megatalent.activate_top_premium')}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    {t('megatalent.monthly_renews')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="feed">{t('megatalent.contest')}</TabsTrigger>
            <TabsTrigger value="referral">{t('megatalent.referral_program')}</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Upload Section */}
              <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                {(subscriptionTier === 'premium' || subscriptionTier === 'top_premium') && (
                  <div className="p-4 rounded-lg bg-gradient-primary border border-gold/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Celkový počet hlasov:</span>
                      <Badge className="bg-gold text-gold-foreground text-base font-bold">
                        {totalVotes.toLocaleString('sk-SK')}
                      </Badge>
                    </div>
                    {subscriptionTier === 'top_premium' && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Obsahuje bonus +100,000 hlasov
                      </p>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Vybraná kategória:</p>
                  <Badge variant="outline" className="text-sm">
                    {categoryGroups.flatMap(g => g.categories).find(c => c.value === selectedCategory)?.label || "Vyberte kategóriu"}
                  </Badge>
                </div>
                
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <Accordion type="single" collapsible className="w-full">
                    {categoryGroups.map((group, idx) => (
                      <AccordionItem key={idx} value={`group-${idx}`}>
                        <AccordionTrigger className="text-sm font-medium">
                          {group.group}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-1">
                            {group.categories.map((cat) => (
                              <Button
                                key={cat.value}
                                variant={selectedCategory === cat.value ? "default" : "ghost"}
                                className="w-full justify-start text-sm"
                                onClick={() => setSelectedCategory(cat.value)}
                              >
                                {cat.label}
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ScrollArea>
                
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'image')}
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'video')}
                />
                
                <Button 
                  variant="premium" 
                  className="w-full"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Camera className="h-4 w-4" />
                  {uploading ? 'Nahrávam...' : 'Nahrať foto'}
                </Button>
                <Button 
                  variant="premium" 
                  className="w-full"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Video className="h-4 w-4" />
                  {uploading ? 'Nahrávam...' : 'Nahrať video'}
                </Button>
                
                {uploadedFile && (
                  <div className="mt-4">
                    {uploadedFile.type === 'image' ? (
                      <img src={uploadedFile.url} alt="Uploaded" className="w-full rounded-lg" />
                    ) : (
                      <video src={uploadedFile.url} controls className="w-full rounded-lg" />
                    )}
                  </div>
                )}
                
                <Input 
                  placeholder="Názov príspevku..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
                <Textarea 
                  placeholder="Napíš popis svojho talentu..." 
                  className="min-h-20"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                />
                <Button 
                  variant="hero" 
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={submitting || uploading}
                >
                  {submitting ? 'Zverejňujem...' : 'Zverejniť'}
                </Button>
              </CardContent>
              </Card>
              </div>

              {/* Feed */}
              <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {categoryGroups.flatMap(g => g.categories).find(c => c.value === selectedCategory)?.label || "Príspevky"}
              </h2>
              <Badge className="bg-gold text-gold-foreground">
                <TrendingUp className="h-4 w-4 mr-1" />
                Trending
              </Badge>
            </div>

            {/* Real Posts from Database */}
            {submissions.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  Zatiaľ žiadne príspevky v tejto kategórii. Buďte prvý!
                </p>
              </Card>
            ) : (
              submissions.map((submission) => (
                <Card key={submission.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                          {submission.profiles?.full_name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {submission.profiles?.full_name || 'Používateľ'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(submission.created_at).toLocaleDateString('sk-SK')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {categoryGroups.flatMap(g => g.categories).find(c => c.value === selectedCategory)?.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <h3 className="font-semibold text-lg">{submission.title}</h3>
                    {submission.media_type === 'image' ? (
                      <img 
                        src={submission.media_url} 
                        alt={submission.title}
                        className="w-full aspect-video object-cover rounded-lg"
                      />
                    ) : (
                      <video 
                        src={submission.media_url} 
                        controls
                        className="w-full aspect-video rounded-lg"
                      />
                    )}
                    <p className="text-sm">
                      {submission.description}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote('like')}
                          className="text-green-500 hover:text-green-600"
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          {submission.votes_count || 0}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          0
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
              )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mesačná súťaž</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold">10.000 €</div>
                  <p className="text-sm text-muted-foreground">Hlavná výhra</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Aktuálny mesiac:</span>
                    <span className="font-semibold">
                      {(() => {
                        const now = new Date();
                        const startDate = new Date('2026-01-01');
                        
                        if (now < startDate) {
                          return 'Začína 01.01.2026';
                        }
                        
                        const currentMonth = now.toLocaleDateString('sk-SK', { month: 'long', year: 'numeric' });
                        return currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Zostáva:</span>
                    <span className="font-semibold">
                      {(() => {
                        const now = new Date();
                        const startDate = new Date('2026-01-01');
                        
                        if (now < startDate) {
                          const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                          return `Štart o ${daysUntilStart} dní`;
                        }
                        
                        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                        const daysLeft = Math.ceil((lastDayOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        return `${daysLeft} ${daysLeft === 1 ? 'deň' : daysLeft < 5 ? 'dni' : 'dní'}`;
                      })()}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-gold h-2 rounded-full transition-all" 
                      style={{
                        width: `${(() => {
                          const now = new Date();
                          const startDate = new Date('2026-01-01');
                          
                          if (now < startDate) return '0%';
                          
                          const currentDay = now.getDate();
                          const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                          return `${(currentDay / daysInMonth) * 100}%`;
                        })()}`
                      }}
                    ></div>
                  </div>
                </div>
                </CardContent>
              </Card>
              </div>
            </div>
          </TabsContent>


          <TabsContent value="referral" className="mt-0">
            <div className="max-w-4xl mx-auto space-y-6">
              <ReferralProgram />
              
              {/* Subscription Management */}
              {isSubscribed && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Správa predplatného</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">Aktuálne predplatné</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {subscriptionTier === 'top_premium' ? 'Top Premium' : 'Premium'}
                        </p>
                      </div>
                      <Badge variant="default">Aktívne</Badge>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        Pri zrušení predplatného zostane aktívne do konca zaplateného obdobia. 
                        Vyplatená suma sa nevracia.
                      </p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={handleCancelSubscription}
                      disabled={cancelingSubscription}
                    >
                      {cancelingSubscription ? 'Ruším...' : 'Zrušiť predplatné'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Copyright Protection Section */}
        <Card className="mt-12 border-muted">
          <CardHeader>
            <CardTitle className="text-xl">⚖️ Ochrana autorského práva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="space-y-3">
              <p className="font-semibold text-foreground">
                Dôležité informácie pre všetkých účastníkov súťaže Megatalent:
              </p>
              
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">📸 Práva k nahranému obsahu:</h3>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Nahraním príspevku potvrdzujete, že ste autorom alebo máte právo obsah zverejniť</li>
                  <li>Nesmú sa nahrávať cudzie fotografie, videá ani iný chránený obsah bez povolenia</li>
                  <li>Za nahratie cudzieho obsahu nesie plnú zodpovednosť autor príspevku</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-foreground">🛡️ Naše zodpovednosti:</h3>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Platforma Megatalent slúži len ako priestor pre zverejnenie obsahu</li>
                  <li>Prevádzkovateľ platformy nezodpovedá za obsah nahraný používateľmi</li>
                  <li>V prípade porušenia autorských práv bude obsah okamžite odstránený</li>
                  <li>Vyhradujeme si právo zablokovať používateľov, ktorí porušujú pravidlá</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-foreground">⚠️ Upozornenie:</h3>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Porušenie autorských práv môže mať vážne právne následky</li>
                  <li>Nahraním obsahu súhlasíte s týmito podmienkami</li>
                  <li>V prípade pochybností o pravosti obsahu môžeme požiadať o overenie autorstva</li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-amber-700 dark:text-amber-400 font-medium">
                  🚨 Nahrajte len svoj vlastný, originálny obsah. Porušenie autorských práv vás môže diskvalifikovať zo súťaže a vystaviť právnym následkom.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Megatalent;