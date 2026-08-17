import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Inbox, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useSkillUnread, type SkillConversation } from "@/hooks/useSkillUnread";
import { useAuth } from "@/contexts/AuthContext";
import { SkillChatDialog } from "./SkillChatDialog";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function SkillConversationsDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const { conversations, loading, refresh } = useSkillUnread({ notifyToasts: false });
  const [tab, setTab] = useState<"incoming" | "outgoing">("incoming");
  const [active, setActive] = useState<SkillConversation | null>(null);

  const list = useMemo(
    () =>
      conversations.filter((c) => (tab === "incoming" ? c.has_incoming : c.has_outgoing)),
    [conversations, tab],
  );

  const incomingUnread = conversations.reduce((s, c) => s + c.unread, 0);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5" /> Messages
            </DialogTitle>
            <DialogDescription>Your Skills Marketplace chats — incoming and outgoing.</DialogDescription>
          </DialogHeader>

          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="w-full">
              <TabsTrigger value="incoming" className="flex-1 gap-2">
                <ArrowDownLeft className="h-4 w-4" /> Incoming
                {incomingUnread > 0 && (
                  <Badge className="bg-red-500 hover:bg-red-500 text-white h-4 px-1 text-[10px]">{incomingUnread}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="outgoing" className="flex-1 gap-2">
                <ArrowUpRight className="h-4 w-4" /> Outgoing
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <ScrollArea className="flex-1 -mx-2 px-2">
            {!user ? (
              <p className="text-sm text-muted-foreground text-center py-12">Please sign in.</p>
            ) : loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : list.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                {tab === "incoming" ? "No incoming messages yet." : "You haven't sent any messages yet."}
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {list.map((c) => (
                  <li key={`${c.offering_id}|${c.other_id}`}>
                    <button
                      className="w-full text-left py-3 px-2 hover:bg-muted/50 rounded-md flex items-start gap-3"
                      onClick={() => setActive(c)}
                    >
                      <div className="relative mt-1">
                        {c.last_mine ? (
                          <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ArrowDownLeft className="h-5 w-5 text-primary" />
                        )}
                        {c.unread > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {c.unread > 9 ? "9+" : c.unread}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold truncate">{c.other_name}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {new Date(c.last_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          <Badge variant="outline" className="mr-1 text-[10px] py-0">{c.offering_title}</Badge>
                          {c.last_mine ? "You: " : ""}{c.last_message}
                        </p>
                      </div>
                      {c.unread > 0 && (
                        <Badge className="bg-red-500 hover:bg-red-500 text-white">{c.unread} new</Badge>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {active && (
        <SkillChatDialog
          open={!!active}
          onOpenChange={(o) => {
            if (!o) {
              setActive(null);
              refresh();
            }
          }}
          offeringId={active.offering_id}
          offeringTitle={active.offering_title}
          otherId={active.other_id}
          otherName={active.other_name}
        />
      )}
    </>
  );
}
