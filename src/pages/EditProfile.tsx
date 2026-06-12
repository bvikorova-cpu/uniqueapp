import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, Save, User as UserIcon, BookText, Wrench, Link2, Shield, X, Eye, EyeOff } from "lucide-react";
import { fileToDataUrl, normalizeImageForUpload } from "@/utils/imageUploadPrep";

import { EditProfileHero } from "@/components/profile/edit/EditProfileHero";
import { ProfileCompleteness, computeCompleteness, CompletenessCheck } from "@/components/profile/edit/ProfileCompleteness";
import { AvatarStudio } from "@/components/profile/edit/AvatarStudio";
import { CoverBannerUpload } from "@/components/profile/edit/CoverBannerUpload";
import { SocialLinksSection, SocialLinks } from "@/components/profile/edit/SocialLinksSection";
import { SkillsEditor, Skill } from "@/components/profile/edit/SkillsEditor";
import { PrivacyAndStyle, FieldVisibility, ProfileTheme } from "@/components/profile/edit/PrivacyAndStyle";
import { VerifiedBadges, VerifiedBadgesState } from "@/components/profile/edit/VerifiedBadges";
import { ShareQRSection } from "@/components/profile/edit/ShareQRSection";
import { VoiceIntroRecorder } from "@/components/profile/edit/VoiceIntroRecorder";
import { PersonalityTest } from "@/components/profile/edit/PersonalityTest";
import { AnimatedAvatarStudio } from "@/components/profile/edit/AnimatedAvatarStudio";
import { ProfileAnalytics } from "@/components/profile/edit/ProfileAnalytics";
import { LiveProfilePreview } from "@/components/profile/edit/LiveProfilePreview";
import { OpenToWorkEditor } from "@/components/profile/edit/OpenToWorkEditor";
import { ProfileMusicEditor } from "@/components/profile/edit/ProfileMusicEditor";
import { BioToolkit } from "@/components/profile/edit/BioToolkit";
import { SeoPreview } from "@/components/profile/edit/SeoPreview";
import { CustomDomainNotice } from "@/components/profile/edit/CustomDomainNotice";
import { AccountSecuritySection } from "@/components/profile/edit/AccountSecuritySection";
import type { OpenToWorkDetails } from "@/components/profile/OpenToWork";

