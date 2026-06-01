export type NotificationActor = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
} | null | undefined;

export type NotificationLike = {
  type: string;
  title?: string | null;
  message?: string | null;
  actor?: NotificationActor;
};

export const displayNameOf = (actor?: NotificationActor): string =>
  actor?.full_name?.trim() || actor?.username?.trim() || "";

export const hasActor = (actor?: NotificationActor): boolean =>
  !!actor && !!displayNameOf(actor);

export const getNotificationText = (n: NotificationLike): string => {
  const name = displayNameOf(n.actor);
  const withActor = hasActor(n.actor);

  switch (n.type) {
    case "like":
      return withActor ? `${name} liked your post` : "Your post got a new like";
    case "comment":
      return withActor ? `${name} commented on your post` : "New comment on your post";
    case "reaction":
      return withActor ? `${name} reacted to your post` : "New reaction on your post";
    case "repost":
      return withActor ? `${name} shared your post` : "Your post was shared";
    case "follow":
      return withActor ? `${name} started following you` : "You have a new follower";
    case "friend_request":
      return n.message || (withActor ? `${name} sent you a friend request` : "New friend request");
    case "job_match":
      return "New job listing matches your preferences";
    case "job_application":
      return withActor ? `${name} applied for your job position` : "New job application";
    case "verification_request":
      return withActor ? `${name} submitted a company verification request` : "New verification request";
    case "masterchef_payout":
      return "New KitchenStars payout pending";
    case "masterchef_withdrawal":
      return n.message || "New KitchenStars withdrawal request";
    case "musician_withdrawal":
      return n.message || "New Musician withdrawal request";
    case "instructor_withdrawal":
      return n.message || "New Instructor withdrawal request";
    case "campaign_withdrawal":
      return n.message || "New Campaign withdrawal request";
    case "weekly_xp_winner":
    case "weekly_xp_leaderboard":
      return n.message || n.title || "You won the Weekly XP Leaderboard!";
    default:
      return n.message || n.title || (withActor ? `${name} interacted with your content` : "New notification");
  }
};

export const getAvatarFallbackChar = (actor?: NotificationActor): string | null => {
  if (!hasActor(actor)) return null;
  return displayNameOf(actor).charAt(0).toUpperCase();
};
