import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EyeOff, Info, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ShadowBanToggleProps {
  userId: string;
  userName?: string;
  initialValue?: boolean;
  onUpdate?: (isShadowBanned: boolean) => void;
}

export const ShadowBanToggle = ({
  userId,
  userName,
  initialValue = false,
  onUpdate,
}: ShadowBanToggleProps) => {
  const [isShadowBanned, setIsShadowBanned] = useState(initialValue);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingValue, setPendingValue] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const handleToggleChange = (checked: boolean) => {
    setPendingValue(checked);
    setShowConfirmDialog(true);
  };

  const confirmShadowBan = async () => {
    setUpdating(true);
    try {
      // Update or insert shadow ban record
      if (pendingValue) {
        const { error } = await supabase
          .from("shadow_bans")
          .upsert({
            user_id: userId,
            is_active: true,
            banned_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("shadow_bans")
          .update({ is_active: false, unbanned_at: new Date().toISOString() })
          .eq("user_id", userId);

        if (error) throw error;
      }

      setIsShadowBanned(pendingValue);
      onUpdate?.(pendingValue);

      toast({
        title: pendingValue ? "Shadow ban activated" : "Shadow ban removed",
        description: pendingValue 
          ? "User's posts are now hidden from public feeds"
          : "User's posts are visible again",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Shadow Ban Toggle - How it works"} steps={[{ title: 'Open', desc: 'Access the Shadow Ban Toggle section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Shadow Ban Toggle.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <>
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-lg",
        "bg-gradient-to-r from-red-500/5 to-orange-500/5",
        "border border-red-500/20",
        isShadowBanned && "border-red-500/40 from-red-500/10 to-orange-500/10"
      )}>
        <EyeOff className={cn(
          "h-5 w-5",
          isShadowBanned ? "text-red-500" : "text-muted-foreground"
        )} />
        
        <div className="flex-1">
          <Label 
            htmlFor={`shadow-ban-${userId}`} 
            className="text-sm font-medium cursor-pointer"
          >
            Shadow Ban
          </Label>
          <p className="text-xs text-muted-foreground">
            {isShadowBanned 
              ? "Posts hidden from global feed" 
              : "Posts visible to everyone"
            }
          </p>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="text-xs">
                Shadow banned users can still post and see their own content, 
                but their posts won't appear in the public feed or trending. 
                They are not notified of this action.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Switch
          id={`shadow-ban-${userId}`}
          checked={isShadowBanned}
          onCheckedChange={handleToggleChange}
          disabled={updating}
          className="data-[state=checked]:bg-red-500"
        />
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <EyeOff className="h-5 w-5 text-red-500" />
              {pendingValue ? "Activate Shadow Ban?" : "Remove Shadow Ban?"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  {pendingValue ? (
                    <>
                      You are about to shadow ban <strong>{userName || "this user"}</strong>.
                      Their posts will be hidden from the global feed and trending sections,
                      but they will still be able to see their own posts.
                    </>
                  ) : (
                    <>
                      You are about to remove the shadow ban from <strong>{userName || "this user"}</strong>.
                      Their posts will be visible in public feeds again.
                    </>
                  )}
                </p>
                {pendingValue && (
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      ⚠️ The user will NOT be notified of this action. Use this feature 
                      responsibly to maintain platform integrity.
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmShadowBan}
              disabled={updating}
              className={cn(
                pendingValue 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-green-500 hover:bg-green-600"
              )}
            >
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pendingValue ? "Activate Shadow Ban" : "Remove Shadow Ban"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
    </>
  );
};
