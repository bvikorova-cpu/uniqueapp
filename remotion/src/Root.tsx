import { Composition } from "remotion";
import { PropertyVideo } from "./PropertyVideo";
import { UniqueMarketing } from "./UniqueMarketing";
import { UniqueMarketingV } from "./UniqueMarketingV";
import { HomeMarketing, HOME_DURATION } from "./HomeMarketing";
import { HomeMarketingVertical, HOME_V_DURATION } from "./HomeMarketingVertical";
import { ChallengesFilm, CHALLENGES_DURATION } from "./ChallengesFilm";
import { DiscoverFilm, DISCOVER_DURATION } from "./DiscoverFilm";
import { KidsFilm, KIDS_DURATION } from "./KidsFilm";
import { LearningFilm, LEARNING_DURATION } from "./LearningFilm";
import { ArenaFilm, ARENA_DURATION } from "./ArenaFilm";
import { FundraisingFilm, FUNDRAISING_DURATION } from "./FundraisingFilm";
import { AIToolsFilm, AITOOLS_DURATION } from "./AIToolsFilm";
import { MysticalFilm, MYSTICAL_DURATION } from "./MysticalFilm";
import { SocialFilm, SOCIAL_DURATION } from "./SocialFilm";
import { HealthFilm, HEALTH_DURATION } from "./HealthFilm";
import { SportsFilm, SPORTS_DURATION } from "./SportsFilm";
import { EntertainmentFilm, ENTERTAINMENT_DURATION } from "./EntertainmentFilm";
import { InfluKingFilm, INFLUKING_DURATION } from "./InfluKingFilm";
import { InfluKingCinematic, INFLUKING_CINEMATIC_DURATION } from "./InfluKingCinematic";
import { MarketplacesFilm, MARKETPLACES_DURATION } from "./MarketplacesFilm";
import { LearningGrowthFilm, LEARNINGGROWTH_DURATION } from "./LearningGrowthFilm";
import { AccountFilm, ACCOUNT_DURATION } from "./AccountFilm";
import { UniAssistantFilm, UNIASSISTANT_DURATION } from "./UniAssistantFilm";
import { VerifiedFilm, VERIFIED_DURATION } from "./VerifiedFilm";
import { ClubFilm, CLUB_DURATION } from "./ClubFilm";

import { VERSIONS } from "./versions";



const TOTAL = 8 * 112 + 4; // 900

export const RemotionRoot = () => (
  <>
    <Composition
      id="main"
      component={PropertyVideo}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={540}
    />
    <Composition
      id="unique-marketing"
      component={UniqueMarketing}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="home-marketing"
      component={HomeMarketing}
      durationInFrames={HOME_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="home-marketing-vertical"
      component={HomeMarketingVertical}
      durationInFrames={HOME_V_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="challenges-film"
      component={ChallengesFilm}
      durationInFrames={CHALLENGES_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="discover-film"
      component={DiscoverFilm}
      durationInFrames={DISCOVER_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="kids-film"
      component={KidsFilm}
      durationInFrames={KIDS_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="learning-film"
      component={LearningFilm}
      durationInFrames={LEARNING_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="arena-film"
      component={ArenaFilm}
      durationInFrames={ARENA_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="fundraising-film"
      component={FundraisingFilm}
      durationInFrames={FUNDRAISING_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="aitools-film"
      component={AIToolsFilm}
      durationInFrames={AITOOLS_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="mystical-film"
      component={MysticalFilm}
      durationInFrames={MYSTICAL_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="social-film"
      component={SocialFilm}
      durationInFrames={SOCIAL_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="health-film"
      component={HealthFilm}
      durationInFrames={HEALTH_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="sports-film"
      component={SportsFilm}
      durationInFrames={SPORTS_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="entertainment-film"
      component={EntertainmentFilm}
      durationInFrames={ENTERTAINMENT_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="influking-film"
      component={InfluKingFilm}
      durationInFrames={INFLUKING_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="influking-cinematic"
      component={InfluKingCinematic}
      durationInFrames={INFLUKING_CINEMATIC_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="marketplaces-film"
      component={MarketplacesFilm}
      durationInFrames={MARKETPLACES_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="account-film"
      component={AccountFilm}
      durationInFrames={ACCOUNT_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="learninggrowth-film"
      component={LearningGrowthFilm}
      durationInFrames={LEARNINGGROWTH_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="uniassistant-film"
      component={UniAssistantFilm}
      durationInFrames={UNIASSISTANT_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="verified-film"
      component={VerifiedFilm}
      durationInFrames={VERIFIED_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="club-film"
      component={ClubFilm}
      durationInFrames={CLUB_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />




















    {VERSIONS.map((v) => (
      <Composition
        key={v.id}
        id={v.id}
        component={UniqueMarketingV}
        durationInFrames={TOTAL}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ version: v }}
      />
    ))}
  </>
);
