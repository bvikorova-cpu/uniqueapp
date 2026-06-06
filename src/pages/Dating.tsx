import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Heart, X, MessageCircle, User, Sparkles, Send, Settings, Trash2, Upload, Image as ImageIcon, RotateCcw, Gift, Zap, Eye, Check, CheckCheck, Camera, Video, Plus, XCircle, Shield, MapPin, Star, Clock, Crown, Flame, ArrowLeft, Info, ChevronRight, Brain, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import { DatingHero } from "@/components/dating/DatingHero";
import { AIIcebreaker } from "@/components/dating/AIIcebreaker";
import { AICompatibility } from "@/components/dating/AICompatibility";
import { AIDateIdeas } from "@/components/dating/AIDateIdeas";
import { AIProfileOptimizer } from "@/components/dating/AIProfileOptimizer";
import { FiltersDialog, type DatingFilters } from "@/components/dating/FiltersDialog";
import { BlockReportMenu } from "@/components/dating/BlockReportMenu";
import { PromptsEditor, type Prompt } from "@/components/dating/PromptsEditor";
import { VoiceIntroRecorder } from "@/components/dating/VoiceIntroRecorder";
import { SocialEmbedsCard } from "@/components/dating/SocialEmbedsCard";
import { PhotoVerificationCard } from "@/components/dating/PhotoVerificationCard";
import { PhotoLikeButton } from "@/components/dating/PhotoLikeButton";
import { ProfileExtrasDisplay } from "@/components/dating/ProfileExtrasDisplay";
import { SafetyCenter } from "@/components/dating/SafetyCenter";
import { MessageActions } from "@/components/dating/MessageActions";
import { EmojiPicker } from "@/components/dating/EmojiPicker";
import { CompatibilityQuiz, computeCompatibility } from "@/components/dating/CompatibilityQuiz";
import { OpeningMoveEditor } from "@/components/dating/OpeningMoveEditor";
import { PassportDialog } from "@/components/dating/PassportDialog";
import { SnoozeButton } from "@/components/dating/SnoozeButton";
import { MatchExpiryBadge } from "@/components/dating/MatchExpiryBadge";
import { DiscoveryTabs, type DiscoveryMode } from "@/components/dating/DiscoveryTabs";
import { VideoPromptRecorder, type VideoPrompt } from "@/components/dating/VideoPromptRecorder";
import { VoiceNoteRecorder } from "@/components/dating/VoiceNoteRecorder";
import { DatePlanCard } from "@/components/dating/DatePlanCard";
import { MatchPollCard } from "@/components/dating/MatchPollCard";
import { DatingEventsList } from "@/components/dating/DatingEventsList";
import { FriendCirclesPanel } from "@/components/dating/FriendCirclesPanel";
import { DatingPremiumPanel } from "@/components/dating/DatingPremiumPanel";
import { DatingNotificationsCenter } from "@/components/dating/DatingNotificationsCenter";
import { DatingAnalyticsPanel } from "@/components/dating/DatingAnalyticsPanel";
import { AIStarterButton } from "@/components/dating/AIStarterButton";
import { AIBioCoach } from "@/components/dating/AIBioCoach";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
interface DatingProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  age: number;
  gender: string;
  looking_for: string;
  location: string | null;
  profile_photo_url: string | null;
  additional_photos: string[] | null;
  interests: string[] | null;
  prompts?: any;
  voice_intro_url?: string | null;
  voice_intro_duration?: number | null;
  spotify_url?: string | null;
  instagram_url?: string | null;
  photo_verified?: boolean | null;
  verification_status?: string | null;
  incognito?: boolean | null;
  read_receipts_enabled?: boolean | null;
  compatibility_quiz?: any;
  opening_move?: string | null;
  passport_location?: string | null;
  video_prompts?: any;
  snoozed_until?: string | null;
}

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  profile?: DatingProfile;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  edited_at?: string | null;
  deleted_at?: string | null;
  voice_url?: string | null;
  voice_duration?: number | null;
}

interface GiftType {
  id: string;
  name: string;
  icon: string;
  price: number;
}

interface SentGift {
  id: string;
  sender_id: string;
  gift: GiftType;
  created_at: string;
}

