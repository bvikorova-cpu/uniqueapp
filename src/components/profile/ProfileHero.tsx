import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, MapPin, Briefcase, Sparkles, TrendingUp, Users, Trophy, Zap } from "lucide-react";
import heroVideo from "@/assets/profile-hero.mp4.asset.json";
import { VerifiedFounderBadge } from "@/components/wall/VerifiedFounderBadge";
import { FollowButton } from "@/components/profile/FollowButton";
import { MessageButton } from "@/components/wall/MessageButton";
import { ReactNode } from "react";

interface ProfileHeroProps {
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
    occupation: string | null;
    company: string | null;
    location: string | null;
  };
  userId?: string;
  currentUserId: string | null;
  isOwnProfile: boolean;
  onEdit: () => void;
  stats: {
    posts: number;
    followers: number;
    following: number;
    xp?: number;
    level?: number;
    rank?: number;
  };
  friendsAction?: ReactNode;
}

export const ProfileHero = ({
  profile,
  userId,
  currentUserId,
  isOwnProfile,
  onEdit,
  stats,
  friendsAction,
}: ProfileHeroProps) => {
  const initial = profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "U";

  const liveStats = [
    { label: "Posts", value: stats.posts, icon: Sparkles },
    { label: "Followers", value: stats.followers, icon: Users },
    { label: "Following", value: stats.following, icon: TrendingUp },
    { label: "XP", value: stats.xp ?? 0, icon: Zap },
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-amber-500/20 mb-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(1.05) saturate(1.2) contrast(1.05)" }}
        src={heroVideo.url}
      />

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-transparent to-amber-950/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/85" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)]" />

      {/* Content */}
      <div className="relative z-10 px-5 sm:px-8 pt-8 pb-6">
        {/* Top: Avatar + Name + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-7">
          {/* Avatar with glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative shrink-0 mx-auto sm:mx-0"
          >
            <div className="absolute -inset-2 bg-gradient-to-tr from-amber-400/40 via-violet-400/30 to-pink-400/30 rounded-full blur-xl opacity-70" />
            <Avatar className="relative h-28 w-28 sm:h-36 sm:w-36 ring-4 ring-amber-300/40 ring-offset-4 ring-offset-black/40">
              <AvatarImage src={profile.avatar_url || undefined} className="object-cover" />
              <AvatarFallback className="text-4xl bg-gradient-to-br from-amber-500/30 to-violet-500/30 font-black text-white">
                {initial}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex justify-center sm:justify-start mb-2"
            >
              <VerifiedFounderBadge
                userName={profile.full_name || ""}
                userEmail={profile.email || undefined}
                userId={userId}
                size="md"
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent"
              style={{ textShadow: "0 4px 24px rgba(0,0,0,0.6)" }}
            >
              {profile.full_name || "No name"}
            </motion.h1>

            {(profile.occupation || profile.location) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-2 text-sm text-amber-50/90"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
              >
                {profile.occupation && (
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-amber-300" />
                    {profile.occupation}
                    {profile.company && <span className="text-amber-200/70"> @ {profile.company}</span>}
                  </span>
                )}
                {profile.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-amber-300" />
                    {profile.location}
                  </span>
                )}
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-start gap-2 mt-4 w-full [&>*]:w-full [&>*]:h-11 [&>*]:text-sm [&>*]:px-4 sm:[&>*]:w-auto sm:[&>*]:h-10"
            >
              {isOwnProfile ? (
                <Button
                  onClick={onEdit}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold border-0 shadow-lg shadow-amber-500/30"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  {friendsAction}
                  <FollowButton
                    userId={userId}
                    currentUserId={currentUserId || undefined}
                    variant="default"
                  />
                  {userId && (
                    <MessageButton
                      userId={userId}
                      userName={profile.full_name || "User"}
                      userAvatar={profile.avatar_url || undefined}
                    />
                  )}
                </>
              )}
            </motion.div>
          </div>
        </div>

        {/* Live Stats Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-4 gap-2 sm:gap-3 mt-6"
        >
          {liveStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 + i * 0.05 }}
              className="bg-black/45 backdrop-blur-xl border border-amber-400/25 rounded-xl px-2 sm:px-3 py-2.5 text-center hover:border-amber-400/60 transition-all hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]"
            >
              <stat.icon className="h-3.5 w-3.5 mx-auto mb-1 text-amber-300" />
              <div className="text-base sm:text-xl font-black text-white">{stat.value.toLocaleString()}</div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-amber-100/70 font-semibold">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Level / Rank — always visible so the level is clear on every profile */}
        {(stats.level !== undefined || (stats.rank !== undefined && stats.rank > 0)) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-3 mt-4 text-xs text-amber-100/85 flex-wrap"
          >
            {stats.level !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/40">
                <Trophy className="h-3 w-3 text-violet-300" />
                Level {stats.level}
              </span>
            )}
            {stats.rank !== undefined && stats.rank > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40">
                <Sparkles className="h-3 w-3 text-amber-300" />
                Rank #{stats.rank}
              </span>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
