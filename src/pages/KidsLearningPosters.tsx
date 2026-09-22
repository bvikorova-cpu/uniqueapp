import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Link, useNavigate } from "react-router-dom";
import {
  Download,
  Sparkles,
  Loader2,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Wallet,
  Brain,
  Baby,
  ArrowLeft,
  Info,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import heroVideo from "@/assets/kids-posters/posters-hero.mp4.asset.json";
import encyclopediaCover from "@/assets/kids-posters/encyclopedia-cover.jpg";
import posterPartsOfSpeech from "@/assets/kids-posters/parts-of-speech.jpg";
import posterTimesTables from "@/assets/kids-posters/times-tables.jpg";
import posterAbcPhonics from "@/assets/kids-posters/abc-phonics.jpg";
import posterShapesColors from "@/assets/kids-posters/shapes-colors.jpg";
import posterSolarSystem from "@/assets/kids-posters/solar-system.jpg";
import posterWaterCycle from "@/assets/kids-posters/water-cycle.jpg";
import posterFeelings from "@/assets/kids-posters/feelings.jpg";
import posterDailyRoutine from "@/assets/kids-posters/daily-routine.jpg";
import posterOnlineSafety from "@/assets/kids-posters/online-safety.jpg";
import posterMoneyBasics from "@/assets/kids-posters/money-basics.jpg";
import posterStudySmart from "@/assets/kids-posters/study-smart.jpg";
import posterTeenLifeSkills from "@/assets/kids-posters/teen-life-skills.jpg";
import posterNumbers120 from "@/assets/kids-posters/numbers-1-20.jpg";
import posterCountingTo100 from "@/assets/kids-posters/counting-to-100.jpg";
import posterAdditionSubtraction from "@/assets/kids-posters/addition-subtraction.jpg";
import posterMultiplicationTricks from "@/assets/kids-posters/multiplication-tricks.jpg";
import posterDivisionBasics from "@/assets/kids-posters/division-basics.jpg";
import posterFractions from "@/assets/kids-posters/fractions.jpg";
import posterGeometryShapes from "@/assets/kids-posters/geometry-shapes.jpg";
import posterPercentages from "@/assets/kids-posters/percentages.jpg";
import posterRomanNumerals from "@/assets/kids-posters/roman-numerals.jpg";
import posterTellingTime from "@/assets/kids-posters/telling-time.jpg";
import posterMeasurementUnits from "@/assets/kids-posters/measurement-units.jpg";
import posterMathVocabulary from "@/assets/kids-posters/math-vocabulary.jpg";
import posterOrderOfOperations from "@/assets/kids-posters/order-of-operations.jpg";
import posterNegativeNumbers from "@/assets/kids-posters/negative-numbers.jpg";
import posterCursiveAlphabet from "@/assets/kids-posters/cursive-alphabet.jpg";
import posterSightWords from "@/assets/kids-posters/sight-words.jpg";
import klpReadyGeoSk from "@/assets/kids-poster-translations/geometry-shapes-sk.webp.asset.json";
import klpReadyGeoHu from "@/assets/kids-poster-translations/geometry-shapes-hu.webp.asset.json";
import klpReadyGeoDe from "@/assets/kids-poster-translations/geometry-shapes-de.webp.asset.json";
import klpReadyGeoEs from "@/assets/kids-poster-translations/geometry-shapes-es.webp.asset.json";
import klpReadyGeoFr from "@/assets/kids-poster-translations/geometry-shapes-fr.webp.asset.json";
import klpReadyRomanSk from "@/assets/kids-poster-translations/roman-numerals-sk.webp.asset.json";
import klpReadyRomanHu from "@/assets/kids-poster-translations/roman-numerals-hu.webp.asset.json";
import klpReadyRomanDe from "@/assets/kids-poster-translations/roman-numerals-de.webp.asset.json";
import klpReadyRomanEs from "@/assets/kids-poster-translations/roman-numerals-es.webp.asset.json";
import klpReadyRomanFr from "@/assets/kids-poster-translations/roman-numerals-fr.webp.asset.json";
import klpReadyTimeSk from "@/assets/kids-poster-translations/telling-time-sk.webp.asset.json";
import klpReadyTimeHu from "@/assets/kids-poster-translations/telling-time-hu.webp.asset.json";
import klpReadyTimeDe from "@/assets/kids-poster-translations/telling-time-de.webp.asset.json";
import klpReadyTimeEs from "@/assets/kids-poster-translations/telling-time-es.webp.asset.json";
import klpReadyTimeFr from "@/assets/kids-poster-translations/telling-time-fr.webp.asset.json";
import klpReadyCursSk from "@/assets/kids-poster-translations/cursive-alphabet-sk.webp.asset.json";
import klpReadyCursHu from "@/assets/kids-poster-translations/cursive-alphabet-hu.webp.asset.json";
import klpReadyCursDe from "@/assets/kids-poster-translations/cursive-alphabet-de.webp.asset.json";
import klpReadyCursEs from "@/assets/kids-poster-translations/cursive-alphabet-es.webp.asset.json";
import klpReadyCursFr from "@/assets/kids-poster-translations/cursive-alphabet-fr.webp.asset.json";
import klpReadySightSk from "@/assets/kids-poster-translations/sight-words-sk.webp.asset.json";
import klpReadySightHu from "@/assets/kids-poster-translations/sight-words-hu.webp.asset.json";
import klpReadySightDe from "@/assets/kids-poster-translations/sight-words-de.webp.asset.json";
import klpReadySightEs from "@/assets/kids-poster-translations/sight-words-es.webp.asset.json";
import klpReadySightFr from "@/assets/kids-poster-translations/sight-words-fr.webp.asset.json";
import klpReadyVowConSk from "@/assets/kids-poster-translations/vowels-consonants-sk.webp.asset.json";
import klpReadyVowConHu from "@/assets/kids-poster-translations/vowels-consonants-hu.webp.asset.json";
import klpReadyVowConDe from "@/assets/kids-poster-translations/vowels-consonants-de.webp.asset.json";
import klpReadyVowConEs from "@/assets/kids-poster-translations/vowels-consonants-es.webp.asset.json";
import klpReadyVowConFr from "@/assets/kids-poster-translations/vowels-consonants-fr.webp.asset.json";
import klpReadyPunctSk from "@/assets/kids-poster-translations/punctuation-marks-sk.webp.asset.json";
import klpReadyPunctHu from "@/assets/kids-poster-translations/punctuation-marks-hu.webp.asset.json";
import klpReadyPunctDe from "@/assets/kids-poster-translations/punctuation-marks-de.webp.asset.json";
import klpReadyPunctEs from "@/assets/kids-poster-translations/punctuation-marks-es.webp.asset.json";
import klpReadyPunctFr from "@/assets/kids-poster-translations/punctuation-marks-fr.webp.asset.json";
import klpReadyNounsSk from "@/assets/kids-poster-translations/nouns-sk.webp.asset.json";
import klpReadyNounsHu from "@/assets/kids-poster-translations/nouns-hu.webp.asset.json";
import klpReadyNounsDe from "@/assets/kids-poster-translations/nouns-de.webp.asset.json";
import klpReadyNounsEs from "@/assets/kids-poster-translations/nouns-es.webp.asset.json";
import klpReadyNounsFr from "@/assets/kids-poster-translations/nouns-fr.webp.asset.json";
import klpReadyVerbTenSk from "@/assets/kids-poster-translations/verbs-tenses-sk.webp.asset.json";
import klpReadyVerbTenHu from "@/assets/kids-poster-translations/verbs-tenses-hu.webp.asset.json";
import klpReadyVerbTenDe from "@/assets/kids-poster-translations/verbs-tenses-de.webp.asset.json";
import klpReadyVerbTenEs from "@/assets/kids-poster-translations/verbs-tenses-es.webp.asset.json";
import klpReadyVerbTenFr from "@/assets/kids-poster-translations/verbs-tenses-fr.png.asset.json";
import klpReadyMeasSk from "@/assets/kids-poster-translations/measurement-units-sk.webp.asset.json";
import klpReadyMeasHu from "@/assets/kids-poster-translations/measurement-units-hu.webp.asset.json";
import klpReadyMeasDe from "@/assets/kids-poster-translations/measurement-units-de.webp.asset.json";
import klpReadyMeasEs from "@/assets/kids-poster-translations/measurement-units-es.webp.asset.json";
import klpReadyMeasFr from "@/assets/kids-poster-translations/measurement-units-fr.webp.asset.json";
import klpReadyMathVocSk from "@/assets/kids-poster-translations/math-vocabulary-sk.webp.asset.json";
import klpReadyMathVocHu from "@/assets/kids-poster-translations/math-vocabulary-hu.webp.asset.json";
import klpReadyMathVocDe from "@/assets/kids-poster-translations/math-vocabulary-de.webp.asset.json";
import klpReadyMathVocEs from "@/assets/kids-poster-translations/math-vocabulary-es.webp.asset.json";
import klpReadyMathVocFr from "@/assets/kids-poster-translations/math-vocabulary-fr.webp.asset.json";
import klpReadyPctSk from "@/assets/kids-poster-translations/percentages-sk.webp.asset.json";
import klpReadyPctHu from "@/assets/kids-poster-translations/percentages-hu.webp.asset.json";
import klpReadyPctDe from "@/assets/kids-poster-translations/percentages-de.webp.asset.json";
import klpReadyPctEs from "@/assets/kids-poster-translations/percentages-es.webp.asset.json";
import klpReadyPctFr from "@/assets/kids-poster-translations/percentages-fr.webp.asset.json";
import klpReadyOrdOpSk from "@/assets/kids-poster-translations/order-of-operations-sk.webp.asset.json";
import klpReadyOrdOpHu from "@/assets/kids-poster-translations/order-of-operations-hu.webp.asset.json";
import klpReadyOrdOpDe from "@/assets/kids-poster-translations/order-of-operations-de.webp.asset.json";
import klpReadyOrdOpEs from "@/assets/kids-poster-translations/order-of-operations-es.webp.asset.json";
import klpReadyOrdOpFr from "@/assets/kids-poster-translations/order-of-operations-fr.webp.asset.json";
import klpReadyNegNumSk from "@/assets/kids-poster-translations/negative-numbers-sk.webp.asset.json";
import klpReadyNegNumHu from "@/assets/kids-poster-translations/negative-numbers-hu.webp.asset.json";
import klpReadyNegNumDe from "@/assets/kids-poster-translations/negative-numbers-de.webp.asset.json";
import klpReadyNegNumEs from "@/assets/kids-poster-translations/negative-numbers-es.png.asset.json";
import klpReadyNegNumFr from "@/assets/kids-poster-translations/negative-numbers-fr.webp.asset.json";
import klpReadyShapesSk from "@/assets/kids-poster-translations/shapes-colors-sk.jpg.asset.json";
import klpReadyShapesHu from "@/assets/kids-poster-translations/shapes-colors-hu.jpg.asset.json";
import klpReadyShapesDe from "@/assets/kids-poster-translations/shapes-colors-de.jpg.asset.json";
import klpReadyShapesEs from "@/assets/kids-poster-translations/shapes-colors-es.jpg.asset.json";
import klpReadyShapesFr from "@/assets/kids-poster-translations/shapes-colors-fr.jpg.asset.json";
import klpReadyAbcSk from "@/assets/kids-poster-translations/abc-phonics-sk.jpg.asset.json";
import klpReadyAbcHu from "@/assets/kids-poster-translations/abc-phonics-hu.jpg.asset.json";
import klpReadyAbcDe from "@/assets/kids-poster-translations/abc-phonics-de.jpg.asset.json";
import klpReadyAbcEs from "@/assets/kids-poster-translations/abc-phonics-es.jpg.asset.json";
import klpReadyAbcFr from "@/assets/kids-poster-translations/abc-phonics-fr.jpg.asset.json";
import klpReadyAddSubSk from "@/assets/kids-poster-translations/addition-subtraction-sk.jpg.asset.json";
import klpReadyAddSubHu from "@/assets/kids-poster-translations/addition-subtraction-hu.jpg.asset.json";
import klpReadyAddSubDe from "@/assets/kids-poster-translations/addition-subtraction-de.jpg.asset.json";
import klpReadyAddSubEs from "@/assets/kids-poster-translations/addition-subtraction-es.jpg.asset.json";
import klpReadyAddSubFr from "@/assets/kids-poster-translations/addition-subtraction-fr.jpg.asset.json";
import klpReadyMultTricksSk from "@/assets/kids-poster-translations/multiplication-tricks-sk.jpg.asset.json";
import klpReadyMultTricksHu from "@/assets/kids-poster-translations/multiplication-tricks-hu.jpg.asset.json";
import klpReadyMultTricksDe from "@/assets/kids-poster-translations/multiplication-tricks-de.jpg.asset.json";
import klpReadyMultTricksEs from "@/assets/kids-poster-translations/multiplication-tricks-es.jpg.asset.json";
import klpReadyMultTricksFr from "@/assets/kids-poster-translations/multiplication-tricks-fr.jpg.asset.json";
import klpReadyDivBasSk from "@/assets/kids-poster-translations/division-basics-sk.jpg.asset.json";
import klpReadyDivBasHu from "@/assets/kids-poster-translations/division-basics-hu.jpg.asset.json";
import klpReadyDivBasDe from "@/assets/kids-poster-translations/division-basics-de.jpg.asset.json";
import klpReadyDivBasEs from "@/assets/kids-poster-translations/division-basics-es.jpg.asset.json";
import klpReadyDivBasFr from "@/assets/kids-poster-translations/division-basics-fr.jpg.asset.json";
import klpReadyFracSk from "@/assets/kids-poster-translations/fractions-sk.jpg.asset.json";
import klpReadyFracHu from "@/assets/kids-poster-translations/fractions-hu.jpg.asset.json";
import klpReadyFracDe from "@/assets/kids-poster-translations/fractions-de.jpg.asset.json";
import klpReadyFracEs from "@/assets/kids-poster-translations/fractions-es.jpg.asset.json";
import klpReadyFracFr from "@/assets/kids-poster-translations/fractions-fr.jpg.asset.json";
import klpReadyTimesSk from "@/assets/kids-poster-translations/times-tables-sk.jpg.asset.json";
import klpReadyTimesHu from "@/assets/kids-poster-translations/times-tables-hu.jpg.asset.json";
import klpReadyTimesDe from "@/assets/kids-poster-translations/times-tables-de.jpg.asset.json";
import klpReadyTimesEs from "@/assets/kids-poster-translations/times-tables-es.jpg.asset.json";
import klpReadyTimesFr from "@/assets/kids-poster-translations/times-tables-fr.jpg.asset.json";
import klpReadyPosSk from "@/assets/kids-poster-translations/parts-of-speech-sk.jpg.asset.json";
import klpReadyPosHu from "@/assets/kids-poster-translations/parts-of-speech-hu.jpg.asset.json";
import klpReadyPosDe from "@/assets/kids-poster-translations/parts-of-speech-de.jpg.asset.json";
import klpReadyPosEs from "@/assets/kids-poster-translations/parts-of-speech-es.jpg.asset.json";
import klpReadyPosFr from "@/assets/kids-poster-translations/parts-of-speech-fr.jpg.asset.json";
import klpReadySolarSk from "@/assets/kids-poster-translations/solar-system-sk.jpg.asset.json";
import klpReadySolarHu from "@/assets/kids-poster-translations/solar-system-hu.jpg.asset.json";
import klpReadySolarDe from "@/assets/kids-poster-translations/solar-system-de.jpg.asset.json";
import klpReadySolarEs from "@/assets/kids-poster-translations/solar-system-es.jpg.asset.json";
import klpReadySolarFr from "@/assets/kids-poster-translations/solar-system-fr.jpg.asset.json";
import klpReadyWaterSk from "@/assets/kids-poster-translations/water-cycle-sk.jpg.asset.json";
import klpReadyWaterHu from "@/assets/kids-poster-translations/water-cycle-hu.jpg.asset.json";
import klpReadyWaterDe from "@/assets/kids-poster-translations/water-cycle-de.jpg.asset.json";
import klpReadyWaterEs from "@/assets/kids-poster-translations/water-cycle-es.jpg.asset.json";
import klpReadyWaterFr from "@/assets/kids-poster-translations/water-cycle-fr.jpg.asset.json";
import klpReadyFeelSk from "@/assets/kids-poster-translations/feelings-sk.jpg.asset.json";
import klpReadyFeelHu from "@/assets/kids-poster-translations/feelings-hu.jpg.asset.json";
import klpReadyFeelDe from "@/assets/kids-poster-translations/feelings-de.jpg.asset.json";
import klpReadyFeelEs from "@/assets/kids-poster-translations/feelings-es.jpg.asset.json";
import klpReadyFeelFr from "@/assets/kids-poster-translations/feelings-fr.jpg.asset.json";
import klpReadyRoutSk from "@/assets/kids-poster-translations/daily-routine-sk.jpg.asset.json";
import klpReadyRoutHu from "@/assets/kids-poster-translations/daily-routine-hu.jpg.asset.json";
import klpReadyRoutDe from "@/assets/kids-poster-translations/daily-routine-de.jpg.asset.json";
import klpReadyRoutEs from "@/assets/kids-poster-translations/daily-routine-es.jpg.asset.json";
import klpReadyRoutFr from "@/assets/kids-poster-translations/daily-routine-fr.jpg.asset.json";
import posterVowelsConsonants from "@/assets/kids-posters/vowels-consonants.jpg";
import posterPunctuationMarks from "@/assets/kids-posters/punctuation-marks.jpg";
import posterNouns from "@/assets/kids-posters/nouns.jpg";
import posterVerbsTenses from "@/assets/kids-posters/verbs-tenses.jpg";
import posterAdjectives from "@/assets/kids-posters/adjectives.jpg";
import posterReadingStrategies from "@/assets/kids-posters/reading-strategies.jpg";
import posterWriteAStory from "@/assets/kids-posters/write-a-story.jpg";
import posterIrregularVerbs from "@/assets/kids-posters/irregular-verbs.jpg";
import posterWorldLandmarks from "@/assets/kids-posters/world-landmarks.jpg";
import posterContinentsOceans from "@/assets/kids-posters/continents-oceans.jpg";
import posterWorldMapAnimals from "@/assets/kids-posters/world-map-animals.jpg";
import posterFlagsOfEurope from "@/assets/kids-posters/flags-of-europe.jpg";
import posterHumanBodyOrgans from "@/assets/kids-posters/human-body-organs.jpg";
import posterHumanSkeleton from "@/assets/kids-posters/human-skeleton.jpg";
import posterFiveSenses from "@/assets/kids-posters/five-senses.jpg";
import posterDinosaurs from "@/assets/kids-posters/dinosaurs.jpg";
import posterButterflyLifeCycle from "@/assets/kids-posters/butterfly-life-cycle.jpg";
import posterPhotosynthesis from "@/assets/kids-posters/photosynthesis.jpg";
import posterWeatherClouds from "@/assets/kids-posters/weather-clouds.jpg";
import posterStatesOfMatter from "@/assets/kids-posters/states-of-matter.jpg";
import posterFoodChain from "@/assets/kids-posters/food-chain.jpg";
import posterOceanZones from "@/assets/kids-posters/ocean-zones.jpg";
import posterVolcanoes from "@/assets/kids-posters/volcanoes.jpg";
import posterElectricityBasics from "@/assets/kids-posters/electricity-basics.jpg";
import posterSimpleMachines from "@/assets/kids-posters/simple-machines.jpg";
import posterSpaceRockets from "@/assets/kids-posters/space-rockets.jpg";
import posterMoonPhases from "@/assets/kids-posters/moon-phases.jpg";
import posterFourSeasons from "@/assets/kids-posters/four-seasons.jpg";
import posterRecyclingEarth from "@/assets/kids-posters/recycling-earth.jpg";
import posterBeesPollination from "@/assets/kids-posters/bees-pollination.jpg";
import posterRainforestAnimals from "@/assets/kids-posters/rainforest-animals.jpg";
import posterInsects from "@/assets/kids-posters/insects.jpg";
import posterBrushingTeeth from "@/assets/kids-posters/brushing-teeth.jpg";
import posterHandWashing from "@/assets/kids-posters/hand-washing.jpg";
import posterHealthyFoodPlate from "@/assets/kids-posters/healthy-food-plate.jpg";
import posterEmotionsTeens from "@/assets/kids-posters/emotions-teens.jpg";
import posterFriendshipRules from "@/assets/kids-posters/friendship-rules.jpg";
import posterTableManners from "@/assets/kids-posters/table-manners.jpg";
import posterMorningRoutine from "@/assets/kids-posters/morning-routine.jpg";
import posterBedtimeRoutine from "@/assets/kids-posters/bedtime-routine.jpg";
import posterSportsMovement from "@/assets/kids-posters/sports-movement.jpg";
import posterYogaKids from "@/assets/kids-posters/yoga-kids.jpg";
import posterDealingWithAnger from "@/assets/kids-posters/dealing-with-anger.jpg";
import posterKindness from "@/assets/kids-posters/kindness.jpg";
import posterBullyingSpeakUp from "@/assets/kids-posters/bullying-speak-up.jpg";
import posterGrowthMindset from "@/assets/kids-posters/growth-mindset.jpg";
import posterGoalSetting from "@/assets/kids-posters/goal-setting.jpg";
import posterTimeManagement from "@/assets/kids-posters/time-management.jpg";
import posterFirstAidBasics from "@/assets/kids-posters/first-aid-basics.jpg";
import posterRoadSafety from "@/assets/kids-posters/road-safety.jpg";
import posterFireSafety from "@/assets/kids-posters/fire-safety.jpg";
import posterWaterSafety from "@/assets/kids-posters/water-safety.jpg";
import posterStrangerSafety from "@/assets/kids-posters/stranger-safety.jpg";
import posterPrivacyOnline from "@/assets/kids-posters/privacy-online.jpg";
import posterScreenTimeBalance from "@/assets/kids-posters/screen-time-balance.jpg";
import posterPasswordsSafety from "@/assets/kids-posters/passwords-safety.jpg";
import posterSpotFakeNews from "@/assets/kids-posters/spot-fake-news.jpg";
import posterEmergencyNumbers from "@/assets/kids-posters/emergency-numbers.jpg";
import posterSavingMoney from "@/assets/kids-posters/saving-money.jpg";
import posterNeedsVsWants from "@/assets/kids-posters/needs-vs-wants.jpg";
import posterFirstPaycheck from "@/assets/kids-posters/first-paycheck.jpg";
import posterGoodListener from "@/assets/kids-posters/good-listener.jpg";
import posterAskingForHelp from "@/assets/kids-posters/asking-for-help.jpg";
import posterPublicSpeaking from "@/assets/kids-posters/public-speaking.jpg";
import posterExamStress from "@/assets/kids-posters/exam-stress.jpg";
import posterHealthySleep from "@/assets/kids-posters/healthy-sleep.jpg";
import posterCriticalThinking from "@/assets/kids-posters/critical-thinking.jpg";
import posterRespectfulOnline from "@/assets/kids-posters/respectful-online.jpg";
import posterChoresResponsibility from "@/assets/kids-posters/chores-responsibility.jpg";
import posterPatiencePractice from "@/assets/kids-posters/patience-practice.jpg";
import posterGratitude from "@/assets/kids-posters/gratitude.jpg";
import posterCareerDreams from "@/assets/kids-posters/career-dreams.jpg";
import klpReadySafeSk from "@/assets/kids-poster-translations/online-safety-sk.jpg.asset.json";
import klpReadySafeHu from "@/assets/kids-poster-translations/online-safety-hu.jpg.asset.json";
import klpReadySafeDe from "@/assets/kids-poster-translations/online-safety-de.jpg.asset.json";
import klpReadySafeEs from "@/assets/kids-poster-translations/online-safety-es.jpg.asset.json";
import klpReadySafeFr from "@/assets/kids-poster-translations/online-safety-fr.jpg.asset.json";
import klpReadyMoneySk from "@/assets/kids-poster-translations/money-basics-sk.jpg.asset.json";
import klpReadyMoneyHu from "@/assets/kids-poster-translations/money-basics-hu.jpg.asset.json";
import klpReadyMoneyDe from "@/assets/kids-poster-translations/money-basics-de.jpg.asset.json";
import klpReadyMoneyEs from "@/assets/kids-poster-translations/money-basics-es.jpg.asset.json";
import klpReadyMoneyFr from "@/assets/kids-poster-translations/money-basics-fr.jpg.asset.json";
import klpReadyStudySk from "@/assets/kids-poster-translations/study-smart-sk.jpg.asset.json";
import klpReadyStudyHu from "@/assets/kids-poster-translations/study-smart-hu.jpg.asset.json";
import klpReadyStudyDe from "@/assets/kids-poster-translations/study-smart-de.jpg.asset.json";
import klpReadyStudyEs from "@/assets/kids-poster-translations/study-smart-es.jpg.asset.json";
import klpReadyStudyFr from "@/assets/kids-poster-translations/study-smart-fr.jpg.asset.json";
import klpReadyTeenSk from "@/assets/kids-poster-translations/teen-life-skills-sk.jpg.asset.json";
import klpReadyTeenHu from "@/assets/kids-poster-translations/teen-life-skills-hu.jpg.asset.json";
import klpReadyTeenDe from "@/assets/kids-poster-translations/teen-life-skills-de.jpg.asset.json";
import klpReadyTeenEs from "@/assets/kids-poster-translations/teen-life-skills-es.jpg.asset.json";
import klpReadyTeenFr from "@/assets/kids-poster-translations/teen-life-skills-fr.jpg.asset.json";
import klpReadyNum20Sk from "@/assets/kids-poster-translations/numbers-1-20-sk.jpg.asset.json";
import klpReadyNum20Hu from "@/assets/kids-poster-translations/numbers-1-20-hu.jpg.asset.json";
import klpReadyNum20De from "@/assets/kids-poster-translations/numbers-1-20-de.jpg.asset.json";
import klpReadyNum20Es from "@/assets/kids-poster-translations/numbers-1-20-es.jpg.asset.json";
import klpReadyNum20Fr from "@/assets/kids-poster-translations/numbers-1-20-fr.jpg.asset.json";
import klpReadyCount100Sk from "@/assets/kids-poster-translations/counting-to-100-sk.jpg.asset.json";
import klpReadyCount100Hu from "@/assets/kids-poster-translations/counting-to-100-hu.jpg.asset.json";
import klpReadyCount100De from "@/assets/kids-poster-translations/counting-to-100-de.jpg.asset.json";
import klpReadyCount100Es from "@/assets/kids-poster-translations/counting-to-100-es.jpg.asset.json";
import klpReadyCount100Fr from "@/assets/kids-poster-translations/counting-to-100-fr.jpg.asset.json";

export const KLP_AI_POSTER_CREDITS = 3;
export const KLP_BOOK_CREDITS = 25;
/** Credits for re-creating one poster in another language, same style. */
export const KLP_POSTER_TRANSLATE_CREDITS = 2;

/** Credits for the whole encyclopedia translated into another language. */
export const KLP_BOOK_TRANSLATE_CREDITS = 25;

type KlpCategory = "school" | "science" | "life" | "safety" | "money" | "teen";

type KlpPoster = {
  id: string;
  title: string;
  description: string;
  ages: string;
  minAge: number;
  category: KlpCategory;
  image: string;
  file: string;
};

const KLP_CATEGORIES: { id: KlpCategory | "all"; label: string; icon: typeof GraduationCap }[] = [
  { id: "all", label: "All posters", icon: Sparkles },
  { id: "school", label: "School basics", icon: GraduationCap },
  { id: "science", label: "Science & nature", icon: Brain },
  { id: "life", label: "Life & feelings", icon: HeartHandshake },
  { id: "safety", label: "Safety", icon: ShieldCheck },
  { id: "money", label: "Money skills", icon: Wallet },
  { id: "teen", label: "Teen advice", icon: Baby },
];

const KLP_AGE_BANDS = [
  { id: "all", label: "All ages" },
  { id: "3", label: "3-5 years" },
  { id: "6", label: "6-9 years" },
  { id: "10", label: "10-13 years" },
  { id: "14", label: "14-18 years" },
] as const;

const KLP_POSTERS: KlpPoster[] = [
  {
    id: "shapes-colors",
    title: "Shapes and Colors",
    description: "First shapes, colour names and friendly animal helpers for the very youngest learners.",
    ages: "3-6 years",
    minAge: 3,
    category: "school",
    image: posterShapesColors,
    file: "unique-shapes-and-colors-poster.jpg",
  },
  {
    id: "abc-phonics",
    title: "ABC Phonics",
    description: "The whole alphabet with one clear picture per letter — perfect for learning to read.",
    ages: "4-7 years",
    minAge: 3,
    category: "school",
    image: posterAbcPhonics,
    file: "unique-abc-phonics-poster.jpg",
  },
  {
    id: "times-tables",
    title: "Times Tables 1-10",
    description: "All ten tables on one sheet, colour coded so practice feels like a game.",
    ages: "6-10 years",
    minAge: 6,
    category: "school",
    image: posterTimesTables,
    file: "unique-times-tables-poster.jpg",
  },
  {
    id: "parts-of-speech",
    title: "Parts of Speech",
    description: "Nouns, verbs, adjectives and the rest — each with a simple rule and an example.",
    ages: "8-11 years",
    minAge: 6,
    category: "school",
    image: posterPartsOfSpeech,
    file: "unique-parts-of-speech-poster.jpg",
  },
  {
    id: "solar-system",
    title: "The Solar System",
    description: "The Sun and all eight planets in order, with names children can point to.",
    ages: "7-12 years",
    minAge: 6,
    category: "science",
    image: posterSolarSystem,
    file: "unique-solar-system-poster.jpg",
  },
  {
    id: "water-cycle",
    title: "The Water Cycle",
    description: "Evaporation, condensation, precipitation and collection explained in one friendly circle.",
    ages: "8-12 years",
    minAge: 6,
    category: "science",
    image: posterWaterCycle,
    file: "unique-water-cycle-poster.jpg",
  },
  {
    id: "feelings",
    title: "My Feelings",
    description: "Nine emotions with faces children recognise, so they can name how they feel out loud.",
    ages: "4-9 years",
    minAge: 3,
    category: "life",
    image: posterFeelings,
    file: "unique-my-feelings-poster.jpg",
  },
  {
    id: "daily-routine",
    title: "My Daily Routine",
    description: "A calm eight-step day from waking up to nine hours of sleep, with clock times.",
    ages: "4-9 years",
    minAge: 3,
    category: "life",
    image: posterDailyRoutine,
    file: "unique-daily-routine-poster.jpg",
  },
  {
    id: "online-safety",
    title: "Online Safety Rules",
    description: "Six short rules about passwords, strangers, posting and asking an adult for help.",
    ages: "8-14 years",
    minAge: 6,
    category: "safety",
    image: posterOnlineSafety,
    file: "unique-online-safety-poster.jpg",
  },
  {
    id: "money-basics",
    title: "Money Basics",
    description: "Earn, save, spend wisely and give — plus the 50-30-20 rule in a simple chart.",
    ages: "10-16 years",
    minAge: 10,
    category: "money",
    image: posterMoneyBasics,
    file: "unique-money-basics-poster.jpg",
  },
  {
    id: "study-smart",
    title: "Study Smart",
    description: "Six habits that really work: focus blocks, active recall, sleep and one task at a time.",
    ages: "12-18 years",
    minAge: 10,
    category: "teen",
    image: posterStudySmart,
    file: "unique-study-smart-poster.jpg",
  },
  {
    id: "teen-life-skills",
    title: "Life Skills for Teens",
    description: "Saying no, handling stress, asking for help and setting goals in small steps.",
    ages: "14-18 years",
    minAge: 14,
    category: "teen",
    image: posterTeenLifeSkills,
    file: "unique-life-skills-for-teens-poster.jpg",
  },
  {
    id: "numbers-1-20",
    title: "Numbers 1 to 20",
    description: "Every number with dots to count and a friendly picture for early number sense.",
    ages: "3-5 years",
    minAge: 3,
    category: "school",
    image: posterNumbers120,
    file: "unique-numbers-1-20-poster.jpg",
  },
  {
    id: "counting-to-100",
    title: "Counting to 100",
    description: "A bright 100-chart with patterns highlighted so skip-counting clicks.",
    ages: "6-8 years",
    minAge: 6,
    category: "school",
    image: posterCountingTo100,
    file: "unique-counting-to-100-poster.jpg",
  },
  {
    id: "addition-subtraction",
    title: "Addition and Subtraction",
    description: "Plus and minus strategies with number lines and picture examples.",
    ages: "6-9 years",
    minAge: 6,
    category: "school",
    image: posterAdditionSubtraction,
    file: "unique-addition-subtraction-poster.jpg",
  },
  {
    id: "multiplication-tricks",
    title: "Multiplication Tricks",
    description: "Handy tricks for the 2, 5, 9 and 10 tables that make multiplying faster.",
    ages: "7-10 years",
    minAge: 6,
    category: "school",
    image: posterMultiplicationTricks,
    file: "unique-multiplication-tricks-poster.jpg",
  },
  {
    id: "division-basics",
    title: "Division Basics",
    description: "Sharing and grouping explained step by step with clear visuals.",
    ages: "8-11 years",
    minAge: 6,
    category: "school",
    image: posterDivisionBasics,
    file: "unique-division-basics-poster.jpg",
  },
  {
    id: "fractions",
    title: "Fractions",
    description: "Halves, thirds and quarters shown on pizzas, bars and number lines.",
    ages: "8-11 years",
    minAge: 6,
    category: "school",
    image: posterFractions,
    file: "unique-fractions-poster.jpg",
  },
  {
    id: "geometry-shapes",
    title: "Geometry Shapes",
    description: "2D and 3D shapes with sides, corners and real-world examples.",
    ages: "7-11 years",
    minAge: 6,
    category: "school",
    image: posterGeometryShapes,
    file: "unique-geometry-shapes-poster.jpg",
  },
  {
    id: "percentages",
    title: "Percentages",
    description: "What percent means, quick tricks for 10%, 25% and 50%, and shop examples.",
    ages: "10-13 years",
    minAge: 10,
    category: "school",
    image: posterPercentages,
    file: "unique-percentages-poster.jpg",
  },
  {
    id: "roman-numerals",
    title: "Roman Numerals",
    description: "I, V, X, L, C, D, M with the rules and fun clock and monument examples.",
    ages: "8-12 years",
    minAge: 6,
    category: "school",
    image: posterRomanNumerals,
    file: "unique-roman-numerals-poster.jpg",
  },
  {
    id: "telling-time",
    title: "Telling the Time",
    description: "Analogue and digital clocks, o'clock, half past, quarters and minutes.",
    ages: "5-8 years",
    minAge: 3,
    category: "school",
    image: posterTellingTime,
    file: "unique-telling-time-poster.jpg",
  },
  {
    id: "measurement-units",
    title: "Measurement Units",
    description: "Length, weight and volume units with everyday comparisons.",
    ages: "8-11 years",
    minAge: 6,
    category: "school",
    image: posterMeasurementUnits,
    file: "unique-measurement-units-poster.jpg",
  },
  {
    id: "math-vocabulary",
    title: "Math Vocabulary",
    description: "Sum, difference, product, quotient and more — the words maths problems use.",
    ages: "9-13 years",
    minAge: 10,
    category: "school",
    image: posterMathVocabulary,
    file: "unique-math-vocabulary-poster.jpg",
  },
  {
    id: "order-of-operations",
    title: "Order of Operations",
    description: "Brackets first, then multiply and divide, then add and subtract — with examples.",
    ages: "10-13 years",
    minAge: 10,
    category: "school",
    image: posterOrderOfOperations,
    file: "unique-order-of-operations-poster.jpg",
  },
  {
    id: "negative-numbers",
    title: "Negative Numbers",
    description: "The number line below zero explained with temperature and lift examples.",
    ages: "10-13 years",
    minAge: 10,
    category: "school",
    image: posterNegativeNumbers,
    file: "unique-negative-numbers-poster.jpg",
  },
  {
    id: "cursive-alphabet",
    title: "Cursive Alphabet",
    description: "Upper and lower case cursive letters with stroke arrows for practice.",
    ages: "6-10 years",
    minAge: 6,
    category: "school",
    image: posterCursiveAlphabet,
    file: "unique-cursive-alphabet-poster.jpg",
  },
  {
    id: "sight-words",
    title: "First Sight Words",
    description: "The most common words young readers should recognise at a glance.",
    ages: "5-7 years",
    minAge: 3,
    category: "school",
    image: posterSightWords,
    file: "unique-sight-words-poster.jpg",
  },
  {
    id: "vowels-consonants",
    title: "Vowels and Consonants",
    description: "Short and long vowel sounds with picture examples for early readers.",
    ages: "5-8 years",
    minAge: 3,
    category: "school",
    image: posterVowelsConsonants,
    file: "unique-vowels-consonants-poster.jpg",
  },
  {
    id: "punctuation-marks",
    title: "Punctuation Marks",
    description: "Full stop, comma, question mark, exclamation mark and friends — with examples.",
    ages: "7-10 years",
    minAge: 6,
    category: "school",
    image: posterPunctuationMarks,
    file: "unique-punctuation-marks-poster.jpg",
  },
  {
    id: "nouns",
    title: "Nouns",
    description: "Person, place, thing or animal — common and proper nouns with examples.",
    ages: "6-9 years",
    minAge: 6,
    category: "school",
    image: posterNouns,
    file: "unique-nouns-poster.jpg",
  },
  {
    id: "verbs-tenses",
    title: "Verbs and Tenses",
    description: "Action words in past, present and future with clear sentence examples.",
    ages: "8-11 years",
    minAge: 6,
    category: "school",
    image: posterVerbsTenses,
    file: "unique-verbs-tenses-poster.jpg",
  },
  {
    id: "adjectives",
    title: "Adjectives",
    description: "Describing words that make sentences sparkle — size, colour, feeling and more.",
    ages: "7-10 years",
    minAge: 6,
    category: "school",
    image: posterAdjectives,
    file: "unique-adjectives-poster.jpg",
  },
  {
    id: "reading-strategies",
    title: "Reading Strategies",
    description: "Predict, question, visualise and summarise — how strong readers think.",
    ages: "7-11 years",
    minAge: 6,
    category: "school",
    image: posterReadingStrategies,
    file: "unique-reading-strategies-poster.jpg",
  },
  {
    id: "write-a-story",
    title: "Write a Story",
    description: "Beginning, middle and end — a simple plan for young writers with prompts.",
    ages: "8-12 years",
    minAge: 6,
    category: "school",
    image: posterWriteAStory,
    file: "unique-write-a-story-poster.jpg",
  },
  {
    id: "irregular-verbs",
    title: "Irregular Verbs",
    description: "Go-went-gone and the other tricky verbs in one clear chart.",
    ages: "9-13 years",
    minAge: 10,
    category: "school",
    image: posterIrregularVerbs,
    file: "unique-irregular-verbs-poster.jpg",
  },
  {
    id: "world-landmarks",
    title: "World Landmarks",
    description: "Famous places from every continent with one fun fact each.",
    ages: "8-13 years",
    minAge: 6,
    category: "school",
    image: posterWorldLandmarks,
    file: "unique-world-landmarks-poster.jpg",
  },
  {
    id: "continents-oceans",
    title: "Continents and Oceans",
    description: "All seven continents and five oceans on a friendly world map.",
    ages: "7-11 years",
    minAge: 6,
    category: "school",
    image: posterContinentsOceans,
    file: "unique-continents-oceans-poster.jpg",
  },
  {
    id: "world-map-animals",
    title: "Animals of the World Map",
    description: "Where elephants, kangaroos and polar bears live — animals on a world map.",
    ages: "5-9 years",
    minAge: 3,
    category: "science",
    image: posterWorldMapAnimals,
    file: "unique-world-map-animals-poster.jpg",
  },
  {
    id: "flags-of-europe",
    title: "Flags of Europe",
    description: "European flags with country names for young geographers.",
    ages: "8-13 years",
    minAge: 6,
    category: "school",
    image: posterFlagsOfEurope,
    file: "unique-flags-of-europe-poster.jpg",
  },
  {
    id: "human-body-organs",
    title: "Human Body Organs",
    description: "Heart, lungs, brain and more — where they are and what they do.",
    ages: "8-13 years",
    minAge: 6,
    category: "science",
    image: posterHumanBodyOrgans,
    file: "unique-human-body-organs-poster.jpg",
  },
  {
    id: "human-skeleton",
    title: "Human Skeleton",
    description: "The main bones of the body with friendly labels.",
    ages: "8-13 years",
    minAge: 6,
    category: "science",
    image: posterHumanSkeleton,
    file: "unique-human-skeleton-poster.jpg",
  },
  {
    id: "five-senses",
    title: "My Five Senses",
    description: "See, hear, smell, taste and touch — with everyday examples.",
    ages: "3-6 years",
    minAge: 3,
    category: "science",
    image: posterFiveSenses,
    file: "unique-five-senses-poster.jpg",
  },
  {
    id: "dinosaurs",
    title: "Dinosaurs",
    description: "Favourite dinosaurs with size comparisons and fun facts.",
    ages: "5-10 years",
    minAge: 3,
    category: "science",
    image: posterDinosaurs,
    file: "unique-dinosaurs-poster.jpg",
  },
  {
    id: "butterfly-life-cycle",
    title: "Butterfly Life Cycle",
    description: "Egg, caterpillar, chrysalis and butterfly — the four stages illustrated.",
    ages: "5-9 years",
    minAge: 3,
    category: "science",
    image: posterButterflyLifeCycle,
    file: "unique-butterfly-life-cycle-poster.jpg",
  },
  {
    id: "photosynthesis",
    title: "Photosynthesis",
    description: "How plants turn sunlight, water and air into food — step by step.",
    ages: "9-13 years",
    minAge: 10,
    category: "science",
    image: posterPhotosynthesis,
    file: "unique-photosynthesis-poster.jpg",
  },
  {
    id: "weather-clouds",
    title: "Weather and Clouds",
    description: "Cloud types, what they tell us and how weather works.",
    ages: "6-11 years",
    minAge: 6,
    category: "science",
    image: posterWeatherClouds,
    file: "unique-weather-clouds-poster.jpg",
  },
  {
    id: "states-of-matter",
    title: "States of Matter",
    description: "Solid, liquid and gas with melting, freezing and evaporation examples.",
    ages: "8-12 years",
    minAge: 6,
    category: "science",
    image: posterStatesOfMatter,
    file: "unique-states-of-matter-poster.jpg",
  },
  {
    id: "food-chain",
    title: "Food Chain",
    description: "From the sun to top predators — who eats whom in nature.",
    ages: "7-11 years",
    minAge: 6,
    category: "science",
    image: posterFoodChain,
    file: "unique-food-chain-poster.jpg",
  },
  {
    id: "ocean-zones",
    title: "Ocean Zones",
    description: "From the sunny surface to the deep dark — the layers of the ocean and their animals.",
    ages: "8-12 years",
    minAge: 6,
    category: "science",
    image: posterOceanZones,
    file: "unique-ocean-zones-poster.jpg",
  },
  {
    id: "volcanoes",
    title: "Volcanoes",
    description: "How volcanoes work, what's inside and famous eruptions.",
    ages: "8-13 years",
    minAge: 6,
    category: "science",
    image: posterVolcanoes,
    file: "unique-volcanoes-poster.jpg",
  },
  {
    id: "electricity-basics",
    title: "Electricity Basics",
    description: "Circuits, conductors and staying safe around electricity.",
    ages: "9-13 years",
    minAge: 10,
    category: "science",
    image: posterElectricityBasics,
    file: "unique-electricity-basics-poster.jpg",
  },
  {
    id: "simple-machines",
    title: "Simple Machines",
    description: "Lever, pulley, wheel, ramp, wedge and screw — physics in everyday life.",
    ages: "8-12 years",
    minAge: 6,
    category: "science",
    image: posterSimpleMachines,
    file: "unique-simple-machines-poster.jpg",
  },
  {
    id: "space-rockets",
    title: "Space and Rockets",
    description: "How rockets launch, astronaut life and our space neighbourhood.",
    ages: "6-11 years",
    minAge: 6,
    category: "science",
    image: posterSpaceRockets,
    file: "unique-space-rockets-poster.jpg",
  },
  {
    id: "moon-phases",
    title: "Phases of the Moon",
    description: "From new moon to full moon — the lunar cycle illustrated.",
    ages: "7-11 years",
    minAge: 6,
    category: "science",
    image: posterMoonPhases,
    file: "unique-moon-phases-poster.jpg",
  },
  {
    id: "four-seasons",
    title: "Four Seasons",
    description: "Spring, summer, autumn and winter — what changes in nature.",
    ages: "3-6 years",
    minAge: 3,
    category: "science",
    image: posterFourSeasons,
    file: "unique-four-seasons-poster.jpg",
  },
  {
    id: "recycling-earth",
    title: "Recycling and Our Earth",
    description: "What goes in which bin and small habits that help the planet.",
    ages: "6-11 years",
    minAge: 6,
    category: "science",
    image: posterRecyclingEarth,
    file: "unique-recycling-earth-poster.jpg",
  },
  {
    id: "bees-pollination",
    title: "Bees and Pollination",
    description: "Why bees matter and how they help our food grow.",
    ages: "6-10 years",
    minAge: 6,
    category: "science",
    image: posterBeesPollination,
    file: "unique-bees-pollination-poster.jpg",
  },
  {
    id: "rainforest-animals",
    title: "Rainforest Animals",
    description: "The layers of the rainforest and the amazing animals in each.",
    ages: "6-11 years",
    minAge: 6,
    category: "science",
    image: posterRainforestAnimals,
    file: "unique-rainforest-animals-poster.jpg",
  },
  {
    id: "insects",
    title: "Insects",
    description: "Six legs, three body parts — what makes an insect an insect, with examples.",
    ages: "5-9 years",
    minAge: 3,
    category: "science",
    image: posterInsects,
    file: "unique-insects-poster.jpg",
  },
  {
    id: "brushing-teeth",
    title: "Brushing Teeth",
    description: "Two minutes, twice a day — the right way to brush, step by step.",
    ages: "3-7 years",
    minAge: 3,
    category: "life",
    image: posterBrushingTeeth,
    file: "unique-brushing-teeth-poster.jpg",
  },
  {
    id: "hand-washing",
    title: "Hand Washing",
    description: "Soap, twenty seconds and every finger — clean hands keep germs away.",
    ages: "3-7 years",
    minAge: 3,
    category: "life",
    image: posterHandWashing,
    file: "unique-hand-washing-poster.jpg",
  },
  {
    id: "healthy-food-plate",
    title: "Healthy Food Plate",
    description: "Half veggies, some protein, some grains — building a balanced plate.",
    ages: "6-11 years",
    minAge: 6,
    category: "life",
    image: posterHealthyFoodPlate,
    file: "unique-healthy-food-plate-poster.jpg",
  },
  {
    id: "emotions-teens",
    title: "Understanding Emotions",
    description: "Naming feelings, what they're telling you and healthy ways to respond.",
    ages: "11-16 years",
    minAge: 10,
    category: "teen",
    image: posterEmotionsTeens,
    file: "unique-emotions-teens-poster.jpg",
  },
  {
    id: "friendship-rules",
    title: "Being a Good Friend",
    description: "Sharing, listening, honesty and saying sorry — friendship skills that last.",
    ages: "5-10 years",
    minAge: 3,
    category: "life",
    image: posterFriendshipRules,
    file: "unique-friendship-rules-poster.jpg",
  },
  {
    id: "table-manners",
    title: "Table Manners",
    description: "Kind habits at the table — from please and thank you to trying new foods.",
    ages: "4-8 years",
    minAge: 3,
    category: "life",
    image: posterTableManners,
    file: "unique-table-manners-poster.jpg",
  },
  {
    id: "morning-routine",
    title: "Morning Routine",
    description: "Wake up, wash, dress, breakfast — a calm start to the day in five steps.",
    ages: "4-8 years",
    minAge: 3,
    category: "life",
    image: posterMorningRoutine,
    file: "unique-morning-routine-poster.jpg",
  },
  {
    id: "bedtime-routine",
    title: "Bedtime Routine",
    description: "Bath, pyjamas, teeth, story, lights out — small steps to big dreams.",
    ages: "3-6 years",
    minAge: 3,
    category: "life",
    image: posterBedtimeRoutine,
    file: "unique-bedtime-routine-poster.jpg",
  },
  {
    id: "sports-movement",
    title: "Move Your Body",
    description: "Running, jumping, swimming, dancing — why moving every day matters.",
    ages: "6-10 years",
    minAge: 6,
    category: "life",
    image: posterSportsMovement,
    file: "unique-sports-movement-poster.jpg",
  },
  {
    id: "yoga-kids",
    title: "Yoga for Kids",
    description: "Six gentle poses with names and benefits — stronger bodies, calmer minds.",
    ages: "6-12 years",
    minAge: 6,
    category: "life",
    image: posterYogaKids,
    file: "unique-yoga-kids-poster.jpg",
  },
  {
    id: "dealing-with-anger",
    title: "Calming Anger",
    description: "The volcano metaphor and five steps to cool down — stop, breathe, name it, walk, talk.",
    ages: "7-12 years",
    minAge: 6,
    category: "life",
    image: posterDealingWithAnger,
    file: "unique-dealing-with-anger-poster.jpg",
  },
  {
    id: "kindness",
    title: "Kindness Matters",
    description: "Small acts, big difference — everyday kindness ideas for kids.",
    ages: "5-10 years",
    minAge: 3,
    category: "life",
    image: posterKindness,
    file: "unique-kindness-poster.jpg",
  },
  {
    id: "bullying-speak-up",
    title: "Speak Up About Bullying",
    description: "What bullying looks like, what friendship looks like and how to take action.",
    ages: "8-13 years",
    minAge: 6,
    category: "safety",
    image: posterBullyingSpeakUp,
    file: "unique-bullying-speak-up-poster.jpg",
  },
  {
    id: "growth-mindset",
    title: "Growth Mindset",
    description: "I can't do it... YET — fixed vs growth thinking and the power of practice.",
    ages: "8-14 years",
    minAge: 6,
    category: "life",
    image: posterGrowthMindset,
    file: "unique-growth-mindset-poster.jpg",
  },
  {
    id: "goal-setting",
    title: "Goal Setting",
    description: "SMART goals explained with real teen examples — sport, grades and hobbies.",
    ages: "12-17 years",
    minAge: 10,
    category: "teen",
    image: posterGoalSetting,
    file: "unique-goal-setting-poster.jpg",
  },
  {
    id: "time-management",
    title: "Time Management",
    description: "Planners, priorities and the pomodoro technique for busy teens.",
    ages: "13-18 years",
    minAge: 14,
    category: "teen",
    image: posterTimeManagement,
    file: "unique-time-management-poster.jpg",
  },
  {
    id: "first-aid-basics",
    title: "First Aid Basics",
    description: "Small cuts, burns, nosebleeds and when to call an adult or 112.",
    ages: "10-16 years",
    minAge: 10,
    category: "safety",
    image: posterFirstAidBasics,
    file: "unique-first-aid-basics-poster.jpg",
  },
  {
    id: "road-safety",
    title: "Road Safety",
    description: "Stop, look, listen — zebra crossings, traffic lights and helmets.",
    ages: "5-9 years",
    minAge: 3,
    category: "safety",
    image: posterRoadSafety,
    file: "unique-road-safety-poster.jpg",
  },
  {
    id: "fire-safety",
    title: "Fire Safety",
    description: "Stop drop roll, crawl low, meeting point — the family escape plan.",
    ages: "6-11 years",
    minAge: 6,
    category: "safety",
    image: posterFireSafety,
    file: "unique-fire-safety-poster.jpg",
  },
  {
    id: "water-safety",
    title: "Water Safety",
    description: "Pool and beach rules, life jackets and what the beach flags mean.",
    ages: "5-10 years",
    minAge: 3,
    category: "safety",
    image: posterWaterSafety,
    file: "unique-water-safety-poster.jpg",
  },
  {
    id: "stranger-safety",
    title: "Safe with Strangers",
    description: "Say no, walk away, find a trusted adult — clear rules, friendly tone.",
    ages: "5-9 years",
    minAge: 3,
    category: "safety",
    image: posterStrangerSafety,
    file: "unique-stranger-safety-poster.jpg",
  },
  {
    id: "privacy-online",
    title: "Protect Your Privacy",
    description: "Private accounts, no location sharing, think before posting.",
    ages: "12-17 years",
    minAge: 10,
    category: "safety",
    image: posterPrivacyOnline,
    file: "unique-privacy-online-poster.jpg",
  },
  {
    id: "screen-time-balance",
    title: "Screen Time Balance",
    description: "The 1-hour rule, no screens before bed and choosing real life.",
    ages: "8-14 years",
    minAge: 6,
    category: "safety",
    image: posterScreenTimeBalance,
    file: "unique-screen-time-balance-poster.jpg",
  },
  {
    id: "passwords-safety",
    title: "Strong Passwords",
    description: "Do's and don'ts, passphrases and two-factor authentication.",
    ages: "11-16 years",
    minAge: 10,
    category: "safety",
    image: posterPasswordsSafety,
    file: "unique-passwords-safety-poster.jpg",
  },
  {
    id: "spot-fake-news",
    title: "Spot Fake News",
    description: "Check the source, look for evidence, read beyond the headline.",
    ages: "12-18 years",
    minAge: 10,
    category: "safety",
    image: posterSpotFakeNews,
    file: "unique-spot-fake-news-poster.jpg",
  },
  {
    id: "emergency-numbers",
    title: "Emergency Numbers",
    description: "Call 112 — when to call and what to say, step by step.",
    ages: "6-12 years",
    minAge: 6,
    category: "safety",
    image: posterEmergencyNumbers,
    file: "unique-emergency-numbers-poster.jpg",
  },
  {
    id: "saving-money",
    title: "Saving Money",
    description: "Save, spend, share — three jars, a goal chart and small steps that add up.",
    ages: "8-13 years",
    minAge: 6,
    category: "money",
    image: posterSavingMoney,
    file: "unique-saving-money-poster.jpg",
  },
  {
    id: "needs-vs-wants",
    title: "Needs vs Wants",
    description: "What we really need vs what's nice to have — smart shopper thinking.",
    ages: "7-12 years",
    minAge: 6,
    category: "money",
    image: posterNeedsVsWants,
    file: "unique-needs-vs-wants-poster.jpg",
  },
  {
    id: "first-paycheck",
    title: "Your First Paycheck",
    description: "Reading a payslip, the 50-30-20 budget and first job ideas for teens.",
    ages: "14-18 years",
    minAge: 14,
    category: "money",
    image: posterFirstPaycheck,
    file: "unique-first-paycheck-poster.jpg",
  },
  {
    id: "good-listener",
    title: "Be a Good Listener",
    description: "Look, don't interrupt, ask questions, respond — listening shows respect.",
    ages: "6-11 years",
    minAge: 6,
    category: "life",
    image: posterGoodListener,
    file: "unique-good-listener-poster.jpg",
  },
  {
    id: "asking-for-help",
    title: "It's OK to Ask for Help",
    description: "Notice the problem, find a trusted person, use your words.",
    ages: "6-12 years",
    minAge: 6,
    category: "life",
    image: posterAskingForHelp,
    file: "unique-asking-for-help-poster.jpg",
  },
  {
    id: "public-speaking",
    title: "Public Speaking",
    description: "Prepare, breathe, stand tall, speak slowly — real voices, bigger opportunities.",
    ages: "12-17 years",
    minAge: 10,
    category: "teen",
    image: posterPublicSpeaking,
    file: "unique-public-speaking-poster.jpg",
  },
  {
    id: "exam-stress",
    title: "Beat Exam Stress",
    description: "Start early, study in chunks, sleep well and breathe 4-7-8 on the day.",
    ages: "12-18 years",
    minAge: 10,
    category: "teen",
    image: posterExamStress,
    file: "unique-exam-stress-poster.jpg",
  },
  {
    id: "healthy-sleep",
    title: "Healthy Sleep",
    description: "How much sleep kids and teens need and bedtime tips that work.",
    ages: "6-12 years",
    minAge: 6,
    category: "life",
    image: posterHealthySleep,
    file: "unique-healthy-sleep-poster.jpg",
  },
  {
    id: "critical-thinking",
    title: "Think Critically",
    description: "Who says this? What's the evidence? Opinion or fact?",
    ages: "13-18 years",
    minAge: 14,
    category: "teen",
    image: posterCriticalThinking,
    file: "unique-critical-thinking-poster.jpg",
  },
  {
    id: "respectful-online",
    title: "Be Respectful Online",
    description: "Think before you type, no trolling, respect opinions, report and block.",
    ages: "11-16 years",
    minAge: 10,
    category: "safety",
    image: posterRespectfulOnline,
    file: "unique-respectful-online-poster.jpg",
  },
  {
    id: "chores-responsibility",
    title: "Chores Build Character",
    description: "Age-by-age chore ideas that build independence and confidence.",
    ages: "6-12 years",
    minAge: 6,
    category: "life",
    image: posterChoresResponsibility,
    file: "unique-chores-responsibility-poster.jpg",
  },
  {
    id: "patience-practice",
    title: "Practicing Patience",
    description: "Good things take time — the growing plant metaphor and waiting tricks.",
    ages: "5-10 years",
    minAge: 3,
    category: "life",
    image: posterPatiencePractice,
    file: "unique-patience-practice-poster.jpg",
  },
  {
    id: "gratitude",
    title: "An Attitude of Gratitude",
    description: "The gratitude tree and three good things every day.",
    ages: "6-12 years",
    minAge: 6,
    category: "life",
    image: posterGratitude,
    file: "unique-gratitude-poster.jpg",
  },
  {
    id: "career-dreams",
    title: "Dream Careers",
    description: "Twelve inspiring careers and the first steps toward any of them.",
    ages: "13-18 years",
    minAge: 14,
    category: "teen",
    image: posterCareerDreams,
    file: "unique-career-dreams-poster.jpg",
  },
];

async function klpDownload(url: string, filename: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

/** Converts the selected bundled poster into an inline reference for image editing. */
async function klpImageToDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not load the original poster.");
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string"
      ? resolve(reader.result)
      : reject(new Error("Could not prepare the original poster."));
    reader.onerror = () => reject(new Error("Could not prepare the original poster."));
    reader.readAsDataURL(blob);
  });
}