const Dating = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<DatingProfile | null>(null);
  const [profiles, setProfiles] = useState<DatingProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: "", age: 18, gender: "male", looking_for: "female", bio: "", location: "",
  });
  const [profileForm, setProfileForm] = useState({
    display_name: "", age: 18, gender: "male", looking_for: "female", bio: "", location: "",
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [availableGifts, setAvailableGifts] = useState<GiftType[]>([]);
  const [sentGifts, setSentGifts] = useState<SentGift[]>([]);
  const [canRewind, setCanRewind] = useState(false);
  const [lastSwipe, setLastSwipe] = useState<{ swiped_profile_id: string; action: string } | null>(null);
  const [likesYouCount, setLikesYouCount] = useState(0);
  const [superLikesRemaining, setSuperLikesRemaining] = useState(5);
  const [cancelingSubscription, setCancelingSubscription] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | "up" | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<DatingFilters | null>(null);
  const [boostActive, setBoostActive] = useState<string | null>(null);
  const [boosting, setBoosting] = useState(false);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [activeView, setActiveView] = useState<string>("hub");
  const [showSafety, setShowSafety] = useState(false);
  const [showPassport, setShowPassport] = useState(false);
  const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>("deck");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [pendingStarterExperiment, setPendingStarterExperiment] = useState<string | null>(null);

  useEffect(() => { checkAuth(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      toast({ title: "Payment received 🎉", description: "Activating your subscription..." });
      // Webhook activates async — poll briefly
      const poll = async () => {
        for (let i = 0; i < 6; i++) {
          await new Promise(r => setTimeout(r, 1500));
          const { data: { user: u } } = await supabase.auth.getUser();
          if (u) { await checkSubscription(u.id); }
        }
        window.history.replaceState({}, '', '/dating');
      };
      poll();
    } else if (params.get('payment') === 'canceled') {
      toast({ title: "Payment canceled", variant: "destructive" });
      window.history.replaceState({}, '', '/dating');
    }
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) await checkSubscription(user.id);
  };

  const checkSubscription = async (userId: string) => {
    const { data } = await supabase.from("dating_subscriptions").select("*").eq("user_id", userId).eq("status", "active").maybeSingle();
    if (data) {
      setIsSubscribed(true);
      await loadUserProfile(userId);
      await loadFilters(userId);
      await loadBlocked(userId);
      await loadActiveBoost(userId);
      await loadProfiles();
      await loadMatches(userId);
      await loadGifts();
      await loadLikesYou(userId);
      await checkLastSwipe(userId);
    }
  };

  const loadFilters = async (userId: string) => {
    const { data } = await supabase.from("dating_filters").select("*").eq("user_id", userId).maybeSingle();
    if (data) setFilters({
      min_age: data.min_age, max_age: data.max_age,
      max_distance_km: data.max_distance_km,
      preferred_genders: data.preferred_genders,
      verified_only: data.verified_only,
    });
  };

  const loadBlocked = async (userId: string) => {
    const [{ data: a }, { data: b }] = await Promise.all([
      supabase.from("dating_blocks").select("blocked_id").eq("blocker_id", userId),
      supabase.from("dating_blocks").select("blocker_id").eq("blocked_id", userId),
    ]);
    const ids = [...(a?.map(x => x.blocked_id) || []), ...(b?.map(x => x.blocker_id) || [])];
    setBlockedIds(ids);
  };

  const loadActiveBoost = async (userId: string) => {
    const { data } = await supabase.from("dating_boosts").select("expires_at")
      .eq("user_id", userId).gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false }).limit(1).maybeSingle();
    setBoostActive(data?.expires_at || null);
  };

  const handleBoost = async () => {
    if (boosting || boostActive || !user) return;
    setBoosting(true);
    try {
      const { data: ok, error: deductErr } = await supabase.rpc("deduct_ai_credits", {
        p_user_id: user.id, p_amount: 20, p_reason: "dating_boost_30min", p_source: "dating",
      });
      if (deductErr || ok === false) {
        toast({ title: "Not enough credits", description: "Boost costs 20 credits.", variant: "destructive" });
        return;
      }
      const expiresAt = new Date(Date.now() + 30 * 60_000).toISOString();
      const { error: insErr } = await supabase.from("dating_boosts").insert({
        user_id: user.id, expires_at: expiresAt, credits_spent: 20,
      });
      if (insErr) throw insErr;
      setBoostActive(expiresAt);
      toast({ title: "🔥 Boost active!", description: "You're a top profile for 30 minutes." });
    } catch (e: any) {
      toast({ title: "Boost failed", description: e?.message || "Try again", variant: "destructive" });
    } finally {
      setBoosting(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    const { data } = await supabase.from("dating_profiles").select("*").eq("user_id", userId).maybeSingle();
    if (data) {
      setCurrentProfile(data);
      setEditForm({ display_name: data.display_name, age: data.age, gender: data.gender, looking_for: data.looking_for, bio: data.bio || "", location: data.location || "" });
    }
  };

  const loadProfiles = async () => {
    if (!user?.id) return;
    const { data: swipedProfiles } = await supabase.from("dating_swipes").select("swiped_id").eq("swiper_id", user.id);
    const swipedIds = swipedProfiles?.map(s => s.swiped_id) || [];
    const excludeIds = [...new Set([...swipedIds, ...blockedIds, user.id])];

    let q = supabase.from("dating_profiles").select("*").eq("is_active", true).eq("incognito", false);
    if (excludeIds.length > 0) q = q.not("user_id", "in", `(${excludeIds.join(",")})`);
    if (filters) {
      q = q.gte("age", filters.min_age).lte("age", filters.max_age);
      if (filters.preferred_genders.length > 0 && filters.preferred_genders.length < 3) {
        q = q.in("gender", filters.preferred_genders);
      }
    }
    const nowIso = new Date().toISOString();
    q = q.or(`snoozed_until.is.null,snoozed_until.lt.${nowIso}`);
    const { data } = await q.limit(80);

    let ranked = data || [];
    if (ranked.length > 0) {
      const userIds = ranked.map(p => p.user_id);
      const { data: boosts } = await supabase.from("dating_boosts").select("user_id")
        .in("user_id", userIds).gt("expires_at", new Date().toISOString());
      const boostedSet = new Set((boosts || []).map(b => b.user_id));

      const myQuiz = (currentProfile?.compatibility_quiz as any) || null;
      const myInterests = new Set(currentProfile?.interests || []);
      const score = (p: any) => {
        let s = 0;
        if (boostedSet.has(p.user_id)) s += 1000;
        if (p.photo_verified) s += 80;
        const compat = computeCompatibility(myQuiz, p.compatibility_quiz);
        s += compat * 2;
        const shared = (p.interests || []).filter((i: string) => myInterests.has(i)).length;
        s += shared * 15;
        if (p.voice_intro_url) s += 10;
        if (Array.isArray(p.prompts) && p.prompts.length > 0) s += 10;
        return s;
      };

      if (discoveryMode === "most_compatible") {
        ranked = [...ranked].sort((a, b) =>
          computeCompatibility(myQuiz, b.compatibility_quiz) - computeCompatibility(myQuiz, a.compatibility_quiz)
        );
      } else if (discoveryMode === "top_picks") {
        ranked = [...ranked].sort((a, b) => score(b) - score(a)).slice(0, 10);
      } else if (discoveryMode === "standouts") {
        ranked = ranked.filter(p => p.photo_verified || (Array.isArray(p.prompts) && p.prompts.length >= 2) || p.voice_intro_url);
        ranked = [...ranked].sort((a, b) => score(b) - score(a)).slice(0, 12);
      } else if (discoveryMode === "ai_smart") {
        try {
          const { data: rerank } = await supabase.functions.invoke("dating-ai-coach", {
            body: { action: "rerank_discovery", me: currentProfile, candidates: ranked.slice(0, 40) },
          });
          const scoreMap = new Map<string, number>();
          (rerank?.scores || []).forEach((s: any) => scoreMap.set(s.id, s.p));
          ranked = [...ranked].sort((a, b) => (scoreMap.get(b.user_id) ?? -1) - (scoreMap.get(a.user_id) ?? -1));
        } catch (e) {
          console.warn("AI rerank failed, fallback to heuristic", e);
          ranked = [...ranked].sort((a, b) => score(b) - score(a));
        }
      } else {
        ranked = [...ranked.filter(p => boostedSet.has(p.user_id)), ...ranked.filter(p => !boostedSet.has(p.user_id))];
      }
    }
    setProfiles(ranked.slice(0, 25));
  };

  useEffect(() => { if (user?.id) loadProfiles(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [discoveryMode]);

  const loadMatches = async (userId: string) => {
    const { data } = await supabase.from("dating_matches").select("*").or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
    if (data) {
      const matchesWithProfiles = await Promise.all(
        data.map(async (match) => {
          const otherId = match.user1_id === userId ? match.user2_id : match.user1_id;
          const { data: profile } = await supabase.from("dating_profiles").select("*").eq("user_id", otherId).single();
          return { ...match, profile };
        })
      );
      setMatches(matchesWithProfiles);
    }
  };

  const loadMessages = async (matchId: string) => {
    const { data } = await supabase.from("dating_messages").select("*").eq("match_id", matchId).order("created_at", { ascending: true });
    setMessages(data || []);
    // Only mark as read if I have read receipts enabled (so partner can see them)
    if (data && data.length > 0 && currentProfile?.read_receipts_enabled !== false) {
      await supabase.from("dating_messages").update({ read_at: new Date().toISOString() }).eq("match_id", matchId).neq("sender_id", user?.id || "").is("read_at", null);
    }
    const { data: gifts } = await supabase.from("dating_sent_gifts").select(`*, gift:gift_id (*)`).eq("match_id", matchId).order("created_at", { ascending: true });
    setSentGifts(gifts || []);
  };

  const handleTogglePrivacy = async (patch: { incognito?: boolean; read_receipts_enabled?: boolean }) => {
    if (!currentProfile) return;
    const { error } = await supabase.from("dating_profiles").update(patch).eq("id", currentProfile.id);
    if (error) { toast({ title: "Could not update", description: error.message, variant: "destructive" }); return; }
    setCurrentProfile({ ...currentProfile, ...patch });
    toast({ title: "Privacy updated" });
  };

  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    if (!user) { toast({ title: "Login Required", description: "You must log in to access", variant: "destructive" }); return; }
    if (subscribing) return; // double-submit guard
    setSubscribing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { product: planType === 'monthly' ? 'dating_monthly' : 'dating_yearly' },
      });
      if (error || !data?.url) throw error || new Error("No checkout URL");
      window.location.href = data.url;
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to start checkout", variant: "destructive" });
      setSubscribing(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!user || !profileForm.display_name || !profileForm.bio) { toast({ title: "Incomplete Data", description: "Fill in all fields", variant: "destructive" }); return; }
    const { error } = await supabase.from("dating_profiles").insert([{ ...profileForm, user_id: user.id }]);
    if (error) { toast({ title: "Error", description: "Failed to create profile", variant: "destructive" }); }
    else { toast({ title: "Success", description: "Profile has been created" }); setShowProfileDialog(false); await loadUserProfile(user.id); await loadProfiles(); }
  };

  const handleSwipe = async (action: "like" | "dislike", isSuper = false) => {
    if (!user || currentIndex >= profiles.length) return;
    const currentCard = profiles[currentIndex];
    setSwipeDirection(action === "like" ? (isSuper ? "up" : "right") : "left");
    await supabase.from("dating_last_swipe").upsert({ user_id: user.id, swiped_profile_id: currentCard.user_id, action: isSuper ? "super_like" : action });
    setCanRewind(true);
    setLastSwipe({ swiped_profile_id: currentCard.user_id, action: isSuper ? "super_like" : action });
    if (isSuper) {
      const { error: superError } = await supabase.from("dating_super_likes").insert([{ swiper_id: user.id, swiped_id: currentCard.user_id }]);
      if (superError) { toast({ title: "Error", description: "Failed to send Super Like", variant: "destructive" }); setSwipeDirection(null); return; }
      toast({ title: "⭐ Super Like!", description: `${currentCard.display_name} will be notified!` });
      setSuperLikesRemaining(superLikesRemaining - 1);
    }
    const { error } = await supabase.from("dating_swipes").insert([{ swiper_id: user.id, swiped_id: currentCard.user_id, action: isSuper ? "like" : action }]);
    if (error) { toast({ title: "Error", description: "Failed to save swipe", variant: "destructive" }); setSwipeDirection(null); return; }
    if (action === "like" || isSuper) {
      await supabase.from("dating_likes_you").insert([{ liker_id: user.id, liked_id: currentCard.user_id }]);
      const { data } = await supabase.from("dating_matches").select("*").or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`).or(`user1_id.eq.${currentCard.user_id},user2_id.eq.${currentCard.user_id}`).maybeSingle();
      if (data) {
        await supabase.from("notifications").insert([
          { user_id: currentCard.user_id, type: "dating_match", title: "🎉 New Match!", message: `You matched with ${currentProfile?.display_name || "someone"}!`, related_id: data.id },
          { user_id: user.id, type: "dating_match", title: "🎉 New Match!", message: `You matched with ${currentCard.display_name}!`, related_id: data.id }
        ]);
        toast({ title: "🎉 It's a Match!", description: `You matched with ${currentCard.display_name}!` });
        await loadMatches(user.id);
      }
    }
    setTimeout(() => { setCurrentIndex(currentIndex + 1); setSwipeDirection(null); setActivePhotoIndex(0); }, 300);
  };

  const handleSendMessage = async () => {
    if (!selectedMatch || !newMessage.trim()) return;
    const otherId = selectedMatch.user1_id === user.id ? selectedMatch.user2_id : selectedMatch.user1_id;
    const content = newMessage.trim().slice(0, 2000);

    // AI moderation pre-check
    try {
      const { data: mod } = await supabase.functions.invoke("dating-moderate-message", { body: { content } });
      if (mod && mod.allow === false) {
        toast({
          title: "Message blocked",
          description: mod.reason || "This message violates community guidelines.",
          variant: "destructive",
        });
        return;
      }
      if (mod?.severity === "medium") {
        toast({ title: "Heads up", description: "This message looks intense — be respectful." });
      }
    } catch {
      // moderation is best-effort
    }

    const { error } = await supabase.from("dating_messages").insert([{ match_id: selectedMatch.id, sender_id: user.id, content }]);
    if (error) { toast({ title: "Error", description: "Failed to send message", variant: "destructive" }); }
    else {
      await supabase.from("notifications").insert([{ user_id: otherId, type: "dating_message", title: "New Message 💌", message: `${currentProfile?.display_name || "Someone"} sent you a message`, related_id: selectedMatch.id }]);
      // A/B conversion tracking: mark experiment as used + led_to_message
      if (pendingStarterExperiment) {
        supabase.functions.invoke("dating-ai-coach", {
          body: { action: "mark_experiment", experiment_id: pendingStarterExperiment, used: true, led_to_message: true },
        }).catch(() => {});
        setPendingStarterExperiment(null);
      }
      setNewMessage(""); await loadMessages(selectedMatch.id);
    }
  };


  const handleUpdateProfile = async () => {
    if (!user || !currentProfile || !editForm.display_name || !editForm.bio) { toast({ title: "Incomplete Data", description: "Fill in all fields", variant: "destructive" }); return; }
    const { error } = await supabase.from("dating_profiles").update({ display_name: editForm.display_name, age: editForm.age, gender: editForm.gender, looking_for: editForm.looking_for, bio: editForm.bio, location: editForm.location }).eq("id", currentProfile.id);
    if (error) { toast({ title: "Error", description: "Failed to update profile", variant: "destructive" }); }
    else { toast({ title: "Success", description: "Profile has been updated" }); setShowEditDialog(false); await loadUserProfile(user.id); }
  };

  const handleDeleteProfile = async () => {
    if (!user || !currentProfile) return;
    const { error } = await supabase.from("dating_profiles").delete().eq("id", currentProfile.id).eq("user_id", user.id);
    if (error) { toast({ title: "Error", description: "Failed to delete profile", variant: "destructive" }); }
    else { toast({ title: "Success", description: "Profile has been deleted" }); setCurrentProfile(null); }
  };

  const handleUploadProfilePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !currentProfile) return;
    if (!file.type.startsWith('video/') && !file.type.startsWith('image/')) { toast({ title: "Invalid File", variant: "destructive" }); return; }
    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${user.id}-profile-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from('dating_profiles').update({ profile_photo_url: publicUrl }).eq('id', currentProfile.id);
      toast({ title: "Success", description: "Profile photo uploaded" }); await loadUserProfile(user.id);
    } catch { toast({ title: "Error", description: "Failed to upload photo", variant: "destructive" }); }
    finally { setUploadingPhoto(false); }
  };

  const handleUploadAdditionalPhotos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user || !currentProfile) return;
    setUploadingAdditional(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('video/') && !file.type.startsWith('image/')) continue;
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${user.id}-additional-${Date.now()}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      }
      const newPhotos = [...(currentProfile.additional_photos || []), ...uploadedUrls];
      await supabase.from('dating_profiles').update({ additional_photos: newPhotos }).eq('id', currentProfile.id);
      toast({ title: "Success", description: `${uploadedUrls.length} files uploaded` }); await loadUserProfile(user.id);
    } catch { toast({ title: "Error", description: "Failed to upload", variant: "destructive" }); }
    finally { setUploadingAdditional(false); }
  };

  const handleRemoveAdditionalPhoto = async (photoUrl: string) => {
    if (!user || !currentProfile) return;
    const updatedPhotos = (currentProfile.additional_photos || []).filter(url => url !== photoUrl);
    const { error } = await supabase.from('dating_profiles').update({ additional_photos: updatedPhotos }).eq('id', currentProfile.id);
    if (error) { toast({ title: "Error", variant: "destructive" }); } else { toast({ title: "Removed" }); await loadUserProfile(user.id); }
  };

  const loadGifts = async () => {
    const { data } = await supabase.from("dating_gifts").select("*").order("price", { ascending: true });
    setAvailableGifts(data || []);
  };

  const handleSendGift = async (giftId: string) => {
    if (!selectedMatch || !user) return;
    try {
      const { data, error } = await supabase.functions.invoke('send-dating-gift', { body: { matchId: selectedMatch.id, giftId, message: newMessage || "" } });
      if (error) throw error;
      if (data?.url) { window.open(data.url, '_blank'); toast({ title: "Opening Checkout 🎁" }); setShowGiftDialog(false); }
    } catch { toast({ title: "Error", description: "Failed to process gift", variant: "destructive" }); }
  };

  const handleRewind = async () => {
    if (!user || !lastSwipe || !canRewind) return;
    await supabase.from("dating_swipes").delete().eq("swiper_id", user.id).eq("swiped_id", lastSwipe.swiped_profile_id);
    setCurrentIndex(Math.max(0, currentIndex - 1)); setCanRewind(false); setLastSwipe(null);
    toast({ title: "Swipe Rewinded!" });
  };

  const checkLastSwipe = async (userId: string) => {
    const { data } = await supabase.from("dating_last_swipe").select("*").eq("user_id", userId).maybeSingle();
    if (data) { setCanRewind(true); setLastSwipe(data); }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    if (cancelingSubscription) return; // double-submit guard
    setCancelingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', { body: { subscriptionType: 'dating' } });
      if (error) throw error;
      toast({ title: "Subscription Cancelled", description: data.message || "Cancelled at end of period" }); await checkSubscription(user.id);
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setCancelingSubscription(false); }
  };

  const loadLikesYou = async (userId: string) => {
    const { data } = await supabase.from("dating_likes_you").select("*").eq("liked_id", userId).eq("seen", false);
    setLikesYouCount(data?.length || 0);
  };

  const viewLikesYou = async () => {
    if (!user) return;
    const { data } = await supabase.from("dating_likes_you").select(`*, liker:liker_id ( id, dating_profiles (*) )`).eq("liked_id", user.id).eq("seen", false);
    if (data && data.length > 0) {
      await supabase.from("dating_likes_you").update({ seen: true }).eq("liked_id", user.id);
      toast({ title: `${data.length} people liked you!` }); setLikesYouCount(0);
    } else { toast({ title: "No Likes Yet", description: "Keep swiping!" }); }
  };

  const isVideoUrl = (url: string) => url.match(/\.(mp4|webm|ogg|mov)$/i);
  const getProfilePhotos = (profile: DatingProfile) => {
    const photos: string[] = [];
    if (profile.profile_photo_url) photos.push(profile.profile_photo_url);
    if (profile.additional_photos) photos.push(...profile.additional_photos);
    return photos;
  };
  const getProfileCompleteness = () => {
    if (!currentProfile) return 0;
    let score = 0;
    if (currentProfile.display_name) score += 15;
    if (currentProfile.bio) score += 20;
    if (currentProfile.age) score += 10;
    if (currentProfile.location) score += 15;
    if (currentProfile.profile_photo_url) score += 25;
    if (currentProfile.additional_photos && currentProfile.additional_photos.length > 0) score += 15;
    return score;
  };

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  // AI Tool views
  if (activeView === "icebreaker") return <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><AIIcebreaker onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "compatibility") return <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><AICompatibility onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "dateideas") return <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><AIDateIdeas onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "optimizer") return <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><AIProfileOptimizer onBack={() => setActiveView("hub")} /></div></div>;

  // ==================== LANDING / PAYWALL ====================
  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <DatingHero />

          <HeroRewardedAd sectionKey="page_dating" />

          {/* Description Card */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                What is Dating?
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                Our <span className="font-semibold text-foreground">premium dating platform</span> brings together 
                AI-powered matching, instant messaging, virtual gifts, and smart compatibility analysis. 
                Swipe through verified profiles, send Super Likes, get AI-generated icebreakers, 
                and discover perfect date ideas — all in one beautifully crafted experience.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[
                  { emoji: "💘", label: "Smart Matching", desc: "AI compatibility" },
                  { emoji: "🤖", label: "AI Tools", desc: "4 premium tools" },
                  { emoji: "🎁", label: "Virtual Gifts", desc: "Send & receive" },
                  { emoji: "🛡️", label: "Verified", desc: "Real people only" },
                ].map(f => (
                  <div key={f.label} className="bg-muted/50 border border-border/50 rounded-xl p-2.5 text-center">
                    <span className="text-xl block">{f.emoji}</span>
                    <p className="text-xs font-bold mt-1">{f.label}</p>
                    <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                  </div>
                ))}
              </div>
              <div className="bg-muted/50 border border-border/50 rounded-xl p-3 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">💡 Tip:</span> AI tools (Icebreaker, Compatibility, Date Ideas & Profile Optimizer) cost 3 credits each. Subscribe to get started!
              </div>
            </CardContent>
          </Card>

          {/* AI Tools Preview */}
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Dating Tools
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { id: "icebreaker", icon: MessageCircle, label: "AI Icebreaker", desc: "Creative openers", color: "from-blue-500 to-cyan-500" },
              { id: "compatibility", icon: Heart, label: "AI Compatibility", desc: "Match analysis", color: "from-rose-500 to-pink-500" },
              { id: "dateideas", icon: MapPin, label: "AI Date Ideas", desc: "Perfect dates", color: "from-amber-500 to-orange-500" },
              { id: "optimizer", icon: Wand2, label: "Profile Optimizer", desc: "Better bio", color: "from-violet-500 to-purple-500" },
            ].map((tool) => (
              <Card key={tool.id} className="overflow-hidden border-border/50 opacity-70 cursor-not-allowed">
                <CardContent className="p-4 text-center">
                  <div className={`h-12 w-12 mx-auto rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-2`}>
                    <tool.icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-semibold text-sm">{tool.label}</p>
                  <p className="text-xs text-muted-foreground">{tool.desc}</p>
                  <Badge variant="outline" className="mt-2 text-[10px]">3 Credits</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pricing */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">Choose Your Plan</h2>
            <p className="text-muted-foreground text-center mb-8">Start your journey today</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <Card className={`relative cursor-pointer transition-all duration-300 overflow-hidden ${selectedPlan === 'monthly' ? 'ring-2 ring-primary shadow-lg shadow-primary/10' : 'hover:border-primary/30'}`} onClick={() => setSelectedPlan('monthly')}>
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl sm:text-5xl font-bold">€2</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">Flexible monthly plan</p>
                  <div className="space-y-3">
                    {["Unlimited swipes", "Send messages", "5 Super Likes daily", "Photo & video profiles", "See who likes you", "Rewind last swipe", "Send virtual gifts", "AI Tools (3 credits each)"].map(feat => (
                      <div key={feat} className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{feat}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className={`relative cursor-pointer transition-all duration-300 overflow-hidden ${selectedPlan === 'yearly' ? 'ring-2 ring-accent shadow-lg shadow-accent/10' : 'hover:border-accent/30'}`} onClick={() => setSelectedPlan('yearly')}>
                <div className="absolute top-0 right-0">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-none rounded-bl-lg px-3 py-1 text-xs font-semibold">SAVE 17%</Badge>
                </div>
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl sm:text-5xl font-bold">€20</span>
                    <span className="text-muted-foreground">/year</span>
                  </div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-6">Only €1.67/month</p>
                  <div className="space-y-3">
                    {["Everything in Monthly", "Priority in discovery", "10 Super Likes daily", "Advanced filters", "Read receipts", "Profile boost weekly", "Premium badge", "Double AI credits"].map(feat => (
                      <div key={feat} className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-accent flex-shrink-0" />
                        <span className="text-sm">{feat}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-8 space-y-4">
              <Button onClick={() => handleSubscribe(selectedPlan)} disabled={subscribing} size="lg" className="w-full max-w-md mx-auto text-base py-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg disabled:opacity-60">
                <Heart className="mr-2 h-5 w-5" />
                {subscribing ? "Redirecting to Stripe…" : `Get Started — ${selectedPlan === 'monthly' ? '€2/month' : '€20/year'}`}
              </Button>
              <p className="text-xs text-muted-foreground">Cancel anytime • Secure payment • 100% satisfaction guarantee</p>
            </div>
          </motion.div>

          {/* Safety Section */}
          <div className="mt-16 border-t border-border/50 pt-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Your Safety Matters</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-center">
              <div className="p-4"><p className="font-medium text-sm mb-1">Photo Verification</p><p className="text-xs text-muted-foreground">Verified profiles for authentic connections</p></div>
              <div className="p-4"><p className="font-medium text-sm mb-1">Block & Report</p><p className="text-xs text-muted-foreground">Easy tools to manage your experience</p></div>
              <div className="p-4"><p className="font-medium text-sm mb-1">Data Encryption</p><p className="text-xs text-muted-foreground">Your conversations stay private</p></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== CREATE PROFILE DIALOG ====================
  if (!currentProfile) {
    return (
      <Dialog open={true} onOpenChange={(open) => { if (!open) navigate('/'); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Create Your Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium mb-1.5 block">Display Name *</label><Input value={profileForm.display_name} onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })} placeholder="Your name" /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Age *</label><Input type="number" min="18" max="99" value={profileForm.age} onChange={(e) => setProfileForm({ ...profileForm, age: parseInt(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium mb-1.5 block">I am</label>
                <select className="w-full p-2.5 border rounded-lg bg-background text-foreground text-sm" value={profileForm.gender} onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}>
                  <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select></div>
              <div><label className="text-sm font-medium mb-1.5 block">Looking For</label>
                <select className="w-full p-2.5 border rounded-lg bg-background text-foreground text-sm" value={profileForm.looking_for} onChange={(e) => setProfileForm({ ...profileForm, looking_for: e.target.value })}>
                  <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select></div>
            </div>
            <div><label className="text-sm font-medium mb-1.5 block">About Me *</label><Textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder="Tell others about yourself, your hobbies, what you're looking for..." className="min-h-24" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Location</label><Input value={profileForm.location} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })} placeholder="City, Country" /></div>
            <Button onClick={handleCreateProfile} className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 py-5">
              <Heart className="mr-2 h-4 w-4" />Create Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ==================== MAIN APP ====================
  const currentCard = currentIndex < profiles.length ? profiles[currentIndex] : null;
  const cardPhotos = currentCard ? getProfilePhotos(currentCard) : [];
  const completeness = getProfileCompleteness();

  return (
    <>
      <SEO
        title="Dating - Meet your match on Unique"
        description="Find meaningful connections with smart matching, voice intros and verified profiles. Unique Dating — the safer way to date."
        canonical="/dating"
      />
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-24">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Cinematic Hero */}
        <DatingHero />

        {/* Engagement Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 p-4 text-center">
            <Flame className="h-5 w-5 mx-auto text-orange-500 mb-1" />
            <p className="text-lg font-black">{superLikesRemaining}</p>
            <p className="text-[10px] text-muted-foreground">Super Likes Left</p>
          </Card>
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 p-4 text-center">
            <Heart className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-lg font-black">{matches.length}</p>
            <p className="text-[10px] text-muted-foreground">Total Matches</p>
          </Card>
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 p-4 text-center">
            <Eye className="h-5 w-5 mx-auto text-purple-500 mb-1" />
            <p className="text-lg font-black">{likesYouCount}</p>
            <p className="text-[10px] text-muted-foreground">Likes You</p>
          </Card>
        </div>

        {/* AI Tools Grid */}
        <h3 className="text-base font-bold mb-3 flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          AI Dating Tools
          <Badge variant="outline" className="text-[10px]">3 Credits Each</Badge>
        </h3>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { id: "icebreaker", icon: MessageCircle, label: "Icebreaker", color: "from-blue-500 to-cyan-500" },
            { id: "compatibility", icon: Heart, label: "Compatibility", color: "from-rose-500 to-pink-500" },
            { id: "dateideas", icon: MapPin, label: "Date Ideas", color: "from-amber-500 to-orange-500" },
            { id: "optimizer", icon: Wand2, label: "Optimizer", color: "from-violet-500 to-purple-500" },
          ].map((tool) => (
            <motion.div key={tool.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card className="cursor-pointer hover:shadow-lg transition-all border-border/50" onClick={() => setActiveView(tool.id)}>
                <CardContent className="p-3 text-center">
                  <div className={`h-10 w-10 mx-auto rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-1.5`}>
                    <tool.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-semibold text-[11px]">{tool.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="swipe" className="w-full">
          <TabsList className="grid w-full grid-cols-8 max-w-4xl mx-auto mb-6 h-11 bg-muted/50">
            <TabsTrigger value="swipe" className="text-sm gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Heart className="h-4 w-4" /><span className="hidden sm:inline">Discover</span>
            </TabsTrigger>
            <TabsTrigger value="matches" className="text-sm gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageCircle className="h-4 w-4" /><span className="hidden sm:inline">Matches</span>
              {matches.length > 0 && <span className="text-xs">({matches.length})</span>}
            </TabsTrigger>
            <TabsTrigger value="likes" className="text-sm gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative">
              <Eye className="h-4 w-4" /><span className="hidden sm:inline">Likes</span>
              {likesYouCount > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">{likesYouCount}</span>}
            </TabsTrigger>
            <TabsTrigger value="community" className="text-sm gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Sparkles className="h-4 w-4" /><span className="hidden sm:inline">Community</span>
            </TabsTrigger>
            <TabsTrigger value="notifs" className="text-sm gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Info className="h-4 w-4" /><span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-sm gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Brain className="h-4 w-4" /><span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="premium" className="text-sm gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Crown className="h-4 w-4" /><span className="hidden sm:inline">Premium</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-sm gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="h-4 w-4" /><span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* ==================== DISCOVER TAB ==================== */}
          <TabsContent value="swipe" className="flex flex-col items-center gap-3">
            <div className="w-full max-w-sm"><DiscoveryTabs mode={discoveryMode} onChange={setDiscoveryMode} /></div>
            <div className="w-full flex justify-center">
            <AnimatePresence mode="wait">
              {currentCard ? (
                <motion.div key={currentCard.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: swipeDirection ? 0 : 1, scale: swipeDirection ? 0.9 : 1, x: swipeDirection === "left" ? -200 : swipeDirection === "right" ? 200 : 0, y: swipeDirection === "up" ? -200 : 0, rotate: swipeDirection === "left" ? -15 : swipeDirection === "right" ? 15 : 0 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full max-w-sm">
                  <Card className="overflow-hidden shadow-xl border-0 bg-card">
                    <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                      {cardPhotos.length > 0 ? (
                        <>
                          {isVideoUrl(cardPhotos[activePhotoIndex]) ? (
                            <video src={cardPhotos[activePhotoIndex]} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                          ) : (
                            <img src={cardPhotos[activePhotoIndex]} alt={currentCard.display_name} className="w-full h-full object-cover" onClick={() => setLightboxImage(cardPhotos[activePhotoIndex])} />
                          )}
                          {cardPhotos.length > 1 && (
                            <div className="absolute top-3 left-3 right-3 flex gap-1">
                              {cardPhotos.map((_, i) => (
                                <button key={i} onClick={() => setActivePhotoIndex(i)} className={`flex-1 h-1 rounded-full transition-all ${i === activePhotoIndex ? 'bg-white' : 'bg-white/40'}`} />
                              ))}
                            </div>
                          )}
                          {cardPhotos.length > 1 && (
                            <><button className="absolute left-0 top-0 w-1/3 h-full" onClick={() => setActivePhotoIndex(Math.max(0, activePhotoIndex - 1))} />
                            <button className="absolute right-0 top-0 w-1/3 h-full" onClick={() => setActivePhotoIndex(Math.min(cardPhotos.length - 1, activePhotoIndex + 1))} /></>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                          <User className="h-24 w-24 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5">
                        <div className="flex items-end justify-between">
                          <div>
                            <h2 className="text-2xl font-bold text-white">{currentCard.display_name}, {currentCard.age}</h2>
                            {currentCard.location && <p className="text-white/80 text-sm flex items-center gap-1 mt-0.5"><MapPin className="h-3.5 w-3.5" />{currentCard.location}</p>}
                          </div>
                          <button onClick={() => setLightboxImage(cardPhotos[activePhotoIndex] || null)} className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                            <Info className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {swipeDirection === "right" && <div className="absolute top-8 left-6 rotate-[-20deg]"><Badge className="bg-emerald-500 text-white text-2xl px-6 py-2 border-4 border-emerald-400">LIKE</Badge></div>}
                      {swipeDirection === "left" && <div className="absolute top-8 right-6 rotate-[20deg]"><Badge className="bg-red-500 text-white text-2xl px-6 py-2 border-4 border-red-400">NOPE</Badge></div>}
                      {swipeDirection === "up" && <div className="absolute top-8 left-1/2 -translate-x-1/2"><Badge className="bg-blue-500 text-white text-2xl px-6 py-2 border-4 border-blue-400">SUPER LIKE</Badge></div>}
                      {user && cardPhotos[activePhotoIndex] && !isVideoUrl(cardPhotos[activePhotoIndex]) && (
                        <PhotoLikeButton fromUserId={user.id} toUserId={currentCard.user_id} photoUrl={cardPhotos[activePhotoIndex]} />
                      )}
                    </div>
                    <ProfileExtrasDisplay
                      prompts={(currentCard.prompts as Prompt[] | null) || null}
                      voiceUrl={currentCard.voice_intro_url}
                      voiceDuration={currentCard.voice_intro_duration}
                      spotifyUrl={currentCard.spotify_url}
                      instagramUrl={currentCard.instagram_url}
                      verified={!!currentCard.photo_verified}
                      videoPrompts={(currentCard.video_prompts as VideoPrompt[] | null) || null}
                    />
                    {currentCard.bio && <div className="px-5 py-3 border-b border-border/50"><p className="text-sm text-muted-foreground line-clamp-2">{currentCard.bio}</p></div>}
                    {currentCard.interests && currentCard.interests.length > 0 && (
                      <div className="px-5 py-3 border-b border-border/50">
                        <div className="flex flex-wrap gap-1.5">{currentCard.interests.slice(0, 5).map(interest => <Badge key={interest} variant="secondary" className="text-xs font-normal">{interest}</Badge>)}</div>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex gap-3 justify-center items-center">
                        <button disabled={!canRewind} onClick={handleRewind} title="Rewind last swipe" className="h-11 w-11 rounded-full border border-border flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:border-amber-400 transition-all disabled:opacity-30"><RotateCcw className="h-5 w-5 text-amber-500" /></button>
                        <button onClick={() => handleSwipe("dislike")} className="h-14 w-14 rounded-full border-2 border-red-200 dark:border-red-800 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-400 hover:scale-110 transition-all shadow-sm"><X className="h-7 w-7 text-red-500" /></button>
                        <button onClick={() => handleSwipe("like", true)} disabled={superLikesRemaining === 0} title="Super Like" className="h-11 w-11 rounded-full border border-border flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-400 transition-all disabled:opacity-30"><Star className="h-5 w-5 text-blue-500" /></button>
                        <button onClick={() => handleSwipe("like")} className="h-14 w-14 rounded-full border-2 border-emerald-200 dark:border-emerald-800 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-400 hover:scale-110 transition-all shadow-sm"><Heart className="h-7 w-7 text-emerald-500" /></button>
                        <button onClick={handleBoost} disabled={boosting || !!boostActive} title={boostActive ? "Boost active" : "Boost profile (20 credits)"} className={`h-11 w-11 rounded-full border flex items-center justify-center transition-all disabled:opacity-50 ${boostActive ? "bg-gradient-to-br from-orange-500 to-pink-500 border-transparent text-white" : "border-border hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:border-orange-400"}`}>
                          <Flame className={`h-5 w-5 ${boostActive ? "text-white" : "text-orange-500"}`} />
                        </button>
                        <button onClick={viewLikesYou} title="Likes you" className="h-11 w-11 rounded-full border border-border flex items-center justify-center hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:border-purple-400 transition-all relative">
                          <Eye className="h-5 w-5 text-purple-500" />
                          {likesYouCount > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">{likesYouCount}</span>}
                        </button>
                      </div>
                      <div className="flex justify-center mt-3">
                        <Button variant="ghost" size="sm" onClick={() => setShowFilters(true)} className="text-xs gap-1.5 text-muted-foreground hover:text-foreground">
                          <Settings className="h-3.5 w-3.5" />Filters
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <Card className="w-full max-w-sm p-10 text-center">
                    <div className="h-20 w-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4"><Heart className="h-10 w-10 text-muted-foreground/50" /></div>
                    <h3 className="text-xl font-bold mb-2">No More Profiles</h3>
                    <p className="text-sm text-muted-foreground mb-6">You've seen everyone nearby. Check back later.</p>
                    <Button onClick={() => loadProfiles()} variant="outline" className="gap-2"><RotateCcw className="h-4 w-4" />Refresh</Button>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </TabsContent>

          {/* ==================== MATCHES TAB ==================== */}
          <TabsContent value="matches">
            {selectedMatch ? (
              <Card className="max-w-2xl mx-auto shadow-lg border-0 overflow-hidden">
                <div className="border-b bg-card p-4 flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedMatch(null)} className="h-9 w-9"><ArrowLeft className="h-5 w-5" /></Button>
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex-shrink-0">
                    {selectedMatch.profile?.profile_photo_url ? <img src={selectedMatch.profile.profile_photo_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white font-bold">{selectedMatch.profile?.display_name?.charAt(0) || "?"}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{selectedMatch.profile?.display_name}</h3>
                    <p className="text-xs text-emerald-500 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Online</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowGiftDialog(true)} className="h-9 w-9 text-primary"><Gift className="h-5 w-5" /></Button>
                  {selectedMatch.profile?.user_id && (
                    <BlockReportMenu
                      targetUserId={selectedMatch.profile.user_id}
                      targetName={selectedMatch.profile.display_name}
                      onBlocked={async () => {
                        setSelectedMatch(null);
                        if (user) { await loadBlocked(user.id); await loadMatches(user.id); await loadProfiles(); }
                      }}
                    />
                  )}
                </div>
                {user && (
                  <div className="border-b p-3 bg-muted/20 space-y-2">
                    <DatePlanCard matchId={selectedMatch.id} userId={user.id} />
                    <MatchPollCard matchId={selectedMatch.id} userId={user.id} />
                  </div>
                )}
                <ScrollArea className="h-[450px]">
                  <div className="p-4 space-y-3">
                    {messages.length === 0 && sentGifts.length === 0 && (
                      <div className="text-center py-12"><Heart className="h-12 w-12 mx-auto text-primary/30 mb-3" /><p className="text-sm font-medium">It's a match! 🎉</p><p className="text-xs text-muted-foreground mt-1">Say something nice to start the conversation</p></div>
                    )}
                    {messages.map((msg) => {
                      const mine = msg.sender_id === user?.id;
                      const partnerReceipts = selectedMatch.profile?.read_receipts_enabled !== false;
                      const deleted = !!msg.deleted_at;
                      return (
                      <div key={msg.id} className={`flex group ${mine ? "justify-end" : "justify-start"}`}>
                        {mine && !deleted && (
                          <MessageActions messageId={msg.id} currentContent={msg.content} createdAt={msg.created_at} onChanged={() => selectedMatch && loadMessages(selectedMatch.id)} />
                        )}
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${mine ? "bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md"} ${deleted ? "opacity-60 italic" : ""}`}>
                          {msg.voice_url && !deleted ? (
                            <div className="flex items-center gap-2 min-w-[180px]">
                              <audio src={msg.voice_url} controls preload="metadata" className="h-8 max-w-full" />
                              {msg.voice_duration && <span className={`text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{msg.voice_duration}s</span>}
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{deleted ? "🚫 Message unsent" : msg.content}</p>
                          )}
                          <div className="flex items-center gap-1 mt-1 justify-end">
                            {msg.edited_at && !deleted && <span className={`text-[10px] ${mine ? "text-primary-foreground/50" : "text-muted-foreground/70"}`}>edited</span>}
                            <span className={`text-[10px] ${mine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {mine && partnerReceipts && (msg.read_at ? <CheckCheck className="h-3 w-3 text-primary-foreground/60" /> : <Check className="h-3 w-3 text-primary-foreground/60" />)}
                          </div>
                        </div>
                      </div>
                      );
                    })}
                    {sentGifts.map((gift) => (
                      <div key={gift.id} className={`flex ${gift.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl px-5 py-3 text-center border border-amber-200/50 dark:border-amber-800/50">
                          <div className="text-3xl mb-1">{gift.gift.icon}</div><p className="text-xs font-medium">{gift.gift.name}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>
                <div className="border-t p-3 bg-card">
                  <div className="flex gap-2">
                    <EmojiPicker onSelect={(e) => setNewMessage(newMessage + e)} />
                    {user && <VoiceNoteRecorder userId={user.id} matchId={selectedMatch.id} onSent={() => loadMessages(selectedMatch.id)} />}
                    <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} maxLength={2000} placeholder="Type a message..." onKeyPress={(e) => e.key === "Enter" && handleSendMessage()} className="flex-1 border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary" />
                    <Button onClick={handleSendMessage} size="icon" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 h-10 w-10"><Send className="h-4 w-4" /></Button>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="max-w-4xl mx-auto">
                {matches.length > 0 ? (
                  <div className="space-y-3">
                    {matches.map((match) => (
                      <Card key={match.id} className="cursor-pointer hover:bg-muted/30 transition-colors border-border/50" onClick={() => { setSelectedMatch(match); loadMessages(match.id); }}>
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-14 w-14 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex-shrink-0">
                            {match.profile?.profile_photo_url ? <img src={match.profile.profile_photo_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">{match.profile?.display_name?.charAt(0) || "?"}</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap"><h3 className="font-semibold truncate">{match.profile?.display_name}</h3><span className="text-xs text-muted-foreground">{match.profile?.age}</span><MatchExpiryBadge expiresAt={(match as any).expires_at ?? null} /></div>
                            <p className="text-sm text-muted-foreground truncate">{match.profile?.location || "Tap to start chatting"}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <MessageCircle className="h-14 w-14 mx-auto text-muted-foreground/40 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Matches Yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">Start swiping to find people you connect with!</p>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* ==================== LIKES TAB ==================== */}
          <TabsContent value="likes">
            <Card className="max-w-md mx-auto p-8 text-center">
              <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg">
                <Eye className="h-10 w-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-black mb-1">{likesYouCount} {likesYouCount === 1 ? "Person" : "People"} Like You</h2>
              <p className="text-sm text-muted-foreground mb-6">See who's interested and make the first move</p>
              <Button onClick={viewLikesYou} className="bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2"><Eye className="h-4 w-4" />View Likes</Button>
            </Card>
          </TabsContent>

          {/* ==================== COMMUNITY TAB ==================== */}
          <TabsContent value="community">
            <div className="max-w-3xl mx-auto space-y-8">
              {user && <DatingEventsList userId={user.id} />}
              {user && <FriendCirclesPanel userId={user.id} />}
            </div>
          </TabsContent>

          {/* ==================== PREMIUM TAB ==================== */}
          <TabsContent value="notifs">
            <DatingNotificationsCenter />
          </TabsContent>

          <TabsContent value="insights">
            <DatingAnalyticsPanel />
          </TabsContent>



          <TabsContent value="premium">
            {user && (
              <DatingPremiumPanel
                userId={user.id}
                isSubscribed={isSubscribed}
                likesYouCount={likesYouCount}
                onSubscribe={() => handleSubscribe('monthly')}
              />
            )}
          </TabsContent>


          {/* ==================== PROFILE TAB ==================== */}
          <TabsContent value="profile">
            <div className="max-w-lg mx-auto space-y-4">
              <Card className="overflow-hidden border-0 shadow-lg">
                <div className="relative">
                  <div className="h-32 bg-gradient-to-br from-primary via-accent to-primary" />
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                    <div className="h-24 w-24 rounded-full border-4 border-card overflow-hidden bg-muted shadow-lg">
                      {currentProfile.profile_photo_url ? (
                        isVideoUrl(currentProfile.profile_photo_url) ? <video src={currentProfile.profile_photo_url} className="w-full h-full object-cover" muted /> : <img src={currentProfile.profile_photo_url} alt="" className="w-full h-full object-cover" />
                      ) : <div className="w-full h-full flex items-center justify-center"><User className="h-10 w-10 text-muted-foreground" /></div>}
                    </div>
                  </div>
                </div>
                <CardContent className="pt-16 pb-6 px-6 text-center">
                  <h2 className="text-xl font-bold">{currentProfile.display_name}, {currentProfile.age}</h2>
                  {currentProfile.location && <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1"><MapPin className="h-3.5 w-3.5" />{currentProfile.location}</p>}
                  {currentProfile.bio && <p className="text-sm text-muted-foreground mt-3 max-w-sm mx-auto">{currentProfile.bio}</p>}
                </CardContent>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2"><p className="text-sm font-medium">Profile Completeness</p><span className="text-sm font-bold text-primary">{completeness}%</span></div>
                <Progress value={completeness} className="h-2" />
                {completeness < 100 && <p className="text-xs text-muted-foreground mt-2">{!currentProfile.profile_photo_url ? "Add a profile photo to get 25% more views" : !currentProfile.additional_photos?.length ? "Add more photos to boost visibility" : !currentProfile.location ? "Add your location for better matches" : "Complete your bio for better matches"}</p>}
              </Card>
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">Photos & Videos</h3>
                  <label className="cursor-pointer"><input type="file" className="hidden" onChange={handleUploadProfilePhoto} accept="image/*,video/*" disabled={uploadingPhoto} /><Badge variant="outline" className="cursor-pointer hover:bg-muted gap-1"><Camera className="h-3 w-3" />{uploadingPhoto ? "Uploading..." : "Change Main"}</Badge></label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
                    {currentProfile.profile_photo_url ? (isVideoUrl(currentProfile.profile_photo_url) ? <video src={currentProfile.profile_photo_url} className="w-full h-full object-cover" muted /> : <img src={currentProfile.profile_photo_url} alt="" className="w-full h-full object-cover" />) : <div className="w-full h-full flex items-center justify-center"><Camera className="h-6 w-6 text-muted-foreground/50" /></div>}
                    <Badge className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5">Main</Badge>
                  </div>
                  {(currentProfile.additional_photos || []).map((url, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-muted relative group">
                      {isVideoUrl(url) ? <video src={url} className="w-full h-full object-cover" muted /> : <img src={url} alt="" className="w-full h-full object-cover" onClick={() => setLightboxImage(url)} />}
                      <button onClick={() => handleRemoveAdditionalPhoto(url)} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center cursor-pointer transition-colors">
                    <input type="file" className="hidden" onChange={handleUploadAdditionalPhotos} accept="image/*,video/*" multiple disabled={uploadingAdditional} /><Plus className="h-6 w-6 text-muted-foreground" />
                  </label>
                </div>
              </Card>
              {user && (
                <>
                  <PhotoVerificationCard
                    profileId={currentProfile.id}
                    userId={user.id}
                    status={currentProfile.verification_status || "unverified"}
                    verified={!!currentProfile.photo_verified}
                    onChange={(status) => setCurrentProfile({ ...currentProfile, verification_status: status })}
                  />
                  <PromptsEditor
                    profileId={currentProfile.id}
                    value={((currentProfile.prompts as Prompt[] | null) || [])}
                    onChange={(next) => setCurrentProfile({ ...currentProfile, prompts: next })}
                  />
                  <VoiceIntroRecorder
                    profileId={currentProfile.id}
                    userId={user.id}
                    url={currentProfile.voice_intro_url || null}
                    duration={currentProfile.voice_intro_duration || null}
                    onChange={(url, dur) => setCurrentProfile({ ...currentProfile, voice_intro_url: url, voice_intro_duration: dur })}
                  />
                  <SocialEmbedsCard
                    profileId={currentProfile.id}
                    spotifyUrl={currentProfile.spotify_url || null}
                    instagramUrl={currentProfile.instagram_url || null}
                    onChange={(sp, ig) => setCurrentProfile({ ...currentProfile, spotify_url: sp, instagram_url: ig })}
                  />
                  <VideoPromptRecorder
                    userId={user.id}
                    value={(currentProfile.video_prompts as VideoPrompt[] | null) || []}
                    onChange={(next) => setCurrentProfile({ ...currentProfile, video_prompts: next })}
                  />
                  <CompatibilityQuiz
                    userId={user.id}
                    initial={(currentProfile.compatibility_quiz as any) || {}}
                    onSaved={(q) => setCurrentProfile({ ...currentProfile, compatibility_quiz: q })}
                  />
                  <OpeningMoveEditor
                    userId={user.id}
                    initial={currentProfile.opening_move || ""}
                    onSaved={(v) => setCurrentProfile({ ...currentProfile, opening_move: v })}
                  />
                  <Card className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium flex items-center gap-2">Passport {currentProfile.passport_location && <Badge variant="secondary" className="text-[10px]">{currentProfile.passport_location}</Badge>}</p>
                      <p className="text-xs text-muted-foreground">Match anywhere in the world.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowPassport(true)}>Change</Button>
                  </Card>
                  <Card className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Snooze profile</p>
                      <p className="text-xs text-muted-foreground">Hide yourself from the deck temporarily.</p>
                    </div>
                    <SnoozeButton
                      userId={user.id}
                      snoozedUntil={currentProfile.snoozed_until || null}
                      onChange={(v) => setCurrentProfile({ ...currentProfile, snoozed_until: v })}
                    />
                  </Card>
                </>
              )}
              <Button variant="outline" onClick={() => setShowSafety(true)} className="w-full gap-2"><Shield className="h-4 w-4" />Safety Center</Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => setShowEditDialog(true)} className="gap-2"><Settings className="h-4 w-4" />Edit Profile</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="outline" className="gap-2 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" />Delete Profile</Button></AlertDialogTrigger>
                  <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Profile?</AlertDialogTitle><AlertDialogDescription>This will permanently delete your dating profile, matches, and messages.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteProfile} className="bg-destructive">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                </AlertDialog>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="ghost" className="w-full text-muted-foreground text-sm" disabled={cancelingSubscription}>Cancel Subscription</Button></AlertDialogTrigger>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Cancel Subscription?</AlertDialogTitle><AlertDialogDescription>You will lose access at the end of your current billing period.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep Subscription</AlertDialogCancel><AlertDialogAction onClick={handleCancelSubscription}>{cancelingSubscription ? "Canceling..." : "Cancel Subscription"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      {/* Safety Center */}
      {currentProfile && (
        <SafetyCenter
          open={showSafety}
          onOpenChange={setShowSafety}
          incognito={!!currentProfile.incognito}
          readReceipts={currentProfile.read_receipts_enabled !== false}
          onTogglePrivacy={handleTogglePrivacy}
          onOpenBlocked={() => { setShowSafety(false); navigate("/settings/blocked"); }}
        />
      )}
      {user && currentProfile && (
        <PassportDialog
          open={showPassport}
          onOpenChange={setShowPassport}
          userId={user.id}
          current={currentProfile.passport_location || null}
          onSaved={(v) => setCurrentProfile({ ...currentProfile, passport_location: v })}
        />
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Edit Profile</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium mb-1.5 block">Display Name</label><Input value={editForm.display_name} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Age</label><Input type="number" min="18" max="99" value={editForm.age} onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium mb-1.5 block">Gender</label><select className="w-full p-2.5 border rounded-lg bg-background text-foreground text-sm" value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
              <div><label className="text-sm font-medium mb-1.5 block">Looking For</label><select className="w-full p-2.5 border rounded-lg bg-background text-foreground text-sm" value={editForm.looking_for} onChange={(e) => setEditForm({ ...editForm, looking_for: e.target.value })}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
            </div>
            <div><label className="text-sm font-medium mb-1.5 block">About Me</label><Textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Write something about yourself..." className="min-h-24" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Location</label><Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} placeholder="City, Country" /></div>
            <div className="flex gap-3">
              <Button onClick={handleUpdateProfile} className="flex-1 bg-gradient-to-r from-primary to-accent">Save Changes</Button>
              <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gift Dialog */}
      <Dialog open={showGiftDialog} onOpenChange={setShowGiftDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Gift className="h-5 w-5 text-primary" />Send a Gift</DialogTitle></DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            {availableGifts.map((gift) => (
              <button key={gift.id} onClick={() => handleSendGift(gift.id)} className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-center">
                <div className="text-3xl mb-1">{gift.icon}</div><p className="text-xs font-medium truncate">{gift.name}</p><p className="text-[10px] text-muted-foreground">{gift.price} €</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          {isVideoUrl(lightboxImage) ? <video src={lightboxImage} className="max-w-full max-h-full" controls autoPlay /> : <img src={lightboxImage} alt="Full size" className="max-w-full max-h-full object-contain" />}
          <button className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-colors" onClick={() => setLightboxImage(null)}><X className="h-5 w-5" /></button>
        </div>
      )}
      {user && (
        <FiltersDialog
          open={showFilters}
          onOpenChange={setShowFilters}
          userId={user.id}
          onSaved={async (f) => { setFilters(f); await loadProfiles(); }}
        />
      )}
    </div>
    </>
  );
};

export default Dating;
