import { useSecretSanta } from "@/hooks/useSecretSanta";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Sparkles, Clock } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const SecretSantaStories = () => {
  const { stories, storiesLoading } = useSecretSanta();

  if (storiesLoading) {
    return (
    <>
      <FloatingHowItWorks title={"Secret Santa Stories - How it works"} steps={[{ title: 'Open', desc: 'Access the Secret Santa Stories section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Secret Santa Stories.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-amber-100 rounded-xl" />
          ))}
        </div>
      </div>
    </>
  );
  }

  if (stories.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-8 text-center shadow-lg">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-rose-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No stories yet</h3>
        <p className="text-gray-500">
          When someone shares their gift, it will appear here for 24 hours!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-4 sm:p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-rose-500" />
        Gift Stories
        <span className="text-gray-400 text-sm font-normal ml-2">
          ({stories.length} active)
        </span>
      </h3>

      <ScrollArea className="h-[500px]">
        <div className="grid gap-4 sm:grid-cols-2">
          {stories.map((story: any) => {
            const gift = story.secret_santa_gifts;
            const expiresIn = new Date(story.expires_at);
            const hoursLeft = Math.max(0, Math.ceil((expiresIn.getTime() - Date.now()) / (1000 * 60 * 60)));

            return (
              <div
                key={story.id}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 border border-rose-200 p-4 group hover:border-rose-400 transition-all shadow-sm"
              >
                {/* Expiry indicator */}
                <div className="absolute top-3 right-3 flex items-center gap-1 text-gray-500 text-xs bg-white/80 px-2 py-1 rounded-full">
                  <Clock className="h-3 w-3" />
                  {hoursLeft}h left
                </div>

                {/* Gift display */}
                <div className="text-center mb-4">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-white to-rose-50 flex items-center justify-center text-5xl transform group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    {gift?.gift_emoji}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-700 font-medium">
                    Someone received a
                  </p>
                  <p className="text-amber-600 font-bold text-lg capitalize">
                    {gift?.gift_type?.replace(/_/g, " ")}
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
                  </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-rose-200/30 rounded-full blur-xl" />
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-200/30 rounded-full blur-xl" />
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
