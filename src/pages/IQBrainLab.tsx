import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Puzzle, Brain, Zap, Calculator, Users, User, BarChart3, Target, Database } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

// Puzzles & Games
import IQHanoi from "@/components/iq/IQHanoi";
import IQSudoku4 from "@/components/iq/IQSudoku4";
import IQMemoryCards from "@/components/iq/IQMemoryCards";
import IQ24Game from "@/components/iq/IQ24Game";
import IQ15Puzzle from "@/components/iq/IQ15Puzzle";
import IQMinesweeper from "@/components/iq/IQMinesweeper";
import IQLightsOut from "@/components/iq/IQLightsOut";
import IQMastermind from "@/components/iq/IQMastermind";
import IQBlockSlide from "@/components/iq/IQBlockSlide";
import IQNonogram5 from "@/components/iq/IQNonogram5";
import IQKakuro4 from "@/components/iq/IQKakuro4";
import IQFlowConnect from "@/components/iq/IQFlowConnect";
import IQPipesRotate from "@/components/iq/IQPipesRotate";
import IQMagicSquare from "@/components/iq/IQMagicSquare";
import IQKnightTour from "@/components/iq/IQKnightTour";
import IQRiverCrossing from "@/components/iq/IQRiverCrossing";
import IQNQueens4 from "@/components/iq/IQNQueens4";
import IQTangram from "@/components/iq/IQTangram";
import IQMazeRunner from "@/components/iq/IQMazeRunner";
import IQPuzzleSummary from "@/components/iq/IQPuzzleSummary";

// Memory & Attention
import IQNumberSpan from "@/components/iq/IQNumberSpan";
import IQVisualMemory from "@/components/iq/IQVisualMemory";
import IQReverseSpan from "@/components/iq/IQReverseSpan";
import IQSimon from "@/components/iq/IQSimon";
import IQNBack from "@/components/iq/IQNBack";
import IQAudioMemory from "@/components/iq/IQAudioMemory";
import IQColorRecall from "@/components/iq/IQColorRecall";
import IQFaceMemory from "@/components/iq/IQFaceMemory";
import IQMapMemory from "@/components/iq/IQMapMemory";
import IQSpotDifference from "@/components/iq/IQSpotDifference";
import IQAttentionGrid from "@/components/iq/IQAttentionGrid";
import IQDualTask from "@/components/iq/IQDualTask";
import IQDivideAttention from "@/components/iq/IQDivideAttention";
import IQVisualSearch from "@/components/iq/IQVisualSearch";
import IQChangeBlind from "@/components/iq/IQChangeBlind";
import IQTrailMaking from "@/components/iq/IQTrailMaking";
import IQDigitSymbol from "@/components/iq/IQDigitSymbol";
import IQBackwardCount from "@/components/iq/IQBackwardCount";
import IQGoNoGo from "@/components/iq/IQGoNoGo";
import IQAttentionSummary from "@/components/iq/IQAttentionSummary";

// Speed & Focus
import IQFocusTimer from "@/components/iq/IQFocusTimer";
import IQReactionTime from "@/components/iq/IQReactionTime";
import IQStroop from "@/components/iq/IQStroop";
import IQTypingSpeed from "@/components/iq/IQTypingSpeed";
import IQSchulte from "@/components/iq/IQSchulte";
import IQBrainSummary from "@/components/iq/IQBrainSummary";

// Math & Logic
import IQMentalMath from "@/components/iq/IQMentalMath";
import IQLogicGates from "@/components/iq/IQLogicGates";
import IQEstimation from "@/components/iq/IQEstimation";
import IQFractions from "@/components/iq/IQFractions";
import IQEquations from "@/components/iq/IQEquations";
import IQSequenceMath from "@/components/iq/IQSequenceMath";
import IQPrimeSpot from "@/components/iq/IQPrimeSpot";
import IQGeometry from "@/components/iq/IQGeometry";
import IQProbability from "@/components/iq/IQProbability";
import IQVennLogic from "@/components/iq/IQVennLogic";
import IQSyllogism from "@/components/iq/IQSyllogism";
import IQMatrixReasoning from "@/components/iq/IQMatrixReasoning";
import IQAnalogies from "@/components/iq/IQAnalogies";
import IQClassification from "@/components/iq/IQClassification";
import IQCodeBreak from "@/components/iq/IQCodeBreak";
import IQBinaryConvert from "@/components/iq/IQBinaryConvert";
import IQHexConvert from "@/components/iq/IQHexConvert";
import IQMathSummary from "@/components/iq/IQMathSummary";
import IQPatternSequence from "@/components/iq/IQPatternSequence";
import IQOddOneOut from "@/components/iq/IQOddOneOut";
import IQRotation from "@/components/iq/IQRotation";
import IQAnagramHunt from "@/components/iq/IQAnagramHunt";
import IQWordScramble from "@/components/iq/IQWordScramble";