/** Age chapters of the printable encyclopedia, youngest first. */
const KLP_BOOK_CHAPTERS: { minAge: number; label: string; blurb: string }[] = [
  { minAge: 3, label: "Ages 3-5 · First discoveries", blurb: "Shapes, colours, letters, numbers and gentle everyday habits." },
  { minAge: 6, label: "Ages 6-9 · School basics", blurb: "Reading, writing, maths, nature and staying safe." },
  { minAge: 10, label: "Ages 10-13 · Going deeper", blurb: "Grammar, geometry, science, the world and money sense." },
  { minAge: 14, label: "Ages 14-18 · Real life skills", blurb: "Study strategies, emotions, goals, career and independence." },
];

/** Languages offered for poster and encyclopedia translation. */
const KLP_LANGUAGES: { id: string; label: string; name: string }[] = [
  { id: "sk", label: "Slovak", name: "Slovak" },
  { id: "hu", label: "Hungarian", name: "Hungarian" },
  { id: "de", label: "German", name: "German" },
  { id: "es", label: "Spanish", name: "Spanish" },
  { id: "fr", label: "French", name: "French" },
];

/** Ready-made translated posters uploaded by the team (no AI needed). */
const KLP_READY_TRANSLATIONS: Record<string, Record<string, string>> = {
  "order-of-operations": {
    sk: klpReadyOrdOpSk.url,
    hu: klpReadyOrdOpHu.url,
    de: klpReadyOrdOpDe.url,
    es: klpReadyOrdOpEs.url,
    fr: klpReadyOrdOpFr.url,
  },
  "negative-numbers": {
    sk: klpReadyNegNumSk.url,
    hu: klpReadyNegNumHu.url,
    de: klpReadyNegNumDe.url,
    es: klpReadyNegNumEs.url,
    fr: klpReadyNegNumFr.url,
  },
  "numbers-1-20": {
    sk: klpReadyNum20Sk.url,
    hu: klpReadyNum20Hu.url,
    de: klpReadyNum20De.url,
    es: klpReadyNum20Es.url,
    fr: klpReadyNum20Fr.url,
  },
  "counting-to-100": {
    sk: klpReadyCount100Sk.url,
    hu: klpReadyCount100Hu.url,
    de: klpReadyCount100De.url,
    es: klpReadyCount100Es.url,
    fr: klpReadyCount100Fr.url,
  },
  "roman-numerals": {
    sk: klpReadyRomanSk.url,
    hu: klpReadyRomanHu.url,
    de: klpReadyRomanDe.url,
    es: klpReadyRomanEs.url,
    fr: klpReadyRomanFr.url,
  },
  "measurement-units": {
    sk: klpReadyMeasSk.url,
    hu: klpReadyMeasHu.url,
    de: klpReadyMeasDe.url,
    es: klpReadyMeasEs.url,
    fr: klpReadyMeasFr.url,
  },
  "math-vocabulary": {
    sk: klpReadyMathVocSk.url,
    hu: klpReadyMathVocHu.url,
    de: klpReadyMathVocDe.url,
    es: klpReadyMathVocEs.url,
    fr: klpReadyMathVocFr.url,
  },
  "telling-time": {
    sk: klpReadyTimeSk.url,
    hu: klpReadyTimeHu.url,
    de: klpReadyTimeDe.url,
    es: klpReadyTimeEs.url,
    fr: klpReadyTimeFr.url,
  },
  "cursive-alphabet": {
    sk: klpReadyCursSk.url,
    hu: klpReadyCursHu.url,
    de: klpReadyCursDe.url,
    es: klpReadyCursEs.url,
    fr: klpReadyCursFr.url,
  },
  "vowels-consonants": {
    sk: klpReadyVowConSk.url,
    hu: klpReadyVowConHu.url,
    de: klpReadyVowConDe.url,
    es: klpReadyVowConEs.url,
    fr: klpReadyVowConFr.url,
  },
  "punctuation-marks": {
    sk: klpReadyPunctSk.url,
    hu: klpReadyPunctHu.url,
    de: klpReadyPunctDe.url,
    es: klpReadyPunctEs.url,
    fr: klpReadyPunctFr.url,
  },
  "sight-words": {
    sk: klpReadySightSk.url,
    hu: klpReadySightHu.url,
    de: klpReadySightDe.url,
    es: klpReadySightEs.url,
    fr: klpReadySightFr.url,
  },
  "geometry-shapes": {
    sk: klpReadyGeoSk.url,
    hu: klpReadyGeoHu.url,
    de: klpReadyGeoDe.url,
    es: klpReadyGeoEs.url,
    fr: klpReadyGeoFr.url,
  },
  "percentages": {
    sk: klpReadyPctSk.url,
    hu: klpReadyPctHu.url,
    de: klpReadyPctDe.url,
    es: klpReadyPctEs.url,
    fr: klpReadyPctFr.url,
  },
  "shapes-colors": {
    sk: klpReadyShapesSk.url,
    hu: klpReadyShapesHu.url,
    de: klpReadyShapesDe.url,
    es: klpReadyShapesEs.url,
    fr: klpReadyShapesFr.url,
  },
  "abc-phonics": {
    sk: klpReadyAbcSk.url,
    hu: klpReadyAbcHu.url,
    de: klpReadyAbcDe.url,
    es: klpReadyAbcEs.url,
    fr: klpReadyAbcFr.url,
  },
  "addition-subtraction": {
    sk: klpReadyAddSubSk.url,
    hu: klpReadyAddSubHu.url,
    de: klpReadyAddSubDe.url,
    es: klpReadyAddSubEs.url,
    fr: klpReadyAddSubFr.url,
  },
  "division-basics": {
    sk: klpReadyDivBasSk.url,
    hu: klpReadyDivBasHu.url,
    de: klpReadyDivBasDe.url,
    es: klpReadyDivBasEs.url,
    fr: klpReadyDivBasFr.url,
  },
  fractions: {
    sk: klpReadyFracSk.url,
    hu: klpReadyFracHu.url,
    de: klpReadyFracDe.url,
    es: klpReadyFracEs.url,
    fr: klpReadyFracFr.url,
  },
  "multiplication-tricks": {
    sk: klpReadyMultTricksSk.url,
    hu: klpReadyMultTricksHu.url,
    de: klpReadyMultTricksDe.url,
    es: klpReadyMultTricksEs.url,
    fr: klpReadyMultTricksFr.url,
  },
  "times-tables": {
    sk: klpReadyTimesSk.url,
    hu: klpReadyTimesHu.url,
    de: klpReadyTimesDe.url,
    es: klpReadyTimesEs.url,
    fr: klpReadyTimesFr.url,
  },
  "parts-of-speech": {
    sk: klpReadyPosSk.url,
    hu: klpReadyPosHu.url,
    de: klpReadyPosDe.url,
    es: klpReadyPosEs.url,
    fr: klpReadyPosFr.url,
  },
  "solar-system": {
    sk: klpReadySolarSk.url,
    hu: klpReadySolarHu.url,
    de: klpReadySolarDe.url,
    es: klpReadySolarEs.url,
    fr: klpReadySolarFr.url,
  },
  "water-cycle": {
    sk: klpReadyWaterSk.url,
    hu: klpReadyWaterHu.url,
    de: klpReadyWaterDe.url,
    es: klpReadyWaterEs.url,
    fr: klpReadyWaterFr.url,
  },
  feelings: {
    sk: klpReadyFeelSk.url,
    hu: klpReadyFeelHu.url,
    de: klpReadyFeelDe.url,
    es: klpReadyFeelEs.url,
    fr: klpReadyFeelFr.url,
  },
  "daily-routine": {
    sk: klpReadyRoutSk.url,
    hu: klpReadyRoutHu.url,
    de: klpReadyRoutDe.url,
    es: klpReadyRoutEs.url,
    fr: klpReadyRoutFr.url,
  },
  "online-safety": {
    sk: klpReadySafeSk.url,
    hu: klpReadySafeHu.url,
    de: klpReadySafeDe.url,
    es: klpReadySafeEs.url,
    fr: klpReadySafeFr.url,
  },
  "money-basics": {
    sk: klpReadyMoneySk.url,
    hu: klpReadyMoneyHu.url,
    de: klpReadyMoneyDe.url,
    es: klpReadyMoneyEs.url,
    fr: klpReadyMoneyFr.url,
  },
  "study-smart": {
    sk: klpReadyStudySk.url,
    hu: klpReadyStudyHu.url,
    de: klpReadyStudyDe.url,
    es: klpReadyStudyEs.url,
    fr: klpReadyStudyFr.url,
  },
  "teen-life-skills": {
    sk: klpReadyTeenSk.url,
    hu: klpReadyTeenHu.url,
    de: klpReadyTeenDe.url,
    es: klpReadyTeenEs.url,
    fr: klpReadyTeenFr.url,
  },
};

