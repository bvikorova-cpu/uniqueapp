import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Cake, PartyPopper } from "lucide-react";
import { format, isSameDay, addYears, differenceInCalendarDays } from "date-fns";

interface Friend {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  birth_date: string | null;
}

function nextBirthday(dob: Date) {
  const now = new Date();
  let nb = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
  if (nb < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    nb = addYears(nb, 1);
  }
  return nb;
}

export function BirthdaysWidget() {
  const [userId, setUserId] = useState<string | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  const { data: friends = [] } = useQuery({
    queryKey: ["friends-birthdays", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Friend[]> => {
      const { data: edges } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq("status", "accepted");
      const ids = (edges ?? [])
        .map((r: any) => (r.user_id === userId ? r.friend_id : r.user_id))
        .filter(Boolean);
      if (ids.length === 0) return [];
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, birth_date")
        .in("id", ids)
        .not("birth_date", "is", null);
      return (profs ?? []) as Friend[];
    },
    staleTime: 1000 * 60 * 60,
  });

  const upcoming = friends
    .filter((f) => f.birth_date)
    .map((f) => {
      const dob = new Date(f.birth_date as string);
      const nb = nextBirthday(dob);
      return { friend: f, nextBirthday: nb, daysAway: differenceInCalendarDays(nb, new Date()) };
    })
    .filter((x) => x.daysAway <= 14)
    .sort((a, b) => a.daysAway - b.daysAway)
    .slice(0, 5);

  if (!userId || upcoming.length === 0) return null;

  return (
    <Card className="bg-card/80 backdrop-blur-md border-pink-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Cake className="h-4 w-4 text-pink-500" />
          Birthdays
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        {upcoming.map(({ friend, nextBirthday, daysAway }) => {
          const today = isSameDay(nextBirthday, new Date());
          return (
            <button
              key={friend.id}
              onClick={() => navigate(`/profile/${friend.id}`)}
              className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/40 transition-colors text-left"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={friend.avatar_url ?? undefined} />
                <AvatarFallback>{friend.full_name?.[0] ?? "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">
                  {friend.full_name ?? "User"}
                </p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  {today ? (
                    <>
                      <PartyPopper className="h-3 w-3 text-pink-500" /> Today!
                    </>
                  ) : daysAway === 1 ? (
                    "Tomorrow"
                  ) : (
                    `${format(nextBirthday, "MMM d")} · in ${daysAway} days`
                  )}
                </p>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