// Social & Clans
import IQDuelInvite from "@/components/iq/IQDuelInvite";
import IQDuelLobby from "@/components/iq/IQDuelLobby";
import IQDuelMatch from "@/components/iq/IQDuelMatch";
import IQDuelHistory from "@/components/iq/IQDuelHistory";
import IQClanCreate from "@/components/iq/IQClanCreate";
import IQClanList from "@/components/iq/IQClanList";
import IQClanChat from "@/components/iq/IQClanChat";
import IQGuildWar from "@/components/iq/IQGuildWar";
import IQTeamLeaderboard from "@/components/iq/IQTeamLeaderboard";
import IQMentorMatch from "@/components/iq/IQMentorMatch";
import IQStudyGroup from "@/components/iq/IQStudyGroup";
import IQForumThreads from "@/components/iq/IQForumThreads";
import IQMentorChat from "@/components/iq/IQMentorChat";
import IQFriendInvite from "@/components/iq/IQFriendInvite";
import IQSocialSummary from "@/components/iq/IQSocialSummary";

// Profile & Customization
import IQAvatarPicker from "@/components/iq/IQAvatarPicker";
import IQThemeSelector from "@/components/iq/IQThemeSelector";
import IQBadgeShowcase from "@/components/iq/IQBadgeShowcase";
import IQTitleSelector from "@/components/iq/IQTitleSelector";
import IQProfileBanner from "@/components/iq/IQProfileBanner";
import IQFrameSelector from "@/components/iq/IQFrameSelector";
import IQNicknameEditor from "@/components/iq/IQNicknameEditor";
import IQBioEditor from "@/components/iq/IQBioEditor";
import IQSoundToggle from "@/components/iq/IQSoundToggle";
import IQCustomSummary from "@/components/iq/IQCustomSummary";

// Analytics
import IQWeeklyActivity from "@/components/iq/IQWeeklyActivity";
import IQSkillRadar from "@/components/iq/IQSkillRadar";
import IQScoreHistory from "@/components/iq/IQScoreHistory";
import IQTimeSpent from "@/components/iq/IQTimeSpent";
import IQAnalyticsSummary from "@/components/iq/IQAnalyticsSummary";

// Goals
import IQGoalSetter from "@/components/iq/IQGoalSetter";
import IQMilestoneTracker from "@/components/iq/IQMilestoneTracker";
import IQHabitTracker from "@/components/iq/IQHabitTracker";
import IQJournal from "@/components/iq/IQJournal";
import IQGoalSummary from "@/components/iq/IQGoalSummary";

// Data
import IQDataExport from "@/components/iq/IQDataExport";
import IQDataImport from "@/components/iq/IQDataImport";
import IQDataReset from "@/components/iq/IQDataReset";
import IQShareProfile from "@/components/iq/IQShareProfile";
import IQFinalSummary from "@/components/iq/IQFinalSummary";

import { SEO } from "@/components/SEO";

const CATEGORIES = [
  { id: "puzzles", label: "Puzzles", icon: Puzzle, desc: "Sudoku, Hanoi, Tangram & more" },
  { id: "memory", label: "Memory & Attention", icon: Brain, desc: "Recall, focus, visual search" },
  { id: "speed", label: "Speed & Focus", icon: Zap, desc: "Reaction, Stroop, Schulte" },
  { id: "math", label: "Math & Logic", icon: Calculator, desc: "Equations, sequences, syllogisms" },
  { id: "social", label: "Social & Clans", icon: Users, desc: "Duels, clans, mentor chat" },
  { id: "profile", label: "Profile", icon: User, desc: "Avatar, theme, nickname, bio" },
  { id: "analytics", label: "Analytics", icon: BarChart3, desc: "Skill radar, history, time" },
  { id: "goals", label: "Goals", icon: Target, desc: "Habits, journal, milestones" },
  { id: "data", label: "Data", icon: Database, desc: "Export / import / reset / share" },
];

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
);