type KlpTranslationMap = Record<string, { title: string; description: string }>;

/** Texts sent to the translation function for the whole book. */
function klpBookTranslationItems() {
  return [
    { id: "book:title", title: "Learning Encyclopedia", description: "The complete printable poster book" },
    { id: "book:contents", title: "Contents", description: "List of all posters in this book" },
    ...KLP_BOOK_CHAPTERS.map((c) => ({ id: `chapter:${c.minAge}`, title: c.label, description: c.blurb })),
    ...KLP_POSTERS.map((p) => ({ id: p.id, title: p.title, description: p.description })),
  ];
}

async function klpLoadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

/** Loads the Unicode font used by translated PDFs (diacritics, Cyrillic). */
async function klpRegisterUnicodeFont(pdf: {
  addFileToVFS: (name: string, data: string) => void;
  addFont: (file: string, name: string, style: string) => void;
}) {
  const [regular, bold] = await Promise.all([
    import("@/assets/kids-posters/klp-unicode.ttf?url"),
    import("@/assets/kids-posters/klp-unicode-bold.ttf?url"),
  ]);
  const toBase64 = async (url: string) => {
    const buf = await (await fetch(url)).arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return btoa(binary);
  };
  pdf.addFileToVFS("klp-unicode.ttf", await toBase64(regular.default));
  pdf.addFont("klp-unicode.ttf", "klpUnicode", "normal");
  pdf.addFileToVFS("klp-unicode-bold.ttf", await toBase64(bold.default));
  pdf.addFont("klp-unicode-bold.ttf", "klpUnicode", "bold");
}

