import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageCircle, Inbox } from "lucide-react";
import { usePropertyUnread } from "@/hooks/usePropertyUnread";
import { useAuth } from "@/contexts/AuthContext";
import { PropertyChatDialog } from "./PropertyChatDialog";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function PropertyConversationsDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const { conversations, loading, refresh } = usePropertyUnread({ notifyToasts: false });
  const [active, setActive] = useState<{
    propertyId: string;
    title: string;
    sellerId: string;
    buyerId: string;
  } | null>(null);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5" /> Property conversations
            </DialogTitle>
            <DialogDescription>Your buyer/seller chats across all listings.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 -mx-2 px-2">
            {!user ? (
              <p className="text-sm text-muted-foreground text-center py-12">Please sign in.</p>
            ) : loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">No conversations yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {conversations.map((c) => {
                  const role = user.id === c.seller_id ? "Buyer" : "Seller";
                  return (
                    <li key={`${c.property_id}|${c.buyer_id}|${c.seller_id}`}>
                      <button
                        className="w-full text-left py-3 px-2 hover:bg-muted/50 rounded-md flex items-start gap-3"
                        onClick={() => {
                          setActive({
                            propertyId: c.property_id,
                            title: c.property_title ?? "Property",
                            sellerId: c.seller_id,
                            buyerId: c.buyer_id,
                          });
                        }}
                      >
                        <div className="relative mt-1">
                          <MessageCircle className="h-5 w-5 text-primary" />
                          {c.unread > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                              {c.unread > 9 ? "9+" : c.unread}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold truncate">{c.property_title ?? "Property"}</p>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {new Date(c.last_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            <Badge variant="outline" className="mr-1 text-[10px] py-0">{role}</Badge>
                            {c.last_content}
                          </p>
                        </div>
                        {c.unread > 0 && (
                          <Badge className="bg-red-500 hover:bg-red-500 text-white">{c.unread} new</Badge>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {active && (
        <PropertyChatDialog
          open={!!active}
          onOpenChange={(o) => {
            if (!o) {
              setActive(null);
              refresh();
            }
          }}
          propertyId={active.propertyId}
          propertyTitle={active.title}
          sellerId={active.sellerId}
          buyerIdOverride={active.buyerId}
        />
      )}
    </>
  );
}