interface ProfileData {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  headline: string | null;
  location: string | null;
  birth_date: string | null;
  phone: string | null;
  website: string | null;
  interests: string[] | null;
  occupation: string | null;
  company: string | null;
  social_links: SocialLinks | null;
  skills: Skill[] | null;
  languages: string[] | null;
  accent_color: string | null;
  profile_theme: ProfileTheme | null;
  field_visibility: FieldVisibility | null;
  username: string | null;
  animated_avatar_url: string | null;
  animated_avatar_audio_url: string | null;
  tone_of_voice: string | null;
  is_verified: boolean | null;
  stripe_connect_charges_enabled: boolean | null;
  open_to_work: boolean;
  open_to_work_details: OpenToWorkDetails;
  profile_music_url: string | null;
  profile_music_title: string | null;
  bio_score: number | null;
  bio_score_feedback: string | null;
  bio_variants: string[];
  bio_translations: Record<string, string>;
  seo_title: string;
  seo_description: string;
}

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingAvatar, setGeneratingAvatar] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const [voiceIntro, setVoiceIntro] = useState<{ url: string | null; transcript: string | null }>({ url: null, transcript: null });
  const [verifiedState, setVerifiedState] = useState<VerifiedBadgesState>({
    email: false, phone: false, id: false, payment: false,
  });

  const [profile, setProfile] = useState<ProfileData>({
    id: "", full_name: "", email: "", avatar_url: "", cover_url: "", bio: "", headline: "",
    location: "", birth_date: "", phone: "", website: "", interests: [], occupation: "", company: "",
    social_links: {}, skills: [], languages: [], accent_color: "#f59e0b", profile_theme: "default", field_visibility: {},
    username: "", animated_avatar_url: "", animated_avatar_audio_url: "", tone_of_voice: "",
    is_verified: false, stripe_connect_charges_enabled: false,
    open_to_work: false, open_to_work_details: {}, profile_music_url: null, profile_music_title: null,
    bio_score: null, bio_score_feedback: null, bio_variants: [], bio_translations: {},
    seo_title: "", seo_description: "",
  });
  const [newInterest, setNewInterest] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [avatarDescription, setAvatarDescription] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
      else { setUser(session.user); fetchProfile(session.user.id); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (error) throw error;
      const p: any = data;
      setProfile({
        id: p.id,
        full_name: p.full_name || "",
        email: p.email || "",
        avatar_url: p.avatar_url || "",
        cover_url: p.cover_url || "",
        bio: p.bio || "",
        headline: p.headline || "",
        location: p.location || "",
        birth_date: p.birth_date || "",
        phone: p.phone || "",
        website: p.website || "",
        interests: p.interests || [],
        occupation: p.occupation || "",
        company: p.company || "",
        social_links: (p.social_links as SocialLinks) || {},
        skills: (p.skills as Skill[]) || [],
        languages: p.languages || [],
        accent_color: p.accent_color || "#f59e0b",
        profile_theme: (p.profile_theme as ProfileTheme) || "default",
        field_visibility: (p.field_visibility as FieldVisibility) || {},
        username: p.username || "",
        animated_avatar_url: p.animated_avatar_url || "",
        animated_avatar_audio_url: p.animated_avatar_audio_url || "",
        tone_of_voice: p.tone_of_voice || "",
        is_verified: !!p.is_verified,
        stripe_connect_charges_enabled: !!p.stripe_connect_charges_enabled,
        open_to_work: !!p.open_to_work,
        open_to_work_details: (p.open_to_work_details as OpenToWorkDetails) || {},
        profile_music_url: p.profile_music_url || null,
        profile_music_title: p.profile_music_title || null,
        bio_score: p.bio_score ?? null,
        bio_score_feedback: p.bio_score_feedback || null,
        bio_variants: Array.isArray(p.bio_variants) ? p.bio_variants : [],
        bio_translations: (p.bio_translations as Record<string, string>) || {},
        seo_title: p.seo_title || "",
        seo_description: p.seo_description || "",
      });

      // verified state — read real email_confirmed_at from auth user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setVerifiedState({
        email: !!authUser?.email_confirmed_at,
        phone: !!p.phone?.trim(),
        id: !!p.is_verified,
        payment: !!p.stripe_connect_charges_enabled,
      });

      // voice intro
      const { data: vi } = await supabase
        .from("profile_voice_intros").select("audio_url, transcript").eq("user_id", userId).maybeSingle();
      if (vi) setVoiceIntro({ url: vi.audio_url, transcript: vi.transcript });
    } catch (error: any) {
      toast({ title: "Error loading profile", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({
        full_name: profile.full_name,
        bio: profile.bio,
        headline: profile.headline,
        location: profile.location,
        birth_date: profile.birth_date || null,
        phone: profile.phone,
        website: profile.website,
        interests: profile.interests,
        occupation: profile.occupation,
        company: profile.company,
        avatar_url: profile.avatar_url,
        cover_url: profile.cover_url,
        social_links: profile.social_links,
        skills: profile.skills,
        languages: profile.languages,
        accent_color: profile.accent_color,
        profile_theme: profile.profile_theme,
        field_visibility: profile.field_visibility,
        username: profile.username || null,
        tone_of_voice: profile.tone_of_voice,
        open_to_work: profile.open_to_work,
        open_to_work_details: profile.open_to_work_details,
        profile_music_url: profile.profile_music_url,
        profile_music_title: profile.profile_music_title,
        bio_score: profile.bio_score,
        bio_score_feedback: profile.bio_score_feedback,
        bio_score_updated_at: profile.bio_score != null ? new Date().toISOString() : null,
        bio_variants: profile.bio_variants,
        bio_translations: profile.bio_translations,
        seo_title: profile.seo_title || null,
        seo_description: profile.seo_description || null,
      } as any).eq("id", user.id);
      if (error) throw error;
      toast({ title: "Profile saved", description: "Your changes are live." });
      navigate(`/profile/${user.id}`);
    } catch (error: any) {
      toast({ title: "Error saving profile", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const uploadToBucket = async (rawFile: File, bucket: string) => {
    if (!user) return null;
    // Convert HEIC/odd-MIME images to a clean JPEG so the storage backend never
    // rejects them with a "database invalid or incompatible" type of error.
    const file = await normalizeImageForUpload(rawFile);
    const rawExt = (file.name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const ext = rawExt || (file.type.split("/")[1] || "jpg");
    const fileName = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file, {
      upsert: true,
      contentType: file.type || "image/jpeg",
    });
    if (uploadError) {
      console.error("[upload]", bucket, fileName, file.type, file.size, uploadError);
      const message = `${uploadError.message || ""} ${uploadError.statusCode || ""} ${(uploadError as any).error || ""}`.toLowerCase();
      if (message.includes("database schema") || message.includes("invalid or incompatible") || message.includes("500")) {
        return await fileToDataUrl(file);
      }
      throw uploadError;
    }
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
    try {
      const { moderateImage } = await import("@/lib/scaleGuards");
      const mod = await moderateImage(publicUrl);
      if (!mod.allowed) {
        try { await supabase.storage.from(bucket).remove([fileName]); } catch {}
        throw new Error(`Image blocked: ${mod.reason || mod.categories.join(", ") || "policy violation"}`);
      }
    } catch (e: any) {
      if (e?.message?.startsWith("Image blocked")) throw e;
      // moderation invoke failed — fail-open
    }
    return publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user) return;
    setUploadingImage(true);
    try {
      const url = await uploadToBucket(e.target.files[0], "avatars");
      if (url) {
        setProfile({ ...profile, avatar_url: url });
        // Persist immediately so users don't lose the photo if they forget to click Save.
        const { error } = await supabase
          .from("profiles")
          .update({ avatar_url: url })
          .eq("id", user.id);
        if (error) throw error;
        toast({ title: "Photo uploaded", description: "Your profile photo is saved." });
      }
    } catch (error: any) {
      console.error("[avatar upload]", error);
      toast({
        title: "Upload error",
        description: `${error?.message || error} (${error?.statusCode || error?.error || "no-code"})`,
        variant: "destructive",
      });
    } finally { setUploadingImage(false); }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user) return;
    setUploadingCover(true);
    try {
      let url: string | null = null;
      try { url = await uploadToBucket(e.target.files[0], "covers"); }
      catch (err) {
        console.warn("[cover upload] covers bucket failed, retrying avatars", err);
        url = await uploadToBucket(e.target.files[0], "avatars");
      }
      if (url) {
        setProfile({ ...profile, cover_url: url });
        const { error } = await supabase
          .from("profiles")
          .update({ cover_url: url })
          .eq("id", user.id);
        if (error) throw error;
        toast({ title: "Cover uploaded", description: "Your cover is saved." });
      }
    } catch (error: any) {
      console.error("[cover upload]", error);
      toast({
        title: "Upload error",
        description: `${error?.message || error} (${error?.statusCode || error?.error || "no-code"})`,
        variant: "destructive",
      });
    } finally { setUploadingCover(false); }
  };

  const handleGenerateAvatar = async (style: string) => {
    if (!avatarDescription.trim()) {
      toast({ title: "Add a description first", variant: "destructive" }); return;
    }
    setGeneratingAvatar(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-avatar", {
        body: { description: avatarDescription, style },
      });
      if (error) throw error;
      if (data.imageUrl) {
        const blob = await (await fetch(data.imageUrl)).blob();
        const fileName = `${user!.id}/${Date.now()}.png`;
        const { error: upErr } = await supabase.storage.from("avatars").upload(fileName, blob, { upsert: true });
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);
        setProfile({ ...profile, avatar_url: publicUrl });
        setAvatarDescription("");
        toast({ title: "AI avatar created", description: `Style: ${style}` });
      }
    } catch (error: any) {
      toast({ title: "Generation error", description: error.message, variant: "destructive" });
    } finally { setGeneratingAvatar(false); }
  };

  const handleGenerateBio = async (tone: string) => {
    setGeneratingBio(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-bio", {
        body: {
          name: profile.full_name, occupation: profile.occupation, company: profile.company,
          location: profile.location, interests: profile.interests, skills: profile.skills, tone,
        },
      });
      if (error) throw error;
      if (data?.bio) {
        setProfile({ ...profile, bio: data.bio, tone_of_voice: tone });
        toast({ title: "Bio generated", description: "Feel free to tweak it." });
      } else if (data?.error) {
        toast({ title: "Bio error", description: data.error, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Bio error", description: error.message, variant: "destructive" });
    } finally { setGeneratingBio(false); }
  };

  const addInterest = () => {
    if (newInterest.trim() && !profile.interests?.includes(newInterest.trim())) {
      setProfile({ ...profile, interests: [...(profile.interests || []), newInterest.trim()] });
      setNewInterest("");
    }
  };
  const removeInterest = (i: string) =>
    setProfile({ ...profile, interests: profile.interests?.filter((x) => x !== i) || [] });

  const addLanguage = () => {
    if (newLanguage.trim() && !profile.languages?.includes(newLanguage.trim())) {
      setProfile({ ...profile, languages: [...(profile.languages || []), newLanguage.trim()] });
      setNewLanguage("");
    }
  };
  const removeLanguage = (l: string) =>
    setProfile({ ...profile, languages: profile.languages?.filter((x) => x !== l) || [] });

  // Username availability check
  const checkUsername = async (uname: string): Promise<boolean> => {
    if (!uname?.trim()) return false;
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/check-username?username=${encodeURIComponent(uname)}`,
        { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "" } }
      );
      const json = await res.json();
      return !!json.available;
    } catch { return false; }
  };

  // Verification triggers (lightweight stubs that route the user to the right place)
  const handleStartVerification = (kind: keyof VerifiedBadgesState) => {
    if (kind === "phone") {
      toast({ title: "Add your phone in the Identity tab", description: "Then save to verify." });
    } else if (kind === "id") {
      navigate("/verification");
    } else if (kind === "payment") {
      navigate("/earnings");
    }
  };

  const applyPersonality = (r: { interests: string[]; tone: string; archetype: string; summary: string }) => {
    const merged = Array.from(new Set([...(profile.interests || []), ...r.interests])).slice(0, 20);
    setProfile({
      ...profile,
      interests: merged,
      tone_of_voice: r.tone,
      headline: profile.headline || r.archetype,
      bio: profile.bio || r.summary,
    });
  };

  // Completeness
  const checks: CompletenessCheck[] = [
    { key: "avatar", label: "Profile photo", done: !!profile.avatar_url, weight: 10 },
    { key: "name", label: "Full name", done: !!profile.full_name?.trim(), weight: 8 },
    { key: "headline", label: "Tagline", done: !!profile.headline?.trim(), weight: 6 },
    { key: "bio", label: "About me", done: !!profile.bio && profile.bio.length >= 30, weight: 10 },
    { key: "occupation", label: "Occupation", done: !!profile.occupation?.trim(), weight: 4 },
    { key: "location", label: "Location", done: !!profile.location?.trim(), weight: 4 },
    { key: "interests", label: "3+ interests", done: (profile.interests?.length || 0) >= 3, weight: 8 },
    { key: "skills", label: "1+ skill", done: (profile.skills?.length || 0) >= 1, weight: 8 },
    { key: "cover", label: "Cover banner", done: !!profile.cover_url, weight: 8 },
    { key: "social", label: "Social link", done: Object.values(profile.social_links || {}).some((v) => !!v), weight: 6 },
    { key: "languages", label: "Language", done: (profile.languages?.length || 0) >= 1, weight: 4 },
    { key: "phone", label: "Phone number", done: !!profile.phone?.trim(), weight: 4 },
    { key: "username", label: "Username/handle", done: !!profile.username?.trim(), weight: 6 },
    { key: "voice", label: "Voice intro", done: !!voiceIntro.url, weight: 6 },
    { key: "animated", label: "Animated avatar", done: !!profile.animated_avatar_url, weight: 4 },
    { key: "verified", label: "2+ verifications", done: Object.values(verifiedState).filter(Boolean).length >= 2, weight: 4 },
  ];
  const percent = computeCompleteness(checks);
  const unlocked = checks.filter((c) => c.done).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        <EditProfileHero
          onBack={() => navigate("/wall")}
          completeness={percent}
          unlockedBadges={unlocked}
          totalBadges={checks.length}
        />

        {/* Toggle live preview */}
        <div className="flex justify-end mb-3">
          <Button variant="outline" size="sm" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? <><EyeOff className="h-3.5 w-3.5 mr-1.5" /> Hide preview</> : <><Eye className="h-3.5 w-3.5 mr-1.5" /> Show preview</>}
          </Button>
        </div>

        <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-[1fr_360px]" : "grid-cols-1"}`}>
          <div className="min-w-0">
            <ProfileCompleteness checks={checks} />

            <VerifiedBadges state={verifiedState} onStartVerification={handleStartVerification} />

            <PersonalityTest onApply={applyPersonality} />

            <ShareQRSection
              userId={profile.id}
              username={profile.username || ""}
              onUsernameChange={(v) => setProfile({ ...profile, username: v })}
              onCheckAvailability={checkUsername}
            />

            <CoverBannerUpload
              coverUrl={profile.cover_url || ""}
              uploading={uploadingCover}
              onUpload={handleCoverUpload}
              onRemove={() => setProfile({ ...profile, cover_url: "" })}
            />

            <AvatarStudio
              avatarUrl={profile.avatar_url || ""}
              fallback={profile.full_name?.[0]?.toUpperCase() || "U"}
              uploading={uploadingImage}
              generating={generatingAvatar}
              description={avatarDescription}
              onDescriptionChange={setAvatarDescription}
              onUpload={handleImageUpload}
              onGenerate={handleGenerateAvatar}
            />

            <VoiceIntroRecorder
              userId={profile.id}
              audioUrl={voiceIntro.url}
              transcript={voiceIntro.transcript}
              onSaved={(url, t) => setVoiceIntro({ url, transcript: t })}
              onRemove={() => setVoiceIntro({ url: null, transcript: null })}
            />

            <AnimatedAvatarStudio
              imageUrl={profile.animated_avatar_url}
              audioUrl={profile.animated_avatar_audio_url}
              onSaved={(image, audio) => setProfile({ ...profile, animated_avatar_url: image, animated_avatar_audio_url: audio })}
            />

            <ProfileAnalytics userId={profile.id} />

            <OpenToWorkEditor
              enabled={profile.open_to_work}
              details={profile.open_to_work_details}
              onChange={(enabled, details) => setProfile({ ...profile, open_to_work: enabled, open_to_work_details: details })}
            />

            <ProfileMusicEditor
              userId={profile.id}
              url={profile.profile_music_url}
              title={profile.profile_music_title}
              onChange={(url, title) => setProfile({ ...profile, profile_music_url: url, profile_music_title: title })}
            />

            <SeoPreview
              title={profile.seo_title}
              description={profile.seo_description}
              fallbackTitle={profile.headline ? `${profile.full_name || "Profile"} — ${profile.headline}` : (profile.full_name || "Profile")}
              fallbackDescription={profile.bio || ""}
              url={`${typeof window !== "undefined" ? window.location.origin : ""}/profile/${profile.id}`}
              onTitleChange={(v) => setProfile({ ...profile, seo_title: v })}
              onDescriptionChange={(v) => setProfile({ ...profile, seo_description: v })}
            />

            <CustomDomainNotice />

            <Card className="p-5 sm:p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-border/50">
              <Tabs defaultValue="identity" className="w-full">
                <TabsList className="grid grid-cols-5 mb-6 h-auto">
                  <TabsTrigger value="identity" className="flex-col gap-1 py-2">
                    <UserIcon className="h-4 w-4" />
                    <span className="text-[10px] sm:text-xs">Identity</span>
                  </TabsTrigger>
                  <TabsTrigger value="story" className="flex-col gap-1 py-2">
                    <BookText className="h-4 w-4" />
                    <span className="text-[10px] sm:text-xs">Story</span>
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="flex-col gap-1 py-2">
                    <Wrench className="h-4 w-4" />
                    <span className="text-[10px] sm:text-xs">Skills</span>
                  </TabsTrigger>
                  <TabsTrigger value="socials" className="flex-col gap-1 py-2">
                    <Link2 className="h-4 w-4" />
                    <span className="text-[10px] sm:text-xs">Socials</span>
                  </TabsTrigger>
                  <TabsTrigger value="privacy" className="flex-col gap-1 py-2">
                    <Shield className="h-4 w-4" />
                    <span className="text-[10px] sm:text-xs">Style</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="identity" className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input id="full_name" value={profile.full_name || ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="headline">Headline / Tagline</Label>
                    <Input id="headline" placeholder="e.g. Building beautiful things at the edge of AI" maxLength={80} value={profile.headline || ""} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} />
                    <p className="text-[10px] text-muted-foreground mt-1">{(profile.headline || "").length}/80</p>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={profile.email || ""} disabled className="bg-muted" />
                  </div>
                  <AccountSecuritySection currentEmail={profile.email || ""} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input id="occupation" placeholder="e.g. Designer" value={profile.occupation || ""} onChange={(e) => setProfile({ ...profile, occupation: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input id="company" placeholder="e.g. Acme Inc." value={profile.company || ""} onChange={(e) => setProfile({ ...profile, company: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" placeholder="e.g. Bratislava, Slovakia" value={profile.location || ""} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="birth_date">Birth Date</Label>
                      <Input id="birth_date" type="date" value={profile.birth_date || ""} onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" placeholder="+421 ..." value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" type="url" placeholder="https://..." value={profile.website || ""} onChange={(e) => setProfile({ ...profile, website: e.target.value })} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="story" className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label htmlFor="bio">About Me</Label>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {["warm", "professional", "playful", "bold", "minimal"].map((tone) => (
                          <Button
                            key={tone}
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={generatingBio}
                            onClick={() => handleGenerateBio(tone)}
                            className="h-7 px-2 text-[10px]"
                          >
                            {generatingBio ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1 text-amber-400" />}
                            {tone}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Textarea
                      id="bio"
                      rows={5}
                      placeholder="Write something about yourself... or click an AI tone above to draft it."
                      value={profile.bio || ""}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      maxLength={500}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">{(profile.bio || "").length}/500</p>
                  </div>

                  <BioToolkit
                    bio={profile.bio || ""}
                    score={profile.bio_score}
                    feedback={profile.bio_score_feedback}
                    variants={profile.bio_variants}
                    translations={profile.bio_translations}
                    onApplyBio={(b) => setProfile({ ...profile, bio: b })}
                    onScoreUpdate={(s, f) => setProfile({ ...profile, bio_score: s, bio_score_feedback: f })}
                    onVariantsUpdate={(v) => setProfile({ ...profile, bio_variants: v })}
                    onTranslationsUpdate={(t) => setProfile({ ...profile, bio_translations: t })}
                  />


                  <div>
                    <Label htmlFor="interests">Interests</Label>
                    <div className="flex gap-2 mb-2">
                      <Input id="interests" placeholder="Add interest..." value={newInterest} onChange={(e) => setNewInterest(e.target.value)} onKeyPress={(e) => e.key === "Enter" && addInterest()} />
                      <Button onClick={addInterest} variant="outline">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests?.map((i) => (
                        <Badge key={i} variant="secondary" className="cursor-pointer pr-1.5" onClick={() => removeInterest(i)}>
                          {i}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="languages">Languages</Label>
                    <div className="flex gap-2 mb-2">
                      <Input id="languages" placeholder="e.g. English, Slovak..." value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} onKeyPress={(e) => e.key === "Enter" && addLanguage()} />
                      <Button onClick={addLanguage} variant="outline">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages?.map((l) => (
                        <Badge key={l} variant="outline" className="cursor-pointer pr-1.5" onClick={() => removeLanguage(l)}>
                          🌐 {l}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="skills">
                  <SkillsEditor
                    skills={profile.skills || []}
                    onChange={(s) => setProfile({ ...profile, skills: s })}
                  />
                </TabsContent>

                <TabsContent value="socials">
                  <SocialLinksSection
                    value={profile.social_links || {}}
                    onChange={(v) => setProfile({ ...profile, social_links: v })}
                  />
                </TabsContent>

                <TabsContent value="privacy">
                  <PrivacyAndStyle
                    visibility={profile.field_visibility || {}}
                    onVisibilityChange={(v) => setProfile({ ...profile, field_visibility: v })}
                    accentColor={profile.accent_color || "#f59e0b"}
                    onAccentChange={(c) => setProfile({ ...profile, accent_color: c })}
                    theme={(profile.profile_theme as ProfileTheme) || "default"}
                    onThemeChange={(t) => setProfile({ ...profile, profile_theme: t })}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex gap-3 pt-6 mt-6 border-t border-border/40 sticky bottom-0 bg-card/80 backdrop-blur-md -mx-5 sm:-mx-6 px-5 sm:px-6">
                <Button onClick={handleSave} disabled={saving} className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-background font-bold">
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => navigate("/wall")}>Cancel</Button>
              </div>
            </Card>
          </div>

          {/* LIVE PREVIEW */}
          {showPreview && (
            <div className="hidden lg:block">
              <div className="sticky top-4">
                <LiveProfilePreview
                  fullName={profile.full_name || ""}
                  headline={profile.headline || ""}
                  bio={profile.bio || ""}
                  avatarUrl={profile.avatar_url || ""}
                  coverUrl={profile.cover_url || ""}
                  occupation={profile.occupation || ""}
                  company={profile.company || ""}
                  location={profile.location || ""}
                  interests={profile.interests || []}
                  skills={profile.skills || []}
                  languages={profile.languages || []}
                  socialLinks={profile.social_links || {}}
                  accentColor={profile.accent_color || "#f59e0b"}
                  theme={(profile.profile_theme as ProfileTheme) || "default"}
                  verifiedCount={Object.values(verifiedState).filter(Boolean).length}
                  voiceIntroUrl={voiceIntro.url}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