/** Builds the whole poster library as one A4 PDF book, ordered by age. */
async function klpBuildEncyclopedia(
  onProgress?: (done: number, total: number) => void,
  opts?: { languageLabel?: string; translations?: KlpTranslationMap },
) {
  const { default: JsPDF } = await import("jspdf");
  const pdf = new JsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = 210;
  const pageH = 297;

  const translated = !!opts?.translations;
  const tr = opts?.translations ?? {};
  if (translated) await klpRegisterUnicodeFont(pdf as never);
  const family = translated ? "klpUnicode" : "helvetica";
  const font = (style: "normal" | "bold") => pdf.setFont(family, style);
  const translatedTitle = (id: string, fallback: string) => tr[id]?.title?.trim() || fallback;
  const translatedDesc = (id: string, fallback: string) => tr[id]?.description?.trim() || fallback;
  const tTitle = (id: string, fallback: string) => translated
    ? `${fallback}\n${translatedTitle(id, fallback)}`
    : fallback;
  const tDesc = (id: string, fallback: string) => translated
    ? `${fallback}\n${translatedDesc(id, fallback)}`
    : fallback;

  // Cover — full-page illustration with title on the calm top area
  const coverImg = await klpLoadImage(encyclopediaCover);
  pdf.addImage(coverImg, "JPEG", 0, 0, pageW, pageH, undefined, "FAST");
  pdf.setTextColor(255, 255, 255);
  font("bold");
  pdf.setFontSize(34);
  pdf.text(tTitle("book:title", "Learning Encyclopedia"), pageW / 2, 42, {
    align: "center",
    maxWidth: pageW - 40,
  });
  pdf.setFontSize(14);
  font("normal");
  pdf.text(tDesc("book:title", "The complete printable poster book"), pageW / 2, 56, {
    align: "center",
    maxWidth: pageW - 40,
  });
  pdf.setFontSize(11);
  pdf.text(`${KLP_POSTERS.length} posters · ages 3 to 18 · sorted by age`, pageW / 2, 66, { align: "center" });
  if (opts?.languageLabel) pdf.text(opts.languageLabel, pageW / 2, 75, { align: "center" });
  pdf.setFontSize(11);
  pdf.text("Unique · Kids Channel", pageW / 2, pageH - 10, { align: "center" });

  const ordered = KLP_BOOK_CHAPTERS.map((chapter) => ({
    chapter,
    items: KLP_POSTERS.filter((p) => p.minAge === chapter.minAge),
  })).filter((group) => group.items.length > 0);

  // Contents
  pdf.addPage();
  pdf.setTextColor(30, 30, 40);
  font("bold");
  pdf.setFontSize(22);
  pdf.text(tTitle("book:contents", "Contents"), 20, 30);
  let y = 45;
  pdf.setFontSize(12);
  for (const group of ordered) {
    font("bold");
    if (y > pageH - 30) {
      pdf.addPage();
      y = 30;
    }
    const chapterLabel = tTitle(`chapter:${group.chapter.minAge}`, group.chapter.label);
    pdf.text(`${chapterLabel} (${group.items.length})`, 20, y);
    y += 7;
    font("normal");
    for (const item of group.items) {
      if (y > pageH - 20) {
        pdf.addPage();
        y = 30;
      }
      pdf.text(`• ${tTitle(item.id, item.title)}`, 26, y);
      y += 6;
    }
    y += 4;
  }

  const total = KLP_POSTERS.length;
  let done = 0;

  for (const group of ordered) {
    pdf.addPage();
    pdf.setFillColor(236, 72, 153);
    pdf.rect(0, 0, pageW, pageH, "F");
    pdf.setTextColor(255, 255, 255);
    font("bold");
    pdf.setFontSize(28);
    pdf.text(tTitle(`chapter:${group.chapter.minAge}`, group.chapter.label), 20, 130, { maxWidth: pageW - 40 });
    font("normal");
    pdf.setFontSize(13);
    pdf.text(tDesc(`chapter:${group.chapter.minAge}`, group.chapter.blurb), 20, 150, { maxWidth: pageW - 40 });

    for (const poster of group.items) {
      const img = await klpLoadImage(poster.image);
      pdf.addPage();
      const maxW = pageW - 20;
      const maxH = pageH - 34;
      const ratio = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
      const w = img.naturalWidth * ratio;
      const h = img.naturalHeight * ratio;
      pdf.addImage(img, "JPEG", (pageW - w) / 2, 10, w, h, undefined, "FAST");
      pdf.setTextColor(60, 60, 70);
      font("bold");
      pdf.setFontSize(12);
      pdf.text(tTitle(poster.id, poster.title), 10, pageH - 14, { maxWidth: pageW - 20 });
      font("normal");
      pdf.setFontSize(9);
      pdf.text(poster.ages, 10, pageH - 8);
      done += 1;
      onProgress?.(done, total);
    }
  }

  pdf.save(
    translated
      ? `unique-kids-learning-encyclopedia-${(opts?.languageLabel ?? "translated").toLowerCase().replace(/[^a-z]+/g, "-")}.pdf`
      : "unique-kids-learning-encyclopedia.pdf",
  );
}

