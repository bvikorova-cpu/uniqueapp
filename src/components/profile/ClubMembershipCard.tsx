import { Link } from "react-router-dom";
import { Crown, ArrowRight, Trophy, Download } from "lucide-react";
import { useClubMembership } from "@/hooks/useClubMembership";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import clubCardPreview from "@/assets/club-card-preview.png.asset.json";

export function ClubMembershipCard() {
  const { membership, loading, isMember } = useClubMembership();

  if (loading) return null;

  // Not a member — subtle invitation
  if (!isMember || !membership) {
    return (
      <Card className="p-5 border-2 border-dashed border-amber-500/40 bg-gradient-to-br from-purple-500/5 to-amber-500/5">
        <div className="flex items-center gap-3">
          <Crown className="h-8 w-8 text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-bold">Become a VIP</div>
            <div className="text-xs text-muted-foreground">
              Join the Unique VIP Club — support good, unlock perks.
            </div>
          </div>
          <Button asChild size="sm" className="bg-gradient-to-r from-amber-500 to-pink-500">
            <Link to="/club">Join</Link>
          </Button>
        </div>
      </Card>
    );
  }

  const memberNum = String(membership.member_number).padStart(4, "0");

  return (
    <Card className="overflow-hidden border-amber-500/40">
      <div className="p-4 flex items-center justify-between bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          <span className="font-bold text-sm">VIP Club Member</span>
          {membership.is_founding && (
            <Badge className="bg-amber-500 text-white text-[10px] gap-1">
              <Trophy className="h-3 w-3" /> FOUNDING
            </Badge>
          )}
        </div>
        <Badge variant="outline" className="text-[10px]">#{memberNum}</Badge>
      </div>

      <Link to="/club/card" className="block group">
        <div className="relative">
          <img
            src={clubCardPreview.url}
            alt={`Unique VIP Club Card #${memberNum}`}
            className="w-full aspect-[1.586/1] object-cover group-hover:scale-[1.02] transition-transform"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
            <div className="text-white">
              <div className="text-[10px] uppercase tracking-widest opacity-80">Tap to view</div>
              <div className="text-sm font-bold">Your VIP Card</div>
            </div>
          </div>
        </div>
      </Link>
      <p className="text-center text-sm font-semibold px-3 py-2 bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
        A unique card for unique people.
      </p>

      <div className="p-3 flex gap-2 flex-wrap">
        <Button asChild size="sm" variant="default" className="flex-1 min-w-[120px]">
          <Link to="/club/card">
            View card <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="flex-1 min-w-[120px]">
          <Link to="/club/card">
            <Download className="h-3 w-3 mr-1" /> Download
          </Link>
        </Button>
      </div>
    </Card>
  );
}