const IQBrainLab = () => {
  const [tab, setTab] = useState("puzzles");

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-6 mt-16 sm:mt-20">
      <FloatingHowItWorks
        title="IQ Brain Lab"
        intro="100+ brain-training mini-games across puzzles, memory, focus, math and logic."
        steps={[
          { title: "Pick a category", desc: "Use the tabs — Puzzles, Memory, Focus, Math, Logic and more." },
          { title: "Play a mini-game", desc: "Each game is short and tracks your best score." },
          { title: "Beat your best", desc: "Scores update your IQ profile and unlock achievements." },
          { title: "Track progress", desc: "Stats tab shows history and improvement over time." },
        ]}
      />
      <SEO
        title="Brain Lab — IQ Training Tools | Unique"
        description="100+ brain training mini-games: puzzles, memory, focus, math, logic. Track progress and beat your best."
        canonical="/iq-platform/lab"
      />

      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/iq-platform"><ArrowLeft className="h-4 w-4 mr-1" /> IQ Platform</Link>
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-primary/15 via-purple-500/10 to-pink-500/10 border-primary/30">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" /> Brain Lab
          </CardTitle>
          <CardDescription>
            100+ training mini-tools, neatly organized. Pick a category and start training.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1 h-auto p-1.5 bg-muted/50 rounded-xl">
          {CATEGORIES.map(c => (
            <TabsTrigger key={c.id} value={c.id} className="text-[10px] sm:text-xs py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <c.icon className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">{c.label}</span>
              <span className="sm:hidden">{c.label.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="puzzles">
          <Grid>
            <IQHanoi /><IQSudoku4 /><IQMemoryCards /><IQ24Game /><IQ15Puzzle />
            <IQMinesweeper /><IQLightsOut /><IQMastermind /><IQBlockSlide /><IQNonogram5 />
            <IQKakuro4 /><IQFlowConnect /><IQPipesRotate /><IQMagicSquare /><IQKnightTour />
            <IQRiverCrossing /><IQNQueens4 /><IQTangram /><IQMazeRunner />
          </Grid>
          <div className="mt-4"><IQPuzzleSummary /></div>
        </TabsContent>

        <TabsContent value="memory">
          <Grid>
            <IQNumberSpan /><IQVisualMemory /><IQReverseSpan /><IQSimon /><IQNBack />
            <IQAudioMemory /><IQColorRecall /><IQFaceMemory /><IQMapMemory /><IQSpotDifference />
            <IQAttentionGrid /><IQDualTask /><IQDivideAttention /><IQVisualSearch /><IQChangeBlind />
            <IQTrailMaking /><IQDigitSymbol /><IQBackwardCount /><IQGoNoGo />
          </Grid>
          <div className="mt-4"><IQAttentionSummary /></div>
        </TabsContent>

        <TabsContent value="speed">
          <Grid>
            <IQFocusTimer /><IQReactionTime /><IQStroop /><IQTypingSpeed /><IQSchulte />
          </Grid>
          <div className="mt-4"><IQBrainSummary /></div>
        </TabsContent>

        <TabsContent value="math">
          <Grid>
            <IQMentalMath /><IQLogicGates /><IQEstimation /><IQFractions /><IQEquations />
            <IQSequenceMath /><IQPrimeSpot /><IQGeometry /><IQProbability /><IQVennLogic />
            <IQSyllogism /><IQMatrixReasoning /><IQAnalogies /><IQClassification /><IQCodeBreak />
            <IQBinaryConvert /><IQHexConvert /><IQPatternSequence /><IQOddOneOut /><IQRotation />
            <IQAnagramHunt /><IQWordScramble />
          </Grid>
          <div className="mt-4"><IQMathSummary /></div>
        </TabsContent>

        <TabsContent value="social">
          <Grid>
            <IQDuelInvite /><IQDuelLobby /><IQDuelMatch /><IQDuelHistory />
            <IQClanCreate /><IQClanList /><IQClanChat /><IQGuildWar /><IQTeamLeaderboard />
            <IQMentorMatch /><IQStudyGroup /><IQForumThreads /><IQMentorChat /><IQFriendInvite />
          </Grid>
          <div className="mt-4"><IQSocialSummary /></div>
        </TabsContent>

        <TabsContent value="profile">
          <Grid>
            <IQAvatarPicker /><IQThemeSelector /><IQBadgeShowcase /><IQTitleSelector />
            <IQProfileBanner /><IQFrameSelector /><IQNicknameEditor /><IQBioEditor /><IQSoundToggle />
          </Grid>
          <div className="mt-4"><IQCustomSummary /></div>
        </TabsContent>

        <TabsContent value="analytics">
          <Grid>
            <IQWeeklyActivity /><IQSkillRadar /><IQScoreHistory /><IQTimeSpent />
          </Grid>
          <div className="mt-4"><IQAnalyticsSummary /></div>
        </TabsContent>

        <TabsContent value="goals">
          <Grid>
            <IQGoalSetter /><IQMilestoneTracker /><IQHabitTracker /><IQJournal />
          </Grid>
          <div className="mt-4"><IQGoalSummary /></div>
        </TabsContent>

        <TabsContent value="data">
          <Grid>
            <IQDataExport /><IQDataImport /><IQDataReset /><IQShareProfile />
          </Grid>
          <div className="mt-4"><IQFinalSummary /></div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IQBrainLab;
