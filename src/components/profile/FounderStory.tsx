import { motion } from "framer-motion";
import { Quote, Mail, Phone, Globe, Calendar, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface FounderStoryProps {
  profile: {
    bio: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    location: string | null;
    birth_date: string | null;
    interests: string[] | null;
  };
}

export const FounderStory = ({ profile }: FounderStoryProps) => {
  const hasContact = profile.email || profile.phone || profile.website || profile.location || profile.birth_date;
  const hasInterests = profile.interests && profile.interests.length > 0;

  if (!profile.bio && !hasContact && !hasInterests) return null;

  return (
    <>
      <FloatingHowItWorks title={"Founder Story - How it works"} steps={[{ title: 'Open', desc: 'Access the Founder Story section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Founder Story.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="glass-post-card p-5 sm:p-7 mb-6 border border-amber-400/15 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl">
      {profile.bio && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6"
        >
          <Quote className="absolute -top-1 -left-1 h-7 w-7 text-amber-400/30" />
          <p className="pl-8 italic text-base sm:text-lg leading-relaxed text-foreground/90 font-medium">
            {profile.bio}
          </p>
        </motion.div>
      )}

      {hasContact && (
        <>
          {profile.bio && <Separator className="my-5 opacity-30" />}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {profile.email && (
              <div className="flex items-center gap-2.5 text-sm">
                <Mail className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
            )}
            {profile.location && (
              <div className="flex items-center gap-2.5 text-sm">
                <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.phone && (
              <div className="flex items-center gap-2.5 text-sm">
                <Phone className="h-4 w-4 text-amber-400 shrink-0" />
                <span>{profile.phone}</span>
              </div>
            )}
            {profile.website && (
              <div className="flex items-center gap-2.5 text-sm">
                <Globe className="h-4 w-4 text-amber-400 shrink-0" />
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 hover:underline truncate"
                >
                  {profile.website}
                </a>
              </div>
            )}
            {profile.birth_date && (
              <div className="flex items-center gap-2.5 text-sm">
                <Calendar className="h-4 w-4 text-amber-400 shrink-0" />
                <span>{new Date(profile.birth_date).toLocaleDateString("sk-SK")}</span>
              </div>
            )}
          </div>
        </>
      )}

      {hasInterests && (
        <>
          <Separator className="my-5 opacity-30" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-amber-300/80 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests!.map((interest) => (
                <Badge
                  key={interest}
                  variant="secondary"
                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border border-amber-400/30 rounded-full px-3 py-1 text-xs font-medium transition-colors"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
    </>
  );
};