/**
 * Kids Channel → Learning Posters.
 * Fully isolated page: printable educational poster library plus an optional
 * AI generator that costs 3 credits from the shared `ai_credits` wallet.
 * All styles are scoped with the unique `klp-` prefix.
 */
export default function KidsLearningPosters() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState<KlpCategory | "all">("all");
  const [ageBand, setAgeBand] = useState<(typeof KLP_AGE_BANDS)[number]["id"]>("all");

  const [balance, setBalance] = useState<number | null>(null);
  const [topic, setTopic] = useState("");
  const [ageGroup, setAgeGroup] = useState("6-10");
  const [style, setStyle] = useState<"playful" | "gentle" | "teen">("playful");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookBusy, setBookBusy] = useState(false);
  const [bookProgress, setBookProgress] = useState<{ done: number; total: number } | null>(null);
  const [transPoster, setTransPoster] = useState<KlpPoster | null>(null);
  const [transLang, setTransLang] = useState<string>(KLP_LANGUAGES[0].name);
  const [transBusy, setTransBusy] = useState(false);
  const [transResult, setTransResult] = useState<string | null>(null);
  const [bookLangOpen, setBookLangOpen] = useState(false);
  const [bookLang, setBookLang] = useState<string>(KLP_LANGUAGES[0].name);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { isAdmin: klpTranslateAdmin } = useIsAdmin();

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setBalance(null);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("ai_credits")
        .select("credits_remaining")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) setBalance(data?.credits_remaining ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, generated]);

  const posters = useMemo(
    () =>
      KLP_POSTERS.filter((p) => (category === "all" ? true : p.category === category)).filter((p) =>
        ageBand === "all" ? true : p.minAge === Number(ageBand),
      ),
    [category, ageBand],
  );

  const handleDownload = async (poster: KlpPoster) => {
    try {
      await klpDownload(poster.image, poster.file);
      toast({ title: "Download started", description: `${poster.title} is being saved to your device.` });
    } catch {
      toast({
        title: "Download failed",
        description: "Please try again, or long-press the image to save it.",
        variant: "destructive",
      });
    }
  };

  const handleTranslatePoster = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!transPoster || transBusy) return;
    setTransBusy(true);
    setTransResult(null);
    try {
      const langId = KLP_LANGUAGES.find((l) => l.name === transLang)?.id ?? "";
      const readyUrl = KLP_READY_TRANSLATIONS[transPoster.id]?.[langId];
      const readyImage = readyUrl ? await klpImageToDataUrl(readyUrl) : "";
      const sourceImage = readyImage ? "" : await klpImageToDataUrl(transPoster.image);
      const { data, error } = await supabase.functions.invoke("kids-poster-translate", {
        body: {
          title: transPoster.title,
          description: transPoster.description,
          ages: transPoster.ages,
          language: transLang,
          posterId: transPoster.id,
          langId,
          sourceImage,
          readyImage,
        },
      });

      const payload = (data ?? {}) as {
        error?: string;
        title?: string;
        description?: string;
        image?: string;
        creditsRemaining?: number;
        success?: boolean;
      };
      if (error || payload.error || !payload.image) {
        const message = payload.error ?? error?.message ?? "Could not translate this poster.";
        if (/insufficient/i.test(message)) {
          toast({
            title: "Not enough credits",
            description: `A translated poster costs ${KLP_POSTER_TRANSLATE_CREDITS} credits. Top up and try again.`,
            variant: "destructive",
          });
          navigate("/ai-credits");
          return;
        }
        toast({ title: "Translation failed", description: message, variant: "destructive" });
        return;
      }
      if (typeof payload.creditsRemaining === "number") setBalance(payload.creditsRemaining);
      setTransResult(payload.image);
      toast({
        title: `Poster ready in ${transLang}`,
        description: `${KLP_POSTER_TRANSLATE_CREDITS} credits used.`,
      });


    } catch (e) {
      toast({
        title: "Translation failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setTransBusy(false);
    }
  };

  const handleTranslatedEncyclopedia = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (bookBusy) return;
    setBookBusy(true);
    setBookProgress(null);
    try {
      const { data, error } = await supabase.functions.invoke("kids-encyclopedia-translate", {
        body: { language: bookLang, items: klpBookTranslationItems() },
      });
      const payload = (data ?? {}) as {
        error?: string;
        translations?: KlpTranslationMap;
        creditsRemaining?: number;
        success?: boolean;
      };
      if (error || payload.error || !payload.translations) {
        const message = payload.error ?? error?.message ?? "Could not translate the encyclopedia.";
        if (/insufficient/i.test(message)) {
          toast({
            title: "Not enough credits",
            description: `The bilingual encyclopedia costs ${KLP_BOOK_TRANSLATE_CREDITS} credits. Top up and try again.`,
            variant: "destructive",
          });
          navigate("/ai-credits");
          return;
        }
        toast({ title: "Translation failed", description: message, variant: "destructive" });
        return;
      }
      if (typeof payload.creditsRemaining === "number") setBalance(payload.creditsRemaining);
      setBookLangOpen(false);
      toast({
        title: `Building your ${bookLang} book`,
        description: `${KLP_BOOK_TRANSLATE_CREDITS} credits used. Please keep this page open.`,
      });
      await klpBuildEncyclopedia((doneCount, total) => setBookProgress({ done: doneCount, total }), {
        languageLabel: bookLang,
        translations: payload.translations,
      });
      toast({
        title: "Encyclopedia ready",
        description: `${KLP_POSTERS.length} bilingual English + ${bookLang} posters, sorted by age.`,
      });
    } catch (e) {
      toast({
        title: "Download failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBookBusy(false);
      setBookProgress(null);
    }
  };

  const handleEncyclopedia = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (bookBusy) return;
    setBookBusy(true);
    setBookProgress(null);
    try {
      const { data, error } = await supabase.functions.invoke("kids-posters-encyclopedia", {
        body: {},
      });
      const payload = (data ?? {}) as { error?: string; creditsRemaining?: number; success?: boolean };
      if (error || payload.error || !payload.success) {
        const message = payload.error ?? error?.message ?? "Could not start the download.";
        if (/insufficient/i.test(message)) {
          toast({
            title: "Not enough credits",
            description: `The encyclopedia costs ${KLP_BOOK_CREDITS} credits. Top up and try again.`,
            variant: "destructive",
          });
          navigate("/ai-credits");
          return;
        }
        toast({ title: "Download failed", description: message, variant: "destructive" });
        return;
      }
      if (typeof payload.creditsRemaining === "number") setBalance(payload.creditsRemaining);
      toast({
        title: "Building your book",
        description: `${KLP_BOOK_CREDITS} credits used. The PDF is being assembled — please keep this page open.`,
      });
      await klpBuildEncyclopedia((doneCount, total) => setBookProgress({ done: doneCount, total }));
      toast({
        title: "Encyclopedia ready",
        description: `${KLP_POSTERS.length} posters saved as one PDF book, sorted by age.`,
      });
    } catch (e) {
      toast({
        title: "Download failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBookBusy(false);
      setBookProgress(null);
    }
  };



  const handleGenerate = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (topic.trim().length < 3) {
      toast({
        title: "Tell us the topic",
        description: "Describe what the poster should teach, for example: fractions for 9 year olds.",
        variant: "destructive",
      });
      return;
    }
    setGenerating(true);
    setGenerated(null);
    try {
      const { data, error } = await supabase.functions.invoke("kids-learning-poster", {
        body: { topic: topic.trim(), ageGroup, style },
      });
      const payload = (data ?? {}) as { imageUrl?: string; error?: string; creditsRemaining?: number };
      if (error || payload.error || !payload.imageUrl) {
        const message = payload.error ?? error?.message ?? "Could not generate the poster.";
        if (/insufficient/i.test(message)) {
          toast({
            title: "Not enough credits",
            description: `This poster costs ${KLP_AI_POSTER_CREDITS} credits. Top up and try again.`,
            variant: "destructive",
          });
          navigate("/ai-credits");
          return;
        }
        toast({ title: "Generation failed", description: message, variant: "destructive" });
        return;
      }
      setGenerated(payload.imageUrl);
      if (typeof payload.creditsRemaining === "number") setBalance(payload.creditsRemaining);
      toast({
        title: "Your poster is ready",
        description: `${KLP_AI_POSTER_CREDITS} credits used. You can download it now.`,
      });
    } catch (e) {
      toast({
        title: "Generation failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="klp-page min-h-screen bg-background">
      <Helmet>
        <title>Learning Posters for Kids & Teens | Unique Kids Channel</title>
        <meta
          name="description"
          content="Free printable learning posters for children and teenagers: school basics, science, feelings, online safety, money skills and teen life advice. Download instantly or create your own with AI."
        />
      </Helmet>

      <div className="klp-hero relative overflow-hidden">
        <video
          ref={videoRef}
          className="klp-hero-video absolute inset-0 h-full w-full object-cover"
          src={heroVideo.url}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="klp-hero-veil absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <Button variant="ghost" size="sm" asChild className="mb-6 gap-2">
            <Link to="/kids-channel">
              <ArrowLeft className="h-4 w-4" /> Kids Channel
            </Link>
          </Button>
          <Badge className="mb-4 bg-primary text-primary-foreground">Printable • Ages 3-18</Badge>
          <h1 className="klp-title text-3xl font-extrabold tracking-tight md:text-5xl">
            Learning Posters for kids and teens
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Beautiful, ready-to-print posters — school basics, science, feelings, safety, money and real-life
            advice for teenagers. See exactly how each one looks, then download it for free. Need something
            specific? Create your own with AI for {KLP_AI_POSTER_CREDITS} credits.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" className="gap-2" onClick={() => setDialogOpen(true)}>
              <Sparkles className="h-4 w-4" /> Create my own · {KLP_AI_POSTER_CREDITS} credits
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="klp-book-cta gap-2"
              onClick={handleEncyclopedia}
              disabled={bookBusy}
            >
              {bookBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {bookBusy
                ? bookProgress
                  ? `Building book · ${bookProgress.done}/${bookProgress.total}`
                  : "Preparing book…"
                : `Download full encyclopedia PDF · ${KLP_BOOK_CREDITS} credits`}
            </Button>
            {klpTranslateAdmin && (
              <Button
                size="lg"
                variant="secondary"
                className="klp-book-cta gap-2"
                onClick={() => setBookLangOpen(true)}
                disabled={bookBusy}
              >
                <Languages className="h-4 w-4" />
                {`Bilingual encyclopedia · ${KLP_BOOK_TRANSLATE_CREDITS} credits`}
              </Button>
            )}
            <Button size="lg" variant="outline" asChild>
              <a href="#klp-library">Browse the library</a>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-20">
        <Card className="klp-how -mt-6 border-primary/30 bg-card/95 backdrop-blur">
          <CardContent className="space-y-2 p-5">
            <div className="flex items-center gap-2 font-semibold">
              <Info className="h-4 w-4 text-primary" /> How it works
            </div>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Pick an age group and a category — every poster shows a full preview first.</li>
              <li>Press Download to save the poster as a picture and print it at home or at school.</li>
              <li>
                Want the whole library as one children's book? Press “Download full encyclopedia PDF” for{" "}
                {KLP_BOOK_CREDITS} credits — all {KLP_POSTERS.length} posters in one printable A4 PDF with a
                cover, contents page and chapters ordered by age (3-5, 6-9, 10-13, 14-18).
              </li>
              <li>
                Want your own topic? Press “Create my own”, describe it, and AI draws a fresh poster for{" "}
                {KLP_AI_POSTER_CREDITS} credits (only charged when the poster is created).
              </li>
              {klpTranslateAdmin && (
                <li>
                  Need another language? Press “Translate” on any poster and Gemini creates its translated version for
                  {KLP_POSTER_TRANSLATE_CREDITS} credits, or get the bilingual
                  encyclopedia PDF for {KLP_BOOK_TRANSLATE_CREDITS} credits.
                </li>
              )}


            </ol>
          </CardContent>
        </Card>

        <Card className="klp-book mt-6 border-primary/40 bg-primary/5">
          <CardContent className="grid gap-5 p-5 md:grid-cols-[180px_minmax(0,1fr)_auto] md:items-center">
            <figure className="klp-book-cover-preview mx-auto w-full max-w-[220px] md:max-w-none">
              <div className="relative aspect-[210/297] overflow-hidden rounded-md border border-primary/30 shadow-lg">
                <img
                  src={encyclopediaCover}
                  alt="Learning Encyclopedia cover preview with a child reading a magical book"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-3 top-5 text-center text-primary-foreground drop-shadow-md">
                  <div className="text-lg font-extrabold leading-tight md:text-base">Learning Encyclopedia</div>
                  <div className="mt-1 text-[10px] font-medium">The complete printable poster book</div>
                  <div className="mt-1 text-[9px]">{KLP_POSTERS.length} posters · ages 3 to 18</div>
                </div>
                <div className="absolute inset-x-2 bottom-2 text-center text-[9px] font-semibold text-primary-foreground drop-shadow-md">
                  Unique · Kids Channel
                </div>
              </div>
              <figcaption className="mt-2 text-center text-xs font-medium text-muted-foreground">
                Cover preview
              </figcaption>
            </figure>
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-semibold">
                <Download className="h-4 w-4 text-primary" /> The complete Learning Encyclopedia (PDF book)
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                All {KLP_POSTERS.length} posters bound into one printable A4 book, sorted by age with chapter
                pages for 3-5, 6-9, 10-13 and 14-18 years. One-time price: {KLP_BOOK_CREDITS} credits.
              </p>
            </div>
            <Button className="w-full gap-2 md:w-auto md:shrink-0" onClick={handleEncyclopedia} disabled={bookBusy}>
              {bookBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {bookBusy
                ? bookProgress
                  ? `Building · ${bookProgress.done}/${bookProgress.total}`
                  : "Preparing…"
                : `Get the book · ${KLP_BOOK_CREDITS} credits`}
            </Button>
          </CardContent>
        </Card>


        <div id="klp-library" className="klp-filters mt-10 space-y-4">
          <div className="flex flex-wrap gap-2">
            {KLP_CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <Button
                  key={c.id}
                  size="sm"
                  variant={category === c.id ? "default" : "outline"}
                  className="klp-filter-chip gap-2"
                  onClick={() => setCategory(c.id)}
                >
                  <Icon className="h-4 w-4" /> {c.label}
                </Button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {KLP_AGE_BANDS.map((a) => (
              <Button
                key={a.id}
                size="sm"
                variant={ageBand === a.id ? "secondary" : "ghost"}
                className="klp-age-chip"
                onClick={() => setAgeBand(a.id)}
              >
                {a.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="klp-grid mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posters.map((poster) => (
            <Card key={poster.id} className="klp-card overflow-hidden">
              <div className="klp-card-preview bg-muted">
                <img
                  src={poster.image}
                  alt={`${poster.title} printable learning poster for ages ${poster.ages}`}
                  loading="lazy"
                  width={768}
                  height={1024}
                  className="h-auto w-full"
                />
              </div>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-bold leading-tight">{poster.title}</h2>
                  <Badge variant="secondary" className="shrink-0">
                    {poster.ages}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{poster.description}</p>
                <Button className="w-full gap-2" onClick={() => handleDownload(poster)}>
                  <Download className="h-4 w-4" /> Download
                </Button>
                {klpTranslateAdmin && (
                  <Button
                    variant="outline"
                    className="klp-translate-btn w-full gap-2"
                    onClick={() => {
                      setTransPoster(poster);
                      setTransResult(null);
                    }}
                  >
                    <Languages className="h-4 w-4" /> Translate · {KLP_POSTER_TRANSLATE_CREDITS} credits
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {posters.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            No poster matches this combination yet — try another age group or category.
          </p>
        )}

        <Card className="klp-cta mt-12 border-primary/40 bg-primary/5">
          <CardContent className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">Need a poster we do not have yet?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Describe any topic — fractions, the alphabet in another language, exam planning, kindness rules —
                and AI draws it in the same friendly style for {KLP_AI_POSTER_CREDITS} credits.
              </p>
            </div>
            <Button size="lg" className="gap-2" onClick={() => setDialogOpen(true)}>
              <Sparkles className="h-4 w-4" /> Create my own poster
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <span className="hidden" aria-hidden="true" />
        </DialogTrigger>
        <DialogContent className="klp-dialog max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Create your own learning poster
            </DialogTitle>
            <DialogDescription>
              One poster costs {KLP_AI_POSTER_CREDITS} credits. Your balance:{" "}
              {balance === null ? "—" : `${balance} credits`}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="klp-topic">
                What should the poster teach?
              </label>
              <Textarea
                id="klp-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="For example: fractions with pizza pictures, or good manners at the dinner table"
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="klp-age">
                Age of the child
              </label>
              <Input
                id="klp-age"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                placeholder="6-10"
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-sm font-medium">Look and feel</span>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: "playful", label: "Playful & colourful" },
                    { id: "gentle", label: "Soft watercolour" },
                    { id: "teen", label: "Modern for teens" },
                  ] as const
                ).map((s) => (
                  <Button
                    key={s.id}
                    type="button"
                    size="sm"
                    variant={style === s.id ? "default" : "outline"}
                    onClick={() => setStyle(s.id)}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>

            {generated && (
              <div className="klp-result space-y-3 rounded-xl border p-3">
                <img
                  src={generated}
                  alt="Your generated learning poster"
                  className="h-auto w-full rounded-lg"
                  loading="lazy"
                />
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => klpDownload(generated, "unique-my-learning-poster.png")}
                >
                  <Download className="h-4 w-4" /> Download my poster
                </Button>
              </div>
            )}

            <Button className="w-full gap-2" disabled={generating} onClick={handleGenerate}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating
                ? "Drawing your poster…"
                : `Generate poster · ${KLP_AI_POSTER_CREDITS} credits`}
            </Button>
            <p className="text-xs text-muted-foreground">
              Everything is kept child friendly. Credits are only charged when a poster is successfully created.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!transPoster}
        onOpenChange={(open) => {
          if (!open && !transBusy) {
            setTransPoster(null);
            setTransResult(null);
          }
        }}
      >
        <DialogContent className="klp-trans-dialog max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" /> Translate this poster
            </DialogTitle>
            <DialogDescription>
              {transPoster?.title} — Gemini creates a translated version from the original poster, for{" "}
              {KLP_POSTER_TRANSLATE_CREDITS} credits. Your balance:{" "}
              {balance === null ? "—" : `${balance} credits`}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {KLP_LANGUAGES.map((l) => (
                <Button
                  key={l.id}
                  type="button"
                  size="sm"
                  variant={transLang === l.name ? "default" : "outline"}
                  onClick={() => setTransLang(l.name)}
                >
                  {l.label}
                </Button>
              ))}
            </div>

            {transResult && (
              <div className="klp-trans-result space-y-3 rounded-xl border p-3">
                <img
                  src={transResult}
                  alt={`${transPoster?.title} poster in ${transLang}`}
                  className="h-auto w-full rounded-lg"
                  loading="lazy"
                />
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() =>
                    klpDownload(transResult, `unique-poster-${transPoster?.id ?? "translated"}-${transLang.toLowerCase()}.png`)
                  }
                >
                  <Download className="h-4 w-4" /> Download {transLang} poster

                </Button>
              </div>
            )}

            <Button className="w-full gap-2" disabled={transBusy} onClick={handleTranslatePoster}>
              {transBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
              {transBusy
                ? `Translating to ${transLang}…`
                : `Translate to ${transLang} · ${KLP_POSTER_TRANSLATE_CREDITS} credits`}
            </Button>
            <p className="text-xs text-muted-foreground">
              Credits are only charged when the translated poster is created.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={bookLangOpen}
        onOpenChange={(open) => {
          if (!open && !bookBusy) setBookLangOpen(false);
        }}
      >
        <DialogContent className="klp-booklang-dialog max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" /> Bilingual encyclopedia
            </DialogTitle>
            <DialogDescription>
              All {KLP_POSTERS.length} posters in one A4 PDF book with cover, contents and age chapters
              written in your language — {KLP_BOOK_TRANSLATE_CREDITS} credits. Your balance:{" "}
              {balance === null ? "—" : `${balance} credits`}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {KLP_LANGUAGES.map((l) => (
                <Button
                  key={l.id}
                  type="button"
                  size="sm"
                  variant={bookLang === l.name ? "default" : "outline"}
                  onClick={() => setBookLang(l.name)}
                >
                  {l.label}
                </Button>
              ))}
            </div>
            <Button className="w-full gap-2" disabled={bookBusy} onClick={handleTranslatedEncyclopedia}>
              {bookBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {bookBusy
                ? bookProgress
                  ? `Building · ${bookProgress.done}/${bookProgress.total}`
                  : `Translating to ${bookLang}…`
                : `Download English + ${bookLang} · ${KLP_BOOK_TRANSLATE_CREDITS} credits`}
            </Button>
            <p className="text-xs text-muted-foreground">
              English stays visible and the selected translation appears beneath it throughout the book.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
